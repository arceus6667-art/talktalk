import React, { useState } from 'react';
import { 
  Files, 
  Search, 
  Filter, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  MoreVertical, 
  MessageSquare, 
  GraduationCap, 
  Sparkles, 
  Trash2, 
  ExternalLink,
  Tag,
  FolderKanban
} from 'lucide-react';
import { Document, Collection } from '../../types';

interface DocumentsViewProps {
  documents: Document[];
  collections: Collection[];
  onSelectDocument: (docId: string) => void;
  onOpenUpload: () => void;
  onStartChatWithDoc: (doc: Document) => void;
  onDeleteDocument: (docId: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  collections,
  onSelectDocument,
  onOpenUpload,
  onStartChatWithDoc,
  onDeleteDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollectionFilter, setSelectedCollectionFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = 
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.metadata?.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.metadata?.summary && doc.metadata.summary.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCollection = 
      selectedCollectionFilter === 'all' || doc.collectionId === selectedCollectionFilter;

    const matchesType = 
      selectedTypeFilter === 'all' || doc.fileType === selectedTypeFilter;

    return matchesSearch && matchesCollection && matchesType;
  });

  return (
    <div id="documents-view" className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#262B35]">
        <div>
          <div className="flex items-center gap-2">
            <Files className="w-5 h-5 text-[#6366F1]" />
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Knowledge Documents
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#1D212A] text-xs font-mono text-[#94A3B8] border border-[#2B313D]">
              {filteredDocuments.length} of {documents.length}
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Grounded vector storage. Every document is pre-indexed for zero-hallucination semantic search.
          </p>
        </div>

        <button
          id="documents-upload-btn"
          type="button"
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_28px_rgba(99,102,241,0.6)] transition-all cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            id="doc-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title, tags, or domain concepts..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#161920] border border-[#262B35] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#6366F1] transition-colors"
          />
        </div>

        {/* Filter by Collection */}
        <select
          id="collection-filter-select"
          value={selectedCollectionFilter}
          onChange={(e) => setSelectedCollectionFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#161920] border border-[#262B35] text-xs text-[#CBD5E1] focus:outline-none focus:border-[#6366F1] cursor-pointer"
        >
          <option value="all">All Collections</option>
          {collections.map((col) => (
            <option key={col.id} value={col.id}>
              {col.name}
            </option>
          ))}
        </select>

        {/* Filter by Type */}
        <select
          id="filetype-filter-select"
          value={selectedTypeFilter}
          onChange={(e) => setSelectedTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#161920] border border-[#262B35] text-xs text-[#CBD5E1] focus:outline-none focus:border-[#6366F1] cursor-pointer"
        >
          <option value="all">All File Formats</option>
          <option value="pdf">PDF</option>
          <option value="docx">DOCX</option>
          <option value="txt">TXT</option>
          <option value="md">Markdown</option>
        </select>
      </div>

      {/* Document Table / Cards */}
      {filteredDocuments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#161920] border border-[#262B35] space-y-3">
          <Files className="w-10 h-10 text-[#64748B] mx-auto" />
          <h3 className="text-sm font-semibold text-white">No matching documents found</h3>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
            Try adjusting your search query or filters, or upload a new research document to your vault.
          </p>
          <button
            type="button"
            onClick={onOpenUpload}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1E232E] text-white border border-[#2B313D] hover:border-[#6366F1] cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4 text-[#6366F1]" />
            <span>Upload Document</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-2xl bg-[#161920] hover:bg-[#1A1E26] border border-[#262B35] hover:border-[#6366F1]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              {/* Document Identity */}
              <div 
                className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer"
                onClick={() => onSelectDocument(doc.id)}
              >
                <div className="w-10 h-10 rounded-xl bg-[#232833] group-hover:bg-[#6366F1]/20 text-[#6366F1] flex items-center justify-center shrink-0 transition-colors">
                  <FileText className="w-5 h-5 text-[#C0C1FF]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-display font-semibold text-white group-hover:text-[#C0C1FF] transition-colors truncate">
                      {doc.filename}
                    </h3>
                    <span className="px-1.5 py-0.2 rounded-md bg-[#232833] text-[10px] font-mono text-[#94A3B8] uppercase">
                      {doc.fileType}
                    </span>
                  </div>

                  {doc.metadata?.summary && (
                    <p className="text-xs text-[#94A3B8] line-clamp-1 mt-1 font-sans">
                      {doc.metadata.summary}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#64748B] mt-2 flex-wrap">
                    <span className="text-[#06B6D4] flex items-center gap-1">
                      <FolderKanban className="w-3 h-3" />
                      {doc.collectionName || 'General Vault'}
                    </span>
                    <span>•</span>
                    <span>{doc.metadata?.pages || 1} pages</span>
                    <span>•</span>
                    <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span>•</span>
                    <span>{new Date(doc.uploadTimestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Ready
                </span>

                <button
                  type="button"
                  onClick={() => onStartChatWithDoc(doc)}
                  className="p-2 rounded-xl bg-[#1D212A] hover:bg-[#6366F1]/20 hover:text-[#C0C1FF] text-[#94A3B8] transition-colors cursor-pointer"
                  title="Ask questions about this document"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectDocument(doc.id)}
                  className="p-2 rounded-xl bg-[#1D212A] hover:bg-[#232833] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                  title="View document details"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteDocument(doc.id)}
                  className="p-2 rounded-xl bg-[#1D212A] hover:bg-[#EF4444]/20 hover:text-[#EF4444] text-[#64748B] transition-colors cursor-pointer"
                  title="Remove from knowledge vault"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
