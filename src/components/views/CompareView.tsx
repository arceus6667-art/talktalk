import React, { useState } from 'react';
import { 
  GitCompare, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Layers, 
  Check, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Document, ComparisonResult } from '../../types';
import { aiService } from '../../services/aiService';

interface CompareViewProps {
  documents: Document[];
  onSelectDocumentDetail: (docId: string) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  documents,
  onSelectDocumentDetail,
}) => {
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([
    documents[0]?.id || '',
    documents[1]?.id || '',
  ].filter(Boolean));

  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleDoc = (docId: string) => {
    if (selectedDocIds.includes(docId)) {
      if (selectedDocIds.length <= 2) return; // Keep at least 2
      setSelectedDocIds(selectedDocIds.filter((id) => id !== docId));
    } else {
      setSelectedDocIds([...selectedDocIds, docId]);
    }
  };

  const handleRunComparison = async () => {
    if (selectedDocIds.length < 2) {
      setError('Please select at least 2 documents to compare.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const chosenDocs = documents.filter((d) => selectedDocIds.includes(d.id));
      const res = await aiService.compareDocuments({ documents: chosenDocs });
      setComparisonResult(res);
    } catch (err: any) {
      setError('Failed to run document comparison. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="compare-view" className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#262B35]">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-[#06B6D4]" />
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Compare Documents
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#1D212A] text-xs font-mono text-[#06B6D4] border border-[#06B6D4]/30">
              Multi-Document Synthesis
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Analyze methodological approaches, empirical metrics, contradictions, and consensus points across papers.
          </p>
        </div>

        <button
          id="run-compare-btn"
          type="button"
          onClick={handleRunComparison}
          disabled={isLoading || selectedDocIds.length < 2}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#06B6D4] to-[#6366F1] text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_28px_rgba(6,182,212,0.6)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isLoading ? 'Comparing with Gemini...' : 'Run Comparative Analysis'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-xs text-[#FCA5A5]">
          {error}
        </div>
      )}

      {/* Document Selection Strip */}
      <div className="p-4 rounded-2xl bg-[#161920] border border-[#262B35] space-y-3">
        <h3 className="text-xs font-mono uppercase text-[#94A3B8]">
          Select Documents to Compare (Min 2):
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {documents.map((doc) => {
            const isSelected = selectedDocIds.includes(doc.id);
            return (
              <div
                key={doc.id}
                onClick={() => handleToggleDoc(doc.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                  isSelected
                    ? 'bg-[#1E232E] border-[#06B6D4] text-white shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'bg-[#1A1E26] border-[#2B313D] text-[#94A3B8] hover:text-white'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center text-[10px] shrink-0 ${
                    isSelected ? 'bg-[#06B6D4] text-black' : 'border border-[#64748B]'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate font-display">{doc.filename}</p>
                  <p className="text-[10px] font-mono text-[#64748B] mt-0.5">
                    {doc.metadata?.pages || 1} pages • {doc.collectionName || 'General'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-12 text-center rounded-2xl bg-[#161920] border border-[#262B35] space-y-3">
          <Sparkles className="w-8 h-8 text-[#06B6D4] animate-spin mx-auto" />
          <h3 className="text-sm font-semibold text-white">Cross-Referencing Selected Documents</h3>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
            Gemini is aligning theoretical frameworks, comparing empirical bounds, and identifying points of divergence...
          </p>
        </div>
      )}

      {/* Comparison Results */}
      {!isLoading && comparisonResult && (
        <div className="space-y-6">
          {/* Overall Synthesis */}
          <div className="p-6 rounded-2xl bg-[#161920] border border-[#262B35] space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#06B6D4]" />
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
                Cross-Document Executive Synthesis
              </h3>
            </div>
            <div className="text-xs text-[#CBD5E1] font-sans leading-relaxed whitespace-pre-line">
              {comparisonResult.overallSynthesis}
            </div>
          </div>

          {/* Consensus vs Contradictions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Consensus */}
            <div className="p-5 rounded-2xl bg-[#161920] border border-[#262B35] space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#10B981] uppercase tracking-wider font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Empirical Consensus Points</span>
              </div>
              <ul className="space-y-2">
                {comparisonResult.consensusPoints?.map((pt, i) => (
                  <li key={i} className="text-xs text-[#CBD5E1] flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contradictions / Divergences */}
            <div className="p-5 rounded-2xl bg-[#161920] border border-[#262B35] space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#F59E0B] uppercase tracking-wider font-mono">
                <AlertTriangle className="w-4 h-4" />
                <span>Identified Divergences & Contradictions</span>
              </div>
              <ul className="space-y-2">
                {comparisonResult.keyContradictions?.map((pt, i) => (
                  <li key={i} className="text-xs text-[#CBD5E1] flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-1.5 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Detailed Aspect Matrix */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-[#94A3B8]">
              Detailed Comparison Matrix by Analytical Dimension
            </h3>

            <div className="space-y-3">
              {comparisonResult.aspects?.map((aspect, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#161920] border border-[#262B35] space-y-3"
                >
                  <div className="border-b border-[#262B35] pb-2">
                    <h4 className="text-xs font-display font-bold text-white">
                      {idx + 1}. {aspect.title}
                    </h4>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">{aspect.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-[#1A1E26] border border-[#2B313D] space-y-1">
                      <span className="text-[10px] font-mono text-[#06B6D4] uppercase">Document A Analysis</span>
                      <p className="text-[#CBD5E1] leading-relaxed">{aspect.docAAnalysis}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#1A1E26] border border-[#2B313D] space-y-1">
                      <span className="text-[10px] font-mono text-[#8B5CF6] uppercase">Document B Analysis</span>
                      <p className="text-[#CBD5E1] leading-relaxed">{aspect.docBAnalysis}</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#1E232E] text-xs font-mono text-[#C0C1FF] flex items-center gap-2">
                    <span className="font-semibold text-white shrink-0">Synthesis Note:</span>
                    <span>{aspect.synthesisNote}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Initial Call to Action if not compared yet */}
      {!isLoading && !comparisonResult && (
        <div className="p-12 text-center rounded-2xl bg-[#161920] border border-[#262B35] space-y-3">
          <GitCompare className="w-10 h-10 text-[#64748B] mx-auto" />
          <h3 className="text-sm font-semibold text-white">Ready for Cross-Document Comparison</h3>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
            Choose 2 or more documents above and click "Run Comparative Analysis" to discover overlapping findings, differences, and unique contributions.
          </p>
        </div>
      )}
    </div>
  );
};
