import { useEffect, useState } from 'react';
import { useScreenHistory } from '@/lib/screenNavigation';
import { SettingsButton } from '@/components/settings/SettingsButton';
import { AuthScreen } from '@/screens/AuthScreen';
import { TopScreen } from '@/screens/TopScreen';
import { WorldListScreen } from '@/screens/WorldListScreen';
import { WorldScreen } from '@/screens/WorldScreen';
import { fetchGames, fetchWorlds } from '@/lib/db';
import { loadUserLastView } from '@/lib/userLastView';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

function App() {
  const { screen, setScreen, setStartupWorldList, setStartupWorld, goBack } = useScreenHistory();
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

    const restoreLastView = async () => {
      try {
        const games = await fetchGames();
        const defaultGame = games.find((game) => game.available) ?? games[0] ?? null;

        let savedView = null;
        try {
          savedView = await loadUserLastView();
        } catch (error) {
          console.error('Failed to load account last view:', error);
        }

        if (savedView?.gameId) {
          const savedGame = games.find((game) => game.id === savedView.gameId) ?? null;
          if (savedGame) {
            if (savedView.screen === 'world' && savedView.worldId) {
              const worlds = await fetchWorlds(savedGame.id);
              const world = worlds.find((item) => item.id === savedView.worldId);
              if (world) {
                if (!cancelled) {
                  setStartupWorld(
                    {
                      name: 'world',
                      gameId: savedGame.id,
                      worldId: world.id,
                      worldName: world.name,
                      initialTab: savedView.worldTab,
                    },
                    { gameId: savedGame.id, gameName: savedGame.name },
                  );
                }
                return;
              }
            }

            if (savedView.screen === 'worldList') {
              if (!cancelled) setStartupWorldList({ gameId: savedGame.id, gameName: savedGame.name });
              return;
            }
          }
        }

        // Existing installs may only have the former device-local last world. Use it once as a compatibility fallback.
        for (const game of games) {
          const lastOpenedWorldId = localStorage.getItem(`survival-wiki:last-opened-world:${game.id}`);
          if (!lastOpenedWorldId) continue;

          const worlds = await fetchWorlds(game.id);
          const world = worlds.find((item) => item.id === lastOpenedWorldId);
          if (!world) continue;

          if (!cancelled) {
            setStartupWorld(
              { name: 'world', gameId: game.id, worldId: world.id, worldName: world.name, initialTab: 'records' },
              { gameId: game.id, gameName: game.name },
            );
          }
          return;
        }

        if (!cancelled && defaultGame) {
          setStartupWorldList({ gameId: defaultGame.id, gameName: defaultGame.name });
        }
      } catch {
        // ゲーム情報の取得自体に失敗した場合のみ、旧TopScreenを非常用フォールバックとして残す。
      } finally {
        if (!cancelled) setStartupLoading(false);
      }
    };

    restoreLastView();

    return () => {
      cancelled = true;
    };
  }, [authLoading, session, setStartupWorldList, setStartupWorld]);

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
          gameName={screen.gameName}
          navigate={setScreen}
        />
      );
      break;
    case 'world':
      screenContent = (
        <WorldScreen
          gameId={screen.gameId}
          worldId={screen.worldId}
          worldName={screen.worldName}
          initialTab={screen.initialTab}
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
