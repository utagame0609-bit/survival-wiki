import { BookOpen, ScrollText } from 'lucide-react';
import { playHoverSound, playTabSwitchSound } from '@/lib/sound';

type Tab = 'records' | 'wiki';

type WorldTabsProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const tabs: { id: Tab; label: string; icon: typeof ScrollText }[] = [
  { id: 'records', label: '冒険の記録', icon: ScrollText },
  { id: 'wiki', label: '旅の書 (Wiki)', icon: BookOpen },
];

export function WorldTabs({ activeTab, onTabChange }: WorldTabsProps) {
  const handleTabChange = (nextTab: Tab) => {
    if (nextTab === activeTab) return;
    playTabSwitchSound();
    onTabChange(nextTab);
  };

  return (
    <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-5 bg-[#0f1424] p-1.5 border-2 border-slate-700/80 rounded-xs shadow-inner">
      {tabs.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleTabChange(item.id)}
            onMouseEnter={playHoverSound}
            className={`min-h-[44px] px-3 sm:px-4 font-mono text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer rounded-xs border-2 ${
              isActive
                ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-black shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'border-slate-800 bg-[#121828] text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
