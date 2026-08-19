import { useEffect, useState } from 'react';
import { BookOpen, Clock3, MapPin, Settings } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import { fetchWorld } from '@/lib/db';
import { Header } from '@/components/Navigation';
import { LocationsTab } from '@/screens/LocationsTab';
import { TimelineTab } from '@/screens/TimelineTab';
import { WikiTab } from '@/screens/WikiTab';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import type { NavigateFn } from '@/components/Navigation';

type Tab = 'locations' | 'timeline' | 'wiki';

export function WorldScreen({
  worldId,
  worldName,
  navigate,
  goBack,
}: {
  worldId: string;
  worldName: string;
  navigate: NavigateFn;
  goBack: () => void;
}) {
  const [world, setWorld] = useState<WorldWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('locations');
  const [reloadKey, setReloadKey] = useState(0);

  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    fetchWorld(worldId)
      .then(setWorld)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [worldId, reloadKey]);

  const tabs: { id: Tab; label: string; icon: typeof MapPin }[] = [
    { id: 'locations', label: 'ロケーション', icon: MapPin },
    { id: 'timeline', label: 'タイムライン', icon: Clock3 },
    { id: 'wiki', label: 'Wiki', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen overflow-y-scroll [scrollbar-gutter:stable] bg-stone-50 flex flex-col">
      <Header title={worldName} onBack={goBack} />
      {error && <ErrorBanner message={error} />}
      {loading && <Spinner label="ワールドを読み込み中" />}
      {!loading && world && (
        <>
          <div className="sticky top-14 z-20 bg-white/90 backdrop-blur-md border-b border-stone-200">
            <div className="flex max-w-3xl mx-auto h-12">
              {tabs.map((t) => {
                const Icon = t.icon;
                const label =
                  t.id === 'locations'
                    ? 'ロケーション'
                    : t.id === 'timeline'
                      ? 'タイムライン'
                      : 'Wiki';
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex-1 h-12 flex items-center justify-center gap-1.5 text-sm font-medium transition-colors relative ${
                      tab === t.id
                        ? 'text-emerald-600'
                        : 'text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{t.id === 'locations' ? 'ロケーション' : label}</span>
                    {tab === t.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1">
            {tab === 'locations' && (
              <LocationsTab world={world} reloadKey={reloadKey} onReload={reload} />
            )}
            {tab === 'timeline' && <TimelineTab world={world} reloadKey={reloadKey} />}
            {tab === 'wiki' && <WikiTab world={world} reloadKey={reloadKey} />}
          </div>

          <button
            onClick={() =>
              navigate({
                name: 'worldCreate',
                gameId: world.game_id,
                gameName: '',
                worldId: world.id,
              })
            }
            className="fixed bottom-5 right-5 w-12 h-12 rounded-full bg-stone-800 text-white shadow-lg flex items-center justify-center hover:bg-stone-900 active:scale-95 transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}
