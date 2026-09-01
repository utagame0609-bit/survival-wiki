import { BookOpen, ChevronLeft, Home, ScrollText, Settings, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isBgmEnabled, setBgmEnabled, subscribeBgmEnabled } from '@/lib/bgm';
import { isSoundEnabled, playCancelSound, playHoverSound, playTabSwitchSound, toggleSound } from '@/lib/sound';

type Tab = 'records' | 'wiki';

type MobileBottomHudProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onBack: () => void;
};

export function MobileBottomHud({ activeTab, onTabChange, onBack }: MobileBottomHudProps) {
  const [audioEnabled, setAudioEnabled] = useState(() => isBgmEnabled() && isSoundEnabled());

  useEffect(() => subscribeBgmEnabled((bgmEnabled) => {
    setAudioEnabled(bgmEnabled && isSoundEnabled());
  }), []);

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

  const handleAudioToggle = () => {
    const next = !(isBgmEnabled() && isSoundEnabled());
    toggleSound(next);
    setBgmEnabled(next);
    setAudioEnabled(next);
  };

  const itemClass = 'flex h-10 min-w-0 flex-1 flex-col items-center justify-center rounded px-0.5 text-[#94A3B8] active:bg-[#1E293B]';

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1018]/95 backdrop-blur-lg border-t border-[#1E293B] pb-[env(safe-area-inset-bottom,2px)] pt-0.5 px-1.5 select-none shadow-[0_-4px_16px_rgba(0,0,0,0.6)]"
      aria-label="モバイル下部HUDナビゲーション"
    >
      <div className="mx-auto flex h-12 w-full max-w-md items-center gap-0.5">
        <button
          type="button"
          onClick={() => {
            playCancelSound();
            onBack();
          }}
          className={`${itemClass} active:text-[#F59E0B]`}
        >
          <ChevronLeft className="h-4 w-4 text-[#F59E0B]" />
          <span className="game-ui-font whitespace-nowrap text-[8px]">戻る</span>
        </button>

        <button type="button" onClick={handleAudioToggle} className={`${itemClass} active:text-[#06B6D4]`}>
          {audioEnabled ? <Volume2 className="h-4 w-4 text-[#06B6D4]" /> : <VolumeX className="h-4 w-4 text-[#64748B]" />}
          <span className="game-ui-font whitespace-nowrap text-[8px]">SOUND {audioEnabled ? 'ON' : 'OFF'}</span>
        </button>

        <button type="button" onClick={handleSettings} className={`${itemClass} active:text-[#F8FAFC]`}>
          <Settings className="h-4 w-4" />
          <span className="game-ui-font whitespace-nowrap text-[8px]">設定</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('records')}
          className={`${itemClass} ${activeTab === 'records' ? 'border border-[#F59E0B]/50 bg-[#1E293B] font-bold text-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.2)]' : ''}`}
        >
          <BookOpen className="h-4 w-4" />
          <span className="game-ui-font whitespace-nowrap text-[8px]">記録</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('wiki')}
          className={`${itemClass} ${activeTab === 'wiki' ? 'border border-[#06B6D4]/50 bg-[#0E2A3A] font-bold text-[#06B6D4] shadow-[0_0_8px_rgba(6,182,212,0.2)]' : ''}`}
        >
          <ScrollText className="h-4 w-4" />
          <span className="game-ui-font whitespace-nowrap text-[8px]">WIKI</span>
        </button>

        <button type="button" onClick={handleHome} className={`${itemClass} active:text-[#F59E0B]`}>
          <Home className="h-4 w-4 text-[#F59E0B]" />
          <span className="game-ui-font whitespace-nowrap text-[8px]">ホーム</span>
        </button>
      </div>
    </nav>
  );
}
