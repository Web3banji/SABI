import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  Briefcase,
  Compass,
  MessageSquare,
  User,
  ShieldCheck,
  Plus,
  Share2,
  ExternalLink,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ActiveTab, WorkRecord, UserProfile } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddWork: () => void;
  onShareProfile: () => void;
  isPublicMode: boolean;
  setIsPublicMode: (val: boolean) => void;
  records: WorkRecord[];
  onSelectRecord: (rec: WorkRecord) => void;
  user: UserProfile | null;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenAddWork,
  onShareProfile,
  isPublicMode,
  setIsPublicMode,
  records,
  onSelectRecord,
  user,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or custom state
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Command items definitions
  const commandItems = useMemo(() => {
    const navItems = [
      {
        id: 'nav-dashboard',
        category: 'Navigation',
        label: 'Dashboard',
        shortcut: '⌘1',
        icon: <LayoutDashboard className="w-4 h-4 text-accent-primary" />,
        action: () => {
          setIsPublicMode(false);
          setActiveTab('dashboard');
          onClose();
        },
      },
      {
        id: 'nav-my-work',
        category: 'Navigation',
        label: 'My Work & Deliverables',
        shortcut: '⌘2',
        icon: <Briefcase className="w-4 h-4 text-accent-primary" />,
        action: () => {
          setIsPublicMode(false);
          setActiveTab('my-work');
          onClose();
        },
      },
      {
        id: 'nav-discover',
        category: 'Navigation',
        label: 'Discover Network',
        shortcut: '⌘3',
        icon: <Compass className="w-4 h-4 text-accent-primary" />,
        action: () => {
          setIsPublicMode(false);
          setActiveTab('discover');
          onClose();
        },
      },
      {
        id: 'nav-messages',
        category: 'Navigation',
        label: 'Direct Messages',
        shortcut: '⌘4',
        icon: <MessageSquare className="w-4 h-4 text-accent-primary" />,
        action: () => {
          setIsPublicMode(false);
          setActiveTab('messages');
          onClose();
        },
      },
      {
        id: 'nav-profile',
        category: 'Navigation',
        label: 'Verified Profile',
        shortcut: '⌘5',
        icon: <User className="w-4 h-4 text-accent-primary" />,
        action: () => {
          setIsPublicMode(false);
          setActiveTab('profile');
          onClose();
        },
      },
      {
        id: 'nav-operations',
        category: 'Navigation',
        label: 'Operations Center',
        shortcut: '⌘9',
        icon: <ShieldCheck className="w-4 h-4 text-accent-primary" />,
        action: () => {
          setIsPublicMode(false);
          setActiveTab('operations');
          onClose();
        },
      },
    ];

    const actionItems = [
      {
        id: 'act-add-work',
        category: 'Actions',
        label: 'Document New Completed Work',
        shortcut: 'N',
        icon: <Plus className="w-4 h-4 text-[#D4A359]" />,
        action: () => {
          onClose();
          onOpenAddWork();
        },
      },
      {
        id: 'act-share-profile',
        category: 'Actions',
        label: 'Share Proof Profile & QR Code',
        shortcut: 'S',
        icon: <Share2 className="w-4 h-4 text-accent-primary" />,
        action: () => {
          onClose();
          onShareProfile();
        },
      },
      {
        id: 'act-toggle-visitor',
        category: 'Actions',
        label: isPublicMode ? 'Exit Public Visitor View' : 'Preview as Public Visitor',
        shortcut: 'V',
        icon: <ExternalLink className="w-4 h-4 text-accent-primary" />,
        action: () => {
          setIsPublicMode(!isPublicMode);
          onClose();
        },
      },
    ];

    const workRecordItems = records.slice(0, 8).map((rec) => ({
      id: `rec-${rec.id}`,
      category: 'Work Records',
      label: rec.title,
      sublabel: `${rec.category} · ${rec.confirmationStatus === 'confirmed' ? 'Client Confirmed' : 'Documented'}`,
      shortcut: '↵',
      icon: <Briefcase className="w-4 h-4 text-stone-500" />,
      action: () => {
        onClose();
        onSelectRecord(rec);
      },
    }));

    return [...actionItems, ...navItems, ...workRecordItems];
  }, [
    records,
    isPublicMode,
    setActiveTab,
    setIsPublicMode,
    onOpenAddWork,
    onShareProfile,
    onSelectRecord,
    onClose,
  ]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return commandItems;
    const q = query.toLowerCase();
    return commandItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.sublabel && item.sublabel.toLowerCase().includes(q))
    );
  }, [commandItems, query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div className="relative z-10 w-full max-w-xl bg-surface rounded-2xl border border-subtle shadow-2xl overflow-hidden flex flex-col animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Search Bar */}
        <div className="p-3.5 border-b border-subtle flex items-center gap-2.5 bg-surface">
          <Search className="w-5 h-5 text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, search deliverables, or switch view..."
            className="flex-1 bg-transparent text-sm text-primary placeholder:text-muted focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-muted bg-surface-elevated border border-subtle rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-subtle/40">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted">
              No matching commands or deliverables found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${
                    isSelected ? 'bg-surface-hover text-primary' : 'text-secondary hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <span className="font-semibold text-primary block truncate">
                        {item.label}
                      </span>
                      {item.sublabel && (
                        <span className="text-[11px] text-muted block truncate">
                          {item.sublabel}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-muted uppercase font-bold tracking-wider">
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-secondary bg-surface-elevated border border-subtle rounded">
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info strip */}
        <div className="px-4 py-2 bg-surface-elevated border-t border-subtle flex items-center justify-between text-[11px] text-muted font-mono">
          <span>Navigate with ↑ ↓ and press ↵</span>
          <span>Sabi Adaptive Command Center</span>
        </div>
      </div>
    </div>
  );
};
