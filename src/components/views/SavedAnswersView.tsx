import React, { useState } from 'react';
import { 
  Bookmark, 
  Search, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Sparkles, 
  Trash2, 
  Tag, 
  Download,
  Filter
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AppRoute } from '../../types';

interface SavedAnswerItem {
  id: string;
  question: string;
  answer: string;
  sourceDoc: string;
  citationPage: string;
  date: string;
  tags: string[];
}

interface SavedAnswersViewProps {
  onNavigate: (route: AppRoute) => void;
}

export const SavedAnswersView: React.FC<SavedAnswersViewProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const initialSavedAnswers: SavedAnswerItem[] = [
    {
      id: '1',
      question: 'What are the required KMS key rotation intervals for customer payload persistence?',
      answer: 'All customer data persistence layers must enforce AES-256-GCM encryption at rest with AWS KMS key rotation strictly set to every 90 days. Backups must be double-encrypted with separate key paths.',
      sourceDoc: 'Q3_2026_Architecture_Report.pdf',
      citationPage: 'Page 14, Section 3.2',
      date: '2 hours ago',
      tags: ['Security', 'KMS', 'Compliance']
    },
    {
      id: '2',
      question: 'How does the RAG vector retriever index multi-lingual markdown documents?',
      answer: 'Vector embeddings use a hybrid dense-sparse retrieval pipeline (Gemini text-embedding-004 + BM25 reciprocal rank fusion). Chunky overlapping windows of 512 tokens preserve contextual continuity across languages.',
      sourceDoc: 'LLM_Vector_Retrieval_Paper.pdf',
      citationPage: 'Page 7, Figure 4',
      date: 'Yesterday',
      tags: ['Architecture', 'Vector RAG', 'AI']
    },
    {
      id: '3',
      question: 'What is the required response SLA for P0 outage reporting in our compliance framework?',
      answer: 'P0 incidents require immediate automated pager escalation within 60 seconds, accompanied by a status page update within 15 minutes of initial anomaly detection.',
      sourceDoc: 'SLA_Compliance_Agreement.docx',
      citationPage: 'Page 3, Paragraph 2',
      date: '3 days ago',
      tags: ['SLA', 'DevOps', 'Compliance']
    }
  ];

  const [savedList, setSavedList] = useState<SavedAnswerItem[]>(initialSavedAnswers);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setSavedList(savedList.filter((item) => item.id !== id));
  };

  const filteredList = savedList.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Saved Insights & Bookmarks</h1>
            <Badge variant="indigo" icon={<Bookmark className="w-3.5 h-3.5" />}>
              {savedList.length} Saved
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Curated library of grounded answers, compliance excerpts, and key findings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
          >
            Export All to Markdown
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search saved answers & tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Badge variant="slate" size="md" icon={<Filter className="w-3 h-3" />}>
            All Categories
          </Badge>
        </div>
      </div>

      {/* Answer Cards List */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <Card variant="bordered" padding="lg" className="text-center py-12">
            <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No saved answers found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Bookmark responses directly from conversations in Chat mode.
            </p>
          </Card>
        ) : (
          filteredList.map((item) => (
            <Card key={item.id} variant="hover" padding="lg" className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400 font-mono">{item.date}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-indigo-400 font-medium flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {item.sourceDoc}
                    </span>
                    <Badge variant="cyan" size="sm">
                      {item.citationPage}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{item.question}</h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(item.id, `${item.question}\n\n${item.answer}`)}
                    className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Copy Answer"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Answer Content */}
              <div className="p-4 rounded-xl bg-[#090c12] border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans">
                {item.answer}
              </div>

              {/* Tags & Action */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5 text-indigo-400" />
                      {tag}
                    </span>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('/chat')}
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Open in Chat
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
