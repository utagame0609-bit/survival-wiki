import { BookOpen, ScrollText } from 'lucide-react';
import { playHoverSound, playTabSwitchSound } from '@/lib/sound';

type Tab = 'records' | 'wiki';

type WorldTabsProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const tabs: { id: Tab; label: string; icon: typeof ScrollText }[] = [
  { id: 'records', label: '冒険の記録 (TIMELINE)', icon: BookOpen },
  { id: 'wiki', label: '旅の書 (AI WIKI CHRONICLE)', icon: ScrollText },
];

export function WorldTabs({ activeTab, onTabChange }: WorldTabsProps) {
  const handleTabChange = (nextTab: Tab) => {
    if (nextTab === activeTab) return;
    playTabSwitchSound();
    onTabChange(nextTab);
  };

  return (
    <div className="sfc-world-tabs hidden md:flex items-center gap-2 mb-6 border-b border-[#1E293B] pb-3">
      {tabs.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleTabChange(item.id)}
            onMouseEnter={playHoverSound}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs game-ui-font tracking-wider transition-all cursor-pointer ${
              isActive && item.id === 'wiki'
                ? 'bg-[#0E2A3A] text-[#06B6D4] border border-[#06B6D4]/60 shadow-[0_0_12px_rgba(6,182,212,0.2)] font-bold'
                : isActive
                  ? 'bg-[#161F30] text-[#F59E0B] border border-[#F59E0B]/60 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-bold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#161F30]/50 border border-transparent'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${item.id === 'wiki' ? 'text-[#06B6D4]' : 'text-[#F59E0B]'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
