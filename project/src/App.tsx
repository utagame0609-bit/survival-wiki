import { useScreenHistory } from '@/components/Navigation';
import { TopScreen } from '@/screens/TopScreen';
import { WorldListScreen } from '@/screens/WorldListScreen';
import { WorldCreateScreen } from '@/screens/WorldCreateScreen';
import { WorldScreen } from '@/screens/WorldScreen';

function App() {
  const { screen, setScreen, goBack } = useScreenHistory();

  switch (screen.name) {
    case 'top':
      return <TopScreen navigate={setScreen} />;
    case 'worldList':
      return (
        <WorldListScreen
          gameId={screen.gameId}
          gameName={screen.gameName}
          navigate={setScreen}
          goBack={goBack}
        />
      );
    case 'worldCreate':
      return (
        <WorldCreateScreen
          gameId={screen.gameId}
          gameName={screen.gameName}
          worldId={screen.worldId}
          navigate={setScreen}
          goBack={goBack}
        />
      );
    case 'world':
      return (
        <WorldScreen
          worldId={screen.worldId}
          worldName={screen.worldName}
          navigate={setScreen}
          goBack={goBack}
        />
      );
  }
}

export default App;
