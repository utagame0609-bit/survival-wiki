import React from 'react';
import { BookOpen, Scroll, Compass, Sparkles } from 'lucide-react';
import { Tab } from '../../types';

interface WorldTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  recordsCount: number;
}

export const WorldTabs: React.FC<WorldTabsProps> = ({
  activeTab,
  onTabChange,
  recordsCount,
}) => {
  return (
    <div className="hidden sm:flex items-center justify-between border-b-2 border-[var(--border-main)] pb-0 pt-2">
      {/* 2 Primary Tabs: Records & Wiki */}
      <div className="flex items-center gap-2">
        {/* Records Tab (Y Button Color: Yellow) */}
        <button
          type="button"
          onClick={() => onTabChange('records')}
          className={`px-5 py-2.5 rounded-t-lg font-dot text-sm font-bold flex items-center gap-2 transition-all border-t-2 border-x-2 ${
            activeTab === 'records'
              ? 'bg-[var(--surface-1)] border-[var(--border-main)] text-[var(--text-main)] shadow-[0_-2px_4px_rgba(0,0,0,0.1)] -mb-[2px] pb-3 z-10'
              : 'bg-[var(--surface-2)] border-transparent text-[var(--text-muted)] hover:bg-[var(--surface-1)]/70'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-[var(--accent-yellow)] text-black text-[10px] flex items-center justify-center font-bold border border-black/30">
            Y
          </span>
          <BookOpen className="w-4 h-4 text-[var(--accent-yellow)]" />
          <span>冒険の記録 (TIMELINE)</span>
          <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-[var(--surface-recessed)] text-[var(--text-main)] border border-[var(--border-main)]">
            {recordsCount}
          </span>
        </button>

        {/* Wiki Tab (X Button Color: Blue) */}
        <button
          type="button"
          onClick={() => onTabChange('wiki')}
          className={`px-5 py-2.5 rounded-t-lg font-dot text-sm font-bold flex items-center gap-2 transition-all border-t-2 border-x-2 ${
            activeTab === 'wiki'
              ? 'bg-[var(--surface-1)] border-[var(--border-main)] text-[var(--text-main)] shadow-[0_-2px_4px_rgba(0,0,0,0.1)] -mb-[2px] pb-3 z-10'
              : 'bg-[var(--surface-2)] border-transparent text-[var(--text-muted)] hover:bg-[var(--surface-1)]/70'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-[var(--accent-blue)] text-white text-[10px] flex items-center justify-center font-bold border border-black/30">
            X
          </span>
          <Scroll className="w-4 h-4 text-[var(--accent-blue)]" />
          <span>旅の書 (AI WIKI CHRONICLE)</span>
          <span className="flex items-center gap-1 text-[9px] bg-[var(--accent-blue)] text-white px-1.5 py-0.5 rounded font-bold">
            <Sparkles className="w-2.5 h-2.5" />
            AI COMPILER
          </span>
        </button>
      </div>

      {/* Retro Status info */}
      <div className="flex items-center gap-2 text-xs font-dot text-[var(--text-muted)] pr-2 pb-2">
        <span className="w-2 h-2 rounded-full sfc-led-green" />
        <span>16-BIT RETRO BUS ACTIVE</span>
      </div>
    </div>
  );
};
