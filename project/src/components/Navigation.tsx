import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, Compass, Home, Settings, Volume2, VolumeX } from 'lucide-react';
import { playCancelSound, playHoverSound, isSoundEnabled, toggleSound } from '../lib/sound';

type Screen =
  | { name: 'top' }
  | { name: 'worldList'; gameId: string; gameName: string }
  | { name: 'world'; worldId: string; worldName: string };

export type NavigateFn = (screen: Screen) => void;

export function useBackButton(onBack: () => void) {
  useEffect(() => {
    const handler = (e: PopStateEvent) => {
      e.preventDefault();
      playCancelSound();
      onBack();
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [onBack]);
}

export function Header({
  title,
  onBack,
  hideMobileActions = false,
}: {
  title: string;
  onBack?: () => void;
  hideMobileActions?: boolean;
}) {
  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled());

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
            onClick={handleSoundToggle}
            onMouseEnter={playHoverSound}
            aria-label="サウンド切替"
            title={soundEnabled ? 'サウンドON (クリックでミュート)' : 'ミュート中 (クリックでサウンドON)'}
            className={`flex items-center gap-1 rounded border p-2 font-mono text-xs transition-colors active:scale-95 cursor-pointer ${
              soundEnabled
                ? 'border-[#06B6D4]/50 bg-[#0E2030] text-[#06B6D4] shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                : 'border-[#334155]/40 bg-[#0F172A] text-[#64748B] hover:border-[#64748B]'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden md:inline text-[11px]">{soundEnabled ? 'SOUND' : 'MUTE'}</span>
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

export function useScreenHistory() {
  const [screen, setScreenState] = useState<Screen>({ name: 'top' });
  const [history, setHistory] = useState<Screen[]>([]);

  const setScreen = (s: Screen) => {
    setScreenState((prev) => {
      setHistory((h) => [...h, prev]);
      return s;
    });
    window.history.pushState({}, '');
  };

  const setStartupWorld = useCallback(
    (world: Screen & { name: 'world' }, game: { gameId: string; gameName: string }) => {
      setScreenState(world);
      setHistory([
        { name: 'top' },
        { name: 'worldList', gameId: game.gameId, gameName: game.gameName },
      ]);
      window.history.replaceState({}, '');
    },
    [],
  );

  const goBack = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setScreenState(prev);
      return h.slice(0, -1);
    });
  };

  useEffect(() => {
    const handler = () => {
      setScreenState({ name: 'top' });
      setHistory([]);
    };
    window.addEventListener('survival-wiki:home', handler);
    return () => window.removeEventListener('survival-wiki:home', handler);
  }, []);

  useBackButton(goBack);

  return { screen, setScreen, setStartupWorld, goBack };
}
