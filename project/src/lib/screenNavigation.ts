import { useCallback, useEffect, useState } from 'react';
import { playCancelSound } from '@/lib/sound';

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
