import { BookOpen, Clock3, MapPin } from 'lucide-react';
import { playHoverSound, playTabSwitchSound } from '@/lib/sound';

type Tab = 'locations' | 'timeline' | 'wiki';

type WorldTabsProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const tabs: { id: Tab; label: string; icon: typeof MapPin }[] = [
  { id: 'locations', label: 'ロケーション', icon: MapPin },
  { id: 'timeline', label: 'タイムライン', icon: Clock3 },
  { id: 'wiki', label: '旅の書 (Wiki)', icon: BookOpen },
];

export function WorldTabs({ activeTab, onTabChange }: WorldTabsProps) {
  const handleTabChange = (nextTab: Tab) => {
    if (nextTab === activeTab) return;
    playTabSwitchSound();
    onTabChange(nextTab);
  };

  return (
    <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-5 bg-[#0f1424] p-1.5 border-2 border-slate-700/80 rounded-xs shadow-inner">
      {tabs.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const count = item.id === 'locations' ? (
          <span className="text-[10px] sm:text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded-xs">
            —
          </span>
        ) : null;

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
            {count}
          </button>
        );
      })}
    </div>
  );
}
