import { useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { HernanResolvedPhoto } from '@/components/wiki/useHernanPhotos';

type HernanImageViewerProps = {
  photos: HernanResolvedPhoto[];
  selectedIndex: number | null;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
};

export function HernanImageViewer({
  photos,
  selectedIndex,
  onClose,
  onSelectIndex,
}: HernanImageViewerProps) {
  const selectedPhoto = selectedIndex === null ? null : photos[selectedIndex];
  const currentIndex = selectedIndex ?? -1;
  const hasMultiple = photos.length > 1;

  const handlePrev = useCallback(() => {
    if (!hasMultiple || currentIndex < 0) return;
    onSelectIndex(currentIndex > 0 ? currentIndex - 1 : photos.length - 1);
  }, [currentIndex, hasMultiple, onSelectIndex, photos.length]);

  const handleNext = useCallback(() => {
    if (!hasMultiple || currentIndex < 0) return;
    onSelectIndex(currentIndex < photos.length - 1 ? currentIndex + 1 : 0);
  }, [currentIndex, hasMultiple, onSelectIndex, photos.length]);

  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && hasMultiple) {
        handlePrev();
      } else if (event.key === 'ArrowRight' && hasMultiple) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, hasMultiple, onClose, selectedPhoto]);

  if (!selectedPhoto) return null;

  return (
    <div
      id="hernan-image-viewer-modal"
      className="fixed inset-0 z-[210] flex select-none flex-col justify-between bg-black/85 p-3 backdrop-blur-xs sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="図版ビューア"
      onClick={onClose}
    >
      <div
        className="z-10 flex items-center justify-between text-neutral-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-[13px] tracking-wide text-neutral-300">
            {hasMultiple ? `図版 [${currentIndex + 1} / ${photos.length}]` : '図版詳細'}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex cursor-pointer items-center gap-1.5 rounded-xs border border-neutral-600 bg-neutral-800/80 px-3 py-1.5 text-[13px] text-white transition-colors hover:bg-neutral-700"
          aria-label="閉じる (Esc)"
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline">閉じる (Esc)</span>
        </button>
      </div>

      <div
        className="relative flex max-h-[78vh] flex-1 items-center justify-center px-1 py-2"
        onClick={(event) => event.stopPropagation()}
      >
        {hasMultiple && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-1 z-20 cursor-pointer rounded-full border border-neutral-700 bg-neutral-900/70 p-2 text-white transition-transform hover:bg-neutral-800 active:scale-95 sm:left-4 sm:p-3"
            aria-label="前の写真"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}

        <img
          src={selectedPhoto.url}
          alt={selectedPhoto.alt}
          className="max-h-[72vh] max-w-[92vw] rounded-xs border border-neutral-800 object-contain shadow-2xl md:max-w-[80vw]"
          referrerPolicy="no-referrer"
        />

        {hasMultiple && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-1 z-20 cursor-pointer rounded-full border border-neutral-700 bg-neutral-900/70 p-2 text-white transition-transform hover:bg-neutral-800 active:scale-95 sm:right-4 sm:p-3"
            aria-label="次の写真"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}
      </div>

      <div
        className="mx-auto w-full max-w-3xl rounded-xs border border-neutral-800 bg-neutral-900/90 p-3 text-center text-neutral-200"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="font-sans text-[13px] leading-relaxed text-neutral-100 sm:text-[14px]">
          {selectedPhoto.title || selectedPhoto.alt}
        </p>
        {(selectedPhoto.locationName || selectedPhoto.timestamp) && (
          <p className="mt-1 font-mono text-[11.5px] text-neutral-400">
            {[selectedPhoto.locationName, selectedPhoto.timestamp].filter(Boolean).join(' • ')}
          </p>
        )}
      </div>
    </div>
  );
}
