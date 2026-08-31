/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Compass,
  Radio,
  Share2,
  Copy,
  ArrowUp,
  ArrowDown,
  BookOpen,
  Check,
  RotateCcw,
  Sliders
} from 'lucide-react';

interface SurvivalWikiOuterHUDProps {
  children: React.ReactNode;
  articleTitle: string;
  onResetArticle?: () => void;
  onOpenPreviewToolbar?: () => void;
  isPreviewToolbarOpen?: boolean;
}

export const SurvivalWikiOuterHUD: React.FC<SurvivalWikiOuterHUDProps> = ({
  children,
  articleTitle,
  onResetArticle,
  onOpenPreviewToolbar,
  isPreviewToolbarOpen = false
}) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: articleTitle,
        url: window.location.href
      }).catch(() => {});
    } else {
      handleCopy();
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col font-sans antialiased">
      {/* OUTER SURVIVAL WIKI DARK HUD HEADER */}
      <header
        id="survival-wiki-outer-header"
        className="sticky top-0 z-40 bg-zinc-950/95 border-b border-zinc-800/80 backdrop-blur-md px-3 sm:px-6 py-2 select-none"
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2">
          {/* Terminal Title & Compiler Indicator */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] sm:text-[12px] bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-xs">
              <Radio className="h-3 w-3 animate-pulse" />
              <span className="font-bold tracking-wider">TERMINAL // LIVE</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-amber-400" />
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                <span className="text-[12.5px] sm:text-[14px] font-bold text-zinc-100 font-mono tracking-tight">
                  SURVIVAL WIKI
                </span>
                <span className="text-[10px] sm:text-[11px] text-amber-300/90 font-mono">
                  [編纂官: 民俗学者エルナン]
                </span>
              </div>
            </div>
          </div>

          {/* HUD Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onOpenPreviewToolbar && (
              <button
                type="button"
                onClick={onOpenPreviewToolbar}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xs text-[11px] sm:text-[12px] font-mono border transition-colors cursor-pointer ${
                  isPreviewToolbarOpen
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white'
                }`}
                title="AI Studio プレビュー検証ツールバー"
              >
                <Sliders className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">検証コントローラー</span>
                <span className="sm:hidden">検証</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] sm:text-[12px] font-mono border border-zinc-800 flex items-center gap-1 transition-colors cursor-pointer"
              title="記事リンクをコピー"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden md:inline">{copied ? 'コピー完了' : '本文共有'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] sm:text-[12px] font-mono border border-zinc-800 flex items-center gap-1 transition-colors cursor-pointer"
              title="共有"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden md:inline">共有</span>
            </button>

            {onResetArticle && (
              <button
                type="button"
                onClick={onResetArticle}
                className="p-1.5 sm:px-2 sm:py-1 rounded-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] font-mono border border-zinc-800 flex items-center transition-colors cursor-pointer"
                title="記事リセット"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* INNER ENCYCLOPEDIA READING SURFACE CONTAINER */}
      <main className="flex-1 w-full bg-[#f8f9fa] shadow-2xl relative">
        {children}
      </main>

      {/* SURVIVAL WIKI BOTTOM MOBILE HUD & QUICK NAVIGATION */}
      <div
        id="survival-wiki-floating-nav"
        className="fixed bottom-4 right-4 z-40 flex flex-col gap-1.5 select-none"
      >
        <button
          type="button"
          onClick={scrollToTop}
          className="p-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 shadow-lg backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
          aria-label="ページ最上部へ移動"
          title="最上部へ"
        >
          <ArrowUp className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={scrollToBottom}
          className="p-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 shadow-lg backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
          aria-label="ページ最下部へ移動"
          title="最下部へ"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      </div>

      {/* SURVIVAL WIKI SYSTEM STATUS FOOTER */}
      <footer className="bg-zinc-950 border-t border-zinc-800 py-3 px-4 text-center text-[11px] font-mono text-zinc-500">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SURVIVAL WIKI // FOLKLORIST HERNAN ENCYCLOPEDIA ARCHIVE SYSTEM</span>
          <span className="text-zinc-600">ENCODING: UTF-8 • ACADEMIC RECORD ENGINE v3.4</span>
        </div>
      </footer>
    </div>
  );
};
