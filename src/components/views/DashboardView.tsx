import React from 'react';
import { 
  Files, 
  MessageSquare, 
  Sparkles, 
  Upload, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  GitCompare, 
  GraduationCap, 
  Compass, 
  ShieldCheck, 
  Zap, 
  ExternalLink,
  Activity,
  Layers
} from 'lucide-react';
import { Document, Conversation, ObservabilityLog, Workspace, User } from '../../types';
import { RoutePath } from '../layout/AppShell';

interface DashboardViewProps {
  workspace: Workspace;
  user: User;
  documents: Document[];
  conversations: Conversation[];
  logs: ObservabilityLog[];
  onNavigate: (route: RoutePath, params?: Record<string, string>) => void;
  onOpenUpload: () => void;
  onSelectDocument: (docId: string) => void;
  onSelectConversation: (convId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  workspace,
  user,
  documents,
  conversations,
  logs,
  onNavigate,
  onOpenUpload,
  onSelectDocument,
  onSelectConversation,
}) => {
  const totalPages = documents.reduce((acc, d) => acc + (d.metadata?.pages || 0), 0);
  const totalWords = documents.reduce((acc, d) => acc + (d.metadata?.wordCount || 0), 0);
  const totalSizeBytes = documents.reduce((acc, d) => acc + d.size, 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);

  return (
    <div id="dashboard-view" className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 select-none">
      {/* Greeting & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#262B35]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">
              Good afternoon, {user.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] text-xs font-mono font-semibold border border-[#10B981]/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Gemini 3.8 Flash Operational
            </span>
          </div>
          <p className="text-sm text-[#94A3B8] mt-1 font-sans">
            Your knowledge assistant in <strong className="text-white">{workspace.name}</strong>. Grounded reasoning with zero hallucinated facts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="dashboard-new-chat-btn"
            type="button"
            onClick={() => onNavigate('/chat')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1D212A] hover:bg-[#232833] border border-[#2B313D] text-white transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-[#C0C1FF]" />
            <span>Open Chat</span>
          </button>
          <button
            id="dashboard-upload-btn"
            type="button"
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_28px_rgba(99,102,241,0.6)] transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#161920] border border-[#262B35] shadow-sm">
          <div className="flex items-center justify-between text-[#94A3B8] mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Indexed Documents</span>
            <Files className="w-4 h-4 text-[#6366F1]" />
          </div>
          <p className="text-2xl font-display font-bold text-white">{documents.length}</p>
          <p className="text-[11px] font-mono text-[#10B981] mt-1">100% Vector Ready</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#161920] border border-[#262B35] shadow-sm">
          <div className="flex items-center justify-between text-[#94A3B8] mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Total Corpus</span>
            <Layers className="w-4 h-4 text-[#06B6D4]" />
          </div>
          <p className="text-2xl font-display font-bold text-white">{totalPages} Pages</p>
          <p className="text-[11px] font-mono text-[#94A3B8] mt-1">~{totalWords.toLocaleString()} words ({totalSizeMB} MB)</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#161920] border border-[#262B35] shadow-sm">
          <div className="flex items-center justify-between text-[#94A3B8] mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Conversations</span>
            <MessageSquare className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <p className="text-2xl font-display font-bold text-white">{conversations.length}</p>
          <p className="text-[11px] font-mono text-[#C0C1FF] mt-1">Persisted & Grounded</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#161920] border border-[#262B35] shadow-sm">
          <div className="flex items-center justify-between text-[#94A3B8] mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Avg Response Time</span>
            <Zap className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <p className="text-2xl font-display font-bold text-white">162 ms</p>
          <p className="text-[11px] font-mono text-[#10B981] mt-1">Grounded Citations Enforced</p>
        </div>
      </div>

      {/* Quick AI Tools */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-display font-bold uppercase tracking-wider text-[#94A3B8]">
            Quick AI Tools
          </h2>
          <span className="text-xs text-[#64748B]">Select tool to begin</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div
            onClick={() => onNavigate('/chat')}
            className="p-4 rounded-2xl bg-[#161920] hover:bg-[#1D212A] border border-[#262B35] hover:border-[#6366F1]/50 transition-all cursor-pointer group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-[#6366F1]/20 text-[#C0C1FF] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5 text-[#6366F1]" />
            </div>
            <h3 className="text-sm font-semibold text-white font-display">Ask Knowledge</h3>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              Ask deep questions over your documents with verifiable citation excerpts.
            </p>
          </div>

          <div
            onClick={() => onNavigate('/compare')}
            className="p-4 rounded-2xl bg-[#161920] hover:bg-[#1D212A] border border-[#262B35] hover:border-[#06B6D4]/50 transition-all cursor-pointer group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-[#06B6D4]/20 text-[#22D3EE] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <GitCompare className="w-5 h-5 text-[#06B6D4]" />
            </div>
            <h3 className="text-sm font-semibold text-white font-display">Compare Documents</h3>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              Multi-document matrix comparing methodology, contradictions, and empirical findings.
            </p>
          </div>

          <div
            onClick={() => onNavigate('/study')}
            className="p-4 rounded-2xl bg-[#161920] hover:bg-[#1D212A] border border-[#262B35] hover:border-[#8B5CF6]/50 transition-all cursor-pointer group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/20 text-[#C4ABFF] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <h3 className="text-sm font-semibold text-white font-display">Study Mode</h3>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              Generate interactive flashcards, quizzes, and high-yield review summaries.
            </p>
          </div>

          <div
            onClick={() => onNavigate('/research')}
            className="p-4 rounded-2xl bg-[#161920] hover:bg-[#1D212A] border border-[#262B35] hover:border-[#10B981]/50 transition-all cursor-pointer group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-[#10B981]/20 text-[#6FFBBE] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-[#10B981]" />
            </div>
            <h3 className="text-sm font-semibold text-white font-display">Deep Research</h3>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              Exploratory synthesis across your entire knowledge vault with gap detection.
            </p>
          </div>
        </div>
      </div>

      {/* Two-Column: Recent Documents & Recent Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="p-5 rounded-2xl bg-[#161920] border border-[#262B35] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#262B35]">
            <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <Files className="w-4 h-4 text-[#6366F1]" />
              Recent Documents
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('/documents')}
              className="text-xs font-mono text-[#C0C1FF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              View all ({documents.length}) <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {documents.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc.id)}
                className="p-3 rounded-xl bg-[#1A1E26] hover:bg-[#232833] border border-[#2B313D] hover:border-[#6366F1]/40 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <p className="text-xs font-semibold text-[#F1F5F9] group-hover:text-white truncate font-display">
                    {doc.filename}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#94A3B8] mt-1">
                    <span className="text-[#C0C1FF]">{doc.collectionName || 'General'}</span>
                    <span>•</span>
                    <span>{doc.metadata?.pages || 1} pages</span>
                    <span>•</span>
                    <span>{(doc.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Ready
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="p-5 rounded-2xl bg-[#161920] border border-[#262B35] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#262B35]">
            <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#8B5CF6]" />
              Recent Conversations
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('/chat')}
              className="text-xs font-mono text-[#C0C1FF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              All threads ({conversations.length}) <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {conversations.slice(0, 4).map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className="p-3 rounded-xl bg-[#1A1E26] hover:bg-[#232833] border border-[#2B313D] hover:border-[#8B5CF6]/40 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <p className="text-xs font-semibold text-[#F1F5F9] group-hover:text-white truncate font-display">
                    {conv.title}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#94A3B8] mt-1">
                    <span className="px-1.5 py-0.2 rounded bg-[#8B5CF6]/15 text-[#C4ABFF] uppercase">
                      {conv.mode}
                    </span>
                    <span>•</span>
                    <span>{conv.messages.length} messages</span>
                    <span>•</span>
                    <span>{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-white transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Observability / AI Activity */}
      <div className="p-5 rounded-2xl bg-[#161920] border border-[#262B35]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#262B35]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-sm font-display font-bold text-white">
              AI Activity & Observability Log
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/analytics')}
            className="text-xs font-mono text-[#C0C1FF] hover:underline cursor-pointer"
          >
            Open Analytics →
          </button>
        </div>

        <div className="space-y-2">
          {logs.slice(0, 3).map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-xl bg-[#1A1E26] border border-[#262B35] flex items-center justify-between text-xs font-mono text-[#CBD5E1]"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span className="text-[#94A3B8] text-[10px] shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="truncate">{log.message}</span>
              </div>
              {log.latencyMs && (
                <span className="text-[10px] text-[#C0C1FF] bg-[#1E232E] px-2 py-0.5 rounded-full shrink-0 ml-2">
                  {log.latencyMs}ms
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
