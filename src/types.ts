export type DocumentStatus = 'uploading' | 'processing' | 'indexing' | 'ready' | 'failed';

export type AIMode = 'knowledge' | 'summarize' | 'compare' | 'study' | 'research';

export type AppRoute =
  | '/landing'
  | '/login'
  | '/signup'
  | '/onboarding'
  | '/dashboard'
  | '/documents'
  | '/collections'
  | '/chat'
  | '/compare'
  | '/study'
  | '/research'
  | '/saved'
  | '/analytics'
  | '/settings'
  | '/profile'
  | '/document-detail';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'researcher' | 'member';
  avatarUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  documentCount: number;
}

export interface DocumentSection {
  id: string;
  page: number;
  title: string;
  content: string;
}

export interface DocumentMetadata {
  pages: number;
  wordCount: number;
  language: string;
  author?: string;
  tags: string[];
  summary?: string;
  mimeType: string;
}

export interface Document {
  id: string;
  workspaceId: string;
  filename: string;
  fileType: string; // 'pdf' | 'docx' | 'txt' | 'md' | 'csv'
  size: number; // in bytes
  uploadTimestamp: string;
  status: DocumentStatus;
  processingProgress?: number; // 0 to 100
  collectionId?: string;
  collectionName?: string;
  tags?: string[];
  metadata: DocumentMetadata;
  sections: DocumentSection[];
  textContent: string;
}

export interface Collection {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  color: string;
  documentCount: number;
  createdAt: string;
}

export interface CitationSource {
  document_id: string;
  document_name: string;
  page: number | string;
  section: string;
  excerpt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: CitationSource[];
  mode?: AIMode;
  confidence?: number | null;
  status?: 'sent' | 'generating' | 'completed' | 'error';
  feedback?: 'like' | 'dislike' | null;
  saved?: boolean;
  relatedQuestions?: string[];
  tokenCount?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs?: number;
}

export interface Conversation {
  id: string;
  workspaceId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  mode: AIMode;
  documentIds: string[];
  messages: Message[];
}

export interface SavedAnswer {
  id: string;
  workspaceId: string;
  conversationId: string;
  messageId: string;
  question: string;
  answer: string;
  sources: CitationSource[];
  savedAt: string;
  tags: string[];
}

export interface ObservabilityLog {
  id: string;
  timestamp: string;
  type: 'request_started' | 'doc_processing_started' | 'doc_processing_completed' | 'ai_generation_started' | 'ai_generation_completed' | 'error';
  message: string;
  details?: Record<string, any>;
  latencyMs?: number;
}

export interface AIServiceResponse {
  answer: string;
  sources: CitationSource[];
  confidence: number | null;
  mode: AIMode;
  latencyMs?: number;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  sourceDocName: string;
  page: number | string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceRef: string;
}

export interface StudyPackage {
  documentIds: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  comprehensiveSummary: string;
  keyDefinitions: { term: string; definition: string; source: string }[];
  sources: CitationSource[];
}

export interface ComparisonResult {
  documents: { id: string; name: string }[];
  aspects: {
    title: string;
    description: string;
    docAAnalysis: string;
    docBAnalysis: string;
    synthesisNote: string;
  }[];
  overallSynthesis: string;
  keyContradictions: string[];
  consensusPoints: string[];
  sources: CitationSource[];
}

export interface AIActivityStep {
  id: string;
  title: string;
  detail: string;
  status: 'pending' | 'active' | 'in_progress' | 'completed';
  timestamp?: string;
  label?: string;
  icon?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  text?: string;
  description?: string;
  duration?: number;
}

export interface OnboardingData {
  workspaceName: string;
  useCase: string;
  firstDocUploaded: boolean;
  completed: boolean;
}
