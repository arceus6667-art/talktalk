import React, { useState } from 'react';
import { BrainCircuit, Mail, Lock, User, Building, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { AppRoute } from '../../types';

interface SignupViewProps {
  onNavigate: (route: AppRoute) => void;
}

export const SignupView: React.FC<SignupViewProps> = ({ onNavigate }) => {
  const [fullName, setFullName] = useState('Alex Rivera');
  const [email, setEmail] = useState('alex@acme.inc');
  const [workspace, setWorkspace] = useState('Acme Corp Research');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onNavigate('/onboarding');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div
            onClick={() => onNavigate('/landing')}
            className="inline-flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">
              TalkTalk
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-6">Create Your AI Workspace</h2>
          <p className="text-xs text-slate-400 mt-1">
            Unlock grounded multi-document analysis in 60 seconds
          </p>
        </div>

        <Card variant="glass" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Sarah Jenkins"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Work Email"
              type="email"
              placeholder="sarah@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Workspace / Organization Name"
              placeholder="e.g. Apex AI Research Lab"
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              leftIcon={<Building className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="space-y-2 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Free 14-day Pro trial, no credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>SOC2 compliant isolated vector indexing</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-4 shadow-lg shadow-indigo-600/25"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Onboarding →
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have a TalkTalk workspace?{' '}
          <button
            onClick={() => onNavigate('/login')}
            className="text-indigo-400 font-semibold hover:text-indigo-300 underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
