import { useEffect, useState } from 'react';
import { useScreenHistory } from '@/lib/screenNavigation';
import { SettingsButton } from '@/components/settings/SettingsButton';
import { AuthScreen } from '@/screens/AuthScreen';
import { TopScreen } from '@/screens/TopScreen';
import { WorldListScreen } from '@/screens/WorldListScreen';
import { WorldScreen } from '@/screens/WorldScreen';
import { fetchGames, fetchWorlds } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

function App() {
  const { screen, setScreen, setStartupWorld, goBack } = useScreenHistory();
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [startupLoading, setStartupLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authLoading || !session) {
      if (!authLoading) setStartupLoading(false);
      return;
    }

    let cancelled = false;

    const restoreLastWorld = async () => {
      try {
        const games = await fetchGames();

        for (const game of games) {
          const lastOpenedWorldId = localStorage.getItem(`survival-wiki:last-opened-world:${game.id}`);
          if (!lastOpenedWorldId) continue;

          const worlds = await fetchWorlds(game.id);
          const world = worlds.find((item) => item.id === lastOpenedWorldId);
          if (!world) continue;

          if (!cancelled) {
            setStartupWorld(
              { name: 'world', worldId: world.id, worldName: world.name },
              { gameId: game.id, gameName: game.name },
            );
          }
          return;
        }
      } catch {
        // 起動時の自動復元に失敗した場合は、従来どおりトップ画面から開始する。
      } finally {
        if (!cancelled) setStartupLoading(false);
      }
    };

    restoreLastWorld();

    return () => {
      cancelled = true;
    };
  }, [authLoading, session, setStartupWorld]);

  useEffect(() => {
    const getScrollKey = () => {
      switch (screen.name) {
        case 'top':
          return 'top';
        case 'worldList':
          return `worldList:${screen.gameId}`;
        case 'world':
          return `world:${screen.worldId}`;
      }
    };

    const storageKey = `survival-wiki:scroll:${getScrollKey()}`;
    let timerA: number | null = null;
    let timerB: number | null = null;

    const readTarget = () => {
      try {
        const raw = sessionStorage.getItem(storageKey);
        const target = raw === null ? 0 : Number(raw);
        return Number.isFinite(target) && target >= 0 ? target : 0;
      } catch {
        return 0;
      }
    };

    const save = () => {
      try {
        sessionStorage.setItem(storageKey, String(Math.round(window.scrollY)));
      } catch {
        // sessionStorage unavailable; ignore.
      }
    };

    const restore = () => {
      const target = readTarget();
      window.scrollTo(0, target);
    };

    window.addEventListener('scroll', save, { passive: true });

    const frame = window.requestAnimationFrame(() => {
      restore();
      timerA = window.setTimeout(restore, 80);
      timerB = window.setTimeout(restore, 250);
    });

    return () => {
      save();
      window.removeEventListener('scroll', save);
      window.cancelAnimationFrame(frame);
      if (timerA !== null) window.clearTimeout(timerA);
      if (timerB !== null) window.clearTimeout(timerB);
    };
  }, [screen]);

  if (authLoading || (session && startupLoading)) {
    return <div className="fixed inset-0 bg-[#11120f]" aria-hidden="true" />;
  }

  if (!session) {
    return <AuthScreen />;
  }

  let screenContent;

  switch (screen.name) {
    case 'top':
      screenContent = <TopScreen navigate={setScreen} />;
      break;
    case 'worldList':
      screenContent = (
        <WorldListScreen
          gameId={screen.gameId}
          navigate={setScreen}
        />
      );
      break;
    case 'world':
      screenContent = (
        <WorldScreen
          worldId={screen.worldId}
          worldName={screen.worldName}
          goBack={goBack}
        />
      );
      break;
  }

  return (
    <>
      {screenContent}
      <SettingsButton showButton={false} />
    </>
  );
}

export default App;
