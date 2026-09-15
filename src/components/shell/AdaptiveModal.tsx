import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface AdaptiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

export const AdaptiveModal: React.FC<AdaptiveModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  maxWidth = 'lg',
  showCloseButton = true,
}) => {
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [translateY, setTranslateY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setTranslateY(0);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Swipe-down dismissal handlers for mobile bottom sheet
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const deltaY = e.touches[0].clientY - touchStartY;
    if (deltaY > 0) {
      setTranslateY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (translateY > 90) {
      onClose();
    }
    setTouchStartY(null);
    setTranslateY(0);
  };

  const maxWidthClass = {
    sm: 'md:max-w-sm',
    md: 'md:max-w-md',
    lg: 'md:max-w-lg',
    xl: 'md:max-w-xl',
    '2xl': 'md:max-w-2xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dual-branching Shell: Sliding Bottom Sheet on Mobile vs Centered Modal on Desktop */}
      <div
        ref={sheetRef}
        style={{
          transform: translateY > 0 ? `translateY(${translateY}px)` : undefined,
          transition: touchStartY !== null ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`relative z-10 w-full bg-surface text-primary border-t md:border border-subtle shadow-2xl overflow-hidden flex flex-col
          /* Mobile Bottom Sheet */
          rounded-t-3xl max-h-[88vh] pb-safe
          /* Desktop Centered Modal */
          md:rounded-2xl md:max-h-[90vh] md:w-full ${maxWidthClass} md:my-8 md:animate-in md:fade-in-50 md:zoom-in-95`}
      >
        {/* Mobile Drag Handle Bar */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="md:hidden pt-3 pb-1 cursor-grab active:cursor-grabbing flex justify-center items-center select-none"
        >
          <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
        </div>

        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="px-5 py-3.5 border-b border-subtle bg-surface-elevated flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {icon && <span className="shrink-0 text-accent-primary">{icon}</span>}
              <div className="min-w-0">
                {title && (
                  <h3 className="font-bold text-sm sm:text-base text-primary truncate">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-xs text-secondary truncate mt-0.5">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="min-h-[44px] min-w-[44px] md:min-h-8 md:min-w-8 md:h-8 md:w-8 p-1.5 flex items-center justify-center rounded-xl text-muted hover:text-primary hover:bg-surface-hover transition-colors cursor-pointer active:scale-95"
              >
                <X className="w-5 h-5 md:w-4 md:h-4" />
              </button>
            )}
          </div>
        )}

        {/* Content Body (Scrollable with hidden scrollbars on mobile) */}
        <div className="flex-1 overflow-y-auto no-scrollbar md:scrollbar-thin p-5">
          {children}
        </div>
      </div>
    </div>
  );
};
