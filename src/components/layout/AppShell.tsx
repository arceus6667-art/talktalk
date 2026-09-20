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
  ChevronRight,
  User as UserIcon,
  Bookmark
} from 'lucide-react';
import { Workspace, User } from '../../types';

export type RoutePath = 
  | '/landing'
  | '/login'
  | '/signup'
  | '/onboarding'
  | '/profile'
  | '/saved'
  | '/dashboard'
  | '/documents'
  | '/collections'
  | '/chat'
  | '/compare'
  | '/study'
  | '/research'
  | '/analytics'
  | '/settings'
  | '/document-detail';

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

  // If we are on marketing / auth pages, render full screen without app shell sidebar
  const isAuthOrLanding = ['/landing', '/login', '/signup', '/onboarding'].includes(currentRoute);

  if (isAuthOrLanding) {
    return <div className="min-h-screen w-screen bg-[#07090e]">{children}</div>;
  }

  const navItems = [
    { path: '/dashboard' as RoutePath, label: 'Dashboard', icon: LayoutDashboard },
    { path: '/documents' as RoutePath, label: 'Documents', icon: Files },
    { path: '/collections' as RoutePath, label: 'Collections', icon: FolderKanban },
    { path: '/chat' as RoutePath, label: 'Chat & Grounding', icon: MessageSquare },
    { path: '/saved' as RoutePath, label: 'Saved Answers', icon: Bookmark },
    { path: '/compare' as RoutePath, label: 'Compare Matrix', icon: GitCompare },
    { path: '/study' as RoutePath, label: 'Study & Quizzes', icon: GraduationCap },
    { path: '/research' as RoutePath, label: 'Deep Research', icon: Compass },
    { path: '/analytics' as RoutePath, label: 'Analytics & Logs', icon: BarChart3 },
    { path: '/profile' as RoutePath, label: 'Profile & API', icon: UserIcon },
    { path: '/settings' as RoutePath, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07090e] text-[#F1F5F9] font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Sidebar Navigation */}
      <aside
        id="app-sidebar"
        className={`relative flex flex-col h-full bg-[#0e121b] border-r border-slate-800/80 transition-all duration-300 z-30 select-none ${
          isSidebarCollapsed ? 'w-[72px]' : 'w-64 min-w-[256px]'
        }`}
      >
        {/* Brand & Tagline */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
          {!isSidebarCollapsed ? (
            <div
              className="flex items-center gap-2.5 min-w-0 cursor-pointer"
              onClick={() => onRouteChange('/landing')}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-white">TalkTalk</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    Pro
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate leading-none mt-0.5">
                  Your knowledge. One conversation.
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto cursor-pointer" onClick={() => onRouteChange('/landing')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
          )}

          <button
            id="toggle-sidebar-button"
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Workspace Selector Dropdown */}
        <div className="p-3 border-b border-slate-800/60 relative">
          {!isSidebarCollapsed ? (
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Active Workspace
              </label>
              <button
                id="workspace-dropdown-trigger"
                type="button"
                onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-[#121622] hover:bg-[#181e2e] border border-slate-800 text-left transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-100 truncate">
                    {activeWorkspace.name}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 truncate">
                    {activeWorkspace.documentCount} indexed docs
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              </button>

              {workspaceMenuOpen && (
                <div className="absolute left-3 right-3 top-full mt-1 bg-[#121622] border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-fadeIn">
                  <div className="text-[10px] font-mono text-slate-500 px-2 py-1 uppercase">Switch Workspace</div>
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
                          ? 'bg-indigo-600/20 text-white font-semibold'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{ws.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{ws.documentCount} docs</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <div 
                className="w-8 h-8 rounded-lg bg-[#121622] border border-slate-800 flex items-center justify-center text-xs font-bold text-indigo-300"
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
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:shadow-lg hover:shadow-indigo-600/30 text-white text-xs font-semibold transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
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
                    ? 'bg-[#151a27] text-white border border-indigo-500/40 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-[#121620] border border-transparent'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Badge */}
        <div
          className="p-3 border-t border-slate-800/80 bg-[#090c12]/60 cursor-pointer hover:bg-slate-800/50 transition-colors"
          onClick={() => onRouteChange('/profile')}
        >
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {currentUser.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{currentUser.name}</p>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Gemini Ready</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">
                {currentUser.name.slice(0, 1)}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#07090e]">
        {children}
      </div>
    </div>
  );
};
