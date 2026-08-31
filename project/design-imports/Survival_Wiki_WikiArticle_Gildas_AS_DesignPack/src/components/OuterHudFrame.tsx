import React from 'react';
import { Sparkles, Feather, Shield, Radio, Volume2, Share2, Copy, Bookmark, ChevronUp, ChevronDown } from 'lucide-react';

interface OuterHudFrameProps {
  children: React.ReactNode;
  onScrollToTop?: () => void;
  onScrollToBottom?: () => void;
}

export const OuterHudFrame: React.FC<OuterHudFrameProps> = ({
  children,
  onScrollToTop,
  onScrollToBottom,
}) => {
  return (
    <div id="survival-wiki-hud-root" className="min-h-screen flex flex-col bg-[#070a0f] text-slate-200">
      {/* Outer HUD Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0c1017]/95 border-b border-amber-900/40 backdrop-blur px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-lg">
        {/* App Title & System Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 shadow-inner">
            <Radio className="w-4 h-4 animate-pulse text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs tracking-wider text-amber-400 font-bold">
                SURVIVAL WIKI
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-amber-900/40 text-amber-300/80 border border-amber-700/30">
                v2.4-STABLE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              EXPLORATION LOG COMPILER // SECTOR-7
            </p>
          </div>
        </div>

        {/* 3 Chroniclers Switcher HUD */}
        <div className="flex items-center gap-1 sm:gap-2 bg-[#080c12] p-1 rounded-lg border border-slate-800">
          <div
            title="百科事典／民俗学者エルナン (閲覧のみ)"
            className="flex items-center gap-1 px-2 py-1 rounded text-slate-500 text-xs font-mono opacity-50 cursor-not-allowed select-none"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden md:inline">エルナン</span>
          </div>
          <div
            title="SCP調／特異点研究員Dr.アーク (閲覧のみ)"
            className="flex items-center gap-1 px-2 py-1 rounded text-slate-500 text-xs font-mono opacity-50 cursor-not-allowed select-none"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Dr.アーク</span>
          </div>
          <div
            title="古代伝承／老吟遊詩人ギルダス (現在選択中・検証対象)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-900/50 border border-amber-500/50 text-amber-300 text-xs font-mono font-medium shadow-sm"
          >
            <Feather className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>ギルダス</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </div>
        </div>

        {/* Global HUD Utilities */}
        <div className="flex items-center gap-2">
          <button
            title="BGM Toggle (HUD Mock)"
            className="p-1.5 rounded bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-amber-300 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            title="Share (HUD Mock)"
            className="p-1.5 rounded bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-amber-300 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Inner Gildas Reading Region */}
      <main className="flex-1 w-full flex flex-col relative overflow-x-hidden">
        {children}
      </main>

      {/* Scroll to Top / Bottom Floating Assist */}
      <div className="fixed right-4 bottom-16 sm:bottom-6 z-30 flex flex-col gap-1.5">
        {onScrollToTop && (
          <button
            id="btn-scroll-top"
            onClick={onScrollToTop}
            title="先頭へ戻る"
            aria-label="先頭へ戻る"
            className="p-2 rounded-full bg-[#101722]/90 border border-amber-500/40 text-amber-300 hover:bg-amber-600 hover:text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 active:scale-95"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        )}
        {onScrollToBottom && (
          <button
            id="btn-scroll-bottom"
            onClick={onScrollToBottom}
            title="末尾（詠唱・コメント）へ"
            aria-label="末尾（詠唱・コメント）へ"
            className="p-2 rounded-full bg-[#101722]/90 border border-amber-500/40 text-amber-300 hover:bg-amber-600 hover:text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 active:scale-95"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Outer HUD Mobile Bottom Bar Mockup */}
      <nav className="sm:hidden sticky bottom-0 z-30 bg-[#090d14]/95 border-t border-amber-900/30 px-4 py-2 flex items-center justify-around text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1 text-amber-400 font-medium">
          <Feather className="w-3.5 h-3.5" /> 伝承録
        </span>
        <span className="flex items-center gap-1 hover:text-slate-200">
          <Bookmark className="w-3.5 h-3.5" /> 保存済み
        </span>
        <span className="flex items-center gap-1 hover:text-slate-200">
          <Copy className="w-3.5 h-3.5" /> 複製
        </span>
      </nav>
    </div>
  );
};
