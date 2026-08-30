import { BookOpen, ChevronLeft, Home, ScrollText, Settings, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { isSoundEnabled, playCancelSound, playHoverSound, playTabSwitchSound, toggleSound } from '@/lib/sound';

type Tab = 'records' | 'wiki';

type MobileBottomHudProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onBack: () => void;
};

export function MobileBottomHud({ activeTab, onTabChange, onBack }: MobileBottomHudProps) {
  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled());

  const handleTabChange = (nextTab: Tab) => {
    if (nextTab === activeTab) return;
    playTabSwitchSound();
    onTabChange(nextTab);
  };

  const handleHome = () => {
    playCancelSound();
    window.dispatchEvent(new CustomEvent('survival-wiki:home'));
  };

  const handleSettings = () => {
    playHoverSound();
    window.dispatchEvent(new CustomEvent('survival-wiki:settings'));
  };

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundEnabled(next);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1018]/95 backdrop-blur-lg border-t border-[#1E293B] pb-[env(safe-area-inset-bottom,2px)] pt-0.5 px-2 select-none shadow-[0_-4px_16px_rgba(0,0,0,0.6)]"
      aria-label="モバイル下部HUDナビゲーション"
    >
      <div className="flex h-12 max-w-md mx-auto items-center justify-around">
        <button
          type="button"
          onClick={() => {
            playCancelSound();
            onBack();
          }}
          className="flex min-w-[40px] h-10 flex-col items-center justify-center rounded text-[#94A3B8] active:text-[#F59E0B] active:bg-[#1E293B]"
        >
          <ChevronLeft className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-[9px] game-ui-font whitespace-nowrap">戻る</span>
        </button>

        <div className="flex items-center rounded-lg border border-[#1E293B] bg-[#101827] p-0.5">
          <button
            type="button"
            onClick={() => handleTabChange('records')}
            className={`flex items-center gap-1 rounded px-2.5 py-1.5 text-xs game-ui-font transition-all whitespace-nowrap ${
              activeTab === 'records'
                ? 'bg-[#1E293B] text-[#F59E0B] border border-[#F59E0B]/50 shadow-[0_0_8px_rgba(245,158,11,0.25)] font-bold'
                : 'text-[#94A3B8]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>記録</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('wiki')}
            className={`flex items-center gap-1 rounded px-2.5 py-1.5 text-xs game-ui-font transition-all whitespace-nowrap ${
              activeTab === 'wiki'
                ? 'bg-[#0E2A3A] text-[#06B6D4] border border-[#06B6D4]/50 shadow-[0_0_8px_rgba(6,182,212,0.25)] font-bold'
                : 'text-[#94A3B8]'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5 shrink-0" />
            <span>Wiki</span>
          </button>
        </div>

        <button type="button" onClick={handleHome} className="flex min-w-[40px] h-10 flex-col items-center justify-center rounded text-[#94A3B8] active:text-[#F59E0B] active:bg-[#1E293B]">
          <Home className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-[9px] game-ui-font whitespace-nowrap">スロット</span>
        </button>

        <button type="button" onClick={handleSoundToggle} className="flex min-w-[38px] h-10 flex-col items-center justify-center rounded text-[#94A3B8] active:text-[#06B6D4] active:bg-[#1E293B]">
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#06B6D4]" /> : <VolumeX className="w-4 h-4 text-[#64748B]" />}
          <span className="text-[9px] font-mono tracking-tighter whitespace-nowrap">{soundEnabled ? 'ON' : 'OFF'}</span>
        </button>

        <button type="button" onClick={handleSettings} className="flex min-w-[38px] h-10 flex-col items-center justify-center rounded text-[#94A3B8] active:text-[#F8FAFC] active:bg-[#1E293B]">
          <Settings className="w-4 h-4" />
          <span className="text-[9px] font-mono tracking-tighter whitespace-nowrap">設定</span>
        </button>
      </div>
    </nav>
  );
}
