import { useEffect, useState } from 'react';
import { ChevronLeft, Compass, Home, Settings, Volume2, VolumeX } from 'lucide-react';
import { isBgmEnabled, setBgmEnabled, subscribeBgmEnabled } from '@/lib/bgm';
import { isSoundEnabled, playCancelSound, playHoverSound, toggleSound } from '@/lib/sound';

export function AppHeader({
  title,
  onBack,
  hideMobileActions = false,
}: {
  title: string;
  onBack?: () => void;
  hideMobileActions?: boolean;
}) {
  const [audioEnabled, setAudioEnabled] = useState(() => isBgmEnabled() && isSoundEnabled());

  useEffect(() => subscribeBgmEnabled((bgmEnabled) => {
    setAudioEnabled(bgmEnabled && isSoundEnabled());
  }), []);

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

  const displayTitle = title.replace(/^UTAPEDIA \/\/\s*/, '');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E293B] bg-[#0B1018]/95 backdrop-blur-md select-none">
      <div className="mx-auto flex h-[52px] sm:h-14 w-full max-w-6xl items-center justify-between px-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {onBack && (
            <button
              type="button"
              onClick={() => {
                playCancelSound();
                onBack();
              }}
              onMouseEnter={playHoverSound}
              className="flex items-center gap-1 rounded border border-[#334155]/60 px-2 py-1.5 font-mono text-xs text-[#94A3B8] transition-colors hover:border-[#F59E0B]/50 hover:bg-[#1E293B]/70 hover:text-[#F59E0B] active:scale-95 cursor-pointer"
              aria-label="戻る"
              title="戻る"
            >
              <ChevronLeft className="h-4 w-4 text-[#F59E0B]" />
              <span className="hidden sm:inline">BACK</span>
            </button>
          )}

          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#06B6D4]/40 bg-[#161F30]">
              <Compass className="h-3.5 w-3.5 text-[#06B6D4]" />
            </div>
            <div className="min-w-0">
              <div className="hidden sm:block truncate font-mono text-[10px] leading-none tracking-wider text-[#06B6D4]">
                UTAPEDIA // SURVIVAL WIKI
              </div>
              <h1 className="truncate text-xs sm:text-sm font-black tracking-wide text-[#F1F5F9]">
                {displayTitle}
              </h1>
            </div>
          </div>
        </div>

        <div className={`${hideMobileActions ? 'hidden md:flex' : 'flex'} shrink-0 items-center gap-1.5 sm:gap-2`}>
          <button
            type="button"
            onClick={handleAudioToggle}
            onMouseEnter={playHoverSound}
            aria-label="サウンド切替"
            title={audioEnabled ? 'サウンドON (クリックで全音ミュート)' : 'ミュート中 (クリックで全音ON)'}
            className={`flex items-center gap-1 rounded border p-2 font-mono text-xs transition-colors active:scale-95 cursor-pointer ${
              audioEnabled
                ? 'border-[#06B6D4]/50 bg-[#0E2030] text-[#06B6D4] shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                : 'border-[#334155]/40 bg-[#0F172A] text-[#64748B] hover:border-[#64748B]'
            }`}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden md:inline text-[11px]">{audioEnabled ? 'SOUND' : 'MUTE'}</span>
          </button>

          <button
            type="button"
            onClick={handleSettings}
            onMouseEnter={playHoverSound}
            aria-label="設定"
            title="システム設定"
            className="flex items-center gap-1 rounded border border-[#334155]/60 bg-[#161F30] p-2 font-mono text-xs text-[#94A3B8] transition-colors hover:border-[#F59E0B]/50 hover:bg-[#1E293B] hover:text-[#F8FAFC] active:scale-95 cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline text-[11px]">CONFIG</span>
          </button>

          {onBack && (
            <button
              type="button"
              onClick={handleHome}
              onMouseEnter={playHoverSound}
              aria-label="ホームへ"
              title="冒険の書一覧へ戻る"
              className="flex items-center gap-1 rounded border border-[#334155]/60 bg-[#161F30] p-2 font-mono text-xs text-[#94A3B8] transition-colors hover:border-[#F59E0B]/50 hover:bg-[#1E293B] hover:text-[#F59E0B] active:scale-95 cursor-pointer"
            >
              <Home className="h-4 w-4 text-[#F59E0B]" />
              <span className="hidden md:inline text-[11px]">SLOTS</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
