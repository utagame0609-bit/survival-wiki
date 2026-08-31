/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TocItem, MobileTocMode } from '../types';
import { ChevronDown, ChevronRight, List, X } from 'lucide-react';

interface HernanTableOfContentsProps {
  toc: TocItem[];
  activeId?: string;
  onNavigate?: (id: string) => void;
  variant: 'desktop-sticky' | 'mobile-inline' | 'mobile-sheet';
  mobileMode?: MobileTocMode;
  onToggleMobileSheet?: (open: boolean) => void;
  isMobileSheetOpen?: boolean;
}

export const HernanTableOfContents: React.FC<HernanTableOfContentsProps> = ({
  toc,
  activeId,
  onNavigate,
  variant,
  onToggleMobileSheet,
  isMobileSheetOpen = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If there are less than 2 sections, do not force a massive TOC
  if (!toc || toc.length < 2) {
    return null;
  }

  const handleItemClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // --- DESKTOP STICKY RAIL ---
  if (variant === 'desktop-sticky') {
    return (
      <nav
        id="hernan-desktop-toc"
        aria-label="記事の目次"
        className="w-[210px] xl:w-[240px] shrink-0 text-neutral-700 select-none"
      >
        <div className="sticky top-6 max-h-[calc(100vh-5rem)] overflow-y-auto pr-2 pb-6 border-r border-[#eaecf0]/80">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#eaecf0]">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold tracking-wider text-neutral-500 uppercase font-mono">
              <List className="h-3.5 w-3.5 text-neutral-400" />
              <span>目次 (Contents)</span>
            </div>
          </div>

          <ul className="space-y-0.5 text-[13px] leading-snug font-sans">
            {toc.map((item) => {
              const isActive = activeId === item.id;
              return (
                <li key={item.id} className="group">
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleItemClick(item.id, e)}
                    className={`flex items-baseline gap-1.5 py-1 px-2 rounded-xs transition-colors ${
                      isActive
                        ? 'font-medium text-[#0645ad] bg-blue-50/70 border-l-2 border-[#0645ad] pl-1.5'
                        : 'text-neutral-600 hover:text-[#0645ad] hover:bg-neutral-100/60'
                    }`}
                  >
                    <span className="text-[11px] font-mono text-neutral-400 shrink-0">
                      {item.numberPrefix}
                    </span>
                    <span className="truncate">{item.text}</span>
                  </a>

                  {item.subItems && item.subItems.length > 0 && (
                    <ul className="pl-4 mt-0.5 space-y-0.5 border-l border-neutral-200 ml-2.5">
                      {item.subItems.map((sub) => {
                        const isSubActive = activeId === sub.id;
                        return (
                          <li key={sub.id}>
                            <a
                              href={`#${sub.id}`}
                              onClick={(e) => handleItemClick(sub.id, e)}
                              className={`flex items-baseline gap-1 py-0.5 px-1.5 text-[12px] rounded-xs transition-colors ${
                                isSubActive
                                  ? 'font-medium text-[#0645ad] bg-blue-50/60'
                                  : 'text-neutral-500 hover:text-[#0645ad]'
                              }`}
                            >
                              <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                                {sub.numberPrefix}
                              </span>
                              <span className="truncate">{sub.text}</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    );
  }

  // --- MOBILE INLINE ACCORDION ---
  if (variant === 'mobile-inline') {
    return (
      <div
        id="hernan-mobile-inline-toc"
        className="my-3 bg-[#f8f9fa] border border-[#eaecf0] p-2.5 sm:p-3 rounded-xs w-full min-w-0"
      >
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between text-left cursor-pointer group select-none py-0.5"
          aria-expanded={!isCollapsed}
          aria-controls="hernan-mobile-toc-list"
        >
          <div className="flex items-center gap-2 min-w-0">
            <List className="h-4 w-4 text-neutral-500 shrink-0" />
            <span className="text-[13.5px] font-bold text-neutral-800 font-serif shrink-0">
              目次
            </span>
            <span className="text-[11px] text-neutral-400 font-mono truncate">
              [{toc.length} 項目]
            </span>
          </div>
          <div className="flex items-center gap-1 text-[12px] text-[#0645ad] font-sans shrink-0 ml-2">
            <span>{isCollapsed ? '表示' : '非表示'}</span>
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </div>
        </button>

        {!isCollapsed && (
          <nav
            id="hernan-mobile-toc-list"
            aria-label="目次一覧"
            className="mt-2.5 pt-2 border-t border-[#eaecf0]"
          >
            <ol className="space-y-1 text-[13px] text-neutral-700 font-sans">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => handleItemClick(item.id, e)}
                    className="flex items-baseline gap-1.5 py-1 text-[#0645ad] hover:underline"
                  >
                    <span className="text-[11.5px] font-mono text-neutral-400 shrink-0">
                      {item.numberPrefix}
                    </span>
                    <span className="font-medium break-words">{item.text}</span>
                  </a>

                  {item.subItems && item.subItems.length > 0 && (
                    <ol className="pl-4 mt-0.5 space-y-0.5">
                      {item.subItems.map((sub) => (
                        <li key={sub.id}>
                          <a
                            href={`#${sub.id}`}
                            onClick={(e) => handleItemClick(sub.id, e)}
                            className="flex items-baseline gap-1 text-[12px] text-[#0645ad]/90 py-0.5 hover:underline"
                          >
                            <span className="text-[10.5px] font-mono text-neutral-400 shrink-0">
                              {sub.numberPrefix}
                            </span>
                            <span className="break-words">{sub.text}</span>
                          </a>
                        </li>
                      ))}
                    </ol>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
    );
  }

  // --- MOBILE BOTTOM QUICK SHEET (Alternative option for comparison) ---
  return (
    <>
      <div className="my-3">
        <button
          type="button"
          onClick={() => onToggleMobileSheet && onToggleMobileSheet(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[#f0f2f5] hover:bg-[#e4e6eb] text-[12.5px] font-medium text-neutral-700 border border-[#dcdfe4] cursor-pointer transition-colors"
        >
          <List className="h-3.5 w-3.5 text-neutral-500" />
          <span>この記事の目次を開く（{toc.length}章）</span>
        </button>
      </div>

      {isMobileSheetOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="記事の目次"
        >
          <div
            className="bg-white rounded-t-lg max-h-[75vh] flex flex-col p-4 shadow-xl border-t border-neutral-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 text-neutral-700" />
                <h3 className="font-serif font-bold text-neutral-900 text-[15px]">
                  目次一覧
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onToggleMobileSheet && onToggleMobileSheet(false)}
                className="p-1 rounded-xs hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800"
                aria-label="目次を閉じる"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-2">
              {toc.map((item) => (
                <div key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      handleItemClick(item.id, e);
                      onToggleMobileSheet && onToggleMobileSheet(false);
                    }}
                    className="flex items-baseline gap-2 py-1 text-[14px] text-[#0645ad] font-medium hover:underline"
                  >
                    <span className="text-[12px] font-mono text-neutral-400">
                      {item.numberPrefix}
                    </span>
                    <span>{item.text}</span>
                  </a>

                  {item.subItems && item.subItems.length > 0 && (
                    <div className="pl-5 space-y-1 mt-1">
                      {item.subItems.map((sub) => (
                        <a
                          key={sub.id}
                          href={`#${sub.id}`}
                          onClick={(e) => {
                            handleItemClick(sub.id, e);
                            onToggleMobileSheet && onToggleMobileSheet(false);
                          }}
                          className="flex items-baseline gap-1.5 text-[13px] text-[#0645ad]/90 py-0.5 hover:underline"
                        >
                          <span className="text-[11px] font-mono text-neutral-400">
                            {sub.numberPrefix}
                          </span>
                          <span>{sub.text}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
