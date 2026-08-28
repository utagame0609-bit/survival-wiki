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
    <div className="grid grid-cols-3 border-b-2 border-[#2d3548] mb-5 gap-1.5 sm:gap-2">
      {tabs.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const count = item.id === 'locations'
          ? <span className="text-[10px] sm:text-xs px-1.5 py-0.2 bg-[#12151f] border border-emerald-500/50 text-emerald-400 font-mono font-bold">—</span>
          : null;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleTabChange(item.id)}
            onMouseEnter={playHoverSound}
            className={`min-h-[48px] sm:min-h-[44px] px-2 sm:px-6 py-2.5 text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all border-b-[3px] -mb-[2px] cursor-pointer ${
              isActive
                ? 'border-amber-500 bg-[#1e2330] text-amber-400 shadow-[0_2px_12px_rgba(245,158,11,0.2)]'
                : 'border-transparent bg-[#141824] text-slate-300 hover:text-white hover:bg-[#181d2c]'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="tracking-wide whitespace-nowrap">{item.label}</span>
            {count}
          </button>
        );
      })}
    </div>
  );
}
