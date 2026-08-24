import { useEffect, useState } from 'react';
import { useScreenHistory } from '@/components/Navigation';
import { SettingsButton } from '@/components/SettingsModal';
import { AuthScreen } from '@/screens/AuthScreen';
import { TopScreen } from '@/screens/TopScreen';
import { WorldListScreen } from '@/screens/WorldListScreen';
import { WorldCreateScreen } from '@/screens/WorldCreateScreen';
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
          goBack={goBack}
        />
      );
      break;
    case 'worldCreate':
      screenContent = (
        <WorldCreateScreen
          gameId={screen.gameId}
          gameName={screen.gameName}
          worldId={screen.worldId}
          navigate={setScreen}
          goBack={goBack}
        />
      );
      break;
    case 'world':
      screenContent = (
        <WorldScreen
          worldId={screen.worldId}
          worldName={screen.worldName}
          navigate={setScreen}
          goBack={goBack}
        />
      );
      break;
  }

  const showSettings = screen.name !== 'world';

  return (
    <>
      {screenContent}
      {showSettings && <SettingsButton />}
    </>
  );
}

export default App;