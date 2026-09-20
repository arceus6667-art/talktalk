"""
rag.py
======
Manages the TalkTalk vector store.

- Seeds itself from handbook.pdf on startup (if present).
- Exposes add_document_chunks() / remove_document_chunks() so that newly
  uploaded PDFs are immediately searchable via RAG without a server restart.
- All mutations are protected by a threading.Lock so concurrent requests are
  safe.
"""

import os
import threading
from pathlib import Path
from typing import List, Dict, Any

from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_core.documents import Document as LCDocument

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")

# ── Embeddings ────────────────────────────────────────────────────────────────
embeddings = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-001",
    google_api_key=api_key,
)

# ── Text splitter (shared settings) ──────────────────────────────────────────
_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=150,
)

# ── Vector store singleton ────────────────────────────────────────────────────
vector_store = InMemoryVectorStore(embedding=embeddings)
_store_lock = threading.Lock()

# ── Track which chunk IDs belong to which doc_id so we can delete them ───────
# { doc_id: [chunk_id, ...] }
_doc_chunk_ids: Dict[str, List[str]] = {}

# ── Public exports expected by graph.py ──────────────────────────────────────
documents: List[LCDocument] = []
chunks: List[LCDocument] = []
retriever = None  # built below after seeding


def _build_retriever():
    """Re-creates the retriever from the current state of the vector store."""
    global retriever
    retriever = vector_store.as_retriever(search_kwargs={"k": 4})


# ── Seed from handbook.pdf ────────────────────────────────────────────────────
pdf_path = Path(__file__).resolve().parent.parent / "data" / "handbook.pdf"

if pdf_path.exists():
    _loader = PyPDFLoader(str(pdf_path))
    documents = _loader.load()
    chunks = _splitter.split_documents(documents)
    ids = vector_store.add_documents(chunks)
    _doc_chunk_ids["__handbook__"] = ids
    print(f"[RAG] Seeded from handbook.pdf — {len(documents)} pages, {len(chunks)} chunks.")
else:
    print(f"[RAG] handbook.pdf not found at {pdf_path}. Starting with empty vector store.")

_build_retriever()


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def add_document_chunks(
    doc_id: str,
    pages: List[Dict[str, Any]],
    filename: str,
) -> int:
    """
    Splits and embeds extracted page text, then adds to the live vector store.

    Parameters
    ----------
    doc_id   : unique document identifier (used to track and delete chunks later)
    pages    : list of { pageNumber: int, text: str, source: str }
    filename : original filename — stored in chunk metadata

    Returns
    -------
    Number of chunks added.
    """
    # Build LangChain Document objects from the extracted pages
    lc_docs = [
        LCDocument(
            page_content=p["text"],
            metadata={
                "source": filename,
                "page": p["pageNumber"] - 1,   # 0-based to match PyPDFLoader convention
                "doc_id": doc_id,
            },
        )
        for p in pages
        if p.get("text", "").strip()
    ]

    if not lc_docs:
        print(f"[RAG] add_document_chunks: no usable pages in '{filename}' (doc_id={doc_id})")
        return 0

    new_chunks = _splitter.split_documents(lc_docs)

    with _store_lock:
        # Remove any old version of this doc first (idempotent re-upload)
        _remove_locked(doc_id)

        ids = vector_store.add_documents(new_chunks)
        _doc_chunk_ids[doc_id] = ids
        _build_retriever()

    print(f"[RAG] Indexed '{filename}' (doc_id={doc_id}) — {len(new_chunks)} chunks.")
    return len(new_chunks)


def remove_document_chunks(doc_id: str) -> int:
    """
    Removes all chunks belonging to doc_id from the vector store.

    Returns the number of chunks removed (0 if doc was not indexed).
    """
    with _store_lock:
        return _remove_locked(doc_id)


def _remove_locked(doc_id: str) -> int:
    """Must be called with _store_lock held."""
    ids = _doc_chunk_ids.pop(doc_id, [])
    if ids:
        try:
            vector_store.delete(ids)
            _build_retriever()
            print(f"[RAG] Removed {len(ids)} chunks for doc_id={doc_id}")
        except Exception as e:
            print(f"[RAG] Warning: could not delete chunks for {doc_id}: {e}")
    return len(ids)


def list_indexed_docs() -> List[str]:
    """Returns the list of doc_ids currently in the vector store."""
    return list(_doc_chunk_ids.keys())


# ── Standalone smoke test ─────────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"Pages loaded: {len(documents)}")
    print(f"Chunks created: {len(chunks)}")
    print(f"Indexed doc IDs: {list_indexed_docs()}")

    test_question = "What is the annual leave policy?"
    print(f"\nRetrieving chunks for: '{test_question}'")
    results = retriever.invoke(test_question)

    for i, doc in enumerate(results, 1):
        print(f"\n--- RESULT {i} ---")
        print(doc.page_content.strip())
        print("Metadata:", doc.metadata)
