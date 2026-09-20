import React, { useState } from 'react';
import { BrainCircuit, Mail, Lock, ArrowRight, Github, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { AppRoute } from '../../types';

interface LoginViewProps {
  onNavigate: (route: AppRoute) => void;
  onLoginSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('demo@talktalk.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onLoginSuccess) onLoginSuccess();
      onNavigate('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
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
          <h2 className="text-xl font-bold text-white mt-6">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to access your grounded knowledge base
          </p>
        </div>

        <Card variant="glass" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 uppercase tracking-wider">Password</span>
                <a href="#forgot" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </a>
              </div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2 shadow-lg shadow-indigo-600/25"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Workspace
            </Button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative px-3 bg-[#12161f] text-xs text-slate-500 font-medium">
              Or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSubmit}
              className="w-full text-xs justify-center"
            >
              Google Workspace
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSubmit}
              icon={<Github className="w-4 h-4" />}
              className="w-full text-xs justify-center"
            >
              GitHub
            </Button>
          </div>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have a TalkTalk workspace yet?{' '}
          <button
            onClick={() => onNavigate('/signup')}
            className="text-indigo-400 font-semibold hover:text-indigo-300 underline"
          >
            Create free account
          </button>
        </p>
      </div>
    </div>
  );
};
