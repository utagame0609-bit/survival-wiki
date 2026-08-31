/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Feather, Quote } from 'lucide-react';

interface HernanCompilerNoteProps {
  comment?: string;
  className?: string;
}

export const HernanCompilerNote: React.FC<HernanCompilerNoteProps> = ({
  comment,
  className = ''
}) => {
  if (!comment || comment.trim().length === 0) {
    return null;
  }

  return (
    <section
      id="hernan-compiler-postscript"
      aria-label="編纂者後記"
      className={`my-8 bg-[#fbfcfd] border border-[#d8dbe0] border-l-4 border-l-neutral-600 p-4 sm:p-5 rounded-xs text-neutral-800 font-sans ${className}`}
    >
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#e9ebed]">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-xs bg-neutral-800 text-neutral-100">
            <Feather className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-[14px] font-bold text-neutral-900 font-serif">
            編纂者解題（民俗学者エルナンによる事後論考）
          </h3>
        </div>
        <span className="text-[11px] font-mono text-neutral-400">
          FOLKLORIST POSTSCRIPT
        </span>
      </div>

      <div className="relative pl-3 text-[14px] sm:text-[14.5px] leading-[1.8] text-neutral-700 italic font-serif">
        <Quote className="h-4 w-4 text-neutral-300 absolute -left-1 -top-1 rotate-180" />
        <p className="relative z-10">{comment}</p>
      </div>

      <div className="mt-3 pt-2 text-right">
        <span className="text-[12px] text-neutral-500 font-serif">
          ── Survival Wiki 学術編纂官 民俗学者エルナン 記
        </span>
      </div>
    </section>
  );
};
