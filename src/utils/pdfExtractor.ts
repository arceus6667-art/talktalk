/**
 * pdfExtractor.ts
 *
 * Real PDF text extraction for TalkTalk using Mozilla PDF.js (pdfjs-dist).
 * Replaces the broken FileReader.readAsText() approach that returned raw PDF syntax.
 *
 * Pipeline:
 *   File → pdfjs-dist → page-by-page text → validate → clean → sections
 */

import * as pdfjsLib from 'pdfjs-dist';
import type { DocumentSection } from '../types';

// ──────────────────────────────────────────────────────────────────────────────
// PDF.js worker setup
// pdfjs-dist ships a pre-built worker. Point it at the CDN copy so we don't
// need to configure a custom Vite asset pipeline.
// ──────────────────────────────────────────────────────────────────────────────
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export interface ExtractedPage {
  pageNumber: number; // 1-based
  text: string;
  source: string; // filename
}

export interface ExtractionResult {
  pages: ExtractedPage[];
  fullText: string;
  pageCount: number;
  wordCount: number;
  extractionMethod: 'pdfjs' | 'ocr' | 'text';
  quality: ExtractionQuality;
}

export interface ExtractionQuality {
  score: number;          // 0–1, higher = better
  readable: boolean;      // true if usable
  reason?: string;        // why it failed, if applicable
}

// ──────────────────────────────────────────────────────────────────────────────
// Raw PDF syntax tokens — used for quality validation
// ──────────────────────────────────────────────────────────────────────────────
const RAW_PDF_TOKENS = [
  '%PDF-',
  'endobj',
  'xref\n',
  '/MediaBox',
  '/Resources',
  '/ProcSet',
  '/Contents',
  '/Type /Page',
  '/Type/Page',
  'startxref',
  'stream\r\n',
  'endstream',
  '/Filter /FlateDecode',
  '/Filter/FlateDecode',
];

// ──────────────────────────────────────────────────────────────────────────────
// 1. Primary extraction — PDF.js (text-based PDFs)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Indexes extracted pages into the live RAG vector store.
 * Must be called after a successful extractTextFromPdf() so the document
 * is immediately queryable via /api/chat.
 */
export async function indexDocument(
  docId: string,
  filename: string,
  pages: ExtractedPage[]
): Promise<{ chunks_added: number }> {
  const payload = { doc_id: docId, filename, pages };
  const response = await fetch('/api/documents/index', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.text();
    console.warn(`[TalkTalk] RAG indexing failed for '${filename}': ${err}`);
    return { chunks_added: 0 };
  }
  return response.json();
}

export async function extractTextFromPdf(file: File, docId?: string): Promise<ExtractionResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/documents/extract', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Backend extraction failed: ${err}`);
  }

  const result = (await response.json()) as ExtractionResult;

  // ── Auto-index into the live RAG vector store ──────────────────────────
  if (result.quality.readable && result.pages.length > 0) {
    const id = docId ?? `${file.name}-${Date.now()}`;
    indexDocument(id, file.name, result.pages).then(({ chunks_added }) => {
      console.info(`[TalkTalk] Indexed '${file.name}' into RAG — ${chunks_added} chunks.`);
    });
  }

  return result;
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. Plain-text extraction (for .txt, .md, .csv files — not PDF)
// ──────────────────────────────────────────────────────────────────────────────

export async function extractTextFromPlainFile(file: File): Promise<ExtractionResult> {
  const text = await file.text();
  const cleaned = cleanExtractedText(text);
  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
  const lines = cleaned.split('\n');
  // Treat every ~50 lines as a "page" for metadata consistency
  const pageCount = Math.max(1, Math.ceil(lines.length / 50));

  const pages: ExtractedPage[] = [];
  for (let i = 0; i < pageCount; i++) {
    const slice = lines.slice(i * 50, (i + 1) * 50).join('\n');
    pages.push({ pageNumber: i + 1, text: slice, source: file.name });
  }

  return {
    pages,
    fullText: cleaned,
    pageCount,
    wordCount,
    extractionMethod: 'text',
    quality: { score: 1, readable: true },
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. OCR fallback stub
// Called when PDF.js extracts too little text (scanned/image PDFs).
// TODO: Integrate a real OCR service (e.g. Tesseract.js or a server endpoint).
// ──────────────────────────────────────────────────────────────────────────────

export async function extractTextWithOcr(_file: File): Promise<ExtractionResult> {
  // OCR NOT YET IMPLEMENTED.
  // Return a clearly-marked failed result so the UI can show "Needs OCR".
  console.warn('[TalkTalk] OCR fallback triggered — OCR not yet implemented.');
  return {
    pages: [],
    fullText: '',
    pageCount: 0,
    wordCount: 0,
    extractionMethod: 'ocr',
    quality: {
      score: 0,
      readable: false,
      reason: 'Scanned PDF detected. OCR extraction is not yet available. Please upload a text-based PDF.',
    },
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// 4. Smart dispatcher — picks the right strategy per file type
// ──────────────────────────────────────────────────────────────────────────────

export async function extractDocument(file: File): Promise<ExtractionResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (ext === 'pdf') {
    const result = await extractTextFromPdf(file);

    // If extraction yielded very little text, assume scanned PDF → OCR fallback
    if (!result.quality.readable) {
      console.warn('[TalkTalk] PDF.js extraction failed quality check, attempting OCR fallback...');
      return extractTextWithOcr(file);
    }

    return result;
  }

  // Plain text formats
  if (['txt', 'md', 'csv', 'json'].includes(ext)) {
    return extractTextFromPlainFile(file);
  }

  // DOCX and other binary formats — not yet supported
  return {
    pages: [],
    fullText: '',
    pageCount: 0,
    wordCount: 0,
    extractionMethod: 'text',
    quality: {
      score: 0,
      readable: false,
      reason: `File format .${ext} is not yet supported for text extraction. Please convert to PDF or TXT.`,
    },
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// 5. Extraction quality validator
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Validates the quality of extracted text to detect raw PDF binary leakage.
 *
 * Scoring criteria:
 *   - Alphabetic character ratio (must be high for real prose)
 *   - Raw PDF token density (must be low)
 *   - Word count relative to file size (very few words for large file = suspicious)
 *   - Minimum length check
 */
export function validateExtraction(
  text: string,
  fileSizeBytes: number,
  pageCount: number = 1
): ExtractionQuality {
  if (!text || text.trim().length === 0) {
    return {
      score: 0,
      readable: false,
      reason: 'Extraction returned empty text. The PDF may be image-only (scanned).',
    };
  }

  const totalChars = text.length;
  const alphaChars = (text.match(/[a-zA-Z]/g) || []).length;
  const alphaRatio = alphaChars / totalChars;

  // Count how many raw PDF tokens appear
  const rawTokenHits = RAW_PDF_TOKENS.filter((tok) => text.includes(tok)).length;
  const rawTokenRatio = rawTokenHits / RAW_PDF_TOKENS.length;

  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Expected minimum: at least 50 words per page for a real document
  const minExpectedWords = Math.max(50, pageCount * 30);
  const wordCountOk = wordCount >= minExpectedWords;

  // Start with a perfect score and deduct
  let score = 1.0;

  if (alphaRatio < 0.4) score -= 0.5;       // Too many non-alpha chars
  if (rawTokenRatio > 0.2) score -= 0.4;    // Multiple PDF tokens detected
  if (rawTokenRatio > 0.4) score -= 0.3;    // Heavy PDF contamination
  if (!wordCountOk) score -= 0.2;            // Too few words
  if (totalChars < 100) score -= 0.3;       // Suspiciously short

  score = Math.max(0, Math.min(1, score));
  const readable = score >= 0.5;

  if (!readable) {
    let reason = 'Extracted text quality is too low. ';
    if (alphaRatio < 0.4) reason += `Low alphabetic ratio (${(alphaRatio * 100).toFixed(0)}%). `;
    if (rawTokenRatio > 0.2) reason += `Raw PDF syntax detected (${rawTokenHits} tokens). `;
    if (!wordCountOk) reason += `Too few words (${wordCount}) for a ${pageCount}-page document. `;

    return { score, readable: false, reason: reason.trim() };
  }

  return { score, readable: true };
}

// ──────────────────────────────────────────────────────────────────────────────
// 6. Text cleaner
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Cleans extracted text without aggressively removing meaningful content.
 * Targets: control chars, excessive blank lines, broken hyphenation.
 */
export function cleanExtractedText(text: string): string {
  return text
    // Remove null bytes and other non-printable control characters (keep \n \t)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Collapse 3+ consecutive blank lines into 2
    .replace(/\n{3,}/g, '\n\n')
    // Trim trailing whitespace from each line
    .split('\n').map((line) => line.trimEnd()).join('\n')
    // Remove lines that are entirely whitespace
    .replace(/^\s+$/gm, '')
    // Rejoin broken hyphenated words across line boundaries (common PDF artifact)
    .replace(/-\n([a-z])/g, '$1')
    .trim();
}

// ──────────────────────────────────────────────────────────────────────────────
// 7. Section builder — from extracted pages → DocumentSection[]
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Converts ExtractedPage[] into DocumentSection[] for the UI.
 *
 * Strategy:
 *   1. Try to detect headings (lines in ALL CAPS or title-case short lines)
 *   2. Fall back to page-based sections (Page 1, Page 2, ...)
 *
 * Always preserves page numbers (1-based).
 */
export function buildSections(pages: ExtractedPage[], docId: string): DocumentSection[] {
  const sections: DocumentSection[] = [];
  let sectionIndex = 0;

  for (const page of pages) {
    if (!page.text.trim()) continue;

    const lines = page.text.split('\n').filter((l) => l.trim().length > 0);

    // Attempt heading detection: first non-empty line of page
    const firstLine = lines[0]?.trim() ?? '';
    const looksLikeHeading =
      firstLine.length > 0 &&
      firstLine.length < 100 &&
      (
        // All caps heading
        firstLine === firstLine.toUpperCase() ||
        // Title case (most words capitalised)
        firstLine.split(' ').filter((w) => w.length > 3 && w[0] === w[0].toUpperCase()).length >=
          Math.floor(firstLine.split(' ').length * 0.5)
      );

    const title = looksLikeHeading ? firstLine : `Page ${page.pageNumber}`;
    const content = looksLikeHeading ? lines.slice(1).join('\n').trim() : page.text.trim();

    // Only add section if there's meaningful content
    if (content.length > 20) {
      sectionIndex++;
      sections.push({
        id: `${docId}-sec-${sectionIndex}`,
        page: page.pageNumber,
        title,
        content: content.slice(0, 2000), // Cap section preview at 2000 chars
      });
    }
  }

  // If we got no sections at all, create a single fallback
  if (sections.length === 0) {
    sections.push({
      id: `${docId}-sec-1`,
      page: 1,
      title: 'Document Content',
      content: pages.map((p) => p.text).join('\n\n').slice(0, 2000),
    });
  }

  return sections;
}
