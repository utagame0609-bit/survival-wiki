import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, MapPin, X } from 'lucide-react';

export type GildasPhotoItem = {
  id: string;
  url: string;
  alt: string;
  title: string;
  locationName?: string;
  timestamp?: string;
};

export function GildasPhotoModal({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: {
  photos: GildasPhotoItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const currentPhoto = photos[currentIndex];
  const hasMultiple = photos.length > 1;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
      return;
    }
    if (!hasMultiple) return;
    if (event.key === 'ArrowLeft') {
      onNavigate((currentIndex - 1 + photos.length) % photos.length);
    } else if (event.key === 'ArrowRight') {
      onNavigate((currentIndex + 1) % photos.length);
    }
  }, [currentIndex, hasMultiple, onClose, onNavigate, photos.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [handleKeyDown]);

  if (!currentPhoto) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[240] flex items-center justify-center bg-[#05080E]/94 p-3 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="旅の記憶を拡大表示"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-amber-500/30 bg-[#121720] shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between border-b border-amber-500/20 bg-gradient-to-r from-[#18202c] to-[#121720] px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
            <span className="gildas-cinzel truncate text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
              Chronicle Relic
            </span>
            {hasMultiple && (
              <span className="ml-1 shrink-0 rounded border border-amber-500/20 bg-amber-950/40 px-2 py-0.5 font-mono text-[11px] text-amber-200/70">
                {currentIndex + 1} / {photos.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="写真を閉じる"
            className="rounded-lg p-2 text-amber-200/70 transition-colors hover:bg-amber-500/20 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex min-h-[260px] flex-1 items-center justify-center overflow-hidden bg-black/40 p-3 sm:min-h-[400px] sm:p-6">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.alt}
            className="max-h-[62vh] max-w-full select-none rounded-md border border-amber-500/10 object-contain shadow-lg"
          />

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() => onNavigate((currentIndex - 1 + photos.length) % photos.length)}
                aria-label="前の写真へ"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-amber-400/30 bg-black/65 p-2.5 text-amber-200 shadow-lg transition-all hover:bg-amber-700/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:left-5"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate((currentIndex + 1) % photos.length)}
                aria-label="次の写真へ"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-amber-400/30 bg-black/65 p-2.5 text-amber-200 shadow-lg transition-all hover:bg-amber-700/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:right-5"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </>
          )}
        </div>

        <div className="flex flex-col justify-between gap-2 border-t border-amber-500/20 bg-[#151c27] px-4 py-3 text-xs text-amber-100/80 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <div className="gildas-display break-words text-sm font-semibold tracking-wide text-amber-200">
              {currentPhoto.title}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-stone-300/80">
            {currentPhoto.locationName && (
              <span className="flex items-center gap-1 rounded border border-amber-500/20 bg-amber-950/30 px-2 py-0.5">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
                {currentPhoto.locationName}
              </span>
            )}
            {currentPhoto.timestamp && (
              <span className="flex items-center gap-1 rounded border border-stone-700 bg-stone-900/60 px-2 py-0.5">
                <Calendar className="h-3.5 w-3.5 text-amber-400/70" />
                {currentPhoto.timestamp}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
