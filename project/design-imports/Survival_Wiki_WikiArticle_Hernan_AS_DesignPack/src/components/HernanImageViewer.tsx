/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useCallback } from 'react';
import { ArticlePhoto } from '../types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface HernanImageViewerProps {
  photos: ArticlePhoto[];
  selectedPhoto: ArticlePhoto | null;
  onClose: () => void;
  onSelectPhoto: (photo: ArticlePhoto) => void;
}

export const HernanImageViewer: React.FC<HernanImageViewerProps> = ({
  photos,
  selectedPhoto,
  onClose,
  onSelectPhoto
}) => {
  const currentIndex = selectedPhoto
    ? photos.findIndex((p) => p.id === selectedPhoto.id)
    : -1;

  const hasMultiple = photos.length > 1;

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onSelectPhoto(photos[currentIndex - 1]);
    } else if (photos.length > 0) {
      onSelectPhoto(photos[photos.length - 1]);
    }
  }, [currentIndex, photos, onSelectPhoto]);

  const handleNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      onSelectPhoto(photos[currentIndex + 1]);
    } else if (photos.length > 0) {
      onSelectPhoto(photos[0]);
    }
  }, [currentIndex, photos, onSelectPhoto]);

  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasMultiple) {
        handlePrev();
      } else if (e.key === 'ArrowRight' && hasMultiple) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, hasMultiple, handlePrev, handleNext, onClose]);

  if (!selectedPhoto) return null;

  return (
    <div
      id="hernan-image-viewer-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex flex-col justify-between p-3 sm:p-6 select-none"
      role="dialog"
      aria-modal="true"
      aria-label="図版ビューア"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="flex items-center justify-between text-neutral-200 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-mono tracking-wide text-neutral-300">
            {hasMultiple ? `図版 [${currentIndex + 1} / ${photos.length}]` : '図版詳細'}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-neutral-800/80 hover:bg-neutral-700 text-white text-[13px] cursor-pointer transition-colors border border-neutral-600"
          aria-label="閉じる (Esc)"
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline">閉じる (Esc)</span>
        </button>
      </div>

      {/* Main Image Container */}
      <div
        className="relative flex-1 flex items-center justify-center py-2 px-1 max-h-[78vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {hasMultiple && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-1 sm:left-4 z-20 p-2 sm:p-3 rounded-full bg-neutral-900/70 hover:bg-neutral-800 text-white border border-neutral-700 transition-transform active:scale-95 cursor-pointer"
            aria-label="前の写真"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}

        <img
          src={selectedPhoto.url}
          alt={selectedPhoto.alt}
          className="max-h-[72vh] max-w-[92vw] md:max-w-[80vw] object-contain rounded-xs shadow-2xl border border-neutral-800"
          referrerPolicy="no-referrer"
        />

        {hasMultiple && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-1 sm:right-4 z-20 p-2 sm:p-3 rounded-full bg-neutral-900/70 hover:bg-neutral-800 text-white border border-neutral-700 transition-transform active:scale-95 cursor-pointer"
            aria-label="次の写真"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}
      </div>

      {/* Bottom Caption Bar */}
      <div
        className="bg-neutral-900/90 border border-neutral-800 text-neutral-200 p-3 rounded-xs max-w-3xl mx-auto w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[13px] sm:text-[14px] leading-relaxed text-neutral-100 font-sans">
          {selectedPhoto.caption || selectedPhoto.alt}
        </p>
        {(selectedPhoto.location || selectedPhoto.timestamp) && (
          <p className="text-[11.5px] text-neutral-400 mt-1 font-mono">
            {[selectedPhoto.location, selectedPhoto.timestamp].filter(Boolean).join(' • ')}
          </p>
        )}
      </div>
    </div>
  );
};
