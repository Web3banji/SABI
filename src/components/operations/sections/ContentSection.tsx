import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Layers,
  CheckCircle2,
  Shield,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Globe,
  Sliders,
  AlertCircle,
  Star,
  ThumbsUp,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Tag,
  LayoutGrid,
  Check,
  Award,
  ArrowUpDown,
  FileCheck,
} from 'lucide-react';
import {
  UserProfile,
  WorkRecord,
  AdminUser,
  CuratedCollection,
  DiscoverySectionConfig,
  CuratedTag,
  VisibilityStatus,
} from '../../../types';
import { operationsService } from '../../../services/operationsService';
import { WorkCurationModal } from '../content/WorkCurationModal';
import { CollectionModal } from '../content/CollectionModal';
import { ContentPreviewModal } from '../content/ContentPreviewModal';

interface ContentSectionProps {
  users: UserProfile[];
  records: WorkRecord[];
  adminUser?: AdminUser | null;
  onRefreshData?: () => void;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  users,
  records,
  adminUser = null,
  onRefreshData,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'works' | 'collections' | 'creators' | 'sections' | 'tags'
  >('works');

  // Modal states
  const [editingWork, setEditingWork] = useState<WorkRecord | null>(null);
  const [editingCollection, setEditingCollection] = useState<CuratedCollection | null>(null);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Data collections
  const [collections, setCollections] = useState<CuratedCollection[]>([]);
  const [discoverySections, setDiscoverySections] = useState<DiscoverySectionConfig[]>([]);
  const [curatedTags, setCuratedTags] = useState<CuratedTag[]>([]);

  // Works tab filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'recommended'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPlacement, setFilterPlacement] = useState<string>('all');
  const [filterVisibility, setFilterVisibility] = useState<string>('all');

  // Tag creation state
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategory, setNewTagCategory] = useState('engineering');

  // Feedback banner
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const reloadOperationalData = () => {
    setCollections(operationsService.getCuratedCollections());
    setDiscoverySections(operationsService.getDiscoverySections());
    setCuratedTags(operationsService.getCuratedTags());
    if (onRefreshData) onRefreshData();
  };

  useEffect(() => {
    reloadOperationalData();
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const actor = {
    id: adminUser?.id || 'admin',
    email: adminUser?.email || 'admin@sabi.id',
    name: adminUser?.fullName || 'Administrator',
  };

  // Quick Work Curation actions
  const handleToggleFeatured = (work: WorkRecord) => {
    const nextFeatured = !work.isFeatured;
    const res = operationsService.updateWorkCuration(
      work.id,
      {
        isFeatured: nextFeatured,
        featuredPriority: nextFeatured ? work.featuredPriority || 1 : undefined,
      },
      actor
    );
    if (res.success) {
      showNotification(
        nextFeatured
          ? `Marked "${work.title}" as Featured deliverable.`
          : `Removed Featured badge from "${work.title}".`
      );
      reloadOperationalData();
    }
  };

  const handleToggleRecommended = (work: WorkRecord) => {
    const nextRecommended = !work.isRecommended;
    const res = operationsService.updateWorkCuration(
      work.id,
      { isRecommended: nextRecommended },
      actor
    );
    if (res.success) {
      showNotification(
        nextRecommended
          ? `Marked "${work.title}" as Recommended.`
          : `Removed Recommended badge from "${work.title}".`
      );
      reloadOperationalData();
    }
  };

  const handleQuickPriorityChange = (work: WorkRecord, priority: number) => {
    const res = operationsService.updateWorkCuration(
      work.id,
      { featuredPriority: Math.max(1, priority) },
      actor
    );
    if (res.success) {
      reloadOperationalData();
    }
  };

  const handleQuickPlacementChange = (
    work: WorkRecord,
    placement: WorkRecord['homepagePlacement']
  ) => {
    const res = operationsService.updateWorkCuration(
      work.id,
      { homepagePlacement: placement },
      actor
    );
    if (res.success) {
      showNotification(`Updated homepage placement for "${work.title}" to ${placement}.`);
      reloadOperationalData();
    }
  };

  // Curated Collection actions
  const handleDeleteCollection = (col: CuratedCollection) => {
    if (window.confirm(`Are you sure you want to delete the curated collection "${col.title}"?`)) {
      operationsService.deleteCuratedCollection(col.id, actor);
      showNotification(`Deleted curated collection "${col.title}".`);
      reloadOperationalData();
    }
  };

  const handleToggleCollectionActive = (col: CuratedCollection) => {
    const nextActive = !col.isActive;
    operationsService.toggleCollectionStatus(col.id, nextActive, actor);
    showNotification(
      nextActive
        ? `Published collection "${col.title}".`
        : `Deactivated collection "${col.title}".`
    );
    reloadOperationalData();
  };

  // Creator Curation actions
  const handleToggleCreatorFeatured = (user: UserProfile) => {
    const nextFeatured = !user.isFeatured;
    const res = operationsService.updateUserCuration(
      user.id,
      {
        isFeatured: nextFeatured,
        featuredRank: nextFeatured ? user.featuredRank || 1 : undefined,
      },
      actor
    );
    if (res.success) {
      showNotification(
        nextFeatured
          ? `Featured ${user.fullName} in Discover Directory.`
          : `Removed ${user.fullName} from Featured practitioners.`
      );
      reloadOperationalData();
    }
  };

  const handleToggleCreatorSpotlight = (user: UserProfile) => {
    const nextSpotlight = !user.homepageSpotlight;
    const res = operationsService.updateUserCuration(
      user.id,
      { homepageSpotlight: nextSpotlight },
      actor
    );
    if (res.success) {
      showNotification(
        nextSpotlight
          ? `Placed ${user.fullName} in Homepage Hero Spotlight.`
          : `Removed ${user.fullName} from Homepage Spotlight.`
      );
      reloadOperationalData();
    }
  };

  const handleCreatorRankChange = (user: UserProfile, rank: number) => {
    operationsService.updateUserCuration(
      user.id,
      { featuredRank: Math.max(1, rank) },
      actor
    );
    reloadOperationalData();
  };

  const handleCreatorBadgeChange = (user: UserProfile, badge: string) => {
    operationsService.updateUserCuration(
      user.id,
      { curationBadge: badge },
      actor
    );
    reloadOperationalData();
  };

  // Tag Management
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    operationsService.saveCuratedTag(
      {
        name: newTagName.trim(),
        category: newTagCategory,
        isFeatured: true,
      },
      actor
    );
    setNewTagName('');
    showNotification(`Added curated skill tag "${newTagName.trim()}".`);
    reloadOperationalData();
  };

  const handleToggleTagFeatured = (tag: CuratedTag) => {
    operationsService.toggleTagFeatured(tag.id, !tag.isFeatured, actor);
    reloadOperationalData();
  };

  const handleDeleteTag = (tag: CuratedTag) => {
    operationsService.deleteCuratedTag(tag.id, actor);
    showNotification(`Deleted tag "${tag.name}".`);
    reloadOperationalData();
  };

  // Section Layout Update
  const handleToggleSectionEnabled = (sec: DiscoverySectionConfig) => {
    operationsService.updateDiscoverySection(
      sec.sectionKey,
      { isEnabled: !sec.isEnabled },
      actor
    );
    showNotification(
      !sec.isEnabled
        ? `Enabled section "${sec.title}".`
        : `Disabled section "${sec.title}".`
    );
    reloadOperationalData();
  };

  const handleSectionLimitChange = (sec: DiscoverySectionConfig, limit: number) => {
    operationsService.updateDiscoverySection(
      sec.sectionKey,
      { itemLimit: limit },
      actor
    );
    reloadOperationalData();
  };

  const handleSectionSortChange = (
    sec: DiscoverySectionConfig,
    sort: DiscoverySectionConfig['sortBy']
  ) => {
    operationsService.updateDiscoverySection(
      sec.sectionKey,
      { sortBy: sort },
      actor
    );
    reloadOperationalData();
  };

  // Filtered Deliverables
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchDesc = (r.description || '').toLowerCase().includes(q);
        const matchCat = (r.category || '').toLowerCase().includes(q);
        const author = users.find((u) => u.id === r.userId);
        const matchAuthor = (author?.fullName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat && !matchAuthor) {
          return false;
        }
      }
      // Featured / Recommended filter
      if (filterFeatured === 'featured' && !r.isFeatured) return false;
      if (filterFeatured === 'recommended' && !r.isRecommended) return false;

      // Category
      if (filterCategory !== 'all' && r.category !== filterCategory) return false;

      // Placement
      if (filterPlacement !== 'all' && r.homepagePlacement !== filterPlacement) return false;

      // Visibility
      if (filterVisibility !== 'all' && r.visibility !== filterVisibility) return false;

      return true;
    });
  }, [
    records,
    users,
    searchQuery,
    filterFeatured,
    filterCategory,
    filterPlacement,
    filterVisibility,
  ]);

  // Derived statistics
  const featuredWorksCount = records.filter((r) => r.isFeatured).length;
  const recommendedWorksCount = records.filter((r) => r.isRecommended).length;
  const homepagePlacedCount = records.filter(
    (r) => r.homepagePlacement && r.homepagePlacement !== 'none'
  ).length;
  const discoverableUsersCount = users.filter((u) => u.appearInDiscover && !u.isSuspended).length;
  const featuredCreatorsCount = users.filter((u) => u.isFeatured).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="p-3 bg-[#EAF3EF] border border-[#2D4D45]/30 text-[#16222F] text-xs font-bold rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2D4D45]" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-[#7A8690] hover:text-[#16222F] text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Operational KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#E7E2D8] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#52606D] mb-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Featured Works</span>
          </div>
          <p className="text-2xl font-black text-[#16222F] font-mono">
            {featuredWorksCount}
          </p>
          <p className="text-[10px] text-[#7A8690] mt-0.5">Top-ranked proof records</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7E2D8] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#52606D] mb-1">
            <ThumbsUp className="w-4 h-4 text-[#2D4D45]" />
            <span>Recommended</span>
          </div>
          <p className="text-2xl font-black text-[#16222F] font-mono">
            {recommendedWorksCount}
          </p>
          <p className="text-[10px] text-[#7A8690] mt-0.5">Curator endorsed</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7E2D8] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#52606D] mb-1">
            <Layers className="w-4 h-4 text-[#2D4D45]" />
            <span>Curated Collections</span>
          </div>
          <p className="text-2xl font-black text-[#16222F] font-mono">
            {collections.filter((c) => c.isActive).length}
          </p>
          <p className="text-[10px] text-[#7A8690] mt-0.5">{collections.length} total defined</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7E2D8] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#52606D] mb-1">
            <Globe className="w-4 h-4 text-[#2D4D45]" />
            <span>Homepage Placements</span>
          </div>
          <p className="text-2xl font-black text-[#16222F] font-mono">
            {homepagePlacedCount}
          </p>
          <p className="text-[10px] text-[#7A8690] mt-0.5">Landing hero & trending</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E7E2D8] shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#52606D] mb-1">
            <Compass className="w-4 h-4 text-[#2D4D45]" />
            <span>Discover Practitioners</span>
          </div>
          <p className="text-2xl font-black text-[#16222F] font-mono">
            {discoverableUsersCount}
          </p>
          <p className="text-[10px] text-[#7A8690] mt-0.5">{featuredCreatorsCount} spotlighted</p>
        </div>
      </div>

      {/* Main Administrative Control Hub */}
      <div className="bg-white rounded-3xl border border-[#E7E2D8] shadow-xs overflow-hidden">
        {/* Navigation Header & Preview Action */}
        <div className="p-4 sm:p-6 border-b border-[#E7E2D8] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF8F5]">
          <div>
            <h2 className="text-base font-bold text-[#16222F]">
              Content, Distribution & Curation Governance
            </h2>
            <p className="text-xs text-[#52606D]">
              Directly govern how existing verified proof deliverables and professional profiles are surfaced, ranked, and highlighted.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-4 py-2 rounded-xl bg-white border border-[#2D4D45] text-[#2D4D45] hover:bg-[#EAF3EF] text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Live Surfaces</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="px-6 border-b border-[#E7E2D8] flex items-center gap-2 overflow-x-auto bg-white">
          {[
            { id: 'works', label: 'Deliverables & Works', icon: FileCheck, count: records.length },
            { id: 'collections', label: 'Curated Collections', icon: Layers, count: collections.length },
            { id: 'creators', label: 'Discover Creators', icon: Compass, count: discoverableUsersCount },
            { id: 'sections', label: 'Discovery Sections Layout', icon: LayoutGrid, count: discoverySections.length },
            { id: 'tags', label: 'Categories & Curated Tags', icon: Tag, count: curatedTags.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-3.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#2D4D45] text-[#2D4D45]'
                    : 'border-transparent text-[#7A8690] hover:text-[#16222F]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-[#EAF3EF] text-[#2D4D45]' : 'bg-stone-100 text-[#7A8690]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: DELIVERABLES & WORKS */}
        {activeTab === 'works' && (
          <div className="p-6 space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-2 border-b border-[#E7E2D8]">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8690]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search deliverables by title, category, description, or creator..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-white"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {/* Featured / Recommended */}
                <select
                  value={filterFeatured}
                  onChange={(e) => setFilterFeatured(e.target.value as typeof filterFeatured)}
                  className="px-2.5 py-1.5 border border-[#D5CEC2] rounded-xl bg-white text-xs font-bold text-[#16222F] focus:outline-none"
                >
                  <option value="all">All Curation States</option>
                  <option value="featured">Featured Only</option>
                  <option value="recommended">Recommended Only</option>
                </select>

                {/* Category */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#D5CEC2] rounded-xl bg-white text-xs font-bold text-[#16222F] focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Craft">Craft</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Consulting">Consulting</option>
                </select>

                {/* Homepage Placement */}
                <select
                  value={filterPlacement}
                  onChange={(e) => setFilterPlacement(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#D5CEC2] rounded-xl bg-white text-xs font-bold text-[#16222F] focus:outline-none"
                >
                  <option value="all">All Homepage Placements</option>
                  <option value="hero_spotlight">Hero Spotlight</option>
                  <option value="trending_proof">Trending Proof</option>
                  <option value="featured_deliverable">Featured Card</option>
                  <option value="none">No Homepage Placement</option>
                </select>

                {/* Visibility */}
                <select
                  value={filterVisibility}
                  onChange={(e) => setFilterVisibility(e.target.value)}
                  className="px-2.5 py-1.5 border border-[#D5CEC2] rounded-xl bg-white text-xs font-bold text-[#16222F] focus:outline-none"
                >
                  <option value="all">All Visibilities</option>
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>

                {(searchQuery ||
                  filterFeatured !== 'all' ||
                  filterCategory !== 'all' ||
                  filterPlacement !== 'all' ||
                  filterVisibility !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterFeatured('all');
                      setFilterCategory('all');
                      setFilterPlacement('all');
                      setFilterVisibility('all');
                    }}
                    className="text-[11px] font-bold text-stone-500 hover:text-stone-800 underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Deliverables Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E7E2D8] text-[11px] font-bold text-[#7A8690] uppercase tracking-wider bg-[#FAF8F5]">
                    <th className="py-3 px-3">Deliverable & Author</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-center">Featured</th>
                    <th className="py-3 px-3 text-center">Priority Rank</th>
                    <th className="py-3 px-3 text-center">Recommended</th>
                    <th className="py-3 px-3">Homepage Placement</th>
                    <th className="py-3 px-3">Visibility</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E2D8]">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-[#7A8690]">
                        No deliverables match the selected curation filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((work) => {
                      const author = users.find((u) => u.id === work.userId);
                      return (
                        <tr
                          key={work.id}
                          className="hover:bg-[#FAF8F5]/80 transition-colors group"
                        >
                          {/* Deliverable info */}
                          <td className="py-3 px-3 max-w-xs">
                            <div className="font-bold text-[#16222F] line-clamp-1">
                              {work.title}
                            </div>
                            <div className="text-[11px] text-[#7A8690] flex items-center gap-1.5 mt-0.5">
                              <span>By {author?.fullName || 'Anonymous'}</span>
                              <span>·</span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  work.confirmationStatus === 'confirmed'
                                    ? 'bg-[#EAF3EF] text-[#2D4D45]'
                                    : 'bg-stone-100 text-[#7A8690]'
                                }`}
                              >
                                {work.confirmationStatus}
                              </span>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 text-[#52606D] font-mono text-[11px]">
                              {work.category || 'General'}
                            </span>
                          </td>

                          {/* Quick Toggle Featured */}
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleFeatured(work)}
                              title={work.isFeatured ? 'Remove Featured' : 'Mark Featured'}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                work.isFeatured
                                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                                  : 'bg-white border-[#E7E2D8] text-stone-300 hover:text-amber-500'
                              }`}
                            >
                              <Star
                                className={`w-4 h-4 ${work.isFeatured ? 'fill-amber-500' : ''}`}
                              />
                            </button>
                          </td>

                          {/* Priority Rank */}
                          <td className="py-3 px-3 text-center">
                            {work.isFeatured ? (
                              <input
                                type="number"
                                min="1"
                                max="99"
                                value={work.featuredPriority || 1}
                                onChange={(e) =>
                                  handleQuickPriorityChange(
                                    work,
                                    parseInt(e.target.value, 10) || 1
                                  )
                                }
                                className="w-14 px-2 py-1 text-xs font-bold text-center border border-[#D5CEC2] rounded-lg focus:border-[#2D4D45] focus:outline-none bg-white font-mono"
                              />
                            ) : (
                              <span className="text-[#7A8690] text-xs font-mono">-</span>
                            )}
                          </td>

                          {/* Quick Toggle Recommended */}
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleRecommended(work)}
                              title={
                                work.isRecommended ? 'Remove Recommended' : 'Mark Recommended'
                              }
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                work.isRecommended
                                  ? 'bg-[#EAF3EF] border-[#2D4D45] text-[#2D4D45]'
                                  : 'bg-white border-[#E7E2D8] text-stone-300 hover:text-[#2D4D45]'
                              }`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                          </td>

                          {/* Homepage Placement */}
                          <td className="py-3 px-3">
                            <select
                              value={work.homepagePlacement || 'none'}
                              onChange={(e) =>
                                handleQuickPlacementChange(
                                  work,
                                  e.target.value as WorkRecord['homepagePlacement']
                                )
                              }
                              className="px-2 py-1 border border-[#D5CEC2] rounded-lg bg-white text-[11px] font-bold text-[#16222F] focus:outline-none"
                            >
                              <option value="none">None</option>
                              <option value="hero_spotlight">Hero Spotlight</option>
                              <option value="trending_proof">Trending Proof</option>
                              <option value="featured_deliverable">Featured Card</option>
                            </select>
                          </td>

                          {/* Visibility */}
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                work.visibility === 'public'
                                  ? 'bg-[#EAF3EF] text-[#2D4D45]'
                                  : work.visibility === 'unlisted'
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {work.visibility || 'public'}
                            </span>
                          </td>

                          {/* Edit Curation Button */}
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setEditingWork(work)}
                              className="px-3 py-1.5 rounded-xl bg-white border border-[#E7E2D8] text-[#16222F] font-bold hover:bg-[#FAF8F5] transition-all text-xs cursor-pointer flex items-center gap-1.5 ml-auto"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#52606D]" />
                              <span>Curate</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CURATED COLLECTIONS */}
        {activeTab === 'collections' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#16222F]">
                  Editorial Curated Collections
                </h3>
                <p className="text-xs text-[#52606D]">
                  Thematic discovery showcases displayed prominently to clients and collaborators.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreatingCollection(true)}
                className="px-4 py-2 rounded-xl bg-[#2D4D45] hover:bg-[#223B35] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>New Collection</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collections.map((col) => {
                const assignedWorks = records.filter(
                  (r) => r.curatedCollectionIds && r.curatedCollectionIds.includes(col.id)
                );

                return (
                  <div
                    key={col.id}
                    className="p-5 rounded-2xl border border-[#E7E2D8] bg-[#FAF8F5] hover:border-[#2D4D45]/40 transition-all space-y-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: col.accentColor || '#2D4D45' }}
                          >
                            {col.badgeLabel}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              col.isActive
                                ? 'bg-[#EAF3EF] text-[#2D4D45]'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {col.isActive ? 'Active' : 'Draft'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#16222F]">{col.title}</h4>
                        <p className="text-xs text-[#52606D] line-clamp-2">{col.description}</p>
                      </div>

                      <span className="text-xs font-bold font-mono text-[#7A8690] shrink-0">
                        Priority #{col.displayOrder}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#E7E2D8] flex items-center justify-between text-xs text-[#52606D]">
                      <div className="flex items-center gap-3">
                        <span>Discipline: <strong className="text-[#16222F] capitalize">{col.targetCategory}</strong></span>
                        <span>·</span>
                        <span>{assignedWorks.length} deliverables assigned</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleCollectionActive(col)}
                          className="p-1.5 rounded-lg border border-[#E7E2D8] hover:bg-white text-[#52606D] transition-colors cursor-pointer text-[11px] font-bold px-2"
                        >
                          {col.isActive ? 'Hide' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCollection(col)}
                          className="p-1.5 rounded-lg border border-[#E7E2D8] hover:bg-white text-[#16222F] transition-colors cursor-pointer"
                          title="Edit Collection"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCollection(col)}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                          title="Delete Collection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: DISCOVER CREATORS */}
        {activeTab === 'creators' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#16222F]">
                  Discover Directory & Spotlight Creators
                </h3>
                <p className="text-xs text-[#52606D]">
                  Curate which verified professionals receive top spotlight rankings and editorial verification badges in client search.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => {
                const userWorks = records.filter((r) => r.userId === user.id && r.visibility === 'public');
                const confirmedWorks = userWorks.filter((r) => r.confirmationStatus === 'confirmed');

                return (
                  <div
                    key={user.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      user.isFeatured
                        ? 'bg-[#FAF8F5] border-[#2D4D45]/40 shadow-xs'
                        : 'bg-white border-[#E7E2D8]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.profilePhoto}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-[#E7E2D8]"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-bold text-xs text-[#16222F] flex items-center gap-1">
                            <span>{user.fullName}</span>
                            {user.isFeatured && (
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            )}
                          </h4>
                          <p className="text-[11px] text-[#7A8690] line-clamp-1">
                            {user.profession || 'Professional'} · {user.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleCreatorFeatured(user)}
                          title={user.isFeatured ? 'Unfeature creator' : 'Feature creator'}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            user.isFeatured
                              ? 'bg-amber-50 border-amber-300 text-amber-600'
                              : 'bg-white border-[#E7E2D8] text-stone-300 hover:text-amber-500'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${user.isFeatured ? 'fill-amber-500' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-[11px] text-[#52606D]">
                      <span>{userWorks.length} public works</span>
                      <span>·</span>
                      <span className="font-bold text-[#2D4D45]">{confirmedWorks.length} confirmed</span>
                      <span>·</span>
                      <span className={user.appearInDiscover ? 'text-[#2D4D45] font-bold' : 'text-stone-400'}>
                        {user.appearInDiscover ? 'In Discover' : 'Private'}
                      </span>
                    </div>

                    {/* Editorial Curation Controls */}
                    <div className="pt-2 border-t border-[#E7E2D8] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-[#52606D]">
                          Featured Rank
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          disabled={!user.isFeatured}
                          value={user.featuredRank || 1}
                          onChange={(e) =>
                            handleCreatorRankChange(user, parseInt(e.target.value, 10) || 1)
                          }
                          className="w-14 px-2 py-0.5 text-center font-mono border border-[#D5CEC2] rounded-md focus:border-[#2D4D45] focus:outline-none disabled:opacity-30 bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#52606D] block">
                          Curator Badge
                        </label>
                        <input
                          type="text"
                          value={user.curationBadge || ''}
                          onChange={(e) => handleCreatorBadgeChange(user, e.target.value)}
                          placeholder="e.g. Master Artisan, Lead Systems Architect"
                          className="w-full px-2 py-1 text-[11px] border border-[#D5CEC2] rounded-md focus:border-[#2D4D45] focus:outline-none bg-white"
                        />
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[11px] text-[#52606D]">Homepage Hero Spotlight</span>
                        <button
                          type="button"
                          onClick={() => handleToggleCreatorSpotlight(user)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            user.homepageSpotlight
                              ? 'bg-[#2D4D45] text-white'
                              : 'bg-stone-100 text-[#7A8690] hover:bg-stone-200'
                          }`}
                        >
                          {user.homepageSpotlight ? 'Spotlighted' : 'Off'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: DISCOVERY SECTIONS LAYOUT */}
        {activeTab === 'sections' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-bold text-sm text-[#16222F]">
                Discovery Directory Sections Layout
              </h3>
              <p className="text-xs text-[#52606D]">
                Configure the modular sections rendered across Sabi&apos;s Discover Directory.
              </p>
            </div>

            <div className="space-y-4">
              {discoverySections.map((sec) => (
                <div
                  key={sec.id}
                  className="p-5 rounded-2xl border border-[#E7E2D8] bg-[#FAF8F5] space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#16222F]">{sec.title}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-mono">
                          {sec.sectionKey}
                        </span>
                      </div>
                      <p className="text-xs text-[#52606D] mt-0.5">{sec.description}</p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto">
                      <input
                        type="checkbox"
                        checked={sec.isEnabled}
                        onChange={() => handleToggleSectionEnabled(sec)}
                        className="w-4 h-4 text-[#2D4D45] rounded border-[#D5CEC2] focus:ring-[#2D4D45]"
                      />
                      <span className="text-xs font-bold text-[#16222F]">
                        {sec.isEnabled ? 'Section Enabled' : 'Section Disabled'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#E7E2D8] text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-[#52606D] block mb-1">
                        Item Display Limit
                      </label>
                      <select
                        value={sec.itemLimit}
                        onChange={(e) =>
                          handleSectionLimitChange(sec, parseInt(e.target.value, 10))
                        }
                        className="w-full px-3 py-1.5 border border-[#D5CEC2] rounded-xl bg-white text-xs font-bold focus:outline-none"
                      >
                        <option value={3}>3 Items</option>
                        <option value={4}>4 Items</option>
                        <option value={6}>6 Items</option>
                        <option value={8}>8 Items</option>
                        <option value={12}>12 Items</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#52606D] block mb-1">
                        Sorting Algorithm
                      </label>
                      <select
                        value={sec.sortBy}
                        onChange={(e) =>
                          handleSectionSortChange(
                            sec,
                            e.target.value as DiscoverySectionConfig['sortBy']
                          )
                        }
                        className="w-full px-3 py-1.5 border border-[#D5CEC2] rounded-xl bg-white text-xs font-bold focus:outline-none"
                      >
                        <option value="priority">Editorial Priority Order</option>
                        <option value="confirmed_first">Client Confirmed First</option>
                        <option value="recent">Most Recent Proofs</option>
                        <option value="evidence_count">Most Evidence Attached</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#52606D] block mb-1">
                        Section Order
                      </label>
                      <input
                        type="number"
                        disabled
                        value={sec.displayOrder}
                        className="w-full px-3 py-1.5 border border-[#D5CEC2] rounded-xl bg-stone-100 text-xs font-mono font-bold text-[#7A8690]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CATEGORIES & CURATED TAGS */}
        {activeTab === 'tags' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-[#16222F]">
                  Curated Skill & Discipline Tags
                </h3>
                <p className="text-xs text-[#52606D]">
                  Tags marked as &ldquo;Featured&rdquo; appear as quick-filter search pills in Discover and deliverable submission dialogs.
                </p>
              </div>

              {/* Add Tag Form */}
              <form onSubmit={handleAddTag} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="New skill tag..."
                  className="px-3 py-1.5 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-white"
                />
                <select
                  value={newTagCategory}
                  onChange={(e) => setNewTagCategory(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-[#D5CEC2] rounded-xl bg-white font-bold"
                >
                  <option value="engineering">Engineering</option>
                  <option value="craft">Craft</option>
                  <option value="design">Design</option>
                  <option value="fashion">Fashion</option>
                  <option value="architecture">Architecture</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-[#2D4D45] text-white text-xs font-bold hover:bg-[#223B35] transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tag</span>
                </button>
              </form>
            </div>

            {/* Tag List */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {curatedTags.map((tag) => (
                <div
                  key={tag.id}
                  className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                    tag.isFeatured
                      ? 'bg-[#EAF3EF] border-[#2D4D45] text-[#16222F]'
                      : 'bg-white border-[#E7E2D8] text-[#52606D]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTagFeatured(tag)}
                    title={tag.isFeatured ? 'Demote tag' : 'Feature tag'}
                    className="cursor-pointer"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        tag.isFeatured
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-stone-300 hover:text-amber-500'
                      }`}
                    />
                  </button>

                  <span className="font-bold">{tag.name}</span>

                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 text-[#7A8690] capitalize">
                    {tag.category}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeleteTag(tag)}
                    className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Work Curation Editor */}
      {editingWork && (
        <WorkCurationModal
          work={editingWork}
          collections={collections}
          adminUser={adminUser}
          onClose={() => setEditingWork(null)}
          onSaved={() => {
            showNotification(`Updated curation for "${editingWork.title}".`);
            reloadOperationalData();
          }}
        />
      )}

      {/* MODAL: Collection Creator / Editor */}
      {(editingCollection || isCreatingCollection) && (
        <CollectionModal
          collection={editingCollection}
          adminUser={adminUser}
          onClose={() => {
            setEditingCollection(null);
            setIsCreatingCollection(false);
          }}
          onSaved={() => {
            showNotification('Curated collection saved successfully.');
            reloadOperationalData();
          }}
        />
      )}

      {/* MODAL: Live Preview Modal */}
      {isPreviewOpen && (
        <ContentPreviewModal
          users={users}
          records={records}
          collections={collections}
          sections={discoverySections}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
};
