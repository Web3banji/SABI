import React, { useState } from 'react';
import {
  X,
  Star,
  ThumbsUp,
  Globe,
  Lock,
  EyeOff,
  Sparkles,
  Layers,
  Award,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { WorkRecord, VisibilityStatus, CuratedCollection, AdminUser } from '../../../types';
import { operationsService } from '../../../services/operationsService';

interface WorkCurationModalProps {
  work: WorkRecord;
  collections: CuratedCollection[];
  adminUser: AdminUser | null;
  onClose: () => void;
  onSaved: () => void;
}

export const WorkCurationModal: React.FC<WorkCurationModalProps> = ({
  work,
  collections,
  adminUser,
  onClose,
  onSaved,
}) => {
  const [isFeatured, setIsFeatured] = useState<boolean>(work.isFeatured || false);
  const [featuredPriority, setFeaturedPriority] = useState<number>(work.featuredPriority || 1);
  const [isRecommended, setIsRecommended] = useState<boolean>(work.isRecommended || false);
  const [homepagePlacement, setHomepagePlacement] = useState<WorkRecord['homepagePlacement']>(
    work.homepagePlacement || 'none'
  );
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    work.curatedCollectionIds || []
  );
  const [featuredNote, setFeaturedNote] = useState<string>(work.featuredNote || '');
  const [visibility, setVisibility] = useState<VisibilityStatus>(work.visibility || 'public');
  const [isTakenDown, setIsTakenDown] = useState<boolean>(work.isTakenDown || false);
  const [takeDownReason, setTakeDownReason] = useState<string>(work.takeDownReason || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCollection = (colId: string) => {
    if (selectedCollections.includes(colId)) {
      setSelectedCollections(selectedCollections.filter((id) => id !== colId));
    } else {
      setSelectedCollections([...selectedCollections, colId]);
    }
  };

  const handleSave = () => {
    setIsSubmitting(true);
    setError(null);

    const actor = {
      id: adminUser?.id || 'admin',
      email: adminUser?.email || 'admin@sabi.id',
      name: adminUser?.fullName || 'Administrator',
    };

    const res = operationsService.updateWorkCuration(
      work.id,
      {
        isFeatured,
        featuredPriority: isFeatured ? Number(featuredPriority) : undefined,
        isRecommended,
        homepagePlacement,
        visibility,
        curatedCollectionIds: selectedCollections,
        featuredNote: featuredNote.trim(),
        isTakenDown,
        takeDownReason: isTakenDown ? takeDownReason.trim() : undefined,
      },
      actor
    );

    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Failed to update work curation.');
      return;
    }

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-[#E7E2D8] overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E7E2D8] bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF3EF] flex items-center justify-center text-[#2D4D45]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#16222F]">
                Curate Deliverable & Distribution
              </h2>
              <p className="text-xs text-[#52606D] truncate max-w-md">
                {work.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A8690] hover:text-[#16222F] hover:bg-[#E7E2D8]/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Featured & Recommendation Badges */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E7E2D8] space-y-4">
            <h3 className="text-xs font-bold text-[#16222F] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#2D4D45]" />
              Surfacing & Promotion Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Featured Switch */}
              <label
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isFeatured
                    ? 'bg-[#EAF3EF] border-[#2D4D45] text-[#16222F]'
                    : 'bg-white border-[#E7E2D8] text-[#52606D]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#2D4D45] rounded border-[#D5CEC2] focus:ring-[#2D4D45]"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Star className={`w-3.5 h-3.5 ${isFeatured ? 'text-amber-500 fill-amber-500' : ''}`} />
                    <span>Featured Deliverable</span>
                  </div>
                  <p className="text-[11px] text-[#7A8690] mt-0.5">
                    Promote in Discover Directory & high-priority search ranks.
                  </p>
                </div>
              </label>

              {/* Recommended Switch */}
              <label
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isRecommended
                    ? 'bg-[#EAF3EF] border-[#2D4D45] text-[#16222F]'
                    : 'bg-white border-[#E7E2D8] text-[#52606D]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isRecommended}
                  onChange={(e) => setIsRecommended(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#2D4D45] rounded border-[#D5CEC2] focus:ring-[#2D4D45]"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <ThumbsUp className={`w-3.5 h-3.5 ${isRecommended ? 'text-[#2D4D45]' : ''}`} />
                    <span>Recommended Item</span>
                  </div>
                  <p className="text-[11px] text-[#7A8690] mt-0.5">
                    Display &ldquo;Curator Recommended&rdquo; verification badge.
                  </p>
                </div>
              </label>
            </div>

            {/* Ordering / Prioritization */}
            {isFeatured && (
              <div className="pt-2 border-t border-[#E7E2D8] flex items-center justify-between gap-4">
                <div>
                  <label className="text-xs font-bold text-[#16222F] block">
                    Featured Display Priority Rank
                  </label>
                  <p className="text-[11px] text-[#7A8690]">
                    1 = Highest priority placement. Ascending numerical order.
                  </p>
                </div>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={featuredPriority}
                  onChange={(e) => setFeaturedPriority(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-24 px-3 py-1.5 text-xs font-bold text-center border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-white"
                />
              </div>
            )}
          </div>

          {/* Section 2: Homepage Placement */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#16222F] block">
              Homepage & Landing Placements
            </label>
            <p className="text-[11px] text-[#7A8690]">
              Control whether this verified deliverable appears on the root public landing page.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {[
                { id: 'none', label: 'No Homepage Placement', desc: 'Default discovery placement only' },
                { id: 'hero_spotlight', label: 'Hero Spotlight Showcase', desc: 'Prominent placement in top landing carousel' },
                { id: 'trending_proof', label: 'Trending Proof Showcase', desc: 'Featured in high-trust proof deliverable grid' },
                { id: 'featured_deliverable', label: 'Featured Deliverable Card', desc: 'Featured in curated landing highlights' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setHomepagePlacement(opt.id as WorkRecord['homepagePlacement'])}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    homepagePlacement === opt.id
                      ? 'bg-[#EAF3EF] border-[#2D4D45] text-[#16222F] font-bold'
                      : 'bg-white border-[#E7E2D8] text-[#52606D] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt.label}</span>
                    {homepagePlacement === opt.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D4D45]" />
                    )}
                  </div>
                  <p className="text-[10px] text-[#7A8690] mt-0.5 font-normal">
                    {opt.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Curated Collections Assignment */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#16222F] block flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#2D4D45]" />
              Curated Collections Assignment
            </label>
            <p className="text-[11px] text-[#7A8690]">
              Tag this deliverable to appear within thematic curated collections.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {collections.map((col) => {
                const isSelected = selectedCollections.includes(col.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => toggleCollection(col.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#2D4D45] text-white border-[#2D4D45]'
                        : 'bg-white text-[#52606D] border-[#E7E2D8] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span>{col.title}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-[#7A8690]'
                      }`}
                    >
                      {col.badgeLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Curator's Editorial Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#16222F] block">
              Curator&apos;s Editorial Note (Publicly visible when featured)
            </label>
            <textarea
              rows={2}
              value={featuredNote}
              onChange={(e) => setFeaturedNote(e.target.value)}
              placeholder="e.g. Exemplary bespoke joinery execution backed by verified timber provenance."
              className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-white"
            />
          </div>

          {/* Section 5: Visibility & Moderation */}
          <div className="pt-4 border-t border-[#E7E2D8] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[#16222F] block">
                  Deliverable Visibility
                </label>
                <p className="text-[11px] text-[#7A8690]">
                  Controls accessibility and search indexing.
                </p>
              </div>

              <div className="flex items-center gap-1">
                {(['public', 'unlisted', 'private'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisibility(v)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                      visibility === v
                        ? 'bg-[#2D4D45] text-white'
                        : 'bg-[#FAF8F5] text-[#52606D] border border-[#E7E2D8]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Takedown Toggle */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTakenDown}
                  onChange={(e) => setIsTakenDown(e.target.checked)}
                  className="w-4 h-4 text-amber-800 rounded border-amber-300 focus:ring-amber-500"
                />
                <span className="text-xs font-bold text-amber-900">
                  Restrict / Take Down Content Immediately
                </span>
              </label>

              {isTakenDown && (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={takeDownReason}
                    onChange={(e) => setTakeDownReason(e.target.value)}
                    placeholder="Mandatory reason for taking down this deliverable..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-amber-600"
                  />
                  <p className="text-[10px] text-amber-800">
                    Content will be instantly hidden from public Discover and search indexes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E7E2D8] bg-[#FAF8F5] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#52606D] hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-[#2D4D45] hover:bg-[#223B35] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Curation Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
