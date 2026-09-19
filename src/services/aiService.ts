import { 
  AIServiceResponse, 
  CitationSource, 
  ComparisonResult, 
  Document, 
  Message, 
  StudyPackage, 
  AIMode 
} from '../types';

export interface AnswerQuestionInput {
  query: string;
  documents: Document[];
  collectionId?: string;
  mode?: AIMode;
  conversationHistory?: Message[];
}

export interface SummarizeDocumentInput {
  document: Document;
  summaryType?: 'executive' | 'detailed' | 'bullet_points';
}

export interface CompareDocumentsInput {
  documents: Document[];
  comparisonAspects?: string[];
}

export interface GenerateStudyMaterialInput {
  documents: Document[];
  format?: 'flashcards' | 'quiz' | 'all';
}

export interface ResearchQuestionInput {
  topic: string;
  documents: Document[];
  depth?: 'quick' | 'deep' | 'comprehensive';
}

/**
 * Service abstraction for TalkTalk AI operations.
 * Isolates UI components from the underlying API layer, allowing seamless
 * migration to a Python / FastAPI / LangChain / LangGraph / RAG backend.
 */
class AIService {
  private apiBaseUrl = '/api/ai';

  /**
   * Grounded question answering over provided documents.
   */
  async answerQuestion(input: AnswerQuestionInput): Promise<AIServiceResponse> {
    const payload = {
      query: input.query,
      documents: input.documents.map((d) => ({
        id: d.id,
        filename: d.filename,
        textContent: d.textContent,
        sections: d.sections,
        metadata: d.metadata,
      })),
      collectionId: input.collectionId,
      mode: input.mode || 'knowledge',
      conversationHistory: input.conversationHistory || [],
    };

    try {
      const response = await fetch(`${this.apiBaseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        answer: data.answer,
        sources: (data.sources || []).map((s: any) => ({
          document_id: s.document_id || s.documentId || '',
          document_name: s.document_name || s.documentName || 'Document',
          page: s.page || 1,
          section: s.section || 'General',
          excerpt: s.excerpt || '',
        })),
        confidence: null, // As mandated: do not invent confidence values
        mode: input.mode || 'knowledge',
        latencyMs: data.latencyMs,
        tokenUsage: data.tokenUsage,
      };
    } catch (err: any) {
      console.error('[aiService.answerQuestion error]', err);
      throw err;
    }
  }

  /**
   * Generates a grounded summary of a single document.
   */
  async summarizeDocument(input: SummarizeDocumentInput): Promise<{
    summary: string;
    keyTakeaways: string[];
    sources: CitationSource[];
    latencyMs?: number;
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: {
            id: input.document.id,
            filename: input.document.filename,
            textContent: input.document.textContent,
            sections: input.document.sections,
            metadata: input.document.metadata,
          },
          summaryType: input.summaryType || 'executive',
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('[aiService.summarizeDocument error]', err);
      throw err;
    }
  }

  /**
   * Compares two or more documents along key aspects.
   */
  async compareDocuments(input: CompareDocumentsInput): Promise<ComparisonResult> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: input.documents.map((d) => ({
            id: d.id,
            filename: d.filename,
            textContent: d.textContent,
            metadata: d.metadata,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('[aiService.compareDocuments error]', err);
      throw err;
    }
  }

  /**
   * Generates interactive flashcards, quizzes, and summary notes.
   */
  async generateStudyMaterial(input: GenerateStudyMaterialInput): Promise<StudyPackage> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/study`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: input.documents.map((d) => ({
            id: d.id,
            filename: d.filename,
            textContent: d.textContent,
            metadata: d.metadata,
          })),
          format: input.format || 'all',
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('[aiService.generateStudyMaterial error]', err);
      throw err;
    }
  }

  /**
   * Deep exploratory research synthesis over corpus.
   */
  async researchQuestion(input: ResearchQuestionInput): Promise<AIServiceResponse> {
    return this.answerQuestion({
      query: `DEEP RESEARCH PROMPT: ${input.topic}. Perform cross-document synthesis, examine methodology, and flag any contradictions or empirical gaps.`,
      documents: input.documents,
      mode: 'research',
    });
  }
}

export const aiService = new AIService();
