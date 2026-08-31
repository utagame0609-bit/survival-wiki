/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Feather } from 'lucide-react';

export interface HernanEncyclopediaLogoProps {
  logoSrc?: string;
  logoAlt?: string;
  siteName?: string;
  subtitle?: string;
  showSubtitle?: boolean;
  className?: string;
}

/**
 * 独自ロゴ／アイコン差し替え可能コンポーネント
 * Wikipediaの地球儀・パズル球ブランド資産は一切使用せず、
 * Survival Wikiの百科事典編纂官・民俗学者エルナンの学術的アイデンティティを表現します。
 * logoSrc を渡せば将来的な独自SVGや画像アセットへシームレスに差し替え可能です。
 */
export const HernanEncyclopediaLogo: React.FC<HernanEncyclopediaLogoProps> = ({
  logoSrc,
  logoAlt = 'Survival Wiki 百科事典編纂録',
  siteName = 'SURVIVAL WIKI 百科事典',
  subtitle = '編纂官：民俗学者エルナン（学術編纂室）',
  showSubtitle = true,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 py-1 select-none min-w-0 ${className}`}>
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={logoAlt}
          className="h-7 sm:h-8 w-auto object-contain shrink-0"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          id="hernan-emblem-badge"
          className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-sm bg-neutral-800 text-neutral-100 border border-neutral-700 shadow-xs"
          title="Survival Wiki 学術編纂官紋章"
        >
          <div className="relative flex items-center justify-center">
            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-200" strokeWidth={1.75} />
            <Feather className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-neutral-400 absolute -bottom-0.5 -right-0.5" strokeWidth={2} />
          </div>
        </div>
      )}

      <div className="flex flex-col min-w-0">
        <div className="flex items-baseline gap-1.5 sm:gap-2 min-w-0">
          <span className="text-[13px] sm:text-[14px] font-bold tracking-tight text-neutral-900 font-serif whitespace-nowrap shrink-0">
            {siteName}
          </span>
          <span className="hidden lg:inline-block text-[9.5px] font-mono tracking-widest text-neutral-500 uppercase shrink-0">
            FOLKLORIC ARCHIVE
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] sm:text-[11px] leading-tight text-neutral-500 font-sans truncate max-w-[220px] sm:max-w-none">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

