import React from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  FileText, 
  Search, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Database, 
  Layers, 
  BookOpen, 
  MessageSquare,
  Lock,
  ChevronRight,
  Star
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AppRoute } from '../../types';

interface LandingViewProps {
  onNavigate: (route: AppRoute) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#07090e]/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                TalkTalk
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                AI Knowledge OS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#security" className="hover:text-white transition-colors">Enterprise & Security</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('/login')}
              className="text-slate-300 hover:text-white"
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('/signup')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Badge variant="indigo" size="md" className="mb-6 py-1.5 px-4 shadow-inner" icon={<Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />}>
            Next-Generation Grounded AI Knowledge Platform
          </Badge>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Your Knowledge.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400">
              One Intelligent Conversation.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Upload complex technical documentation, research papers, and corporate specs. Ask questions, compare sources, and generate precise insights with 100% grounded citations and zero hallucinations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate('/signup')}
              icon={<ArrowRight className="w-5 h-5" />}
              className="w-full sm:w-auto text-base font-semibold px-8 py-4 shadow-xl shadow-indigo-600/30"
            >
              Start Free Trial — No Credit Card
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onNavigate('/chat')}
              icon={<MessageSquare className="w-5 h-5 text-indigo-400" />}
              className="w-full sm:w-auto text-base px-8 py-4 border-slate-700 bg-slate-900/80 hover:bg-slate-800"
            >
              Explore Live Demo
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-500 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SOC2 Type II Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>256-bit AES Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Real-time Gemini Vector Indexing</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive App Preview Mockup */}
        <div className="max-w-6xl mx-auto mt-14 relative z-10">
          <div className="relative rounded-2xl p-2 bg-gradient-to-b from-indigo-500/30 via-slate-800/40 to-slate-900/60 shadow-2xl shadow-indigo-500/10 border border-slate-700/60 backdrop-blur-xl">
            <div className="bg-[#0e121b] rounded-xl overflow-hidden shadow-inner border border-slate-800/80">
              {/* Window bar */}
              <div className="px-4 py-3 bg-[#090c12] border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-4 text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-indigo-400" />
                    TalkTalk Workspace — Knowledge OS v2.4
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="cyan" size="sm" icon={<Sparkles className="w-3 h-3" />}>
                    Research Mode Active
                  </Badge>
                </div>
              </div>

              {/* Demo interface snippet */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
                {/* Left Panel */}
                <div className="md:col-span-4 bg-[#121622] rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Active Documents (3)
                    </span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                      Indexed
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg flex items-center gap-3">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-white truncate">Q3_2026_Architecture_Report.pdf</p>
                        <p className="text-[10px] text-slate-400">42 pages • Vector embeddings ready</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center gap-3">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-medium text-slate-300 truncate">Security_Policy_v4.docx</p>
                        <p className="text-[10px] text-slate-500">18 pages • Compliance docs</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center gap-3">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-medium text-slate-300 truncate">API_Endpoints_Specification.md</p>
                        <p className="text-[10px] text-slate-500">2,400 tokens • REST API</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Conversation Panel */}
                <div className="md:col-span-8 flex flex-col justify-between space-y-4">
                  <div className="bg-[#121622] rounded-xl p-4 border border-slate-800 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-xs shrink-0">
                        Q
                      </div>
                      <p className="text-xs text-slate-200 mt-1">
                        What are the strict encryption specifications required for customer payload persistence in Q3 Architecture?
                      </p>
                    </div>

                    <div className="border-t border-slate-800/80 pt-3 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-white flex items-center justify-center shrink-0">
                        <BrainCircuit className="w-4 h-4" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-slate-300 leading-relaxed">
                          According to <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded text-[11px] font-mono cursor-pointer border border-indigo-500/30">[Doc #1, Page 14]</span>, all payloads must utilize <strong>AES-256-GCM encryption</strong> at rest with KMS key rotation every 90 days.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <Badge variant="emerald" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                            100% Grounded
                          </Badge>
                          <span className="text-[11px] text-slate-400 font-mono">Confidence: 99.4%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input bar preview */}
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      readOnly
                      value="Compare latency figures between v3 and v4 architecture specs..."
                      className="w-full bg-[#121622] border border-slate-700/80 text-xs text-slate-300 rounded-xl py-3 px-4 pr-24 shadow-inner pointer-events-none"
                    />
                    <div className="absolute right-2 flex items-center gap-2">
                      <Button size="sm" variant="primary" className="py-1 px-3 text-xs">
                        Ask AI
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0b0e16] border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="cyan" size="md" className="mb-4">Comprehensive Capabilities</Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Engineered for Deep Knowledge Synthesis
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              TalkTalk is not just a chat wrapper. It's a full-spectrum AI Knowledge Operating System built for technical teams, analysts, and researchers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card variant="hover" padding="lg">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Grounded Citation Engine</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Every claim, metric, or summary generated by TalkTalk links directly back to exact page numbers, paragraph snippets, and source line numbers in your documents.
              </p>
            </Card>

            <Card variant="hover" padding="lg">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Multi-Document Compare</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Side-by-side comparative analysis across multiple PDF, DOCX, Markdown, or TXT files. Instantly identify discrepancies, updates, and key structural changes.
              </p>
            </Card>

            <Card variant="hover" padding="lg">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Automated Study & Quiz Prep</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Transform dense technical documents or academic manuals into interactive flashcards, key takeaway bullets, and practice quiz questions in seconds.
              </p>
            </Card>

            <Card variant="hover" padding="lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Multi-Modal AI Modes</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Switch seamlessly between Knowledge Query, Executive Summary, Deep Research, Study Guide, and Comparative Matrix depending on your immediate workflow needs.
              </p>
            </Card>

            <Card variant="hover" padding="lg">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Smart Collections & Tagging</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Organize thousands of documents into custom project collections, team folders, and domain taxonomies with automatic semantic tagging and indexing.
              </p>
            </Card>

            <Card variant="hover" padding="lg">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Private & Isolated Storage</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your data is never used to train public LLM models. End-to-end vector index isolation ensures strict enterprise privacy and GDPR compliance.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="indigo" size="md" className="mb-4">Flexible Plans</Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Scale from solo researcher to enterprise team without hidden vector storage costs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <Card variant="default" padding="lg" className="flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Starter</h3>
                <p className="text-slate-400 text-xs mt-1">Perfect for individuals and students.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-slate-400 text-sm ml-2">/ month</span>
                </div>

                <ul className="mt-8 space-y-4 text-xs text-slate-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Up to 10 Document Uploads</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>50 AI Queries / day</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Basic Grounded Citations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>2 Knowledge Collections</span>
                  </li>
                </ul>
              </div>

              <Button
                variant="secondary"
                size="md"
                className="mt-8 w-full"
                onClick={() => onNavigate('/signup')}
              >
                Get Started Free
              </Button>
            </Card>

            {/* Pro Plan */}
            <Card variant="gradient" padding="lg" className="flex flex-col justify-between relative border-indigo-500/50 shadow-indigo-500/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                Most Popular
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Pro Knowledge OS</h3>
                <p className="text-slate-400 text-xs mt-1">For professionals, engineers, and researchers.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">$29</span>
                  <span className="text-slate-400 text-sm ml-2">/ month</span>
                </div>

                <ul className="mt-8 space-y-4 text-xs text-slate-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Unlimited Document Uploads</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Unlimited AI Queries & Research Mode</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Deep Side-by-Side Comparison Engine</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Automated Study Guide & Quiz Generator</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Export to PDF, Markdown & Notion</span>
                  </li>
                </ul>
              </div>

              <Button
                variant="primary"
                size="md"
                className="mt-8 w-full shadow-lg shadow-indigo-500/25"
                onClick={() => onNavigate('/signup')}
              >
                Start 14-Day Free Trial
              </Button>
            </Card>

            {/* Enterprise Plan */}
            <Card variant="default" padding="lg" className="flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Enterprise</h3>
                <p className="text-slate-400 text-xs mt-1">Dedicated security and custom AI pipelines.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">Custom</span>
                </div>

                <ul className="mt-8 space-y-4 text-xs text-slate-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Dedicated Private Cloud Vector Store</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Custom LLM Fine-Tuning & Prompt Rules</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>SAML / SSO & Role-Based Access Control</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>24/7 Priority Support & SLA Guarantee</span>
                  </li>
                </ul>
              </div>

              <Button
                variant="secondary"
                size="md"
                className="mt-8 w-full"
                onClick={() => onNavigate('/signup')}
              >
                Contact Enterprise Sales
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <footer className="mt-auto bg-[#05070a] border-t border-slate-800/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">TalkTalk</span>
            <span className="text-xs text-slate-500 ml-4">© 2026 TalkTalk AI Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#security" className="hover:text-white transition-colors">Security Architecture</a>
            <button onClick={() => onNavigate('/dashboard')} className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Go to App Dashboard →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
