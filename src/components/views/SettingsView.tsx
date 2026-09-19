import React, { useState } from 'react';
import { 
  Settings, 
  Cpu, 
  Download, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  Database, 
  Sparkles, 
  Terminal,
  ExternalLink
} from 'lucide-react';
import { Workspace, User, Document, Conversation, Collection } from '../../types';

interface SettingsViewProps {
  workspace: Workspace;
  user: User;
  documents: Document[];
  conversations: Conversation[];
  collections: Collection[];
  onUpdateWorkspaceName: (name: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  workspace,
  user,
  documents,
  conversations,
  collections,
  onUpdateWorkspaceName,
}) => {
  const [wsName, setWsName] = useState(workspace.name);
  const [temperature, setTemperature] = useState(0.1);
  const [strictMode, setStrictMode] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWorkspaceName(wsName);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = () => {
    const exportBundle = {
      app: 'TalkTalk AI Knowledge Assistant',
      exportedAt: new Date().toISOString(),
      workspace,
      user,
      collections,
      documents: documents.map((d) => ({
        id: d.id,
        filename: d.filename,
        metadata: d.metadata,
        sectionsCount: d.sections?.length,
        uploadTimestamp: d.uploadTimestamp,
      })),
      conversations,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `talktalk-export-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="settings-view" className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 select-none max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#262B35]">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#94A3B8]" />
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Settings & Configuration
            </h1>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Manage workspace parameters, Gemini provider configurations, and export knowledge archives.
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1 rounded-xl bg-[#10B981]/20 text-[#10B981] text-xs font-mono border border-[#10B981]/40 flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Settings saved
          </span>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Workspace Profile */}
        <div className="p-6 rounded-2xl bg-[#161920] border border-[#262B35] space-y-4">
          <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider">
            Workspace Settings
          </h2>
          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#121418] border border-[#2B313D] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">
              Active User Email
            </label>
            <input
              type="text"
              disabled
              value={user.email}
              className="w-full px-3.5 py-2 rounded-xl bg-[#121418]/50 border border-[#2B313D] text-xs text-[#64748B]"
            />
          </div>
        </div>

        {/* Primary AI Provider: Google Gemini */}
        <div className="p-6 rounded-2xl bg-[#161920] border border-[#262B35] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#6366F1]" />
              <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                Primary LLM Provider
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] text-xs font-mono border border-[#10B981]/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Google Gemini Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#1A1E26] border border-[#2B313D] space-y-1">
              <span className="text-[#64748B] block">Primary Model:</span>
              <span className="text-white font-mono font-semibold">gemini-3.8-flash</span>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Optimized for low-latency retrieval grounding, structured JSON schemas, and verbatim citation extraction.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1A1E26] border border-[#2B313D] space-y-1">
              <span className="text-[#64748B] block">API Key Security:</span>
              <span className="text-[#10B981] font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Server-side only (process.env.GEMINI_API_KEY)
              </span>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Zero client exposure. All requests are proxied securely through the Node.js backend.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#94A3B8] mb-1">
              Grounding Temperature: {temperature} (Deterministic)
            </label>
            <input
              type="range"
              min="0.0"
              max="0.5"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-[#6366F1]"
            />
            <span className="text-[10px] text-[#64748B]">
              Lower values ensure strictly deterministic responses matching source text.
            </span>
          </div>
        </div>

        {/* Python / FastAPI / LangChain / LangGraph Migration Blueprint */}
        <div className="p-6 rounded-2xl bg-[#161920] border border-[#262B35] space-y-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#06B6D4]" />
            <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              Python / FastAPI & LangGraph Migration Readiness
            </h2>
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            TalkTalk's frontend communicates exclusively through the decoupled <code className="text-[#C0C1FF] font-mono">aiService</code> abstraction layer. This allows plugging into a production Python / FastAPI service containing:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-[#1A1E26] border border-[#2B313D] text-[#CBD5E1]">
              ✓ LangChain Core
            </div>
            <div className="p-2 rounded-lg bg-[#1A1E26] border border-[#2B313D] text-[#CBD5E1]">
              ✓ Vector DB (Chroma/Pinecone)
            </div>
            <div className="p-2 rounded-lg bg-[#1A1E26] border border-[#2B313D] text-[#CBD5E1]">
              ✓ LangGraph State Machines
            </div>
            <div className="p-2 rounded-lg bg-[#1A1E26] border border-[#2B313D] text-[#CBD5E1]">
              ✓ LangSmith Telemetry
            </div>
          </div>
        </div>

        {/* Data Export & Backup */}
        <div className="p-6 rounded-2xl bg-[#161920] border border-[#262B35] flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-display font-bold text-white">
              Export Knowledge Archive
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Download all document metadata, collections, and persisted conversation threads as JSON.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1D212A] hover:bg-[#232833] text-white border border-[#2B313D] transition-colors cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4 text-[#C0C1FF]" />
            <span>Export Archive</span>
          </button>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
