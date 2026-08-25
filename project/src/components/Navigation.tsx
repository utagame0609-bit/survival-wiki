import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, Home, Shield } from 'lucide-react';
import { playCancelSound } from '../lib/sound';

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
  const handleHome = () => {
    playCancelSound();
    window.dispatchEvent(new CustomEvent('survival-wiki:home'));
  };

  return (
    <header className="sticky top-0 z-30 border-b-2 border-[#263244] bg-[#06090e]/95 backdrop-blur-md shadow-[0_4px_18px_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex min-h-14 max-w-4xl items-center gap-2 px-3 py-2 sm:px-4">
        {onBack && (
          <button
            onClick={() => {
              playCancelSound();
              onBack();
            }}
            className="group flex shrink-0 items-center gap-1.5 border border-slate-700 bg-slate-900 px-2.5 py-2 font-mono text-xs font-bold text-slate-300 transition-all hover:border-amber-500 hover:text-amber-400 active:scale-[0.98]"
          >
            <ChevronLeft className="h-4 w-4 text-amber-500 transition-colors group-hover:text-amber-400" />
            <span className="hidden sm:inline">WORLD SELECT</span>
            <span className="sm:hidden">戻る</span>
          </button>
        )}

        <div className="min-w-0 flex-1 border-x border-slate-800 px-2 sm:px-4">
          <div className="flex items-center justify-center gap-2 min-w-0">
            <div className="hidden sm:flex h-7 w-7 shrink-0 items-center justify-center border-2 border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.12)]">
              <Shield className="h-4 w-4" />
            </div>
            <div className="min-w-0 text-center">
              <div className="text-[9px] font-mono font-bold tracking-[0.2em] text-emerald-400">ADVENTURE LOG SYSTEM</div>
              <h1 className="truncate text-sm font-bold tracking-wide text-slate-100 sm:text-base">{title}</h1>
            </div>
          </div>
        </div>

        {onBack && (
          <button
            onClick={handleHome}
            aria-label="ホームへ"
            className="group flex shrink-0 items-center gap-1.5 border border-slate-700 bg-slate-900 px-2.5 py-2 font-mono text-xs font-bold text-slate-300 transition-all hover:border-amber-500 hover:text-amber-400 active:scale-[0.98]"
          >
            <Home className="h-4 w-4 text-amber-500 transition-colors group-hover:text-amber-400" />
            <span className="hidden sm:inline">HOME</span>
          </button>
        )}
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

  const setStartupWorld = useCallback((
    world: Screen & { name: 'world' },
    game: { gameId: string; gameName: string },
  ) => {
    setScreenState(world);
    setHistory([
      { name: 'top' },
      { name: 'worldList', gameId: game.gameId, gameName: game.gameName },
    ]);
    window.history.replaceState({}, '');
  }, []);

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