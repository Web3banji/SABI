import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Compass,
  MessageSquare,
  User,
  Shield,
  Plus,
  Search,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bell,
  CheckCircle2,
  ChevronDown,
  Layers,
  Settings,
  LogOut,
  Sliders,
  ShieldCheck,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { ActiveTab, UserProfile, WorkRecord } from '../../types';
import { SabiLogo } from '../SabiLogo';
import { CommandPalette } from './CommandPalette';

interface AdaptiveShellProps {
  user: UserProfile | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddWork: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  isPublicMode: boolean;
  setIsPublicMode: (val: boolean) => void;
  onShareProfile: () => void;
  unreadMessagesCount?: number;
  onOpenOperations?: () => void;
  records?: WorkRecord[];
  onSelectRecord?: (rec: WorkRecord) => void;
  children: React.ReactNode;
}

export const AdaptiveShell: React.FC<AdaptiveShellProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAddWork,
  onOpenAuth,
  onLogout,
  isPublicMode,
  setIsPublicMode,
  onShareProfile,
  unreadMessagesCount = 0,
  onOpenOperations,
  records = [],
  onSelectRecord = () => {},
  children,
}) => {
  // Collapsible sidebar state (saved locally)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sabi_sidebar_collapsed') === 'true';
    }
    return false;
  });

  // Global Command Palette Open State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Workspace selector dropdown state
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  // Notification indicator state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Toggle sidebar and persist
  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sabi_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Listen to keyboard shortcuts (⌘1 to ⌘5, ⌘9, ⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === '1') {
          e.preventDefault();
          setIsPublicMode(false);
          setActiveTab('dashboard');
        } else if (e.key === '2') {
          e.preventDefault();
          setIsPublicMode(false);
          setActiveTab('my-work');
        } else if (e.key === '3') {
          e.preventDefault();
          setIsPublicMode(false);
          setActiveTab('discover');
        } else if (e.key === '4') {
          e.preventDefault();
          setIsPublicMode(false);
          setActiveTab('messages');
        } else if (e.key === '5') {
          e.preventDefault();
          setIsPublicMode(false);
          setActiveTab('profile');
        } else if (e.key === '9') {
          e.preventDefault();
          setIsPublicMode(false);
          setActiveTab('operations');
        } else if (e.key.toLowerCase() === 'k') {
          e.preventDefault();
          setIsCommandPaletteOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab, setIsPublicMode]);

  return (
    <div className="w-full bg-background min-h-screen text-primary flex flex-col md:flex-row antialiased selection:bg-[#EAF2EE] selection:text-[#2A4B44]">
      {/* ========================================================================= */}
      {/* 1. DESKTOP EXPANDED SIDEBAR NAVIGATION (md:flex)                          */}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex flex-col shrink-0 bg-surface border-r border-subtle transition-all duration-200 z-40 sticky top-0 h-screen select-none ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Top: Brand Identity & Workspace Selector */}
        <div className="p-4 border-b border-subtle">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setIsPublicMode(false);
                setActiveTab('dashboard');
              }}
              className="flex items-center gap-2.5 focus:outline-none group text-left cursor-pointer"
            >
              <SabiLogo size="sm" variant={isSidebarCollapsed ? 'icon' : 'full'} />
            </button>

            {/* Collapse / Expand Toggle button */}
            <button
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Workspace Pill / Environment Switcher */}
          {!isSidebarCollapsed && (
            <div className="relative mt-3">
              <button
                type="button"
                onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-surface-elevated border border-subtle flex items-center justify-between text-xs hover:border-strong transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-[#2D4D45]" />
                  <span className="font-bold text-primary truncate">
                    {activeTab === 'operations' ? 'Sabi Operations' : 'Proof Identity'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted shrink-0" />
              </button>

              {/* Workspace Popover Menu */}
              {isWorkspaceMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-subtle rounded-xl shadow-xl p-1 z-50 text-xs">
                  <button
                    onClick={() => {
                      setIsPublicMode(false);
                      setActiveTab('dashboard');
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                      activeTab !== 'operations'
                        ? 'bg-accent-subtle text-accent-primary font-bold'
                        : 'text-secondary hover:bg-surface-hover'
                    }`}
                  >
                    <span>Personal Proof Identity</span>
                    {activeTab !== 'operations' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => {
                      setIsPublicMode(false);
                      setActiveTab('operations');
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                      activeTab === 'operations'
                        ? 'bg-accent-subtle text-accent-primary font-bold'
                        : 'text-secondary hover:bg-surface-hover'
                    }`}
                  >
                    <span>Operations Command</span>
                    {activeTab === 'operations' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Document Action */}
        <div className="p-3 border-b border-subtle/50">
          <button
            onClick={onOpenAddWork}
            className={`w-full py-2.5 rounded-xl bg-accent-primary hover:bg-[#223B35] text-white font-bold text-xs shadow-xs transition-transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
              isSidebarCollapsed ? 'px-0' : 'px-4'
            }`}
            title="Document Completed Work"
          >
            <Plus className="w-4 h-4 text-[#D4A359]" strokeWidth={2.5} />
            {!isSidebarCollapsed && <span>Document Work</span>}
          </button>
        </div>

        {/* Middle: Categorized Vertical Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {/* Section: Core Platform */}
          <div className="space-y-1">
            {!isSidebarCollapsed && (
              <span className="px-2.5 text-[10px] font-bold text-muted uppercase tracking-wider block">
                Platform
              </span>
            )}

            {/* 1. Dashboard */}
            <button
              onClick={() => {
                setIsPublicMode(false);
                setActiveTab('dashboard');
              }}
              title="Dashboard (⌘1)"
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                !isPublicMode && activeTab === 'dashboard'
                  ? 'bg-accent-subtle text-accent-primary font-bold shadow-2xs'
                  : 'text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Dashboard</span>}
              </div>
              {!isSidebarCollapsed && (
                <kbd className="text-[10px] text-muted font-mono bg-surface border border-subtle px-1.5 py-0.2 rounded">
                  ⌘1
                </kbd>
              )}
            </button>

            {/* 2. My Work */}
            <button
              onClick={() => {
                setIsPublicMode(false);
                setActiveTab('my-work');
              }}
              title="My Work (⌘2)"
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                !isPublicMode && activeTab === 'my-work'
                  ? 'bg-accent-subtle text-accent-primary font-bold shadow-2xs'
                  : 'text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>My Deliverables</span>}
              </div>
              {!isSidebarCollapsed && (
                <kbd className="text-[10px] text-muted font-mono bg-surface border border-subtle px-1.5 py-0.2 rounded">
                  ⌘2
                </kbd>
              )}
            </button>

            {/* 3. Discover */}
            <button
              onClick={() => {
                setIsPublicMode(false);
                setActiveTab('discover');
              }}
              title="Discover (⌘3)"
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                !isPublicMode && activeTab === 'discover'
                  ? 'bg-accent-subtle text-accent-primary font-bold shadow-2xs'
                  : 'text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Discover Network</span>}
              </div>
              {!isSidebarCollapsed && (
                <kbd className="text-[10px] text-muted font-mono bg-surface border border-subtle px-1.5 py-0.2 rounded">
                  ⌘3
                </kbd>
              )}
            </button>

            {/* 4. Messages */}
            <button
              onClick={() => {
                setIsPublicMode(false);
                setActiveTab('messages');
              }}
              title="Messages (⌘4)"
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                !isPublicMode && activeTab === 'messages'
                  ? 'bg-accent-subtle text-accent-primary font-bold shadow-2xs'
                  : 'text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Inquiries & Messages</span>}
              </div>
              <div className="flex items-center gap-1.5">
                {unreadMessagesCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#D4A359] text-primary text-[10px] font-bold">
                    {unreadMessagesCount}
                  </span>
                )}
                {!isSidebarCollapsed && (
                  <kbd className="text-[10px] text-muted font-mono bg-surface border border-subtle px-1.5 py-0.2 rounded">
                    ⌘4
                  </kbd>
                )}
              </div>
            </button>

            {/* 5. Verified Profile */}
            <button
              onClick={() => {
                setIsPublicMode(false);
                setActiveTab('profile');
              }}
              title="Profile (⌘5)"
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                !isPublicMode && activeTab === 'profile'
                  ? 'bg-accent-subtle text-accent-primary font-bold shadow-2xs'
                  : 'text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Verified Profile</span>}
              </div>
              {!isSidebarCollapsed && (
                <kbd className="text-[10px] text-muted font-mono bg-surface border border-subtle px-1.5 py-0.2 rounded">
                  ⌘5
                </kbd>
              )}
            </button>
          </div>

          {/* Section: Administration & Governance */}
          <div className="space-y-1 pt-2 border-t border-subtle/50">
            {!isSidebarCollapsed && (
              <span className="px-2.5 text-[10px] font-bold text-muted uppercase tracking-wider block">
                Governance
              </span>
            )}

            <button
              onClick={() => {
                setIsPublicMode(false);
                setActiveTab('operations');
              }}
              title="Operations Center (⌘9)"
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                !isPublicMode && activeTab === 'operations'
                  ? 'bg-accent-subtle text-accent-primary font-bold shadow-2xs'
                  : 'text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 text-accent-primary" />
                {!isSidebarCollapsed && <span>Operations Center</span>}
              </div>
              {!isSidebarCollapsed && (
                <kbd className="text-[10px] text-muted font-mono bg-surface border border-subtle px-1.5 py-0.2 rounded">
                  ⌘9
                </kbd>
              )}
            </button>
          </div>
        </nav>

        {/* Bottom: Profile & Environment Pill */}
        <div className="p-3 border-t border-subtle bg-surface-elevated">
          {user ? (
            <div className="flex items-center justify-between gap-2">
              <div
                onClick={() => {
                  setIsPublicMode(false);
                  setActiveTab('profile');
                }}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-accent-primary text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-[#D4A359]">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    user.fullName.charAt(0)
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-primary truncate group-hover:text-accent-primary transition-colors">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-muted truncate">
                      {user.profession || 'Evidence Verified'}
                    </p>
                  </div>
                )}
              </div>

              {!isSidebarCollapsed && (
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-1.5 text-muted hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-full py-2 rounded-xl bg-surface border border-subtle text-xs font-bold text-primary hover:border-strong transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              {!isSidebarCollapsed && <span>Sign In</span>}
            </button>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. CENTRAL WORKSPACE STAGE                                                */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* ========================================================================= */}
        {/* 2A. DESKTOP TOP UTILITY HEADER (hidden on mobile, md:flex)                */}
        {/* ========================================================================= */}
        <header className="hidden md:flex h-14 bg-surface/90 backdrop-blur-md border-b border-subtle sticky top-0 z-30 px-6 items-center justify-between gap-4 select-none">
          {/* Search / Command Palette Input trigger */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-hover border border-subtle flex items-center justify-between text-xs text-muted transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-muted" />
                <span>Search proof deliverables, skills, or commands...</span>
              </div>
              <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-secondary bg-surface border border-subtle rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Desktop Right Utilities */}
          <div className="flex items-center gap-2.5">
            {/* Real-time Proof Engine Status Pill */}
            <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-subtle text-accent-primary text-[11px] font-bold border border-[#CFE2D9]">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
              <span>Cryptographic Proof Engine Verified</span>
            </div>

            {/* Public Visitor Preview Toggle */}
            <button
              onClick={() => setIsPublicMode(!isPublicMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                isPublicMode
                  ? 'bg-[#D4A359] text-[#16222F] border-[#B8873E] font-bold'
                  : 'bg-surface hover:bg-surface-hover text-secondary border-subtle'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isPublicMode ? 'Exit Visitor View' : 'Preview as Visitor'}</span>
            </button>

            {/* Share Profile */}
            <button
              onClick={onShareProfile}
              className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover text-secondary border border-subtle text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Proof</span>
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 2B. MOBILE FIXED COMPACT TOP HEADER (< md)                                */}
        {/* ========================================================================= */}
        <header className="md:hidden sticky top-0 z-40 h-14 bg-surface/95 backdrop-blur-md border-b border-subtle px-4 flex items-center justify-between touch-suppress safe-area-top">
          <button
            onClick={() => {
              setIsPublicMode(false);
              setActiveTab('dashboard');
            }}
            className="flex items-center focus:outline-none"
          >
            <SabiLogo size="sm" variant="full" />
          </button>

          <div className="flex items-center gap-2">
            {/* Quick Search trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="p-2 rounded-xl text-secondary hover:text-primary hover:bg-surface-hover transition-colors cursor-pointer active:scale-95"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Profile Avatar trigger */}
            <button
              onClick={() => {
                if (user) {
                  setIsPublicMode(false);
                  setActiveTab('profile');
                } else {
                  onOpenAuth();
                }
              }}
              className="w-8 h-8 rounded-full bg-accent-primary text-white flex items-center justify-center font-bold text-xs border border-[#D4A359] overflow-hidden active:scale-95 cursor-pointer"
            >
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.fullName} className="w-full h-full object-cover" />
              ) : user ? (
                user.fullName.charAt(0)
              ) : (
                <User className="w-4 h-4" />
              )}
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 2C. MAIN CONTENT AREA (Single Viewport on Mobile, Expanded on Desktop)    */}
        {/* ========================================================================= */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto no-scrollbar md:scrollbar-thin pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE FIXED PERSISTENT BOTTOM NAVIGATION DOCK (< md)                  */}
      {/* ========================================================================= */}
      <nav
        id="mobile-adaptive-bottom-dock"
        className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-surface/95 backdrop-blur-md border-t border-subtle z-40 safe-area-bottom touch-suppress px-2 shadow-lg flex items-center justify-around"
      >
        {/* 1. Home / Dashboard */}
        <button
          onClick={() => {
            setIsPublicMode(false);
            setActiveTab('dashboard');
          }}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-transform active:scale-95 ${
            !isPublicMode && activeTab === 'dashboard'
              ? 'text-accent-primary font-bold'
              : 'text-muted'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" strokeWidth={!isPublicMode && activeTab === 'dashboard' ? 2.4 : 1.8} />
          <span className="text-[10px]">Home</span>
        </button>

        {/* 2. My Work */}
        <button
          onClick={() => {
            setIsPublicMode(false);
            setActiveTab('my-work');
          }}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-transform active:scale-95 ${
            !isPublicMode && activeTab === 'my-work'
              ? 'text-accent-primary font-bold'
              : 'text-muted'
          }`}
        >
          <Briefcase className="w-5 h-5 mb-0.5" strokeWidth={!isPublicMode && activeTab === 'my-work' ? 2.4 : 1.8} />
          <span className="text-[10px]">My Work</span>
        </button>

        {/* 3. Central Add Work Action Button */}
        <button
          onClick={onOpenAddWork}
          className="min-h-[44px] min-w-[44px] -mt-4 w-12 h-12 rounded-full bg-accent-primary text-white shadow-lg flex items-center justify-center transition-transform active:scale-90 border-2 border-white"
          title="Document Work Record"
        >
          <Plus className="w-6 h-6 text-[#D4A359]" strokeWidth={2.6} />
        </button>

        {/* 4. Discover */}
        <button
          onClick={() => {
            setIsPublicMode(false);
            setActiveTab('discover');
          }}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-transform active:scale-95 ${
            !isPublicMode && activeTab === 'discover'
              ? 'text-accent-primary font-bold'
              : 'text-muted'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" strokeWidth={!isPublicMode && activeTab === 'discover' ? 2.4 : 1.8} />
          <span className="text-[10px]">Discover</span>
        </button>

        {/* 5. Messages */}
        <button
          onClick={() => {
            setIsPublicMode(false);
            setActiveTab('messages');
          }}
          className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center transition-transform active:scale-95 relative ${
            !isPublicMode && activeTab === 'messages'
              ? 'text-accent-primary font-bold'
              : 'text-muted'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 mb-0.5" strokeWidth={!isPublicMode && activeTab === 'messages' ? 2.4 : 1.8} />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-3.5 h-3.5 px-0.5 rounded-full bg-[#D4A359] text-primary text-[9px] font-black flex items-center justify-center">
                {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Messages</span>
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* 4. GLOBAL COMMAND PALETTE MODAL                                           */}
      {/* ========================================================================= */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddWork={onOpenAddWork}
        onShareProfile={onShareProfile}
        isPublicMode={isPublicMode}
        setIsPublicMode={setIsPublicMode}
        records={records}
        onSelectRecord={onSelectRecord}
        user={user}
      />
    </div>
  );
};
