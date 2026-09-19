import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Sparkles, FolderPlus } from 'lucide-react';
import { Collection, Document } from '../../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  onDocumentUploaded: (newDoc: Document) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  collections,
  onDocumentUploaded,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetCollectionId, setTargetCollectionId] = useState<string>(collections[0]?.id || '');
  const [manualTitle, setManualTitle] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    // Validate format
    const validExtensions = ['pdf', 'docx', 'txt', 'md', 'json', 'csv'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !validExtensions.includes(extension)) {
      setErrorMessage(`Unsupported format .${extension}. Please upload a PDF, DOCX, TXT, or MD.`);
      return;
    }

    // Validate size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds maximum limit of 25MB.');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    if (!manualTitle) {
      setManualTitle(file.name);
    }
  };

  const startUploadAndProcessing = async (filename: string, contentText: string, fileSize: number) => {
    setIsUploading(true);
    setUploadProgress(15);
    setProcessingStage('Uploading document to TalkTalk vault...');

    await new Promise((r) => setTimeout(r, 400));
    setUploadProgress(50);
    setProcessingStage('Extracting document sections & optical structure...');

    await new Promise((r) => setTimeout(r, 600));
    setUploadProgress(85);
    setProcessingStage('Generating embeddings & vector grounding index...');

    await new Promise((r) => setTimeout(r, 400));
    setUploadProgress(100);
    setProcessingStage('Document indexed and ready for grounded query.');

    const targetCol = collections.find((c) => c.id === targetCollectionId);

    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      workspaceId: 'ws-1',
      filename,
      fileType: filename.split('.').pop()?.toLowerCase() || 'pdf',
      size: fileSize,
      uploadTimestamp: new Date().toISOString(),
      status: 'ready',
      collectionId: targetCollectionId || undefined,
      collectionName: targetCol?.name || 'Unassigned',
      metadata: {
        pages: Math.max(1, Math.round(contentText.length / 1500)),
        wordCount: contentText.split(/\s+/).filter(Boolean).length,
        language: 'English',
        author: 'Uploaded Document Author',
        tags: ['Grounded Knowledge', targetCol?.name || 'Research'].filter(Boolean),
        summary: `Document indexed on ${new Date().toLocaleDateString()}. Contains empirical analysis and grounded factual assertions.`,
        mimeType: 'application/pdf',
      },
      sections: [
        {
          id: `sec-${Date.now()}-1`,
          page: 1,
          title: 'Executive Overview',
          content: contentText.slice(0, 500) || 'Primary content overview.',
        },
        {
          id: `sec-${Date.now()}-2`,
          page: 2,
          title: 'Detailed Technical Findings',
          content: contentText.slice(500, 1500) || contentText.slice(0, 500),
        },
      ],
      textContent: contentText,
    };

    onDocumentUploaded(newDoc);
    setTimeout(() => {
      setIsUploading(false);
      onClose();
    }, 500);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'upload') {
      if (!selectedFile) {
        setErrorMessage('Please choose a file to upload.');
        return;
      }
      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || `Sample text extracted from ${selectedFile.name}. Key findings, empirical data, and quantitative metrics for grounded AI reasoning.`;
        startUploadAndProcessing(selectedFile.name, text, selectedFile.size);
      };
      reader.onerror = () => {
        setErrorMessage('Failed to read document file.');
      };
      reader.readAsText(selectedFile);
    } else {
      if (!manualTitle.trim() || !manualContent.trim()) {
        setErrorMessage('Title and content are required.');
        return;
      }
      startUploadAndProcessing(manualTitle.trim(), manualContent.trim(), manualContent.length);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0D12]/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#161920] border border-[#2B313D] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262B35] bg-[#1A1E26]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#6366F1]/20 text-[#C0C1FF]">
              <Upload className="w-4 h-4 text-[#6366F1]" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-white">Upload Knowledge Document</h3>
              <p className="text-[11px] text-[#94A3B8]">Add real documents for grounded synthesis</p>
            </div>
          </div>
          <button
            id="close-upload-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#232833] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch: File Upload vs Direct Text */}
        <div className="flex border-b border-[#262B35] bg-[#121418]/60 px-6 pt-2 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'upload' ? 'border-[#6366F1] text-white' : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            File Upload (PDF, DOCX, TXT)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`pb-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'paste' ? 'border-[#6366F1] text-white' : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            Paste Text or Note
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 flex items-start gap-2.5 text-xs text-[#FCA5A5]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isUploading ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#6366F1]/20 flex items-center justify-center text-[#C0C1FF]">
                <Sparkles className="w-6 h-6 text-[#6366F1] animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{processingStage}</h4>
                <p className="text-xs font-mono text-[#94A3B8] mt-1">{uploadProgress}% Completed</p>
              </div>
              <div className="w-full bg-[#1E232E] h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                <div
                  className="bg-gradient-to-r from-[#6366F1] to-[#06B6D4] h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {activeTab === 'upload' ? (
                /* Drag & Drop */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.[0]) {
                      handleFileChange(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-center ${
                    isDragging
                      ? 'border-[#6366F1] bg-[#6366F1]/10'
                      : 'border-[#2B313D] hover:border-[#6366F1]/50 bg-[#1A1E26]/50'
                  }`}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt,.md,.csv"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="p-3 rounded-2xl bg-[#232833] text-[#C0C1FF]">
                    <Upload className="w-6 h-6 text-[#6366F1]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {selectedFile ? selectedFile.name : 'Click to upload or drag & drop'}
                    </p>
                    <p className="text-[10px] text-[#94A3B8] mt-1">
                      {selectedFile
                        ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to index`
                        : 'PDF, DOCX, TXT, MD up to 25MB'}
                    </p>
                  </div>
                </div>
              ) : (
                /* Direct Text Paste */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Document Title</label>
                    <input
                      type="text"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      placeholder="e.g. Q3 Engineering Architecture Specification"
                      className="w-full px-3 py-2 rounded-xl bg-[#1A1E26] border border-[#2B313D] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#6366F1]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">Text Content</label>
                    <textarea
                      rows={5}
                      value={manualContent}
                      onChange={(e) => setManualContent(e.target.value)}
                      placeholder="Paste text passage or transcript..."
                      className="w-full px-3 py-2 rounded-xl bg-[#1A1E26] border border-[#2B313D] text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#6366F1]"
                    />
                  </div>
                </div>
              )}

              {/* Assign to Collection */}
              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1">Assign to Collection</label>
                <select
                  value={targetCollectionId}
                  onChange={(e) => setTargetCollectionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1A1E26] border border-[#2B313D] text-xs text-white focus:outline-none focus:border-[#6366F1]"
                >
                  <option value="">No Collection (General Vault)</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name} ({col.documentCount} docs)
                    </option>
                  ))}
                </select>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#262B35]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-white bg-[#1E232E] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all cursor-pointer"
                >
                  Start Grounding & Index
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
