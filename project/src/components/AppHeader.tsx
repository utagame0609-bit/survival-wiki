import { useEffect, useState } from 'react';
import { ChevronLeft, Compass, Home, Settings, Volume2, VolumeX } from 'lucide-react';
import { isBgmEnabled, setBgmEnabled, subscribeBgmEnabled } from '@/lib/bgm';
import { isSoundEnabled, playCancelSound, playHoverSound, toggleSound } from '@/lib/sound';
import { getAppTheme, subscribeAppTheme, type AppTheme } from '@/lib/theme';

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
  const [theme, setTheme] = useState<AppTheme>(() => getAppTheme());

  useEffect(() => subscribeBgmEnabled((bgmEnabled) => {
    setAudioEnabled(bgmEnabled && isSoundEnabled());
  }), []);

  useEffect(() => subscribeAppTheme(setTheme), []);

  const handleHome = () => {
    playCancelSound();
    window.dispatchEvent(new CustomEvent('survival-wiki:home'));
  };

  const handleSettings = () => {
    window.dispatchEvent(new CustomEvent('survival-wiki:settings'));
  };

  const handleAudioToggle = () => {
    const next = !(isBgmEnabled() && isSoundEnabled());
    toggleSound(next);
    setBgmEnabled(next);
    setAudioEnabled(next);
  };

  const displayTitle = title.replace(/^UTAPEDIA \/\/\s*/, '');

  if (theme === 'sfc') {
    return (
      <header className="sticky top-0 z-40 border-b-2 border-[var(--border-main)] bg-[var(--surface-1)] px-3 shadow-[0_3px_6px_rgba(0,0,0,0.15)] transition-colors duration-200 sm:px-6">
        <div className="mx-auto flex h-[52px] w-full max-w-6xl items-center justify-between gap-2 sm:h-14">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 rounded border border-[var(--border-main)] bg-[var(--surface-recessed)] px-2 py-1 shadow-inner">
              <span className="sfc-led-red h-2.5 w-2.5 rounded-full" />
              <span className="hidden font-dot text-[10px] font-bold tracking-wider text-[var(--text-muted)] sm:inline">POWER</span>
            </div>

            <div className="flex items-center gap-1.5">
              {onBack && (
                <button
                  type="button"
                  onClick={() => {
                    playCancelSound();
                    onBack();
                  }}
                  onMouseEnter={playHoverSound}
                  className="sfc-btn sfc-btn-convex sfc-btn-neutral flex items-center gap-1 px-2.5 py-1.5 font-dot text-xs hover:bg-white"
                  title="前の画面に戻る (BACK)"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">BACK</span>
                </button>
              )}

              {onBack && (
                <button
                  type="button"
                  onClick={handleHome}
                  onMouseEnter={playHoverSound}
                  className="sfc-btn sfc-btn-convex sfc-btn-neutral flex items-center gap-1 px-2.5 py-1.5 font-dot text-xs hover:bg-white"
                  title="冒険の書一覧に戻る (SLOTS / HOME)"
                >
                  <Home className="h-3.5 w-3.5 text-[var(--accent-blue)]" />
                  <span className="hidden sm:inline">SLOTS</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5">
              <div className="inline-block h-3 w-3 rounded-full border border-black bg-[var(--accent-blue)] shadow-sm" />
              <div className="inline-block h-3 w-3 rounded-full border border-black bg-[var(--accent-yellow)] shadow-sm" />
              <div className="inline-block h-3 w-3 rounded-full border border-black bg-[var(--accent-green)] shadow-sm" />
              <div className="inline-block h-3 w-3 rounded-full border border-black bg-[var(--accent-red)] shadow-sm" />
              <h1 className="ml-1 font-sfc-title text-sm font-bold tracking-wider text-[var(--text-main)] sm:text-base md:text-lg">
                SURVIVAL WIKI
              </h1>
            </div>
            <span className="hidden font-dot text-[9px] uppercase tracking-widest text-[var(--text-muted)] sm:inline sm:text-[10px]">
              16-BIT RETRO CONSOLE EDITION
            </span>
          </div>

          <div className={`${hideMobileActions ? 'hidden md:flex' : 'flex'} items-center gap-1.5 sm:gap-2`}>
            <button
              type="button"
              onClick={handleAudioToggle}
              onMouseEnter={playHoverSound}
              className={`sfc-btn sfc-btn-convex flex items-center gap-1 px-2.5 py-1.5 font-dot text-xs ${
                audioEnabled ? 'sfc-btn-b text-white' : 'sfc-btn-neutral text-[var(--text-muted)]'
              }`}
              title={audioEnabled ? 'サウンドON' : 'サウンドOFF'}
            >
              {audioEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span className="hidden lg:inline">{audioEnabled ? 'SOUND' : 'MUTE'}</span>
            </button>

            <button
              type="button"
              onClick={handleSettings}
              onMouseEnter={playHoverSound}
              className="sfc-btn sfc-btn-convex sfc-btn-neutral flex items-center gap-1 px-2.5 py-1.5 font-dot text-xs hover:bg-white"
              title="システム設定 (CONFIG)"
            >
              <Settings className="h-3.5 w-3.5 text-[var(--text-main)]" />
              <span className="hidden sm:inline">CONFIG</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

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
