import React, { useState } from 'react';
import {
  X,
  Eye,
  Smartphone,
  Monitor,
  Star,
  Sparkles,
  Layers,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Award,
} from 'lucide-react';
import {
  UserProfile,
  WorkRecord,
  CuratedCollection,
  DiscoverySectionConfig,
} from '../../../types';

interface ContentPreviewModalProps {
  users: UserProfile[];
  records: WorkRecord[];
  collections: CuratedCollection[];
  sections: DiscoverySectionConfig[];
  onClose: () => void;
}

export const ContentPreviewModal: React.FC<ContentPreviewModalProps> = ({
  users,
  records,
  collections,
  sections,
  onClose,
}) => {
  const [previewMode, setPreviewMode] = useState<'discover' | 'homepage'>('discover');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');

  const activeCollections = collections.filter((c) => c.isActive);
  const featuredWorks = records
    .filter((r) => r.isFeatured && r.visibility === 'public' && !r.isTakenDown)
    .sort((a, b) => (a.featuredPriority || 99) - (b.featuredPriority || 99));

  const featuredCreators = users
    .filter((u) => u.isFeatured && u.appearInDiscover && !u.isSuspended)
    .sort((a, b) => (a.featuredRank || 99) - (b.featuredRank || 99));

  const heroSpotlightWorks = records.filter(
    (r) => r.homepagePlacement === 'hero_spotlight' && r.visibility === 'public' && !r.isTakenDown
  );

  const trendingWorks = records.filter(
    (r) => r.homepagePlacement === 'trending_proof' && r.visibility === 'public' && !r.isTakenDown
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E7E2D8] flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Modal Top Bar */}
        <div className="p-4 bg-white border-b border-[#E7E2D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EAF3EF] flex items-center justify-center text-[#2D4D45]">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#16222F]">
                  Distribution & Placement Live Preview
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Simulated Production
                </span>
              </div>
              <p className="text-[11px] text-[#7A8690]">
                Verifying visual hierarchy, ordering, and badge placements before live publication.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 bg-[#FAF8F5] border border-[#E7E2D8] rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setPreviewMode('discover')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  previewMode === 'discover'
                    ? 'bg-[#2D4D45] text-white shadow-xs'
                    : 'text-[#52606D] hover:text-[#16222F]'
                }`}
              >
                Discover Directory
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('homepage')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  previewMode === 'homepage'
                    ? 'bg-[#2D4D45] text-white shadow-xs'
                    : 'text-[#52606D] hover:text-[#16222F]'
                }`}
              >
                Homepage Spotlight
              </button>
            </div>

            {/* Device Frame Switcher */}
            <div className="flex items-center p-0.5 bg-[#FAF8F5] border border-[#E7E2D8] rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setDeviceView('desktop')}
                title="Desktop View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  deviceView === 'desktop'
                    ? 'bg-[#2D4D45] text-white'
                    : 'text-[#7A8690] hover:text-[#16222F]'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceView('mobile')}
                title="Mobile View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  deviceView === 'mobile'
                    ? 'bg-[#2D4D45] text-white'
                    : 'text-[#7A8690] hover:text-[#16222F]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#7A8690] hover:text-[#16222F] hover:bg-stone-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Frame */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-[#F4EFE6]/60">
          <div
            className={`transition-all duration-300 bg-white rounded-2xl border border-[#E7E2D8] shadow-md overflow-hidden ${
              deviceView === 'mobile' ? 'w-[380px] min-h-[640px]' : 'w-full max-w-4xl'
            }`}
          >
            {/* Simulated Browser URL bar */}
            <div className="px-4 py-2 bg-[#FAF8F5] border-b border-[#E7E2D8] flex items-center gap-2 text-[11px] text-[#7A8690]">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
              </div>
              <div className="flex-1 text-center font-mono bg-white px-3 py-0.5 rounded-md border border-[#E7E2D8] text-[10px] truncate text-[#52606D]">
                {previewMode === 'discover' ? 'https://sabi.id/discover' : 'https://sabi.id/'}
              </div>
            </div>

            {/* PREVIEW 1: DISCOVER DIRECTORY */}
            {previewMode === 'discover' && (
              <div className="p-6 space-y-6">
                {/* Discover Header */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D4D45]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Proof-Based Discovery Directory</span>
                  </div>
                  <h1 className="text-xl font-black text-[#16222F]">
                    Verified African Professionals & Master Artisans
                  </h1>
                  <p className="text-xs text-[#52606D]">
                    Discover proven capabilities backed by verified client confirmations.
                  </p>
                </div>

                {/* Thematic Collections Strip */}
                {activeCollections.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#7A8690] uppercase tracking-wider block">
                      Curated Thematic Showcases
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeCollections.map((col) => (
                        <div
                          key={col.id}
                          className="p-3.5 rounded-xl border border-[#E7E2D8] bg-[#FAF8F5] hover:border-[#2D4D45] transition-all space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: col.accentColor || '#2D4D45' }}
                            >
                              {col.badgeLabel}
                            </span>
                            <span className="text-[10px] font-bold text-[#7A8690]">
                              Priority #{col.displayOrder}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-[#16222F]">
                            {col.title}
                          </h4>
                          <p className="text-[11px] text-[#52606D] line-clamp-2">
                            {col.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Curator Spotlight Professionals */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E7E2D8] pb-2">
                    <h3 className="font-bold text-xs text-[#16222F] flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Featured Practitioners & Deliverables</span>
                    </h3>
                    <span className="text-[11px] text-[#7A8690]">
                      {featuredCreators.length} featured profiles
                    </span>
                  </div>

                  <div className="space-y-3">
                    {featuredCreators.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#7A8690] bg-[#FAF8F5] rounded-xl border border-dashed border-[#E7E2D8]">
                        No creators currently marked as Featured. Go to the Discover Creators tab to feature professionals!
                      </div>
                    ) : (
                      featuredCreators.map((creator) => {
                        const creatorWorks = records.filter(
                          (r) => r.userId === creator.id && r.visibility === 'public' && !r.isTakenDown
                        );
                        return (
                          <div
                            key={creator.id}
                            className="p-4 rounded-xl border border-[#2D4D45]/30 bg-[#FAF8F5]/80 space-y-3 shadow-xs"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={creator.profilePhoto}
                                  alt={creator.fullName}
                                  className="w-10 h-10 rounded-full object-cover border border-[#E7E2D8]"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="font-bold text-xs text-[#16222F]">
                                      {creator.fullName}
                                    </h4>
                                    <span className="px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold text-[9px] flex items-center gap-0.5">
                                      <Star className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
                                      {creator.curationBadge || 'Curator Spotlight'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#52606D]">
                                    {creator.profession} · {creator.location}
                                  </p>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-[#EAF3EF] text-[#2D4D45] text-[10px] font-bold shrink-0">
                                Rank #{creator.featuredRank || 1}
                              </span>
                            </div>

                            {/* Public works preview */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[#E7E2D8]/80">
                              {creatorWorks.slice(0, 2).map((w) => (
                                <div
                                  key={w.id}
                                  className="p-2.5 rounded-lg bg-white border border-[#E7E2D8] text-xs space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-[11px] text-[#16222F] line-clamp-1">
                                      {w.title}
                                    </span>
                                    {w.isFeatured && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 text-[9px] font-bold">
                                        Featured
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-[#7A8690] line-clamp-1">
                                    {w.category} · {w.completionDate}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Featured Deliverables Highlight */}
                {featuredWorks.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-[#E7E2D8] pb-2">
                      <h3 className="font-bold text-xs text-[#16222F] flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#2D4D45]" />
                        <span>Curated Deliverables Showcase</span>
                      </h3>
                      <span className="text-[11px] text-[#7A8690]">
                        {featuredWorks.length} deliverables
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {featuredWorks.slice(0, 4).map((fw) => (
                        <div
                          key={fw.id}
                          className="p-3.5 rounded-xl bg-white border border-[#E7E2D8] space-y-2 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-full bg-[#EAF3EF] text-[#2D4D45] text-[10px] font-bold">
                              Priority #{fw.featuredPriority || 1}
                            </span>
                            {fw.confirmationStatus === 'confirmed' && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-[#2D4D45]">
                                <ShieldCheck className="w-3 h-3" />
                                Confirmed
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-xs text-[#16222F] line-clamp-1">
                            {fw.title}
                          </h4>
                          <p className="text-[11px] text-[#52606D] line-clamp-2">
                            {fw.description}
                          </p>
                          {fw.featuredNote && (
                            <p className="text-[10px] italic text-[#2D4D45] bg-[#EAF3EF]/50 p-1.5 rounded-lg">
                              &ldquo;{fw.featuredNote}&rdquo;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PREVIEW 2: HOMEPAGE / LANDING PAGE */}
            {previewMode === 'homepage' && (
              <div className="p-6 space-y-8">
                {/* Hero Showcase */}
                <div className="p-6 rounded-2xl bg-[#16222F] text-white space-y-3">
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider">
                    Homepage Hero Placements
                  </span>
                  <h2 className="text-xl font-black">
                    Tangible Proof Over Unsubstantiated Claims
                  </h2>
                  <p className="text-xs text-stone-300 max-w-lg">
                    Discover vetted proofs and master trades with cryptographic client confirmations.
                  </p>

                  {/* Spotlight Cards inside Hero */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {heroSpotlightWorks.length === 0 ? (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-stone-400">
                        No deliverable currently assigned to &ldquo;Hero Spotlight Showcase&rdquo;.
                      </div>
                    ) : (
                      heroSpotlightWorks.map((hw) => (
                        <div
                          key={hw.id}
                          className="p-3.5 rounded-xl bg-white/10 border border-white/20 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-amber-400 font-bold uppercase tracking-wider">
                              Spotlight Deliverable
                            </span>
                            <span className="text-stone-300 font-mono">
                              {hw.category}
                            </span>
                          </div>
                          <h4 className="font-bold text-white line-clamp-1">{hw.title}</h4>
                          <p className="text-[11px] text-stone-300 line-clamp-2">
                            {hw.description}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Trending Proofs Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E7E2D8] pb-2">
                    <h3 className="font-bold text-xs text-[#16222F]">
                      Trending Proofs Placed on Homepage
                    </h3>
                    <span className="text-[11px] text-[#7A8690]">
                      {trendingWorks.length} deliverables placed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {trendingWorks.length === 0 ? (
                      <div className="col-span-2 p-6 text-center text-xs text-[#7A8690] bg-[#FAF8F5] rounded-xl border border-dashed border-[#E7E2D8]">
                        No deliverables currently assigned to &ldquo;Trending Proof Showcase&rdquo;.
                      </div>
                    ) : (
                      trendingWorks.map((tw) => (
                        <div
                          key={tw.id}
                          className="p-3.5 rounded-xl bg-white border border-[#E7E2D8] space-y-2 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                              Trending Proof
                            </span>
                            <span className="text-[10px] text-[#7A8690]">{tw.category}</span>
                          </div>
                          <h4 className="font-bold text-xs text-[#16222F] line-clamp-1">
                            {tw.title}
                          </h4>
                          <p className="text-[11px] text-[#52606D] line-clamp-2">
                            {tw.description}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-[#E7E2D8] flex items-center justify-between text-xs text-[#52606D] shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2D4D45]" />
            <span>
              All previews render live against the current Sabi data store.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2D4D45] text-white font-bold hover:bg-[#223B35] transition-all cursor-pointer shadow-xs"
          >
            Done Previewing
          </button>
        </div>
      </div>
    </div>
  );
};
