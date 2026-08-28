import React from 'react';
import { MapPin, Plus, BookOpen, Clock } from 'lucide-react';
import { playConfirmSound, playHoverSound, playAddSound } from '../lib/soundEngine';

export type TabType = 'records' | 'wiki';

interface WorldTabsProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenCreateRecord: () => void;
  recordCount: number;
}

export function WorldTabs({
  activeTab,
  onChangeTab,
  onOpenCreateRecord,
  recordCount,
}: WorldTabsProps) {
  const handleTabClick = (tab: TabType) => {
    if (tab !== activeTab) {
      playConfirmSound();
      onChangeTab(tab);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-5 bg-[#0f1424] p-1.5 border-2 border-slate-700/80 rounded-xs shadow-inner">
      {/* 1. 拠点・記録 (タイムライン) */}
      <button
        type="button"
        onClick={() => handleTabClick('records')}
        onMouseEnter={playHoverSound}
        className={`min-h-[44px] px-3 sm:px-4 font-mono text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer rounded-xs border-2 ${
          activeTab === 'records'
            ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-black shadow-[0_0_10px_rgba(245,158,11,0.2)]'
            : 'border-slate-800 bg-[#121828] text-slate-400 hover:text-slate-200 hover:border-slate-700'
        }`}
      >
        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="truncate">拠点・タイムライン</span>
        <span className="text-[10px] sm:text-xs font-mono font-bold bg-amber-500/30 text-amber-300 px-1.5 py-0.2 rounded-xs shrink-0">
          {recordCount}
        </span>
      </button>

      {/* 2. 冒険譚 Wiki */}
      <button
        type="button"
        onClick={() => handleTabClick('wiki')}
        onMouseEnter={playHoverSound}
        className={`min-h-[44px] px-3 sm:px-4 font-mono text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer rounded-xs border-2 ${
          activeTab === 'wiki'
            ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-black shadow-[0_0_10px_rgba(6,182,212,0.2)]'
            : 'border-slate-800 bg-[#121828] text-slate-400 hover:text-slate-200 hover:border-slate-700'
        }`}
      >
        <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="truncate">冒険譚 Wiki</span>
      </button>
    </div>
  );
}
