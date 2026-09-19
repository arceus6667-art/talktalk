import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  FileText, 
  Check, 
  HelpCircle,
  Layers
} from 'lucide-react';
import { Document, StudyPackage, Flashcard, QuizQuestion } from '../../types';
import { aiService } from '../../services/aiService';

interface StudyViewProps {
  documents: Document[];
  initialDocId?: string;
}

export const StudyView: React.FC<StudyViewProps> = ({ documents, initialDocId }) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId || documents[0]?.id || '');
  const [studyPackage, setStudyPackage] = useState<StudyPackage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz' | 'summary'>('flashcards');

  // Flashcard state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  const handleGenerateStudy = async () => {
    if (!selectedDocId) return;
    setIsLoading(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSelectedAnswers({});
    setShowExplanation({});

    try {
      const chosenDoc = documents.find((d) => d.id === selectedDocId);
      if (chosenDoc) {
        const res = await aiService.generateStudyMaterial({ documents: [chosenDoc] });
        setStudyPackage(res);
      }
    } catch (err) {
      console.error('Failed to generate study materials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentDoc = documents.find((d) => d.id === selectedDocId);

  return (
    <div id="study-view" className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#262B35]">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#8B5CF6]" />
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Study & Mastery Mode
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#1D212A] text-xs font-mono text-[#C4ABFF] border border-[#8B5CF6]/30">
              Active Recall & Quiz Engine
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Transform empirical documents into interactive flashcards, conceptual quizzes, and high-yield review notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#161920] border border-[#262B35] text-xs text-white focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.filename}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleGenerateStudy}
            disabled={isLoading || !selectedDocId}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_28px_rgba(139,92,246,0.6)] disabled:opacity-40 cursor-pointer transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Generating Materials...' : 'Generate Study Package'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      {studyPackage && (
        <div className="flex border-b border-[#262B35] gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('flashcards')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'flashcards' ? 'border-[#8B5CF6] text-white' : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Interactive Flashcards ({studyPackage.flashcards?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'quiz' ? 'border-[#8B5CF6] text-white' : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Mastery Quiz ({studyPackage.quiz?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'summary' ? 'border-[#8B5CF6] text-white' : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>High-Yield Review Notes</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center rounded-2xl bg-[#161920] border border-[#262B35] space-y-3">
          <Sparkles className="w-8 h-8 text-[#8B5CF6] animate-spin mx-auto" />
          <h3 className="text-sm font-semibold text-white">Synthesizing High-Yield Study Package</h3>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
            Extracting core technical definitions, formulating recall flashcards, and generating grounded quiz questions...
          </p>
        </div>
      )}

      {/* 1. Flashcards Tab */}
      {!isLoading && studyPackage && activeTab === 'flashcards' && (
        <div className="space-y-6 max-w-2xl mx-auto py-4">
          {studyPackage.flashcards?.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
                <span>Card {currentCardIndex + 1} of {studyPackage.flashcards.length}</span>
                <span>Click card to flip</span>
              </div>

              {/* Flashcard Box */}
              {(() => {
                const card = studyPackage.flashcards[currentCardIndex];
                return (
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="relative min-h-[260px] p-8 rounded-3xl bg-[#161920] border border-[#262B35] hover:border-[#8B5CF6]/50 shadow-[0_12px_40px_rgba(0,0,0,0.6)] cursor-pointer transition-all flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#1D212A] text-[#C4ABFF] border border-[#8B5CF6]/30 uppercase">
                        {isFlipped ? 'Answer & Grounding' : 'Concept / Prompt'}
                      </span>
                      <span className="text-xs text-[#64748B] flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                        Flip
                      </span>
                    </div>

                    <div className="my-auto py-4 text-center">
                      {!isFlipped ? (
                        <h3 className="text-base md:text-lg font-display font-semibold text-white leading-relaxed">
                          {card.question}
                        </h3>
                      ) : (
                        <p className="text-sm text-[#CBD5E1] font-sans leading-relaxed">
                          {card.answer}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#262B35] text-[11px] font-mono text-[#64748B]">
                      <span>Source: {card.sourceDocName}</span>
                      <span>Page {card.page}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentCardIndex === 0}
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D212A] hover:bg-[#232833] disabled:opacity-30 text-xs font-semibold text-white border border-[#2B313D] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-4 py-2 rounded-xl bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 text-xs font-semibold text-[#C4ABFF] border border-[#8B5CF6]/40 transition-colors cursor-pointer"
                >
                  Flip Card
                </button>

                <button
                  type="button"
                  disabled={currentCardIndex === (studyPackage.flashcards.length - 1)}
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex((prev) => Math.min(studyPackage.flashcards.length - 1, prev + 1));
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D212A] hover:bg-[#232833] disabled:opacity-30 text-xs font-semibold text-white border border-[#2B313D] transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#94A3B8]">No flashcards generated.</p>
          )}
        </div>
      )}

      {/* 2. Quiz Tab */}
      {!isLoading && studyPackage && activeTab === 'quiz' && (
        <div className="space-y-6 max-w-2xl mx-auto py-4">
          {studyPackage.quiz?.map((q, qIndex) => {
            const selectedOpt = selectedAnswers[qIndex];
            const isAnswered = selectedOpt !== undefined;
            const isCorrect = selectedOpt === q.correctIndex;

            return (
              <div
                key={q.id}
                className="p-6 rounded-2xl bg-[#161920] border border-[#262B35] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8B5CF6] uppercase">Question {qIndex + 1}</span>
                  <span className="text-[10px] font-mono text-[#64748B]">Source: {q.sourceRef}</span>
                </div>

                <h3 className="text-sm font-display font-semibold text-white leading-relaxed">
                  {q.question}
                </h3>

                {/* Options */}
                <div className="space-y-2">
                  {q.options.map((opt, optIndex) => {
                    let btnStyle = 'bg-[#1A1E26] border-[#2B313D] text-[#CBD5E1] hover:bg-[#232833]';

                    if (isAnswered) {
                      if (optIndex === q.correctIndex) {
                        btnStyle = 'bg-[#10B981]/20 border-[#10B981] text-white';
                      } else if (optIndex === selectedOpt) {
                        btnStyle = 'bg-[#EF4444]/20 border-[#EF4444] text-white';
                      }
                    }

                    return (
                      <button
                        key={optIndex}
                        type="button"
                        onClick={() => {
                          if (!isAnswered) {
                            setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
                          }
                        }}
                        disabled={isAnswered}
                        className={`w-full p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-[#232833] text-[10px] font-mono flex items-center justify-center text-[#94A3B8]">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span>{opt}</span>
                        </span>

                        {isAnswered && optIndex === q.correctIndex && (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                        )}
                        {isAnswered && optIndex === selectedOpt && optIndex !== q.correctIndex && (
                          <XCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {isAnswered && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-mono leading-relaxed border ${
                      isCorrect
                        ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                        : 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#FCD34D]'
                    }`}
                  >
                    <p className="font-semibold uppercase mb-1">{isCorrect ? 'Correct!' : 'Grounded Explanation:'}</p>
                    <p className="text-[#CBD5E1]">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Review Notes Tab */}
      {!isLoading && studyPackage && activeTab === 'summary' && (
        <div className="space-y-6 max-w-3xl mx-auto py-4">
          <div className="p-6 rounded-2xl bg-[#161920] border border-[#262B35] space-y-4">
            <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#8B5CF6]" />
              Grounded Review Notes
            </h3>
            <div className="text-xs text-[#CBD5E1] font-sans leading-relaxed whitespace-pre-line">
              {studyPackage.comprehensiveSummary}
            </div>

            {studyPackage.keyDefinitions && studyPackage.keyDefinitions.length > 0 && (
              <div className="pt-4 border-t border-[#262B35] space-y-3">
                <h4 className="text-xs font-mono uppercase text-[#94A3B8]">
                  Core Terminology & Definitions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {studyPackage.keyDefinitions.map((def, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#1A1E26] border border-[#2B313D] space-y-1">
                      <p className="text-xs font-semibold text-white">{def.term}</p>
                      <p className="text-[11px] text-[#94A3B8] leading-relaxed">{def.definition}</p>
                      <span className="text-[9px] font-mono text-[#64748B] block mt-1">Ref: {def.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !studyPackage && (
        <div className="p-12 text-center rounded-2xl bg-[#161920] border border-[#262B35] space-y-3 max-w-md mx-auto">
          <GraduationCap className="w-10 h-10 text-[#64748B] mx-auto" />
          <h3 className="text-sm font-semibold text-white">Generate Study Materials</h3>
          <p className="text-xs text-[#94A3B8]">
            Select a document above and click "Generate Study Package" to create interactive flashcards and multiple-choice quizzes.
          </p>
        </div>
      )}
    </div>
  );
};
