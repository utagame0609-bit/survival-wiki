import { useEffect, useState } from 'react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchWorlds, fetchWorld, fetchLocations } from '@/lib/db';
import { Header, TabNav } from '@/components/Navigation';
import { LocationsTab } from '@/components/LocationsTab';
import { TimelineTab } from '@/components/TimelineTab';
import { WikiTab } from '@/components/WikiTab';
import { WorldListScreen } from '@/components/WorldListScreen';
import { SettingsButton, SettingsModal } from '@/components/SettingsModal';
import { Spinner } from '@/components/Feedback';

type Route =
  | { name: 'worldSelect' }
  | { name: 'world'; worldId: string; worldName?: string };

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'world', worldId: 'world-astoria-01', worldName: 'アストリア古王国・忘却の地' });
  const [activeTab, setActiveTab] = useState<'locations' | 'timeline' | 'wiki'>('locations');
  const [world, setWorld] = useState<WorldWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [locationsCount, setLocationsCount] = useState(0);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const loadCurrentWorld = async (worldId: string) => {
    setLoading(true);
    try {
      const data = await fetchWorld(worldId);
      if (data) {
        setWorld(data);
        const locs = await fetchLocations(data.id);
        setLocationsCount(locs.length);
      } else {
        const all = await fetchWorlds('default-game');
        if (all.length > 0) {
          setWorld(all[0]);
          setRoute({ name: 'world', worldId: all[0].id, worldName: all[0].name });
          const locs = await fetchLocations(all[0].id);
          setLocationsCount(locs.length);
        } else {
          setRoute({ name: 'worldSelect' });
        }
      }
    } catch {
      setRoute({ name: 'worldSelect' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route.name === 'world' && route.worldId) {
      loadCurrentWorld(route.worldId);
    } else {
      setLoading(false);
    }
  }, [route]);

  const handleNavigate = (nextRoute: { name: string; worldId?: string; worldName?: string }) => {
    if (nextRoute.name === 'world' && nextRoute.worldId) {
      setRoute({ name: 'world', worldId: nextRoute.worldId, worldName: nextRoute.worldName });
    } else {
      setRoute({ name: 'worldSelect' });
    }
  };

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
    if (world) {
      fetchLocations(world.id).then((locs) => setLocationsCount(locs.length)).catch(() => {});
    }
  };

  if (route.name === 'worldSelect') {
    return (
      <div className="min-h-screen bg-[#06090e] text-[#f0f0f0] font-mono">
        <WorldListScreen
          gameId="default-game"
          gameName="アストリア古王国・忘却の地"
          navigate={handleNavigate}
          goBack={() => {
            if (world) setRoute({ name: 'world', worldId: world.id, worldName: world.name });
          }}
        />
        <SettingsButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06090e] text-[#cbd5e1] font-mono flex flex-col relative matrix-grid-bg">
      <div className="scanline-overlay" />

      {/* Top Header */}
      <Header
        title={world?.name ?? route.worldName ?? 'アストリア古王国・忘却の地'}
        version="[Node_ID: TAC-4096] [Link: STABLE]"
        status="LOG OPEN"
        system="ONLINE"
        onBack={() => setRoute({ name: 'worldSelect' })}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Tab Navigation */}
      <TabNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Tab Content */}
      <main className="flex-1 pb-12 relative z-10">
        {loading && <Spinner label="ワールドデータを同期中..." />}
        {!loading && world && (
          <>
            {activeTab === 'locations' && (
              <LocationsTab
                world={world}
                reloadKey={reloadKey}
                onReload={handleReload}
              />
            )}
            {activeTab === 'timeline' && (
              <TimelineTab
                world={world}
                reloadKey={reloadKey}
              />
            )}
            {activeTab === 'wiki' && (
              <WikiTab world={world} />
            )}
          </>
        )}
      </main>

      {/* Tactical Telemetry Footer matching Design Specs */}
      <footer className="relative z-20 h-9 border-t border-slate-800 bg-[#06090e]/90 px-4 sm:px-6 flex items-center justify-between text-[10px] font-mono text-slate-500 tracking-wider">
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_4px_#34d399]" /> LOC_GRID: ENABLED</span>
          <span className="hidden sm:inline text-slate-400">MAP_SYNC: 100%</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <span>LOG_CAPACITY: <strong className="text-slate-300">{locationsCount}</strong>/256</span>
          <span className="text-amber-500/80 font-bold">[USER: ADMIN_ACCESS]</span>
        </div>
      </footer>

      {/* Floating Settings Button */}
      <SettingsButton />

      {/* Settings Modal triggered from Header or Floating Button */}
      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          installPrompt={installPrompt}
          onInstallPromptUsed={() => setInstallPrompt(null)}
        />
      )}
    </div>
  );
}
