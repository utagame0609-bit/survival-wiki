import { useEffect, useState } from 'react';
import { useScreenHistory } from '@/components/Navigation';
import { SettingsButton } from '@/components/SettingsModal';
import { AuthScreen } from '@/screens/AuthScreen';
import { TopScreen } from '@/screens/TopScreen';
import { WorldListScreen } from '@/screens/WorldListScreen';
import { WorldCreateScreen } from '@/screens/WorldCreateScreen';
import { WorldScreen } from '@/screens/WorldScreen';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

function App() {
  const { screen, setScreen, goBack } = useScreenHistory();
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  if (authLoading) {
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