import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, Gamepad2, Home, Sliders, Volume2, VolumeX } from 'lucide-react';
import { playCancelSound, playHoverSound, isSoundEnabled, toggleSound } from '../lib/sound';

type Screen =
  | { name: 'top' }
  | { name: 'worldList'; gameId: string; gameName: string }
  | { name: 'worldCreate'; gameId: string; gameName: string; worldId?: string }
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
}: {
  title: string;
  onBack?: () => void;
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

  return (
    <header className="sticky top-0 z-40 border-b-2 border-amber-500/70 bg-[#0e1629]/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.65)]">
      <div className="mx-auto flex min-h-[52px] sm:min-h-[58px] w-full max-w-5xl items-center justify-between gap-2 px-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={() => {
                playCancelSound();
                onBack();
              }}
              onMouseEnter={playHoverSound}
              className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center gap-1.5 border-2 border-amber-500/80 bg-[#0a101d] px-2.5 sm:min-w-0 sm:px-3 py-1.5 font-mono text-xs font-black text-amber-300 transition-all hover:border-amber-400 hover:bg-amber-500/20 active:scale-95 cursor-pointer"
              aria-label="戻る"
              title="戻る"
            >
              <ChevronLeft className="h-4 w-4 stroke-[3]" />
              <span className="hidden sm:inline">戻る</span>
            </button>
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
              <Gamepad2 className="h-4 w-4" />
            </div>
          )}

          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)] sm:h-9 sm:w-9">
              <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xs font-black tracking-wide text-white sm:text-sm">
                <span className="hidden sm:inline text-amber-400 font-mono">UTAPEDIA // </span>
                {title.replace(/^UTAPEDIA \/\/\s*/, '')}
              </h1>
              <p className="hidden truncate font-mono text-[9px] font-bold text-emerald-400/90 sm:block">ADVENTURE LOG SYSTEM // NOMINAL</p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleSoundToggle}
            onMouseEnter={playHoverSound}
            aria-label="サウンド切替"
            title={soundEnabled ? 'サウンドON (クリックでミュート)' : 'ミュート中 (クリックでサウンドON)'}
            className={`flex min-h-[40px] min-w-[40px] sm:min-h-[42px] sm:min-w-[42px] items-center justify-center border-2 px-2 font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer ${soundEnabled ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-400 hover:border-emerald-400' : 'border-slate-700 bg-[#121622] text-slate-500 hover:text-slate-300'}`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={handleSettings}
            onMouseEnter={playHoverSound}
            aria-label="設定"
            title="システム設定"
            className="flex min-h-[40px] min-w-[40px] sm:min-h-[42px] sm:min-w-[42px] items-center justify-center border-2 border-slate-700 bg-[#121622] px-2 text-slate-300 hover:border-amber-400 hover:text-amber-300 active:scale-95 cursor-pointer"
          >
            <Sliders className="h-4 w-4" />
          </button>

          {onBack && (
            <button
              type="button"
              onClick={handleHome}
              onMouseEnter={playHoverSound}
              aria-label="ホームへ"
              title="冒険の書一覧へ戻る"
              className="flex min-h-[40px] shrink-0 items-center gap-1.5 border-2 border-amber-500/80 bg-[#121622] px-2.5 py-2 font-mono text-xs font-black text-amber-300 transition-all hover:border-amber-400 hover:bg-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Home className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">HOME</span>
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
