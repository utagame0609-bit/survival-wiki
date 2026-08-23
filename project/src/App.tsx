import { useScreenHistory } from '@/components/Navigation';
import { SettingsButton } from '@/components/SettingsModal';
import { TopScreen } from '@/screens/TopScreen';
import { WorldListScreen } from '@/screens/WorldListScreen';
import { WorldCreateScreen } from '@/screens/WorldCreateScreen';
import { WorldScreen } from '@/screens/WorldScreen';

function App() {
  const { screen, setScreen, goBack } = useScreenHistory();

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

  return (
    <>
      {screenContent}
      <SettingsButton />
    </>
  );
}

export default App;
