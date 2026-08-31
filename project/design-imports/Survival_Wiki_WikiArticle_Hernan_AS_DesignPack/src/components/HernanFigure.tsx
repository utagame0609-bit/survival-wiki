/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArticlePhoto } from '../types';
import { Maximize2 } from 'lucide-react';

interface HernanFigureProps {
  photo: ArticlePhoto;
  onOpenLightbox?: (photo: ArticlePhoto) => void;
  className?: string;
  variant?: 'inline-right' | 'full-width' | 'infobox-media' | 'gallery-item' | 'section-break';
  figNumber?: number | string;
}

export const HernanFigure: React.FC<HernanFigureProps> = ({
  photo,
  onOpenLightbox,
  className = '',
  variant = 'inline-right',
  figNumber
}) => {
  const handleClick = () => {
    if (onOpenLightbox) {
      onOpenLightbox(photo);
    }
  };

  const getContainerStyle = () => {
    switch (variant) {
      case 'inline-right':
        // On desktop, clean floated right box. On mobile/compact, full width inline block (no awkward float narrow text)
        return 'my-4 sm:my-3 sm:ml-5 sm:float-right sm:w-[260px] md:w-[290px] clear-right w-full';
      case 'section-break':
        // Full width reading break figure between paragraphs
        return 'my-6 w-full max-w-[620px] mx-auto clear-both';
      case 'full-width':
        return 'my-5 w-full clear-both';
      case 'gallery-item':
        return 'w-full h-full';
      case 'infobox-media':
        return 'w-full mb-2';
      default:
        return 'my-4 w-full';
    }
  };

  return (
    <figure
      id={`fig-${photo.id}`}
      className={`group bg-[#f8f9fa] border border-[#eaecf0] p-1.5 sm:p-2 rounded-xs transition-colors duration-150 ${getContainerStyle()} ${className}`}
    >
      <div
        className="relative overflow-hidden bg-neutral-200 cursor-pointer select-none rounded-2xs"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label={`${photo.alt} を拡大表示`}
      >
        <img
          src={photo.url}
          alt={photo.alt}
          className="w-full h-auto object-cover max-h-[320px] transition-transform duration-200 group-hover:scale-[1.01]"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900/75 text-white p-1 rounded-xs backdrop-blur-xs text-[10px] flex items-center gap-1 pointer-events-none">
          <Maximize2 className="h-3 w-3" />
          <span>拡大</span>
        </div>
      </div>

      {photo.caption && (() => {
        // Strip any pre-existing "図1:", "図２：", "Fig.1:" from the caption text to prevent double numbering
        const cleanCaption = photo.caption.replace(/^(?:図|Fig\.?|Figure)\s*[0-9０-９一二三四五六七八九十]+\s*[:：\-–—]\s*/i, '').trim();
        return (
          <figcaption className="text-[12px] sm:text-[12.5px] leading-relaxed text-neutral-600 pt-1.5 px-0.5 mt-1 border-t border-[#f0f2f5] font-sans">
            {figNumber ? (
              <>
                <span className="font-bold text-neutral-800 mr-1 font-mono text-[11.5px]">
                  図{figNumber}：
                </span>
                <span>{cleanCaption}</span>
              </>
            ) : (
              <span>{cleanCaption}</span>
            )}
            {(photo.location || photo.timestamp) && (
              <span className="block text-[11px] text-neutral-400 mt-0.5 font-mono">
                {[photo.location, photo.timestamp].filter(Boolean).join(' • ')}
              </span>
            )}
          </figcaption>
        );
      })()}
    </figure>
  );
};

