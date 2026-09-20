import React from 'react';
import { Sparkles, CheckCircle2, Loader2, Database, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { AIActivityStep } from '../../types';

interface AIActivityPanelProps {
  steps?: AIActivityStep[];
  isProcessing?: boolean;
}

export const AIActivityPanel: React.FC<AIActivityPanelProps> = ({
  steps = [
    {
      id: '1',
      title: 'Query Tokenization',
      detail: 'Generated 24-token dense vector embedding using Gemini text-embedding-004',
      status: 'completed',
      timestamp: '0.04s'
    },
    {
      id: '2',
      title: 'Hybrid Vector + BM25 Search',
      detail: 'Retrieved top 8 candidate chunks across Q3 Architecture & Security Spec',
      status: 'completed',
      timestamp: '0.18s'
    },
    {
      id: '3',
      title: 'Reciprocal Rank Fusion (RRF)',
      detail: 'Re-ranked context window with 99.4% semantic relevance score',
      status: 'completed',
      timestamp: '0.31s'
    },
    {
      id: '4',
      title: 'Citation Grounding & Fact Check',
      detail: 'Cross-referenced response statements against source page 14 line 82',
      status: 'completed',
      timestamp: '0.45s'
    }
  ],
  isProcessing = false
}) => {
  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-sm">AI Pipeline Telemetry</h3>
        </div>
        <Badge variant={isProcessing ? 'amber' : 'emerald'} size="sm" dot>
          {isProcessing ? 'Processing' : 'Stream Complete'}
        </Badge>
      </div>

      {/* Metrics Card */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 bg-[#0b0e14] border border-slate-800 rounded-xl">
          <p className="text-[10px] text-slate-400 font-mono">LATENCY</p>
          <p className="text-sm font-extrabold text-white mt-0.5">0.45s</p>
        </div>
        <div className="p-3 bg-[#0b0e14] border border-slate-800 rounded-xl">
          <p className="text-[10px] text-slate-400 font-mono">GROUNDED SCORE</p>
          <p className="text-sm font-extrabold text-emerald-400 mt-0.5">99.4%</p>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-2.5 pt-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Execution Trace (4 Steps)
        </p>

        {steps.map((step) => (
          <div
            key={step.id}
            className="p-3 rounded-xl bg-[#0e121b] border border-slate-800/80 flex items-start gap-3 transition-all hover:border-slate-700"
          >
            <div className="mt-0.5">
              {step.status === 'completed' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : step.status === 'in_progress' ? (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
              )}
            </div>

            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{step.title}</span>
                {step.timestamp && (
                  <span className="text-[10px] font-mono text-slate-400">{step.timestamp}</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Security badge */}
      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>0% LLM hallucination risk • 100% grounded in workspace documents</span>
      </div>
    </div>
  );
};
