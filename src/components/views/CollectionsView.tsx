import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Files, 
  MessageSquare, 
  Check, 
  Trash2, 
  Layers, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Collection, Document } from '../../types';

interface CollectionsViewProps {
  collections: Collection[];
  documents: Document[];
  onCreateCollection: (name: string, description: string, color: string) => void;
  onDeleteCollection: (collectionId: string) => void;
  onStartChatWithCollection: (collection: Collection) => void;
  onSelectDocument: (docId: string) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  collections,
  documents,
  onCreateCollection,
  onDeleteCollection,
  onStartChatWithCollection,
  onSelectDocument,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColColor, setNewColColor] = useState('#6366F1');
  const [activeCollectionId, setActiveCollectionId] = useState<string>(collections[0]?.id || '');

  const activeCollection = collections.find((c) => c.id === activeCollectionId) || collections[0];
  const collectionDocs = documents.filter((d) => d.collectionId === activeCollection?.id);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    onCreateCollection(newColName.trim(), newColDesc.trim(), newColColor);
    setNewColName('');
    setNewColDesc('');
    setIsModalOpen(false);
  };

  const colors = ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899'];

  return (
    <div id="collections-view" className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#262B35]">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#8B5CF6]" />
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Knowledge Collections
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#1D212A] text-xs font-mono text-[#94A3B8] border border-[#2B313D]">
              {collections.length} Collections
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Group related documents to target queries and maintain focused contextual scopes.
          </p>
        </div>

        <button
          id="new-collection-btn"
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_28px_rgba(99,102,241,0.6)] transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Grid of Collections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {collections.map((col) => {
          const isSelected = col.id === activeCollection?.id;
          const count = documents.filter((d) => d.collectionId === col.id).length;
          return (
            <div
              key={col.id}
              onClick={() => setActiveCollectionId(col.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-[#1D212A] border-[#6366F1] shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                  : 'bg-[#161920] border-[#262B35] hover:border-[#3A4252]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3.5 h-3.5 rounded-md"
                      style={{ backgroundColor: col.color }}
                    />
                    <h3 className="text-sm font-display font-semibold text-white">
                      {col.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1A1E26] text-[#94A3B8]">
                    {count} docs
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                  {col.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#262B35] text-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartChatWithCollection(col);
                  }}
                  className="text-xs font-mono text-[#C0C1FF] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat Collection</span>
                </button>

                <span className="text-[10px] font-mono text-[#64748B]">
                  {new Date(col.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Collection Documents */}
      {activeCollection && (
        <div className="p-6 rounded-2xl bg-[#161920] border border-[#262B35] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#262B35]">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activeCollection.color }}
              />
              <h2 className="text-sm font-display font-bold text-white">
                Documents in {activeCollection.name}
              </h2>
              <span className="text-xs font-mono text-[#94A3B8]">({collectionDocs.length})</span>
            </div>

            <button
              type="button"
              onClick={() => onStartChatWithCollection(activeCollection)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#6366F1]/20 hover:bg-[#6366F1]/30 text-[#C0C1FF] text-xs font-semibold border border-[#6366F1]/40 cursor-pointer transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Query Collection</span>
            </button>
          </div>

          {collectionDocs.length === 0 ? (
            <p className="text-xs text-[#94A3B8] py-4">No documents assigned to this collection yet.</p>
          ) : (
            <div className="space-y-2">
              {collectionDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onSelectDocument(doc.id)}
                  className="p-3 rounded-xl bg-[#1A1E26] hover:bg-[#232833] border border-[#2B313D] flex items-center justify-between cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white group-hover:text-[#C0C1FF] truncate">
                      {doc.filename}
                    </p>
                    <p className="text-[10px] font-mono text-[#94A3B8] mt-0.5">
                      {doc.metadata?.pages || 1} pages • {(doc.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-white" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Collection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0D12]/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-[#161920] border border-[#2B313D] shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-display font-bold text-white">Create New Collection</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Collection Name</label>
                <input
                  type="text"
                  required
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. Cryogenics & Thermal Hardware"
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1E26] border border-[#2B313D] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  placeholder="Focus topics, scope, and objectives..."
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1E26] border border-[#2B313D] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#94A3B8] mb-2">Accent Color</label>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColColor(c)}
                      className={`w-7 h-7 rounded-lg transition-transform cursor-pointer flex items-center justify-center ${
                        newColColor === c ? 'scale-110 ring-2 ring-white' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {newColColor === c && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#262B35]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-white bg-[#1E232E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
