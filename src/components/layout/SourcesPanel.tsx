import React from 'react';
import { FileText, ExternalLink, Sparkles, CheckCircle2, Bookmark } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { AppRoute } from '../../types';

export interface SourceCitation {
  id: string;
  docTitle: string;
  pageNumber: number;
  snippet: string;
  score: number;
}

interface SourcesPanelProps {
  citations?: SourceCitation[];
  onSelectDoc?: (docId: string) => void;
  onNavigate?: (route: AppRoute) => void;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({
  citations = [
    {
      id: 'doc-1',
      docTitle: 'Q3_2026_Architecture_Report.pdf',
      pageNumber: 14,
      snippet: 'Customer payload persistence must enforce AES-256-GCM encryption with mandatory AWS KMS key rotation strictly every 90 days. Unrotated keys trigger automated SOC2 compliance alerts.',
      score: 99.4
    },
    {
      id: 'doc-2',
      docTitle: 'Security_Policy_v4.docx',
      pageNumber: 8,
      snippet: 'Data at rest and in transit must undergo SHA-256 integrity verification before entering vector index storage.',
      score: 94.2
    }
  ],
  onSelectDoc,
  onNavigate
}) => {
  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-white text-sm">Grounded Sources</h3>
        </div>
        <Badge variant="indigo" size="sm">
          {citations.length} Verified Sources
        </Badge>
      </div>

      <div className="space-y-3">
        {citations.map((citation, index) => (
          <div
            key={citation.id}
            className="p-4 rounded-xl bg-[#0e121b] border border-slate-800 space-y-2.5 transition-all hover:border-indigo-500/40"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <span className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                  #{index + 1}
                </span>
                <span className="font-semibold text-white truncate">{citation.docTitle}</span>
              </div>
              <Badge variant="cyan" size="sm" className="shrink-0">
                Pg {citation.pageNumber}
              </Badge>
            </div>

            <p className="text-[11px] text-slate-300 bg-[#07090e] p-2.5 rounded-lg border border-slate-800/80 leading-relaxed font-sans italic">
              "{citation.snippet}"
            </p>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="text-emerald-400 font-mono flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                {citation.score}% Match
              </span>
              <button
                onClick={() => onNavigate && onNavigate('/document-detail')}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors"
              >
                Inspect Document <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
