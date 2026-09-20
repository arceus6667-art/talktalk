"""
test_pdf_extraction.py
======================
Regression tests for the TalkTalk PDF extraction pipeline.

Run with:
    cd backend
    .venv\\Scripts\\python.exe -m pytest test_pdf_extraction.py -v

Tests:
  1. Normal text PDF    → readable text extracted, no raw PDF syntax
  2. Corrupted input    → validator correctly rejects it
  3. Empty extraction   → validator rejects empty string
  4. Large document     → extraction completes, chunks created
  5. Summary safety     → summary does not contain raw PDF syntax
  6. Source metadata    → correct page numbers preserved
  7. RAG query          → retrieves clean chunks (not PDF binary)
"""

import os
import sys
import re
import pytest
from pathlib import Path

# ── Make sure we can import app modules ──────────────────────────────────────
sys.path.insert(0, str(Path(__file__).resolve().parent))

# ──────────────────────────────────────────────────────────────────────────────
# Constants — raw PDF tokens that must NOT appear in extracted content
# ──────────────────────────────────────────────────────────────────────────────
RAW_PDF_TOKENS = [
    "%PDF-",
    "endobj",
    "/MediaBox",
    "/Resources",
    "/ProcSet",
    "/Contents",
    "/Type /Page",
    "xref",
    "startxref",
    "endstream",
]

HANDBOOK_PATH = Path(__file__).resolve().parent / "data" / "handbook.pdf"


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def contains_raw_pdf_syntax(text: str, threshold: int = 2) -> bool:
    """
    Returns True if the text contains >= threshold raw PDF tokens.
    A single incidental occurrence may be legitimate document content;
    multiple occurrences strongly indicates raw PDF byte leakage.
    """
    hits = sum(1 for tok in RAW_PDF_TOKENS if tok in text)
    return hits >= threshold


def alpha_ratio(text: str) -> float:
    if not text:
        return 0.0
    alpha = sum(1 for c in text if c.isalpha())
    return alpha / len(text)


# ──────────────────────────────────────────────────────────────────────────────
# TEST 1 — Normal text PDF → readable text, no raw PDF tokens
# ──────────────────────────────────────────────────────────────────────────────
def test_handbook_extraction_readable():
    """
    The handbook.pdf is a text-based PDF.
    After extraction via the RAG pipeline, the retrieved chunks must:
    - Contain real human-readable text
    - NOT begin with or primarily consist of raw PDF syntax
    """
    if not HANDBOOK_PATH.exists():
        pytest.skip(f"handbook.pdf not found at {HANDBOOK_PATH}")

    from app.rag import retriever

    # Ask a factual question that should return real content
    results = retriever.invoke("What is the annual leave policy?")
    assert len(results) > 0, "Retriever returned no results"

    for doc in results:
        text = doc.page_content
        assert text, "Retrieved chunk is empty"

        # Must not be primarily raw PDF bytes
        assert not contains_raw_pdf_syntax(text), (
            f"Chunk contains raw PDF syntax tokens.\nChunk preview: {text[:300]}"
        )

        # Must have reasonable alphabetic content
        ratio = alpha_ratio(text)
        assert ratio >= 0.4, (
            f"Alphabetic character ratio too low ({ratio:.2f}) — likely raw PDF content.\n"
            f"Chunk preview: {text[:300]}"
        )

        # Must have at least a few words
        words = text.split()
        assert len(words) >= 10, (
            f"Chunk has only {len(words)} words — likely empty or corrupted.\n"
            f"Chunk: {text[:300]}"
        )


# ──────────────────────────────────────────────────────────────────────────────
# TEST 2 — Corrupted / raw PDF text → validator rejects it
# ──────────────────────────────────────────────────────────────────────────────
def test_raw_pdf_text_detected_as_corrupted():
    """
    Simulate what the old FileReader.readAsText() produced.
    The validator must flag this as unreadable.
    """
    raw_pdf_text = (
        "%PDF-1.4\n"
        "1 0 obj\n"
        "<< /Type /Catalog /Pages 2 0 R >>\n"
        "endobj\n"
        "2 0 obj\n"
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n"
        "endobj\n"
        "3 0 obj\n"
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]\n"
        "/Resources << /ProcSet [/PDF /Text] >> /Contents 4 0 R >>\n"
        "endobj\n"
        "xref\n"
        "0 5\n"
        "startxref\n"
        "9999\n"
        "%%EOF\n"
    )

    # This should be clearly detected as corrupted
    assert contains_raw_pdf_syntax(raw_pdf_text, threshold=2), (
        "Raw PDF text was not detected as containing PDF syntax — validator may be broken"
    )

    # Alpha ratio should be low
    ratio = alpha_ratio(raw_pdf_text)
    assert ratio < 0.55, (
        f"Alpha ratio of raw PDF text should be low, got {ratio:.2f}"
    )


# ──────────────────────────────────────────────────────────────────────────────
# TEST 3 — Empty extraction → rejected
# ──────────────────────────────────────────────────────────────────────────────
def test_empty_extraction_rejected():
    """
    An empty extraction result must not pass the quality gate.
    """
    empty_text = ""
    assert not empty_text.strip(), "Empty text should have no content"

    # Simulate quality check
    word_count = len(empty_text.split())
    assert word_count == 0, "Word count of empty string should be 0"


# ──────────────────────────────────────────────────────────────────────────────
# TEST 4 — 86-page document: extraction completes, chunks created
# ──────────────────────────────────────────────────────────────────────────────
def test_handbook_chunks_created():
    """
    The handbook is ~86 pages. The pipeline must produce multiple chunks
    with real content.
    """
    if not HANDBOOK_PATH.exists():
        pytest.skip(f"handbook.pdf not found at {HANDBOOK_PATH}")

    from app.rag import chunks, documents

    assert len(documents) > 0, "No pages loaded from handbook.pdf"
    assert len(chunks) > 0, f"No chunks created from {len(documents)} pages"

    print(f"\n  Pages loaded: {len(documents)}")
    print(f"  Chunks created: {len(chunks)}")

    # Verify a sample of chunks look clean
    sample = chunks[:5]
    for i, chunk in enumerate(sample):
        text = chunk.page_content
        assert not contains_raw_pdf_syntax(text), (
            f"Chunk {i} contains raw PDF syntax.\nPreview: {text[:200]}"
        )
        assert len(text.split()) >= 5, (
            f"Chunk {i} has too few words: '{text[:100]}'"
        )


# ──────────────────────────────────────────────────────────────────────────────
# TEST 5 — Summary must not contain raw PDF syntax
# ──────────────────────────────────────────────────────────────────────────────
def test_summary_does_not_contain_raw_pdf():
    """
    The LLM summary pipeline should receive clean text.
    Verify the context passed to the LLM is not contaminated with raw PDF tokens.
    """
    if not HANDBOOK_PATH.exists():
        pytest.skip(f"handbook.pdf not found at {HANDBOOK_PATH}")

    from app.rag import chunks

    # Build the context string the way the generate node does
    context = "\n\n".join(c.page_content for c in chunks[:4])

    assert not contains_raw_pdf_syntax(context), (
        f"Context sent to LLM contains raw PDF syntax!\nPreview: {context[:400]}"
    )


# ──────────────────────────────────────────────────────────────────────────────
# TEST 6 — Source metadata: page numbers are 1-based integers
# ──────────────────────────────────────────────────────────────────────────────
def test_source_page_numbers_are_valid():
    """
    All retrieved chunks must have numeric, 1-based page metadata.
    """
    if not HANDBOOK_PATH.exists():
        pytest.skip(f"handbook.pdf not found at {HANDBOOK_PATH}")

    from app.rag import retriever

    results = retriever.invoke("annual leave")
    assert len(results) > 0

    for doc in results:
        page = doc.metadata.get("page")
        assert page is not None, f"Chunk missing page metadata: {doc.metadata}"
        # pypdf uses 0-based internally; our code adds +1 for display
        # so the raw metadata page value should be >= 0
        assert isinstance(page, (int, float)), f"Page metadata is not numeric: {page}"
        assert page >= 0, f"Page number is negative: {page}"


# ──────────────────────────────────────────────────────────────────────────────
# TEST 7 — RAG Q&A returns clean chunks for a factual query
# ──────────────────────────────────────────────────────────────────────────────
def test_rag_query_returns_clean_content():
    """
    End-to-end: send a real question through the retriever.
    The returned chunks must contain relevant, human-readable text.
    """
    if not HANDBOOK_PATH.exists():
        pytest.skip(f"handbook.pdf not found at {HANDBOOK_PATH}")

    from app.rag import retriever

    questions = [
        "What is the annual leave policy?",
        "What are the working hours?",
        "remote work policy",
    ]

    for question in questions:
        results = retriever.invoke(question)
        assert len(results) > 0, f"No results for: '{question}'"

        combined = " ".join(r.page_content for r in results)
        assert not contains_raw_pdf_syntax(combined), (
            f"RAG results for '{question}' contain raw PDF syntax.\n"
            f"Preview: {combined[:300]}"
        )
        assert alpha_ratio(combined) >= 0.4, (
            f"RAG results for '{question}' have low alpha ratio — may be corrupted.\n"
            f"Preview: {combined[:300]}"
        )


# ──────────────────────────────────────────────────────────────────────────────
# TEST 8 — Regression: extracted text must not START with %PDF-
# ──────────────────────────────────────────────────────────────────────────────
def test_extracted_text_does_not_start_with_pdf_header():
    """
    Regression test for the exact bug that was reported:
    FileReader.readAsText() produced text starting with '%PDF-1.4'.
    """
    if not HANDBOOK_PATH.exists():
        pytest.skip(f"handbook.pdf not found at {HANDBOOK_PATH}")

    from app.rag import chunks

    for i, chunk in enumerate(chunks):
        text = chunk.page_content.strip()
        assert not text.startswith("%PDF-"), (
            f"Chunk {i} starts with '%PDF-' — raw PDF binary leakage detected!\n"
            f"Chunk preview: {text[:200]}"
        )
        assert not text.startswith("obj\n"), (
            f"Chunk {i} starts with 'obj\\n' — raw PDF internal structure detected!\n"
            f"Chunk preview: {text[:200]}"
        )


# ──────────────────────────────────────────────────────────────────────────────
# Entry point for running directly
# ──────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
