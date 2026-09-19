import React from 'react';
import { 
  LayoutDashboard, 
  Files, 
  FolderKanban, 
  MessageSquare, 
  GitCompare, 
  GraduationCap, 
  Compass, 
  BarChart3, 
  Settings, 
  Upload, 
  Sparkles, 
  ChevronDown, 
  ShieldCheck, 
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Workspace, User } from '../../types';

export type RoutePath = 
  | '/dashboard'
  | '/documents'
  | '/collections'
  | '/chat'
  | '/compare'
  | '/study'
  | '/research'
  | '/analytics'
  | '/settings';

interface AppShellProps {
  currentRoute: string;
  onRouteChange: (route: RoutePath, params?: Record<string, string>) => void;
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  onSelectWorkspace: (workspace: Workspace) => void;
  currentUser: User;
  onOpenUpload: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentRoute,
  onRouteChange,
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  currentUser,
  onOpenUpload,
  children,
}) => {
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const navItems = [
    { path: '/dashboard' as RoutePath, label: 'Dashboard', icon: LayoutDashboard },
    { path: '/documents' as RoutePath, label: 'Documents', icon: Files },
    { path: '/collections' as RoutePath, label: 'Collections', icon: FolderKanban },
    { path: '/chat' as RoutePath, label: 'Chat & Ask', icon: MessageSquare },
    { path: '/compare' as RoutePath, label: 'Compare', icon: GitCompare },
    { path: '/study' as RoutePath, label: 'Study Mode', icon: GraduationCap },
    { path: '/research' as RoutePath, label: 'Research', icon: Compass },
    { path: '/analytics' as RoutePath, label: 'Analytics & Logs', icon: BarChart3 },
    { path: '/settings' as RoutePath, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121418] text-[#F1F5F9] font-sans selection:bg-[#6366F1]/30 selection:text-[#C0C1FF]">
      {/* Sidebar Navigation */}
      <aside
        id="app-sidebar"
        className={`relative flex flex-col h-full bg-[#161920] border-r border-[#262B35] transition-all duration-300 z-30 select-none ${
          isSidebarCollapsed ? 'w-[72px]' : 'w-64 min-w-[256px]'
        }`}
      >
        {/* Brand & Tagline */}
        <div className="flex items-center justify-between p-4 border-b border-[#262B35]/70">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.35)] shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-base tracking-tight text-white">TalkTalk</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#06B6D4]/15 text-[#22D3EE] border border-[#06B6D4]/30">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-[#94A3B8] truncate leading-none mt-0.5">
                  Your knowledge. One conversation.
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.35)]">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
          )}

          <button
            id="toggle-sidebar-button"
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E232E] transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Workspace Selector Dropdown */}
        <div className="p-3 border-b border-[#262B35]/60 relative">
          {!isSidebarCollapsed ? (
            <div>
              <label className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block mb-1">
                Active Workspace
              </label>
              <button
                id="workspace-dropdown-trigger"
                type="button"
                onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-[#1D212A] hover:bg-[#232833] border border-[#2B313D] text-left transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#F1F5F9] truncate font-display">
                    {activeWorkspace.name}
                  </p>
                  <p className="text-[10px] font-mono text-[#94A3B8] truncate">
                    {activeWorkspace.documentCount} indexed docs
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-[#94A3B8] shrink-0 ml-1" />
              </button>

              {workspaceMenuOpen && (
                <div className="absolute left-3 right-3 top-full mt-1 bg-[#1D212A] border border-[#2B313D] rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in">
                  <div className="text-[10px] font-mono text-[#64748B] px-2 py-1 uppercase">Switch Workspace</div>
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => {
                        onSelectWorkspace(ws);
                        setWorkspaceMenuOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        ws.id === activeWorkspace.id
                          ? 'bg-[#6366F1]/20 text-white'
                          : 'text-[#94A3B8] hover:bg-[#232833] hover:text-white'
                      }`}
                    >
                      <span className="truncate">{ws.name}</span>
                      <span className="text-[10px] font-mono text-[#64748B]">{ws.documentCount} docs</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <div 
                className="w-8 h-8 rounded-lg bg-[#1D212A] border border-[#2B313D] flex items-center justify-center text-xs font-bold text-[#C0C1FF]"
                title={activeWorkspace.name}
              >
                {activeWorkspace.name.slice(0, 2).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Upload Document Primary CTA */}
        <div className="p-3">
          <button
            id="sidebar-upload-cta"
            type="button"
            onClick={onOpenUpload}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white text-xs font-semibold font-display transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <Upload className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Upload Document</span>}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.path || (item.path !== '/dashboard' && currentRoute.startsWith(item.path));
            return (
              <button
                key={item.path}
                id={`nav-item-${item.path.replace('/', '')}`}
                type="button"
                onClick={() => onRouteChange(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1E232E] text-white border border-[#6366F1]/40 shadow-[0_0_12px_rgba(99,102,241,0.15)] font-semibold'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1D212A] border border-transparent'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C0C1FF]' : 'text-[#94A3B8]'}`} />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Badge & Gemini API Live Status */}
        <div className="p-3 border-t border-[#262B35]/70 bg-[#121418]/60">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#06B6D4] flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {currentUser.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{currentUser.name}</p>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-[#10B981]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    <span>Gemini Ready</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#06B6D4] flex items-center justify-center text-xs font-bold text-white">
                {currentUser.name.slice(0, 1)}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#121418]">
        {children}
      </div>
    </div>
  );
};
