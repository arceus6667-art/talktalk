import React, { useState, useEffect } from 'react';
import { AppShell, RoutePath } from './components/layout/AppShell';
import { LandingView } from './components/views/LandingView';
import { LoginView } from './components/views/LoginView';
import { SignupView } from './components/views/SignupView';
import { OnboardingView } from './components/views/OnboardingView';
import { ProfileView } from './components/views/ProfileView';
import { SavedAnswersView } from './components/views/SavedAnswersView';
import { DashboardView } from './components/views/DashboardView';
import { DocumentsView } from './components/views/DocumentsView';
import { DocumentDetailView } from './components/views/DocumentDetailView';
import { CollectionsView } from './components/views/CollectionsView';
import { ChatView } from './components/views/ChatView';
import { CompareView } from './components/views/CompareView';
import { StudyView } from './components/views/StudyView';
import { ResearchView } from './components/views/ResearchView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';
import { UploadModal } from './components/modals/UploadModal';

import { 
  CURRENT_USER, 
  INITIAL_WORKSPACES, 
  INITIAL_COLLECTIONS, 
  INITIAL_DOCUMENTS, 
  INITIAL_CONVERSATIONS, 
  INITIAL_LOGS 
} from './data/mockData';

import { 
  Workspace, 
  Collection, 
  Document, 
  Conversation, 
  ObservabilityLog, 
  AIMode, 
  Message 
} from './types';

import { aiService } from './services/aiService';

export const App: React.FC = () => {
  // Navigation & routing
  const [currentRoute, setCurrentRoute] = useState<RoutePath>('/dashboard');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  // Core Data States with localStorage persistence
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    try {
      const saved = localStorage.getItem('talktalk_workspaces');
      return saved ? JSON.parse(saved) : INITIAL_WORKSPACES;
    } catch {
      return INITIAL_WORKSPACES;
    }
  });

  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(() => workspaces[0]);

  const [collections, setCollections] = useState<Collection[]>(() => {
    try {
      const saved = localStorage.getItem('talktalk_collections');
      return saved ? JSON.parse(saved) : INITIAL_COLLECTIONS;
    } catch {
      return INITIAL_COLLECTIONS;
    }
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    try {
      const saved = localStorage.getItem('talktalk_documents');
      return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
    } catch {
      return INITIAL_DOCUMENTS;
    }
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('talktalk_conversations');
      return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return conversations[0]?.id || '';
  });

  const [logs, setLogs] = useState<ObservabilityLog[]>(INITIAL_LOGS);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('talktalk_workspaces', JSON.stringify(workspaces));
      localStorage.setItem('talktalk_collections', JSON.stringify(collections));
      localStorage.setItem('talktalk_documents', JSON.stringify(documents));
      localStorage.setItem('talktalk_conversations', JSON.stringify(conversations));
    } catch (e) {
      console.warn('Storage sync failed:', e);
    }
  }, [workspaces, collections, documents, conversations]);

  // Helper to append logs
  const logEvent = (
    type: ObservabilityLog['type'],
    message: string,
    details?: any,
    latencyMs?: number
  ) => {
    const newLog: ObservabilityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type,
      message,
      details,
      latencyMs,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  // Route Navigation Handler
  const handleNavigate = (route: RoutePath, params?: Record<string, string>) => {
    setCurrentRoute(route);
    if (params?.docId) {
      setSelectedDocumentId(params.docId);
    }
  };

  // Document Upload Completion Handler
  const handleDocumentUploaded = (newDoc: Document) => {
    setDocuments((prev) => [newDoc, ...prev]);
    if (newDoc.collectionId) {
      setCollections((prev) =>
        prev.map((c) =>
          c.id === newDoc.collectionId ? { ...c, documentCount: c.documentCount + 1 } : c
        )
      );
    }
    setActiveWorkspace((prev) => ({
      ...prev,
      documentCount: prev.documentCount + 1,
    }));
    logEvent(
      'doc_processing_completed',
      `Uploaded and indexed "${newDoc.filename}" (${newDoc.metadata?.pages || 1} pages)`,
      { docId: newDoc.id, size: newDoc.size }
    );
  };

  // Document Selection Handlers
  const handleSelectDocument = (docId: string) => {
    setSelectedDocumentId(docId);
    setCurrentRoute('/documents');
  };

  const handleStartChatWithDoc = (doc: Document) => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      workspaceId: activeWorkspace.id,
      title: `Analysis: ${doc.filename.slice(0, 32)}...`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mode: 'knowledge',
      documentIds: [doc.id],
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setCurrentRoute('/chat');
  };

  const handleStartChatWithCollection = (col: Collection) => {
    const colDocs = documents.filter((d) => d.collectionId === col.id);
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      workspaceId: activeWorkspace.id,
      title: `${col.name} Inquiry`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mode: 'knowledge',
      documentIds: colDocs.map((d) => d.id),
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setCurrentRoute('/chat');
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    logEvent('doc_processing_completed', `Removed document ${docId} from knowledge vault`);
  };

  // Collection Handlers
  const handleCreateCollection = (name: string, description: string, color: string) => {
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      workspaceId: activeWorkspace.id,
      name,
      description,
      color,
      documentCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCollections((prev) => [newCol, ...prev]);
    logEvent('doc_processing_completed', `Created collection "${name}"`);
  };

  const handleDeleteCollection = (colId: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== colId));
  };

  // Chat Handlers
  const handleNewConversation = (mode: AIMode = 'knowledge') => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      workspaceId: activeWorkspace.id,
      title: 'New Knowledge Thread',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mode,
      documentIds: documents.slice(0, 2).map((d) => d.id),
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
  };

  const handleSendMessage = async (
    conversationId: string,
    userText: string,
    attachedDocIds: string[],
    mode: AIMode
  ) => {
    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-u`,
      conversationId,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...conv.messages, userMsg];
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: updatedMessages,
              title: c.messages.length === 0 ? userText.slice(0, 40) : c.title,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    logEvent('request_started', `Query in mode [${mode}]: "${userText.slice(0, 40)}..."`, {
      docCount: attachedDocIds.length,
    });

    const attachedDocs = documents.filter((d) => attachedDocIds.includes(d.id));

    try {
      const response = await aiService.answerQuestion({
        query: userText,
        documents: attachedDocs,
        mode,
        conversationHistory: updatedMessages,
      });

      const assistantMsg: Message = {
        id: `msg-${Date.now()}-a`,
        conversationId,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources,
        mode: response.mode,
        confidence: response.confidence,
        latencyMs: response.latencyMs,
        tokenCount: response.tokenUsage,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: [...c.messages, assistantMsg],
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );

      logEvent(
        'ai_generation_completed',
        `Grounded answer generated for "${userText.slice(0, 30)}..."`,
        { sourcesCount: response.sources.length },
        response.latencyMs
      );
    } catch (err: any) {
      logEvent('error', `Failed to generate answer: ${err.message}`);
      const errorMsg: Message = {
        id: `msg-${Date.now()}-err`,
        conversationId,
        role: 'assistant',
        content: 'An error occurred while connecting to the Gemini knowledge service. Please verify your connection or try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, errorMsg] }
            : c
        )
      );
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0] || null;
  const activeDocumentDetail = documents.find((d) => d.id === selectedDocumentId);

  return (
    <AppShell
      currentRoute={currentRoute}
      onRouteChange={handleNavigate}
      workspaces={workspaces}
      activeWorkspace={activeWorkspace}
      onSelectWorkspace={setActiveWorkspace}
      currentUser={CURRENT_USER}
      onOpenUpload={() => setIsUploadOpen(true)}
    >
      {/* Route Views */}
      {currentRoute === '/landing' && (
        <LandingView onNavigate={handleNavigate} />
      )}

      {currentRoute === '/login' && (
        <LoginView
          onNavigate={handleNavigate}
          onLoginSuccess={() => setCurrentRoute('/dashboard')}
        />
      )}

      {currentRoute === '/signup' && (
        <SignupView onNavigate={handleNavigate} />
      )}

      {currentRoute === '/onboarding' && (
        <OnboardingView onNavigate={handleNavigate} />
      )}

      {currentRoute === '/profile' && (
        <ProfileView />
      )}

      {currentRoute === '/saved' && (
        <SavedAnswersView onNavigate={handleNavigate} />
      )}

      {currentRoute === '/dashboard' && (
        <DashboardView
          workspace={activeWorkspace}
          user={CURRENT_USER}
          documents={documents}
          conversations={conversations}
          logs={logs}
          onNavigate={handleNavigate}
          onOpenUpload={() => setIsUploadOpen(true)}
          onSelectDocument={handleSelectDocument}
          onSelectConversation={(convId) => {
            setActiveConversationId(convId);
            setCurrentRoute('/chat');
          }}
        />
      )}

      {currentRoute === '/documents' && (
        activeDocumentDetail ? (
          <DocumentDetailView
            document={activeDocumentDetail}
            onBack={() => setSelectedDocumentId(null)}
            onStartChat={(doc) => handleStartChatWithDoc(doc)}
            onStartStudy={(doc) => {
              setSelectedDocumentId(doc.id);
              setCurrentRoute('/study');
            }}
            onStartCompare={(doc) => {
              setCurrentRoute('/compare');
            }}
          />
        ) : (
          <DocumentsView
            documents={documents}
            collections={collections}
            onSelectDocument={handleSelectDocument}
            onOpenUpload={() => setIsUploadOpen(true)}
            onStartChatWithDoc={handleStartChatWithDoc}
            onDeleteDocument={handleDeleteDocument}
          />
        )
      )}

      {currentRoute === '/collections' && (
        <CollectionsView
          collections={collections}
          documents={documents}
          onCreateCollection={handleCreateCollection}
          onDeleteCollection={handleDeleteCollection}
          onStartChatWithCollection={handleStartChatWithCollection}
          onSelectDocument={handleSelectDocument}
        />
      )}

      {currentRoute === '/chat' && (
        <ChatView
          conversations={conversations}
          activeConversation={activeConversation}
          documents={documents}
          onSelectConversation={setActiveConversationId}
          onNewConversation={handleNewConversation}
          onSendMessage={handleSendMessage}
          onSelectDocumentDetail={handleSelectDocument}
          onNavigate={handleNavigate}
        />
      )}

      {currentRoute === '/compare' && (
        <CompareView
          documents={documents}
          onSelectDocumentDetail={handleSelectDocument}
        />
      )}

      {currentRoute === '/study' && (
        <StudyView
          documents={documents}
          initialDocId={selectedDocumentId || undefined}
        />
      )}

      {currentRoute === '/research' && (
        <ResearchView
          documents={documents}
          onSelectDocumentDetail={handleSelectDocument}
        />
      )}

      {currentRoute === '/analytics' && (
        <AnalyticsView
          logs={logs}
          documents={documents}
          conversations={conversations}
        />
      )}

      {currentRoute === '/settings' && (
        <SettingsView
          workspace={activeWorkspace}
          user={CURRENT_USER}
          documents={documents}
          conversations={conversations}
          collections={collections}
          onUpdateWorkspaceName={(name) =>
            setActiveWorkspace((prev) => ({ ...prev, name }))
          }
        />
      )}

      {/* Document Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        collections={collections}
        onDocumentUploaded={handleDocumentUploaded}
      />
    </AppShell>
  );
};

export default App;
