import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Compass, Calendar, Maximize2 } from 'lucide-react';
import { PhotoItem } from '../types';

interface PhotoModalProps {
  photos: PhotoItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const currentPhoto = photos[currentIndex];
  const hasMultiple = photos.length > 1;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasMultiple) {
        onNavigate((currentIndex - 1 + photos.length) % photos.length);
      } else if (e.key === 'ArrowRight' && hasMultiple) {
        onNavigate((currentIndex + 1) % photos.length);
      }
    },
    [isOpen, currentIndex, photos.length, hasMultiple, onClose, onNavigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !currentPhoto) return null;

  return (
    <div
      id="photo-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#070a0ed9] backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="旅の記憶・拡大閲覧"
    >
      <div
        id="photo-modal-content"
        className="relative flex flex-col max-w-5xl max-h-[92vh] w-full bg-[#121720] border border-amber-500/30 rounded-xl overflow-hidden shadow-2xl shadow-black/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/20 bg-gradient-to-r from-[#18202c] to-[#121720]">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-cinzel text-xs tracking-widest text-amber-300 uppercase font-semibold">
              Chronicle Relic
            </span>
            {hasMultiple && (
              <span className="text-xs text-amber-200/60 font-mono ml-2 px-2 py-0.5 bg-amber-950/40 rounded border border-amber-500/20">
                {currentIndex + 1} / {photos.length}
              </span>
            )}
          </div>
          <button
            id="btn-close-photo-modal"
            onClick={onClose}
            aria-label="写真を閉じる"
            className="p-1.5 rounded-lg text-amber-200/70 hover:text-amber-100 hover:bg-amber-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Image Stage */}
        <div className="relative flex-1 flex items-center justify-center p-3 sm:p-6 bg-black/40 overflow-hidden min-h-[260px] sm:min-h-[400px]">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.alt || currentPhoto.title}
            className="max-h-[62vh] max-w-full object-contain rounded-md shadow-lg border border-amber-500/10 select-none transition-all duration-300"
          />

          {/* Previous / Next buttons (only if multiple) */}
          {hasMultiple && (
            <>
              <button
                id="btn-photo-prev"
                onClick={() => onNavigate((currentIndex - 1 + photos.length) % photos.length)}
                aria-label="前の写真へ"
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 border border-amber-400/30 text-amber-200 hover:text-white hover:bg-amber-600/60 hover:scale-105 active:scale-95 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                id="btn-photo-next"
                onClick={() => onNavigate((currentIndex + 1) % photos.length)}
                aria-label="次の写真へ"
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 border border-amber-400/30 text-amber-200 hover:text-white hover:bg-amber-600/60 hover:scale-105 active:scale-95 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}
        </div>

        {/* Footer Meta Details */}
        <div className="px-4 py-3 bg-[#151c27] border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-100/80">
          <div>
            <h4 className="font-serif-jp text-sm font-semibold text-amber-200 tracking-wide">
              {currentPhoto.title}
            </h4>
            <p className="text-amber-300/60 text-[11px] mt-0.5 font-cinzel">
              {currentPhoto.alt}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-stone-300/80">
            {currentPhoto.locationTag && (
              <span className="flex items-center gap-1 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/20">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                {currentPhoto.locationTag}
              </span>
            )}
            {currentPhoto.timestamp && (
              <span className="flex items-center gap-1 bg-stone-900/60 px-2 py-0.5 rounded border border-stone-700">
                <Calendar className="w-3.5 h-3.5 text-amber-400/70" />
                {currentPhoto.timestamp}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
