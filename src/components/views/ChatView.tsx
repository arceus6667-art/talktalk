import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCw, 
  Bookmark, 
  ThumbsUp, 
  ThumbsDown, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  ExternalLink, 
  Paperclip, 
  X, 
  Layers, 
  Compass, 
  GraduationCap, 
  GitCompare,
  Clock,
  AlertCircle,
  Cpu,
  PanelRightOpen,
  PanelRightClose
} from 'lucide-react';
import { Conversation, Document, Message, CitationSource, AIMode, AppRoute } from '../../types';
import { aiService } from '../../services/aiService';
import { AIActivityPanel } from '../layout/AIActivityPanel';
import { SourcesPanel } from '../layout/SourcesPanel';
import { Tabs } from '../ui/Tabs';

interface ChatViewProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  documents: Document[];
  onSelectConversation: (convId: string) => void;
  onNewConversation: (mode?: AIMode) => void;
  onSendMessage: (conversationId: string, userText: string, attachedDocIds: string[], mode: AIMode) => Promise<void>;
  onSelectDocumentDetail?: (docId: string) => void;
  onNavigate?: (route: AppRoute) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversations,
  activeConversation,
  documents,
  onSelectConversation,
  onNewConversation,
  onSendMessage,
  onSelectDocumentDetail,
  onNavigate,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [activeMode, setActiveMode] = useState<AIMode>('knowledge');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [expandedCitationKey, setExpandedCitationKey] = useState<string | null>(null);
  const [docPickerOpen, setDocPickerOpen] = useState(false);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'like' | 'dislike'>>({});
  const [savedMessages, setSavedMessages] = useState<Record<string, boolean>>({});

  // Right Panel State (3-column layout)
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'sources' | 'activity'>('sources');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync state when activeConversation changes
  useEffect(() => {
    if (activeConversation) {
      setActiveMode(activeConversation.mode || 'knowledge');
      setSelectedDocIds(activeConversation.documentIds || documents.slice(0, 2).map((d) => d.id));
    } else if (documents.length > 0) {
      setSelectedDocIds(documents.slice(0, 2).map((d) => d.id));
    }
  }, [activeConversation, documents]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isSubmitting]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    const text = inputText.trim();
    setInputText('');
    setIsSubmitting(true);

    let targetConvId = activeConversation?.id;
    if (!targetConvId) {
      onNewConversation(activeMode);
      return;
    }

    try {
      await onSendMessage(targetConvId, text, selectedDocIds, activeMode);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (msgId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleFeedback = (msgId: string, type: 'like' | 'dislike') => {
    setFeedbackState((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === type ? (null as any) : type,
    }));
  };

  const handleToggleSave = (msgId: string) => {
    setSavedMessages((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleToggleDocAttachment = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const modeOptions: { mode: AIMode; label: string; icon: any }[] = [
    { mode: 'knowledge', label: 'Ask Knowledge', icon: MessageSquare },
    { mode: 'summarize', label: 'Summarize', icon: Sparkles },
    { mode: 'compare', label: 'Compare', icon: GitCompare },
    { mode: 'study', label: 'Study Mode', icon: GraduationCap },
    { mode: 'research', label: 'Research', icon: Compass },
  ];

  return (
    <div id="chat-view" className="flex-1 flex h-full overflow-hidden select-none bg-[#07090e]">
      {/* Left Column: Conversation History Rail */}
      <div className="hidden md:flex w-72 bg-[#0e121b] border-r border-slate-800/80 flex-col h-full shrink-0">
        <div className="p-3 border-b border-slate-800/80">
          <button
            id="chat-new-thread-btn"
            type="button"
            onClick={() => onNewConversation(activeMode)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white text-xs font-semibold transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-500 px-2.5 py-1.5 font-bold tracking-wider">
            Recent Knowledge Threads
          </div>
          {conversations.map((conv) => {
            const isSelected = conv.id === activeConversation?.id;
            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-[#181e2b] border border-indigo-500/50 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-[#121620] hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold truncate font-display text-white">
                    {conv.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                  <span className="uppercase text-indigo-300 font-semibold">{conv.mode}</span>
                  <span>•</span>
                  <span>{conv.messages.length} msgs</span>
                  <span>•</span>
                  <span>{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Column: Main Conversation Stream & Composer */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#090c12]">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800/80 bg-[#0e121b]/90 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <MessageSquare className="w-4 h-4 text-indigo-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white truncate">
                {activeConversation?.title || 'Knowledge Conversation'}
              </h2>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span>Scope:</span>
                <span className="text-emerald-400 font-semibold">{selectedDocIds.length} docs attached</span>
                <span>•</span>
                <span className="text-indigo-300 uppercase font-semibold">{activeMode}</span>
              </div>
            </div>
          </div>

          {/* Header Controls: Mode Selector + Toggle Telemetry Panel */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-[#121622] p-1 rounded-xl border border-slate-800">
              {modeOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = activeMode === opt.mode;
                return (
                  <button
                    key={opt.mode}
                    type="button"
                    onClick={() => setActiveMode(opt.mode)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                showRightPanel
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Toggle AI Activity Telemetry & Sources Panel"
            >
              {showRightPanel ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
              <span className="hidden lg:inline">Telemetry</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {(!activeConversation || activeConversation.messages.length === 0) && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Ask your knowledge vault</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Questions are answered strictly using the attached documents. Verifiable page excerpts and sections are provided with zero hallucination.
                </p>
              </div>

              {/* Quick Prompt Starters */}
              <div className="w-full space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setInputText('What are the strict encryption specifications for Q3 Architecture KMS rotation?');
                  }}
                  className="w-full p-3 rounded-xl bg-[#0e121b] hover:bg-[#151a27] border border-slate-800 text-left text-xs text-slate-300 transition-colors cursor-pointer"
                >
                  "What are the strict encryption specifications for Q3 Architecture KMS rotation?"
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputText('Compare dense vs sparse vector retrieval techniques from the research paper.');
                  }}
                  className="w-full p-3 rounded-xl bg-[#0e121b] hover:bg-[#151a27] border border-slate-800 text-left text-xs text-slate-300 transition-colors cursor-pointer"
                >
                  "Compare dense vs sparse vector retrieval techniques from the research paper."
                </button>
              </div>
            </div>
          )}

          {activeConversation?.messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSaved = savedMessages[msg.id];
            const currentFeedback = feedbackState[msg.id];

            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-2 max-w-3xl ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] rounded-tr-sm'
                      : 'bg-[#0e121b] border border-slate-800 text-slate-200 rounded-tl-sm w-full space-y-3'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
                    {msg.content}
                  </div>

                  {/* Dedicated Source UI */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Grounded Sources ({msg.sources.length})</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {msg.sources.map((src, idx) => {
                          const key = `${msg.id}-src-${idx}`;
                          const isExpanded = expandedCitationKey === key;
                          return (
                            <div
                              key={idx}
                              className="rounded-xl bg-[#121622] border border-slate-800 p-2.5 space-y-1.5"
                            >
                              <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => setExpandedCitationKey(isExpanded ? null : key)}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono flex items-center justify-center shrink-0">
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs font-semibold text-white truncate">
                                    {src.document_name}
                                  </span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                                    p. {src.page}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-400">
                                  <span className="text-[10px] font-mono text-cyan-400">{src.section}</span>
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300 bg-[#090c12] p-2.5 rounded-lg leading-relaxed border-l-2 border-emerald-400">
                                  <p className="text-slate-500 text-[10px] uppercase mb-1">Verbatim Grounded Excerpt:</p>
                                  "{src.excerpt}"
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Assistant Message Controls */}
                {!isUser && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs px-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 rounded hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                      title="Copy response"
                    >
                      {copiedMessageId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedMessageId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleSave(msg.id)}
                      className={`p-1 rounded hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-[11px] ${
                        isSaved ? 'text-indigo-400 font-bold' : ''
                      }`}
                      title="Save answer to Bookmarks"
                    >
                      <Bookmark className="w-3 h-3" />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>

                    <div className="h-3 w-px bg-slate-800 mx-1" />

                    <button
                      type="button"
                      onClick={() => handleFeedback(msg.id, 'like')}
                      className={`p-1 rounded hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
                        currentFeedback === 'like' ? 'text-emerald-400' : ''
                      }`}
                      title="Helpful grounded answer"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFeedback(msg.id, 'dislike')}
                      className={`p-1 rounded hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
                        currentFeedback === 'dislike' ? 'text-rose-400' : ''
                      }`}
                      title="Unhelpful or ungrounded"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>

                    {msg.latencyMs && (
                      <span className="text-[10px] font-mono text-slate-500 ml-2">
                        {msg.latencyMs}ms
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isSubmitting && (
            <div className="flex items-start gap-3 mr-auto max-w-xl">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-[#0e121b] border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Gemini 3.8 Flash Grounding...</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] font-mono text-slate-400">
                  Retrieving exact document passages and enforcing zero-hallucination verification...
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Composer */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0e121b]/90 backdrop-blur-md">
          {/* Attached Document Chips */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase text-slate-500">Context:</span>
            {selectedDocIds.map((id) => {
              const doc = documents.find((d) => d.id === id);
              if (!doc) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#151a27] border border-slate-700 text-[11px] font-mono text-indigo-300"
                >
                  <FileText className="w-3 h-3 text-indigo-400" />
                  <span className="truncate max-w-[140px]">{doc.filename}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleDocAttachment(id)}
                    className="text-slate-400 hover:text-white ml-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setDocPickerOpen(!docPickerOpen)}
              className="text-[10px] font-mono text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Paperclip className="w-3 h-3" />
              <span>{docPickerOpen ? 'Done' : '+ Attach Docs'}</span>
            </button>
          </div>

          {/* Doc Picker Dropdown */}
          {docPickerOpen && (
            <div className="p-3 mb-2 rounded-xl bg-[#121622] border border-slate-800 max-h-40 overflow-y-auto space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Select Documents to Ground Query</div>
              {documents.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleToggleDocAttachment(d.id)}
                  className={`p-1.5 rounded-lg text-xs cursor-pointer flex items-center justify-between ${
                    selectedDocIds.includes(d.id)
                      ? 'bg-indigo-600/20 text-white'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{d.filename}</span>
                  {selectedDocIds.includes(d.id) && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            <input
              id="chat-message-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask anything about attached documents in ${activeMode} mode...`}
              disabled={isSubmitting}
              className="w-full pl-4 pr-12 py-3 rounded-2xl bg-[#07090e] border border-slate-800 focus:border-indigo-500 text-xs text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
            />
            <button
              id="chat-send-btn"
              type="submit"
              disabled={!inputText.trim() || isSubmitting}
              className="absolute right-2 p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_16px_rgba(99,102,241,0.5)] transition-all cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-slate-500">
            <span>Grounded mode: Answers strictly verified against attached documents.</span>
            <span>Gemini 3.8 Flash</span>
          </div>
        </div>
      </div>

      {/* Right Column: AI Telemetry & Grounded Sources Panel (3rd Column) */}
      {showRightPanel && (
        <div className="hidden lg:flex w-80 bg-[#0e121b] border-l border-slate-800/80 flex-col h-full shrink-0 p-4 space-y-4 overflow-y-auto">
          <Tabs
            tabs={[
              { id: 'sources', label: 'Sources', icon: <FileText className="w-3.5 h-3.5" /> },
              { id: 'activity', label: 'AI Activity', icon: <Cpu className="w-3.5 h-3.5" /> }
            ]}
            activeTab={rightPanelTab}
            onChange={(id) => setRightPanelTab(id as 'sources' | 'activity')}
          />

          {rightPanelTab === 'sources' ? (
            <SourcesPanel onNavigate={onNavigate} />
          ) : (
            <AIActivityPanel isProcessing={isSubmitting} />
          )}
        </div>
      )}
    </div>
  );
};
