import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
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
  return (
    <header className="sticky top-0 z-30 bg-[#11120f]/90 backdrop-blur-md border-b border-[#2d3028]">
      <div className="flex items-center gap-2 px-4 h-14 max-w-3xl mx-auto">
        {onBack && (
          <button
            onClick={() => {
              playCancelSound();
              onBack();
            }}
            className="flex items-center gap-1 text-stone-400 hover:text-stone-100 -ml-2 px-2 py-1 rounded-lg hover:bg-[#20231c] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">戻る</span>
          </button>
        )}
        <h1 className="text-base font-semibold text-stone-100 truncate flex-1 text-center">
          {title}
        </h1>
        {onBack && <div className="w-16" />}
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

  const goBack = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setScreenState(prev);
      return h.slice(0, -1);
    });
  };

  useBackButton(goBack);

  return { screen, setScreen, goBack };
}
