import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  MessageSquare, 
  Sparkles, 
  GraduationCap, 
  GitCompare, 
  Tag, 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  Copy, 
  Check,
  Search
} from 'lucide-react';
import { Document, CitationSource } from '../../types';
import { aiService } from '../../services/aiService';

interface DocumentDetailViewProps {
  document: Document;
  onBack: () => void;
  onStartChat: (doc: Document) => void;
  onStartStudy: (doc: Document) => void;
  onStartCompare: (doc: Document) => void;
}

export const DocumentDetailView: React.FC<DocumentDetailViewProps> = ({
  document,
  onBack,
  onStartChat,
  onStartStudy,
  onStartCompare,
}) => {
  const [activeTab, setActiveTab] = useState<'sections' | 'fulltext' | 'summary' | 'metadata'>('sections');
  const [summaryData, setSummaryData] = useState<{ summary: string; keyTakeaways: string[]; sources: CitationSource[] } | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contentSearch, setContentSearch] = useState('');

  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    setActiveTab('summary');
    try {
      const res = await aiService.summarizeDocument({ document });
      setSummaryData(res);
    } catch (err) {
      console.error('Failed to summarize:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(document.textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="document-detail-view" className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 select-none">
      {/* Back Button & Top Actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Documents</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onStartChat(document)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#6366F1]/20 hover:bg-[#6366F1]/30 text-[#C0C1FF] border border-[#6366F1]/40 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat with Doc</span>
          </button>
          <button
            type="button"
            onClick={handleGenerateSummary}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1D212A] hover:bg-[#232833] text-white border border-[#2B313D] transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            <span>AI Summarize</span>
          </button>
          <button
            type="button"
            onClick={() => onStartStudy(document)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1D212A] hover:bg-[#232833] text-white border border-[#2B313D] transition-colors cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-[#06B6D4]" />
            <span>Study Cards</span>
          </button>
        </div>
      </div>

      {/* Document Hero Header */}
      <div className="p-6 rounded-2xl bg-[#161920] border border-[#262B35] space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#6366F1]/20 text-[#6366F1] flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-[#C0C1FF]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-display font-bold text-white tracking-tight">
                {document.filename}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Grounded & Ready
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1.5 font-sans leading-relaxed">
              {document.metadata?.summary || 'Authoritative research paper indexed into TalkTalk knowledge vector vault.'}
            </p>
          </div>
        </div>

        {/* Metadata Chips */}
        <div className="flex items-center gap-4 pt-4 border-t border-[#262B35] text-xs font-mono text-[#94A3B8] flex-wrap">
          <div>Collection: <span className="text-[#C0C1FF]">{document.collectionName || 'General'}</span></div>
          <span>•</span>
          <div>Pages: <span className="text-white">{document.metadata?.pages || 1}</span></div>
          <span>•</span>
          <div>Words: <span className="text-white">~{document.metadata?.wordCount?.toLocaleString() || 1200}</span></div>
          <span>•</span>
          <div>Size: <span className="text-white">{(document.size / 1024 / 1024).toFixed(2)} MB</span></div>
          <span>•</span>
          <div>Indexed: <span className="text-white">{new Date(document.uploadTimestamp).toLocaleDateString()}</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#262B35] gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('sections')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'sections' ? 'border-[#6366F1] text-white' : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          Extracted Sections ({document.sections?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('fulltext')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'fulltext' ? 'border-[#6366F1] text-white' : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          Full Text Content
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'summary' ? 'border-[#6366F1] text-white' : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          Grounded Summary
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('metadata')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'metadata' ? 'border-[#6366F1] text-white' : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          Document Metadata
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          <p className="text-xs text-[#94A3B8]">
            Individual sections parsed by the optical extraction layer, used for page-accurate citations:
          </p>
          <div className="grid grid-cols-1 gap-3">
            {document.sections?.map((sec, idx) => (
              <div
                key={sec.id}
                className="p-4 rounded-2xl bg-[#161920] border border-[#262B35] space-y-2 hover:border-[#6366F1]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-display font-semibold text-white">
                    {idx + 1}. {sec.title}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1D212A] text-[#94A3B8] border border-[#2B313D]">
                    Page {sec.page}
                  </span>
                </div>
                <p className="text-xs text-[#CBD5E1] font-sans leading-relaxed">
                  {sec.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'fulltext' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={contentSearch}
                onChange={(e) => setContentSearch(e.target.value)}
                placeholder="Find in document text..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#161920] border border-[#262B35] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#6366F1]"
              />
            </div>
            <button
              type="button"
              onClick={handleCopyContent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1D212A] hover:bg-[#232833] text-xs text-[#94A3B8] hover:text-white border border-[#2B313D] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#161920] border border-[#262B35] max-h-[500px] overflow-y-auto font-mono text-xs text-[#CBD5E1] leading-relaxed whitespace-pre-wrap">
            {document.textContent}
          </div>
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="space-y-4">
          {isSummarizing ? (
            <div className="p-12 text-center rounded-2xl bg-[#161920] border border-[#262B35] space-y-3">
              <Sparkles className="w-8 h-8 text-[#8B5CF6] animate-spin mx-auto" />
              <h3 className="text-sm font-semibold text-white">Synthesizing Document Summary</h3>
              <p className="text-xs text-[#94A3B8]">
                Gemini 3.8 Flash is extracting core takeaways with verbatim source excerpts...
              </p>
            </div>
          ) : summaryData ? (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-[#161920] border border-[#262B35] space-y-4">
                <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                  Executive Synthesis
                </h3>
                <div className="text-xs text-[#CBD5E1] font-sans leading-relaxed whitespace-pre-line">
                  {summaryData.summary}
                </div>

                <div className="pt-4 border-t border-[#262B35] space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                    Key Empirical Takeaways
                  </h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-xs text-[#CBD5E1]">
                    {summaryData.keyTakeaways.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[#161920] border border-[#262B35] space-y-3">
              <Sparkles className="w-8 h-8 text-[#8B5CF6] mx-auto" />
              <h3 className="text-sm font-semibold text-white">Generate an AI Summary</h3>
              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
                Click below to synthesize an executive breakdown with verified empirical takeaways.
              </p>
              <button
                type="button"
                onClick={handleGenerateSummary}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white cursor-pointer"
              >
                Summarize with Gemini
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'metadata' && (
        <div className="p-6 rounded-2xl bg-[#161920] border border-[#262B35] space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[#64748B] block mb-1">Author / Publisher:</span>
              <span className="text-white font-medium">{document.metadata?.author || 'Unspecified'}</span>
            </div>
            <div>
              <span className="text-[#64748B] block mb-1">Detected Language:</span>
              <span className="text-white font-medium">{document.metadata?.language || 'English'}</span>
            </div>
            <div>
              <span className="text-[#64748B] block mb-1">File MIME Type:</span>
              <span className="text-white font-mono">{document.metadata?.mimeType || 'application/pdf'}</span>
            </div>
            <div>
              <span className="text-[#64748B] block mb-1">Document UUID:</span>
              <span className="text-[#94A3B8] font-mono">{document.id}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#262B35]">
            <span className="text-[#64748B] block mb-2">Subject Tags:</span>
            <div className="flex flex-wrap gap-2">
              {document.metadata?.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#1E232E] text-xs font-mono text-[#C0C1FF] border border-[#2B313D]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
