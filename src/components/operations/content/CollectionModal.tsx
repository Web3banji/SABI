import React, { useState } from 'react';
import { X, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CuratedCollection, AdminUser } from '../../../types';
import { operationsService } from '../../../services/operationsService';

interface CollectionModalProps {
  collection?: CuratedCollection | null;
  adminUser: AdminUser | null;
  onClose: () => void;
  onSaved: () => void;
}

export const CollectionModal: React.FC<CollectionModalProps> = ({
  collection,
  adminUser,
  onClose,
  onSaved,
}) => {
  const [title, setTitle] = useState(collection?.title || '');
  const [description, setDescription] = useState(collection?.description || '');
  const [badgeLabel, setBadgeLabel] = useState(collection?.badgeLabel || '');
  const [accentColor, setAccentColor] = useState(collection?.accentColor || '#2D4D45');
  const [targetCategory, setTargetCategory] = useState(collection?.targetCategory || 'all');
  const [displayOrder, setDisplayOrder] = useState<number>(collection?.displayOrder || 1);
  const [isActive, setIsActive] = useState<boolean>(
    collection?.isActive !== undefined ? collection.isActive : true
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Collection title is required.');
      return;
    }

    const actor = {
      id: adminUser?.id || 'admin',
      email: adminUser?.email || 'admin@sabi.id',
      name: adminUser?.fullName || 'Administrator',
    };

    try {
      operationsService.saveCuratedCollection(
        {
          id: collection?.id,
          title: title.trim(),
          description: description.trim(),
          badgeLabel: badgeLabel.trim() || 'Curated',
          accentColor,
          targetCategory,
          displayOrder: Number(displayOrder) || 1,
          isActive,
        },
        actor
      );
      onSaved();
      onClose();
    } catch {
      setError('Failed to save collection.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E7E2D8] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E7E2D8] bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF3EF] flex items-center justify-center text-[#2D4D45]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#16222F]">
                {collection ? 'Edit Curated Collection' : 'Create Curated Collection'}
              </h2>
              <p className="text-xs text-[#52606D]">
                Thematic showcase of verified proof deliverables
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#16222F] block mb-1">
              Collection Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Tangible Craft & Architectural Fabrication"
              className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#16222F] block mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the editorial curation criteria and proof requirements for this showcase..."
              className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#16222F] block mb-1">
                Badge Label
              </label>
              <input
                type="text"
                value={badgeLabel}
                onChange={(e) => setBadgeLabel(e.target.value)}
                placeholder="e.g. Master Trades"
                className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#16222F] block mb-1">
                Accent Theme Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-9 h-9 p-0.5 rounded-lg border border-[#D5CEC2] cursor-pointer"
                />
                <span className="font-mono text-xs text-[#52606D] uppercase">
                  {accentColor}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#16222F] block mb-1">
                Target Discipline
              </label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-white"
              >
                <option value="all">All Disciplines</option>
                <option value="craft">Craft & Fabrication</option>
                <option value="engineering">Engineering & Tech</option>
                <option value="design">Design & Creative</option>
                <option value="fashion">Haute Couture & Fashion</option>
                <option value="architecture">Architecture & Spaces</option>
                <option value="consulting">Strategy & Operations</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#16222F] block mb-1">
                Display Order Priority
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-xs border border-[#D5CEC2] rounded-xl focus:border-[#2D4D45] focus:outline-none bg-white font-mono font-bold"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#E7E2D8] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#16222F] block">
                Collection Publication Status
              </span>
              <span className="text-[11px] text-[#7A8690]">
                Active collections appear live in Discovery sections.
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-[#2D4D45] rounded border-[#D5CEC2] focus:ring-[#2D4D45]"
              />
              <span className="text-xs font-bold text-[#16222F]">
                {isActive ? 'Published / Active' : 'Draft / Hidden'}
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-[#E7E2D8] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#52606D] hover:bg-stone-200/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2D4D45] hover:bg-[#223B35] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{collection ? 'Update Collection' : 'Create Collection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
