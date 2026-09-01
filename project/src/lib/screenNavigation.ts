import { useCallback, useEffect, useRef, useState } from 'react';
import { playCancelSound } from '@/lib/sound';
import type { UserLastWorldTab } from '@/lib/userLastView';

type Screen =
  | { name: 'top' }
  | { name: 'worldList'; gameId: string; gameName: string }
  | { name: 'world'; gameId: string; worldId: string; worldName: string; initialTab?: UserLastWorldTab };

type HomeScreen =
  | { name: 'top' }
  | { name: 'worldList'; gameId: string; gameName: string };

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
  const homeScreenRef = useRef<HomeScreen>({ name: 'top' });

  const setScreen = (s: Screen) => {
    if (s.name === 'worldList') homeScreenRef.current = s;
    setScreenState((prev) => {
      setHistory((h) => [...h, prev]);
      return s;
    });
    window.history.pushState({}, '');
  };

  const setStartupWorldList = useCallback((game: { gameId: string; gameName: string }) => {
    const homeScreen: HomeScreen = {
      name: 'worldList',
      gameId: game.gameId,
      gameName: game.gameName,
    };
    homeScreenRef.current = homeScreen;
    setScreenState(homeScreen);
    setHistory([]);
    window.history.replaceState({}, '');
  }, []);

  const setStartupWorld = useCallback(
    (world: Screen & { name: 'world' }, game: { gameId: string; gameName: string }) => {
      const homeScreen: HomeScreen = {
        name: 'worldList',
        gameId: game.gameId,
        gameName: game.gameName,
      };
      homeScreenRef.current = homeScreen;
      setScreenState(world);
      setHistory([homeScreen]);
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
      setScreenState(homeScreenRef.current);
      setHistory([]);
      window.history.replaceState({}, '');
    };
    window.addEventListener('survival-wiki:home', handler);
    return () => window.removeEventListener('survival-wiki:home', handler);
  }, []);

  useBackButton(goBack);

  return { screen, setScreen, setStartupWorldList, setStartupWorld, goBack };
}
