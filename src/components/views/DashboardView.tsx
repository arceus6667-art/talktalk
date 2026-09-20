import React, { useState } from 'react';
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
  Layers,
  Bookmark,
  Folder
} from 'lucide-react';
import { Document, Conversation, ObservabilityLog, Workspace, User } from '../../types';
import { RoutePath } from '../layout/AppShell';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

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
  const [selectedCollection, setSelectedCollection] = useState<string>('All');

  // Dynamic time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const totalPages = documents.reduce((acc, d) => acc + (d.metadata?.pages || 0), 0);
  const totalWords = documents.reduce((acc, d) => acc + (d.metadata?.wordCount || 0), 0);
  const totalSizeBytes = documents.reduce((acc, d) => acc + d.size, 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);

  const collections = ['All', 'Architecture Specs', 'Research Papers', 'Compliance & SLA'];

  const filteredDocs = selectedCollection === 'All'
    ? documents
    : documents.filter((d) => d.collectionName === selectedCollection || d.tags?.includes(selectedCollection));

  return (
    <div id="dashboard-view" className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8 select-none">
      {/* Greeting & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {getGreeting()}, {user.name}
            </h1>
            <Badge variant="emerald" size="md" dot>
              Gemini 3.8 Operational
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 font-sans">
            Your knowledge assistant in <strong className="text-white font-semibold">{workspace.name}</strong>. Grounded reasoning with zero hallucinated facts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            id="dashboard-new-chat-btn"
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('/chat')}
            icon={<MessageSquare className="w-4 h-4 text-indigo-400" />}
          >
            Open Chat
          </Button>
          <Button
            id="dashboard-upload-btn"
            variant="primary"
            size="sm"
            onClick={onOpenUpload}
            icon={<Upload className="w-4 h-4" />}
            className="shadow-lg shadow-indigo-600/30"
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="hover" padding="md" className="space-y-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Indexed Documents</span>
            <Files className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{documents.length}</p>
          <p className="text-[11px] font-mono text-emerald-400">100% Vector Ready</p>
        </Card>

        <Card variant="hover" padding="md" className="space-y-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Total Corpus</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{totalPages} Pages</p>
          <p className="text-[11px] font-mono text-slate-400">~{totalWords.toLocaleString()} words ({totalSizeMB} MB)</p>
        </Card>

        <Card variant="hover" padding="md" className="space-y-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Conversations</span>
            <MessageSquare className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{conversations.length}</p>
          <p className="text-[11px] font-mono text-indigo-300">Persisted & Grounded</p>
        </Card>

        <Card variant="hover" padding="md" className="space-y-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Avg Latency</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">162 ms</p>
          <p className="text-[11px] font-mono text-emerald-400">Strict Citations Enforced</p>
        </Card>
      </div>

      {/* Quick AI Tools */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Quick AI Tools & Modes
          </h2>
          <span className="text-xs text-slate-500">Select tool to launch</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            variant="hover"
            padding="md"
            onClick={() => onNavigate('/chat')}
            className="cursor-pointer group border-indigo-500/20"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-white">Ask Knowledge</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Ask deep questions over your documents with verifiable citation excerpts.
            </p>
          </Card>

          <Card
            variant="hover"
            padding="md"
            onClick={() => onNavigate('/compare')}
            className="cursor-pointer group border-cyan-500/20"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <GitCompare className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-sm font-bold text-white">Compare Documents</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Multi-document matrix comparing methodology, contradictions, and findings.
            </p>
          </Card>

          <Card
            variant="hover"
            padding="md"
            onClick={() => onNavigate('/study')}
            className="cursor-pointer group border-violet-500/20"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="text-sm font-bold text-white">Study & Quiz Prep</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Generate interactive flashcards, quizzes, and high-yield review summaries.
            </p>
          </Card>

          <Card
            variant="hover"
            padding="md"
            onClick={() => onNavigate('/research')}
            className="cursor-pointer group border-emerald-500/20"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-white">Deep Research Mode</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Exploratory synthesis across your entire knowledge vault with gap detection.
            </p>
          </Card>
        </div>
      </div>

      {/* Collection Selector & Recent Documents / Conversations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Collection Filter:</span>
            {collections.map((col) => (
              <button
                key={col}
                onClick={() => setSelectedCollection(col)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedCollection === col
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-[#121620] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {col}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('/collections')}
            icon={<Folder className="w-3.5 h-3.5 text-indigo-400" />}
            className="text-xs text-indigo-400 shrink-0"
          >
            Manage Collections
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Documents */}
          <Card variant="default" padding="lg" className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Files className="w-4 h-4 text-indigo-400" />
                Recent Documents
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('/documents')}
                className="text-xs font-mono text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                View all ({documents.length}) <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {filteredDocs.slice(0, 4).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onSelectDocument(doc.id)}
                  className="p-3 rounded-xl bg-[#090c12] hover:bg-[#121622] border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                      {doc.filename}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-1">
                      <span className="text-indigo-300">{doc.collectionName || 'General'}</span>
                      <span>•</span>
                      <span>{doc.metadata?.pages || 1} pages</span>
                      <span>•</span>
                      <span>{(doc.size / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                  </div>
                  <Badge variant="emerald" size="sm" icon={<CheckCircle2 className="w-2.5 h-2.5" />}>
                    Ready
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Conversations */}
          <Card variant="default" padding="lg" className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-violet-400" />
                Recent Conversations
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('/chat')}
                className="text-xs font-mono text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                All threads ({conversations.length}) <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {conversations.slice(0, 4).map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className="p-3 rounded-xl bg-[#090c12] hover:bg-[#121622] border border-slate-800 hover:border-violet-500/40 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                      {conv.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-1">
                      <span className="px-1.5 py-0.2 rounded bg-violet-500/10 text-violet-300 uppercase font-semibold">
                        {conv.mode}
                      </span>
                      <span>•</span>
                      <span>{conv.messages.length} messages</span>
                      <span>•</span>
                      <span>{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Observability Log */}
      <Card variant="default" padding="lg">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              AI Activity & Observability Log
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/analytics')}
            className="text-xs font-mono text-indigo-400 hover:underline cursor-pointer"
          >
            Open Analytics →
          </button>
        </div>

        <div className="space-y-2">
          {logs.slice(0, 3).map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-xl bg-[#090c12] border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-slate-500 text-[10px] shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="truncate">{log.message}</span>
              </div>
              {log.latencyMs && (
                <span className="text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full shrink-0 ml-2 font-mono">
                  {log.latencyMs}ms
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
