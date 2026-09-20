import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Key, 
  Database, 
  Check, 
  Copy, 
  Sparkles,
  Smartphone,
  Save,
  HardDrive
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Tabs } from '../ui/Tabs';

export const ProfileView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [name, setName] = useState('Alex Rivera');
  const [email, setEmail] = useState('alex@talktalk.ai');
  const [role, setRole] = useState('Principal AI Architect');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const apiKey = 'tt_live_9f8a37b192e4827c819a0021a';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Account & Profile</h1>
            <Badge variant="indigo" icon={<Sparkles className="w-3 h-3" />}>
              Pro License
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your credentials, API keys, security settings, and vector quota
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          icon={savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
        >
          {savedSuccess ? 'Changes Saved' : 'Save Changes'}
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: 'general', label: 'General & Profile', icon: <User className="w-4 h-4" /> },
          { id: 'security', label: 'Security & API Keys', icon: <Key className="w-4 h-4" /> },
          { id: 'usage', label: 'Storage & Vector Quota', icon: <Database className="w-4 h-4" /> }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar Card */}
          <Card variant="default" padding="lg" className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-1 shadow-xl shadow-indigo-600/20 mb-4">
              <div className="w-full h-full rounded-full bg-[#12161f] flex items-center justify-center text-2xl font-bold text-white">
                AR
              </div>
            </div>
            <h3 className="text-base font-bold text-white">{name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{role}</p>
            <Badge variant="emerald" size="sm" className="mt-3">
              Active Member
            </Badge>

            <Button variant="secondary" size="sm" className="w-full mt-6 text-xs">
              Upload New Avatar
            </Button>
          </Card>

          {/* Form Details */}
          <Card variant="default" padding="lg" className="md:col-span-2">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              Personal Information
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />
              <Input
                label="Job Title / Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <Button variant="primary" size="sm" type="submit" icon={<Save className="w-4 h-4" />}>
                  Save Profile
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* API Keys */}
          <Card variant="default" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">TalkTalk API Secret Key</h3>
                <p className="text-xs text-slate-400">Use this key to query vector indexes via SDK or CLI</p>
              </div>
              <Badge variant="cyan">Active Secret</Badge>
            </div>

            <div className="flex items-center gap-3 bg-[#0b0e14] border border-slate-800 rounded-xl p-3">
              <code className="text-xs font-mono text-indigo-300 flex-1 truncate">
                {apiKey}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyKey}
                icon={copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedKey ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </Card>

          {/* 2FA Card */}
          <Card variant="default" padding="lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Two-Factor Authentication (2FA)</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Secure your account using an authenticator app (Google Authenticator, 1Password)
                  </p>
                </div>
              </div>
              <Badge variant="emerald" icon={<ShieldCheck className="w-3 h-3" />}>
                Enabled
              </Badge>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'usage' && (
        <Card variant="default" padding="lg" className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white">Vector Storage & Embeddings Quota</h3>
            <p className="text-xs text-slate-400">Pro Plan tier limits and current workspace utilization</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Indexed Pages</span>
                <span className="text-indigo-400">1,420 / 10,000 pages (14.2%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full w-[14.2%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">AI Query Credits</span>
                <span className="text-cyan-400">8,450 / 10,000 queries (84.5%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full w-[84.5%]" />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
