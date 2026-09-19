import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  ShieldCheck, 
  Lightbulb, 
  FileText, 
  ArrowRight,
  Clock,
  Layers
} from 'lucide-react';
import { Document, CitationSource, AIServiceResponse } from '../../types';
import { aiService } from '../../services/aiService';

interface ResearchViewProps {
  documents: Document[];
  onSelectDocumentDetail: (docId: string) => void;
}

export const ResearchView: React.FC<ResearchViewProps> = ({
  documents,
  onSelectDocumentDetail,
}) => {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState<'quick' | 'deep' | 'comprehensive'>('deep');
  const [isLoading, setIsLoading] = useState(false);
  const [researchResult, setResearchResult] = useState<AIServiceResponse | null>(null);

  const sampleTopics = [
    'Syndrome extraction latency bottlenecks in fault-tolerant surface codes',
    'Comparison of garnet LLZO and sulfide solid-state battery electrolytes',
    'Mitigating multi-agent compounding hallucinations through speculative arbitration',
  ];

  const handleRunResearch = async (targetTopic?: string) => {
    const q = targetTopic || topic;
    if (!q.trim()) return;

    setIsLoading(true);
    try {
      const res = await aiService.researchQuestion({
        topic: q,
        documents,
        depth,
      });
      setResearchResult(res);
    } catch (err) {
      console.error('Failed to run research:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="research-view" className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#262B35]">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#10B981]" />
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Deep Research Mode
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#10B981]/15 text-xs font-mono text-[#10B981] border border-[#10B981]/30">
              Autonomous Corpus Synthesis
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Conduct exploratory cross-document inquiry, formulate hypotheses, and identify empirical boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#64748B]">Corpus Scope:</span>
          <span className="px-2.5 py-1 rounded-xl bg-[#161920] border border-[#262B35] text-xs font-mono text-white">
            {documents.length} Indexed Papers
          </span>
        </div>
      </div>

      {/* Query Bar */}
      <div className="p-6 rounded-2xl bg-[#161920] border border-[#262B35] space-y-4">
        <h3 className="text-xs font-mono uppercase text-[#94A3B8]">
          Formulate Research Objective:
        </h3>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunResearch()}
              placeholder="e.g. Scaling limits of sub-Kelvin cryogenic readout lines..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121418] border border-[#2B313D] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#10B981]"
            />
          </div>

          <button
            type="button"
            onClick={() => handleRunResearch()}
            disabled={isLoading || !topic.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-40 cursor-pointer transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Synthesizing...' : 'Execute Deep Research'}</span>
          </button>
        </div>

        {/* Quick Suggestions */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[10px] font-mono text-[#64748B]">Suggested topics:</span>
          {sampleTopics.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTopic(s);
                handleRunResearch(s);
              }}
              className="text-[11px] font-mono text-[#94A3B8] hover:text-[#C0C1FF] bg-[#1A1E26] hover:bg-[#232833] border border-[#2B313D] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              {s.slice(0, 48)}...
            </button>
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="p-12 text-center rounded-2xl bg-[#161920] border border-[#262B35] space-y-3">
          <Sparkles className="w-8 h-8 text-[#10B981] animate-spin mx-auto" />
          <h3 className="text-sm font-semibold text-white">Performing Multi-Stage Research Synthesis</h3>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
            Aggregating citations across {documents.length} papers, testing empirical hypotheses, and formatting grounded report...
          </p>
        </div>
      )}

      {/* Research Output */}
      {!isLoading && researchResult && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#161920] border border-[#262B35] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#262B35]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#10B981] font-mono uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Authoritative Research Synthesis</span>
              </div>
              {researchResult.latencyMs && (
                <span className="text-[10px] font-mono text-[#64748B]">
                  Generated in {researchResult.latencyMs}ms
                </span>
              )}
            </div>

            <div className="text-xs text-[#CBD5E1] font-sans leading-relaxed whitespace-pre-wrap">
              {researchResult.answer}
            </div>

            {/* Citations list */}
            {researchResult.sources && researchResult.sources.length > 0 && (
              <div className="pt-4 border-t border-[#262B35] space-y-2">
                <h4 className="text-xs font-mono uppercase text-[#94A3B8]">
                  Verified Document Citations ({researchResult.sources.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {researchResult.sources.map((src, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#1A1E26] border border-[#2B313D] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white truncate">{src.document_name}</span>
                        <span className="text-[10px] font-mono text-[#10B981]">p. {src.page}</span>
                      </div>
                      <p className="text-[11px] font-mono text-[#94A3B8] line-clamp-3">"{src.excerpt}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
