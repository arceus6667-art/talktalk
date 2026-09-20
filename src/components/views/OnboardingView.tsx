import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Building, 
  FileText, 
  Search, 
  BookOpen, 
  Layers, 
  CheckCircle2,
  FolderPlus
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AppRoute } from '../../types';

interface OnboardingViewProps {
  onNavigate: (route: AppRoute) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [workspaceName, setWorkspaceName] = useState('Acme Research Lab');
  const [selectedRole, setSelectedRole] = useState('Engineering & Architecture');
  const [selectedMode, setSelectedMode] = useState('knowledge');
  const [samplePreset, setSamplePreset] = useState<'architecture' | 'paper' | 'security'>('architecture');
  const [isFinishing, setIsFinishing] = useState(false);

  const roles = [
    'Engineering & Architecture',
    'Product Management',
    'Academic & AI Research',
    'Legal & Compliance',
    'Finance & Strategy'
  ];

  const modes = [
    {
      id: 'knowledge',
      name: 'Grounded QA',
      desc: 'Ask exact technical questions with strict page/snippet citations',
      icon: <Search className="w-5 h-5 text-indigo-400" />
    },
    {
      id: 'research',
      name: 'Deep Research Mode',
      desc: 'Synthesize across dozens of documents with structured evidence reports',
      icon: <BrainCircuit className="w-5 h-5 text-cyan-400" />
    },
    {
      id: 'summarize',
      name: 'Executive Summary',
      desc: 'Extract key takeaways, metrics, and bulleted digests instantly',
      icon: <FileText className="w-5 h-5 text-emerald-400" />
    },
    {
      id: 'compare',
      name: 'Multi-Doc Compare',
      desc: 'Side-by-side delta analysis between specifications or contracts',
      icon: <Layers className="w-5 h-5 text-amber-400" />
    }
  ];

  const handleFinish = () => {
    setIsFinishing(true);
    setTimeout(() => {
      onNavigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white">TalkTalk</span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                s === step
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 border border-indigo-400'
                  : s < step
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Box */}
      <div className="max-w-2xl mx-auto w-full z-10 my-8">
        {step === 1 && (
          <Card variant="glass" padding="lg" className="animate-fadeIn">
            <Badge variant="indigo" size="md" className="mb-4">Step 1 of 3</Badge>
            <h2 className="text-2xl font-bold text-white mb-2">Configure Your Workspace</h2>
            <p className="text-xs text-slate-400 mb-6">
              Customize TalkTalk for your organization's specific domain and workflow.
            </p>

            <div className="space-y-5">
              <Input
                label="Workspace Title"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                leftIcon={<Building className="w-4 h-4" />}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Primary Domain / Use Case
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {roles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                        selectedRole === role
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{role}</span>
                      {selectedRole === role && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => setStep(2)}
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full mt-8 shadow-lg shadow-indigo-600/25"
            >
              Next: Select AI Preference →
            </Button>
          </Card>
        )}

        {step === 2 && (
          <Card variant="glass" padding="lg" className="animate-fadeIn">
            <Badge variant="cyan" size="md" className="mb-4">Step 2 of 3</Badge>
            <h2 className="text-2xl font-bold text-white mb-2">Choose Default AI Mode</h2>
            <p className="text-xs text-slate-400 mb-6">
              You can switch modes anytime inside conversations. Choose your primary default.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSelectedMode(mode.id)}
                  className={`p-4 rounded-xl border text-left transition-all flex items-start gap-4 ${
                    selectedMode === mode.id
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-600/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="p-2 bg-slate-800/80 rounded-lg shrink-0">
                    {mode.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{mode.name}</h4>
                      {selectedMode === mode.id && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{mode.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-8">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setStep(3)}
                icon={<ArrowRight className="w-4 h-4" />}
                className="flex-1 shadow-lg shadow-indigo-600/25"
              >
                Next: Knowledge Seeds →
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card variant="glass" padding="lg" className="animate-fadeIn">
            <Badge variant="emerald" size="md" className="mb-4">Step 3 of 3</Badge>
            <h2 className="text-2xl font-bold text-white mb-2">Pre-load Sample Knowledge</h2>
            <p className="text-xs text-slate-400 mb-6">
              Choose a starter dataset to test TalkTalk instantly, or start with a clean slate.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setSamplePreset('architecture')}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                  samplePreset === 'architecture'
                    ? 'bg-indigo-600/20 border-indigo-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Q3 Architecture & Security Spec (Recommended)</p>
                    <p className="text-[11px] text-slate-400">Contains microservices breakdown, KMS policy & REST APIs</p>
                  </div>
                </div>
                {samplePreset === 'architecture' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </button>

              <button
                type="button"
                onClick={() => setSamplePreset('paper')}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                  samplePreset === 'paper'
                    ? 'bg-indigo-600/20 border-indigo-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Transformers & LLM RAG Research Paper</p>
                    <p className="text-[11px] text-slate-400">Academic benchmark data, attention mechanisms & vector search</p>
                  </div>
                </div>
                {samplePreset === 'paper' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </button>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                isLoading={isFinishing}
                onClick={handleFinish}
                icon={<Sparkles className="w-4 h-4" />}
                className="flex-1 shadow-lg shadow-indigo-600/25"
              >
                Launch Workspace →
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="text-center text-xs text-slate-500 z-10">
        Need help setting up enterprise integrations? Contact support@talktalk.ai
      </div>
    </div>
  );
};
