import { useState, useEffect } from 'react';
import { WorldListScreen } from './screens/WorldListScreen';
import { WorldCreateScreen } from './screens/WorldCreateScreen';
import { WorldScreen } from './screens/WorldScreen';
import { SoundStudioScreen } from './screens/SoundStudioScreen';
import type { ScreenState } from './components/Navigation';

const DEFAULT_GAME_ID = 'survival-main';
const DEFAULT_GAME_NAME = 'SURVIVAL WIKI';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>({
    name: 'worldList',
    gameId: DEFAULT_GAME_ID,
    gameName: DEFAULT_GAME_NAME,
  });

  useEffect(() => {
    const handleOpenStudio = () => {
      setScreen({ name: 'soundStudio' });
    };
    window.addEventListener('survival-wiki:open-sound-studio', handleOpenStudio);
    return () => window.removeEventListener('survival-wiki:open-sound-studio', handleOpenStudio);
  }, []);

  return (
    <main className="min-h-screen bg-[#070c18] text-[#f0f0f0] flex flex-col font-mono selection:bg-[#ffb000] selection:text-black">
      {screen.name === 'worldList' && (
        <WorldListScreen
          gameId={screen.gameId}
          gameName={screen.gameName}
          navigate={setScreen}
          goBack={() => {
            // Already at root list
          }}
        />
      )}

      {screen.name === 'worldCreate' && (
        <WorldCreateScreen
          gameId={screen.gameId}
          gameName={screen.gameName}
          worldId={screen.worldId}
          navigate={setScreen}
          goBack={() => setScreen({ name: 'worldList', gameId: screen.gameId, gameName: screen.gameName })}
        />
      )}

      {screen.name === 'world' && (
        <WorldScreen
          worldId={screen.worldId}
          worldName={screen.worldName}
          navigate={setScreen}
          goBack={() => setScreen({ name: 'worldList', gameId: DEFAULT_GAME_ID, gameName: DEFAULT_GAME_NAME })}
        />
      )}

      {screen.name === 'soundStudio' && (
        <SoundStudioScreen
          goBack={() => setScreen({ name: 'worldList', gameId: DEFAULT_GAME_ID, gameName: DEFAULT_GAME_NAME })}
        />
      )}
    </main>
  );
}
