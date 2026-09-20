import os
import tempfile
import re
from typing import List, Dict, Any, Tuple
from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate
from app.llm import llm

RAW_PDF_TOKENS = [
    "%PDF-", "endobj", "/MediaBox", "/Resources", "/ProcSet",
    "/Contents", "/Type /Page", "xref", "startxref", "endstream",
]

def contains_raw_pdf_syntax(text: str, threshold: int = 2) -> bool:
    if not text:
        return False
    hits = sum(1 for tok in RAW_PDF_TOKENS if tok in text)
    return hits >= threshold

def alpha_ratio(text: str) -> float:
    if not text:
        return 0.0
    alpha = sum(1 for c in text if c.isalpha())
    return alpha / len(text)

def clean_extracted_text(text: str) -> str:
    if not text:
        return ""
    # Remove null bytes and other non-printable control characters (keep \n \t)
    text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    # Collapse 3+ consecutive blank lines into 2
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Trim trailing whitespace from each line
    text = "\n".join(line.rstrip() for line in text.split('\n'))
    # Rejoin broken hyphenated words across line boundaries
    text = re.sub(r'-\n([a-z])', r'\1', text)
    return text.strip()

def validate_extraction(text: str, file_size_bytes: int, page_count: int = 1) -> Dict[str, Any]:
    if not text or not text.strip():
        return {"score": 0, "readable": False, "reason": "Extraction returned empty text. The PDF may be image-only (scanned)."}
    
    ratio = alpha_ratio(text)
    raw_detected = contains_raw_pdf_syntax(text, threshold=2)
    words = text.split()
    word_count = len(words)
    
    # Expected minimum: at least 50 words per page for a real document
    min_expected_words = max(50, page_count * 30)
    word_count_ok = word_count >= min_expected_words
    
    score = 1.0
    if ratio < 0.4: score -= 0.5
    if raw_detected: score -= 0.4
    if not word_count_ok: score -= 0.2
    
    readable = score >= 0.5
    if not readable:
        reason = "Extracted text quality is too low. "
        if ratio < 0.4: reason += f"Low alphabetic ratio ({int(ratio*100)}%). "
        if raw_detected: reason += "Raw PDF syntax detected. "
        if not word_count_ok: reason += f"Too few words ({word_count}) for a {page_count}-page document."
        return {"score": max(0, score), "readable": False, "reason": reason.strip()}
    
    return {"score": max(0, score), "readable": True}

def extract_text_from_pdf(file_path: str, filename: str) -> Dict[str, Any]:
    loader = PyPDFLoader(file_path)
    docs = loader.load()
    
    page_count = len(docs)
    pages = []
    full_text_parts = []
    
    for doc in docs:
        page_num = doc.metadata.get("page", 0) + 1
        raw_text = doc.page_content
        cleaned_text = clean_extracted_text(raw_text)
        
        full_text_parts.append(cleaned_text)
        pages.append({
            "pageNumber": page_num,
            "text": cleaned_text,
            "source": filename
        })
        
    full_text = "\n\n".join(full_text_parts)
    file_size = os.path.getsize(file_path)
    word_count = len(full_text.split())
    
    quality = validate_extraction(full_text, file_size, page_count)
    
    return {
        "pages": pages,
        "fullText": full_text,
        "pageCount": page_count,
        "wordCount": word_count,
        "extractionMethod": "pypdf",
        "quality": quality
    }

def extract_text_with_ocr(file_path: str, filename: str) -> Dict[str, Any]:
    return {
        "pages": [],
        "fullText": "",
        "pageCount": 0,
        "wordCount": 0,
        "extractionMethod": "ocr",
        "quality": {
            "score": 0,
            "readable": False,
            "reason": "Scanned PDF detected. OCR extraction is not yet available. Please upload a text-based PDF."
        }
    }

def generate_hierarchical_summary(pages: List[Dict[str, Any]], filename: str) -> Dict[str, Any]:
    valid_pages = [p for p in pages if len(p.get("text", "").strip()) > 50]
    
    if not valid_pages:
         return {
            "summary": None,
            "key_points": [],
            "source_pages": [],
            "status": "failed",
            "error": "No valid text available for summarization."
         }

    full_text = "\n\n".join(p["text"] for p in valid_pages)
    
    splitter = RecursiveCharacterTextSplitter(chunk_size=15000, chunk_overlap=1000)
    chunks = splitter.split_text(full_text)
    
    try:
        from langsmith import traceable
    except ImportError:
        def traceable(run_type=None, name=None):
            def decorator(func): return func
            return decorator

    @traceable(run_type="chain", name="HierarchicalSummarization")
    def _run_summary():
        prompt_template = PromptTemplate.from_template(
            "You are TalkTalk, an AI document summarization assistant.\n"
            "Summarize only the supplied document content.\n"
            "Do not invent facts.\n"
            "Preserve important claims, findings, numbers, dates and conclusions.\n"
            "If the supplied text is insufficient, explicitly say so.\n"
            "Return a clear structured summary formatted in markdown, with a 'Key Points' section.\n\n"
            "Document Text:\n{text}\n\n"
            "Structured Summary:"
        )
        
        chain = prompt_template | llm
        
        if len(chunks) == 1:
            result = chain.invoke({"text": chunks[0]})
            return result.content
        else:
            chunk_summaries = []
            for chunk in chunks:
                res = chain.invoke({"text": chunk})
                chunk_summaries.append(str(res.content))
            
            combined = "\n\n".join(chunk_summaries)
            final_res = chain.invoke({"text": f"Combine and synthesize the following chunk summaries into a cohesive final summary:\n\n{combined}"})
            return final_res.content

    try:
        final_summary_text = str(_run_summary())
        
        # Simple extraction of key points if present
        key_points = []
        if "Key Points" in final_summary_text or "key points" in final_summary_text.lower():
            # A rough heuristic to find bullets
            bullets = re.findall(r'^[\-\*]\s+(.*)$', final_summary_text, re.MULTILINE)
            key_points = bullets[:5]
            
        return {
            "summary": final_summary_text,
            "key_points": key_points,
            "source_pages": [p["pageNumber"] for p in valid_pages[:3]],
            "status": "completed"
        }
    except Exception as e:
        return {
            "summary": None,
            "key_points": [],
            "source_pages": [],
            "status": "failed",
            "error": str(e)
        }
