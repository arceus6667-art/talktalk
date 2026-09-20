import json
import re
import asyncio
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import tempfile
import os

from app.graph import graph
from app.document_processor import extract_text_from_pdf, extract_text_with_ocr, generate_hierarchical_summary
from app.prompts import SUMMARIZE_PROMPT, COMPARE_PROMPT, STUDY_PROMPT
from app.llm import llm
from app.rag import add_document_chunks, remove_document_chunks, list_indexed_docs


app = FastAPI(
    title="TalkTalk AI Knowledge Assistant API",
    description="Backend API powered by LangChain, LangGraph, and Google Gemini with RAG and intelligent routing.",
    version="1.0.0",
)

# Enable CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────────────────────────────────────
# Shared helpers
# ──────────────────────────────────────────────────────────────────────────────

def _clean_json_str(text: Any) -> str:
    if isinstance(text, list):
        return "".join(c.get("text", "") for c in text if isinstance(c, dict))
    return str(text)


def _parse_json(text: str) -> dict:
    raw = _clean_json_str(text)
    # Try to extract JSON block (handles markdown code fences)
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            pass
    return {}


# ──────────────────────────────────────────────────────────────────────────────
# Pydantic models
# ──────────────────────────────────────────────────────────────────────────────

class SourceItem(BaseModel):
    document: Optional[str] = None
    document_name: Optional[str] = None
    document_id: Optional[str] = "doc-handbook"
    page: Optional[int] = 1
    section: Optional[str] = "Company Handbook"
    excerpt: Optional[str] = ""


class ChatRequest(BaseModel):
    question: Optional[str] = None
    query: Optional[str] = None
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    intent: Optional[str] = "GENERAL"
    supported: Optional[bool] = True
    sources: List[SourceItem] = []
    latencyMs: Optional[int] = None
    tokenUsage: Optional[int] = None


class SummaryRequest(BaseModel):
    pages: List[Dict[str, Any]]
    filename: str


class IndexRequest(BaseModel):
    doc_id: str
    filename: str
    pages: List[Dict[str, Any]]   # [{pageNumber, text, source}]


class DocumentInput(BaseModel):
    id: str
    filename: str
    textContent: Optional[str] = ""
    sections: Optional[List[Dict[str, Any]]] = []
    metadata: Optional[Dict[str, Any]] = {}


class AISummarizeRequest(BaseModel):
    document: DocumentInput
    summaryType: Optional[str] = "executive"


class AICompareRequest(BaseModel):
    documents: List[DocumentInput]


class AIStudyRequest(BaseModel):
    documents: List[DocumentInput]
    format: Optional[str] = "all"


# ──────────────────────────────────────────────────────────────────────────────
# Health
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "TalkTalk API",
        "version": "1.0.0",
        "indexed_docs": list_indexed_docs(),
    }


# ──────────────────────────────────────────────────────────────────────────────
# Document Extraction & Indexing
# ──────────────────────────────────────────────────────────────────────────────

@app.post("/api/documents/extract")
async def extract_document(file: UploadFile = File(...)):
    """Extracts text from an uploaded PDF and validates quality."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        try:
            result = await asyncio.to_thread(extract_text_from_pdf, tmp_path, file.filename)

            if not result["quality"]["readable"]:
                print(f"[TalkTalk] pypdf quality check failed for {file.filename}, attempting OCR fallback...")
                result = await asyncio.to_thread(extract_text_with_ocr, tmp_path, file.filename)

            return result
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/documents/summarize")
async def summarize_document_pages(request: SummaryRequest):
    """Generates a hierarchical summary of extracted pages (legacy endpoint)."""
    try:
        result = await asyncio.to_thread(generate_hierarchical_summary, request.pages, request.filename)
        return result
    except Exception as e:
        return {
            "summary": None,
            "key_points": [],
            "source_pages": [],
            "status": "failed",
            "error": str(e),
        }


@app.post("/api/documents/index")
async def index_document(request: IndexRequest):
    """
    Adds extracted pages to the live RAG vector store.
    Call this after a successful /api/documents/extract so the document
    becomes immediately searchable via /api/chat.
    """
    try:
        chunk_count = await asyncio.to_thread(
            add_document_chunks,
            request.doc_id,
            [p.dict() if hasattr(p, "dict") else p for p in request.pages],
            request.filename,
        )
        return {
            "status": "indexed",
            "doc_id": request.doc_id,
            "filename": request.filename,
            "chunks_added": chunk_count,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indexing failed: {str(e)}")


@app.delete("/api/documents/{doc_id}/index")
async def deindex_document(doc_id: str):
    """Removes a document's chunks from the live vector store."""
    removed = await asyncio.to_thread(remove_document_chunks, doc_id)
    return {"status": "removed", "doc_id": doc_id, "chunks_removed": removed}


# ──────────────────────────────────────────────────────────────────────────────
# AI Chat (RAG + LangGraph)
# ──────────────────────────────────────────────────────────────────────────────

@app.post("/api/chat", response_model=ChatResponse)
@app.post("/api/ai/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Synchronous REST endpoint — invokes the full LangGraph state machine."""
    user_prompt = (request.question or request.query or "").strip()
    if not user_prompt:
        raise HTTPException(status_code=400, detail="Question/query cannot be empty.")

    start_time = asyncio.get_event_loop().time()
    try:
        result = await asyncio.to_thread(graph.invoke, {"question": user_prompt})
        latency = int((asyncio.get_event_loop().time() - start_time) * 1000)

        sources = [
            SourceItem(
                document=s.get("document"),
                document_name="handbook.pdf" if "handbook" in str(s.get("document", "")).lower() else str(s.get("document", "Document")),
                document_id="doc-handbook",
                page=s.get("page", 1),
                section=f"Section (Page {s.get('page', 1)})",
                excerpt="",
            )
            for s in (result.get("sources") or [])
        ]

        return ChatResponse(
            answer=result.get("answer", ""),
            intent=result.get("intent", "GENERAL"),
            supported=result.get("supported", True),
            sources=sources,
            latencyMs=latency,
            tokenUsage=len(result.get("answer", "").split()) * 2,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing graph: {str(e)}")


@app.post("/api/chat/stream")
async def chat_stream_endpoint(request: ChatRequest):
    """SSE streaming endpoint — yields per-node progress, tokens, citations, done."""
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    async def event_generator():
        try:
            yield f"event: status\ndata: {json.dumps({'stage': 'understanding', 'message': 'Classifying intent...'})}\\n\\n"

            accumulated_sources = []
            final_answer = ""
            final_intent = "GENERAL"
            is_supported = True

            def run_stream():
                return list(graph.stream({"question": request.question.strip()}, stream_mode="updates"))

            updates = await asyncio.to_thread(run_stream)

            for update in updates:
                for node_name, node_output in update.items():
                    if node_name == "classify_question":
                        final_intent = node_output.get("intent", "GENERAL")
                        yield f"event: status\ndata: {json.dumps({'stage': 'routed', 'intent': final_intent, 'message': f'Routed to {final_intent} engine'})}\n\n"

                    elif node_name == "retrieve":
                        accumulated_sources = node_output.get("sources", [])
                        count = len(accumulated_sources)
                        yield f"event: status\ndata: {json.dumps({'stage': 'retrieving', 'message': f'Found {count} relevant knowledge chunks', 'sources_count': count})}\n\n"

                    elif node_name == "calculator":
                        yield f"event: status\ndata: {json.dumps({'stage': 'computing', 'message': 'Executing calculation tool'})}\n\n"

                    elif node_name == "generate":
                        final_answer = node_output.get("answer", "")
                        yield f"event: status\ndata: {json.dumps({'stage': 'generating', 'message': 'Answer synthesized'})}\n\n"

                    elif node_name == "verify":
                        is_supported = node_output.get("supported", True)
                        if "answer" in node_output:
                            final_answer = node_output["answer"]
                        yield f"event: status\ndata: {json.dumps({'stage': 'verifying', 'supported': is_supported})}\n\n"

            yield f"event: answer\ndata: {json.dumps({'text': final_answer})}\n\n"
            yield f"event: sources\ndata: {json.dumps({'sources': accumulated_sources})}\n\n"
            yield f"event: done\ndata: {json.dumps({'status': 'complete', 'intent': final_intent, 'supported': is_supported})}\n\n"

        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ──────────────────────────────────────────────────────────────────────────────
# AI Summarize  (POST /api/ai/summarize)
# ──────────────────────────────────────────────────────────────────────────────

@app.post("/api/ai/summarize")
async def ai_summarize(request: AISummarizeRequest):
    """
    Generates an executive summary + key takeaways for a single document.
    Accepts the full document text so it works for any uploaded file, not just
    the seeded handbook.
    """
    doc = request.document
    # Build a combined text from sections if textContent is sparse
    text = doc.textContent or ""
    if not text.strip() and doc.sections:
        text = "\n\n".join(
            f"[Page {s.get('page', '?')}] {s.get('title', '')}\n{s.get('content', '')}"
            for s in doc.sections
        )

    if not text.strip():
        raise HTTPException(status_code=400, detail="Document has no extractable text.")

    # Trim to ~12 000 chars to stay inside context limits
    text = text[:12000]

    try:
        start = asyncio.get_event_loop().time()

        def _call():
            chain = SUMMARIZE_PROMPT | llm
            return chain.invoke({"filename": doc.filename, "text": text})

        response = await asyncio.to_thread(_call)
        latency = int((asyncio.get_event_loop().time() - start) * 1000)

        raw = _clean_json_str(response.content)
        data = _parse_json(raw)

        return {
            "summary": data.get("summary", raw),
            "keyTakeaways": data.get("keyTakeaways", []),
            "topics": data.get("topics", []),
            "sources": [
                {
                    "document_id": doc.id,
                    "document_name": doc.filename,
                    "page": 1,
                    "section": "Full Document",
                    "excerpt": "",
                }
            ],
            "latencyMs": latency,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")


# ──────────────────────────────────────────────────────────────────────────────
# AI Compare  (POST /api/ai/compare)
# ──────────────────────────────────────────────────────────────────────────────

@app.post("/api/ai/compare")
async def ai_compare(request: AICompareRequest):
    """
    Compares two or more documents across key dimensions.
    Returns a ComparisonResult-shaped payload.
    """
    if len(request.documents) < 2:
        raise HTTPException(status_code=400, detail="At least 2 documents are required for comparison.")

    # Build the prompt input — label each document clearly
    doc_blocks = []
    for i, doc in enumerate(request.documents):
        label = "A" if i == 0 else ("B" if i == 1 else chr(65 + i))
        text = doc.textContent or ""
        if not text.strip() and doc.sections:
            text = "\n\n".join(
                f"[Page {s.get('page', '?')}] {s.get('content', '')}"
                for s in doc.sections
            )
        # Trim per-doc budget: 5000 chars each so Gemini context fits
        text = text[:5000]
        doc_blocks.append(f"=== DOCUMENT {label}: {doc.filename} ===\n{text}")

    documents_text = "\n\n".join(doc_blocks)

    try:
        start = asyncio.get_event_loop().time()

        def _call():
            chain = COMPARE_PROMPT | llm
            return chain.invoke({"documents_text": documents_text})

        response = await asyncio.to_thread(_call)
        latency = int((asyncio.get_event_loop().time() - start) * 1000)

        raw = _clean_json_str(response.content)
        data = _parse_json(raw)

        sources = [
            {
                "document_id": doc.id,
                "document_name": doc.filename,
                "page": 1,
                "section": "Full Document",
                "excerpt": "",
            }
            for doc in request.documents
        ]

        return {
            "documents": [{"id": d.id, "name": d.filename} for d in request.documents],
            "aspects": data.get("aspects", []),
            "overallSynthesis": data.get("overallSynthesis", ""),
            "keyContradictions": data.get("keyContradictions", []),
            "consensusPoints": data.get("consensusPoints", []),
            "sources": sources,
            "latencyMs": latency,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")


# ──────────────────────────────────────────────────────────────────────────────
# AI Study  (POST /api/ai/study)
# ──────────────────────────────────────────────────────────────────────────────

@app.post("/api/ai/study")
async def ai_study(request: AIStudyRequest):
    """
    Generates flashcards, quiz questions, definitions, and a study summary.
    Returns a StudyPackage-shaped payload.
    """
    if not request.documents:
        raise HTTPException(status_code=400, detail="At least one document is required.")

    filenames = ", ".join(d.filename for d in request.documents)

    # Combine all document texts
    combined_text = ""
    for doc in request.documents:
        text = doc.textContent or ""
        if not text.strip() and doc.sections:
            text = "\n\n".join(
                f"[Page {s.get('page', '?')}] {s.get('content', '')}"
                for s in doc.sections
            )
        combined_text += f"\n\n=== {doc.filename} ===\n{text}"

    # Trim to 10 000 chars
    combined_text = combined_text[:10000]

    if not combined_text.strip():
        raise HTTPException(status_code=400, detail="No extractable text found in provided documents.")

    try:
        start = asyncio.get_event_loop().time()

        def _call():
            chain = STUDY_PROMPT | llm
            return chain.invoke({"filenames": filenames, "text": combined_text})

        response = await asyncio.to_thread(_call)
        latency = int((asyncio.get_event_loop().time() - start) * 1000)

        raw = _clean_json_str(response.content)
        data = _parse_json(raw)

        sources = [
            {
                "document_id": doc.id,
                "document_name": doc.filename,
                "page": 1,
                "section": "Full Document",
                "excerpt": "",
            }
            for doc in request.documents
        ]

        return {
            "documentIds": [d.id for d in request.documents],
            "flashcards": data.get("flashcards", []),
            "quiz": data.get("quiz", []),
            "comprehensiveSummary": data.get("comprehensiveSummary", ""),
            "keyDefinitions": data.get("keyDefinitions", []),
            "sources": sources,
            "latencyMs": latency,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Study material generation failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
