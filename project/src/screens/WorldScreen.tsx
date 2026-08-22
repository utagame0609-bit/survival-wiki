import { useEffect, useState } from 'react';
import { BookOpen, Clock3, MapPin, Settings, X } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { fetchLocations, fetchWorld, getPhotoUrl } from '@/lib/db';
import { Header } from '@/components/Navigation';
import { LocationsTab } from '@/screens/LocationsTab';
import { TimelineTab } from '@/screens/TimelineTab';
import { WikiTab } from '@/screens/WikiTab';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import type { NavigateFn } from '@/components/Navigation';

type Tab = 'locations' | 'timeline' | 'wiki';

export function WorldScreen({ worldId, worldName, navigate, goBack }: { worldId: string; worldName: string; navigate: NavigateFn; goBack: () => void }) {
  const [world, setWorld] = useState<WorldWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('locations');
  const [reloadKey, setReloadKey] = useState(0);
  const [openLocationId, setOpenLocationId] = useState<string | null>(null);
  const [wikiLocation, setWikiLocation] = useState<LocationWithPhotos | null>(null);

  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    fetchWorld(worldId)
      .then(setWorld)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [worldId, reloadKey]);

  const handleOpenLocation = async (locationId: string) => {
    try {
      const locations = await fetchLocations(worldId);
      const location = locations.find((item) => item.id === locationId);
      if (!location) throw new Error('ロケーションが見つかりません。');
      setWikiLocation(location);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof MapPin }[] = [
    { id: 'locations', label: 'ロケーション', icon: MapPin },
    { id: 'timeline', label: 'タイムライン', icon: Clock3 },
    { id: 'wiki', label: 'Wiki', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen overflow-y-scroll [scrollbar-gutter:stable] bg-[#11120f] text-stone-100 flex flex-col">
      <Header title={worldName} onBack={goBack} />
      {error && <ErrorBanner message={error} />}
      {loading && <Spinner label="ワールドを読み込み中" />}
      {!loading && world && (
        <>
          <div className="sticky top-14 z-20 bg-[#151611]/95 backdrop-blur-md border-b border-[#2d3028]">
            <div className="flex max-w-3xl mx-auto h-12">
              {tabs.map((t) => {
                const Icon = t.icon;
                const label = t.id === 'locations' ? 'ロケーション' : t.id === 'timeline' ? 'タイムライン' : 'Wiki';
                return (
                  <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 h-12 flex items-center justify-center gap-1.5 text-sm font-medium transition-colors relative ${tab === t.id ? 'text-emerald-400' : 'text-stone-500 hover:text-stone-300'}`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{label}</span>
                    {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1">
            {tab === 'locations' && <LocationsTab world={world} reloadKey={reloadKey} onReload={reload} openLocationId={openLocationId} onOpenLocationHandled={() => setOpenLocationId(null)} />}
            {tab === 'timeline' && <TimelineTab world={world} reloadKey={reloadKey} />}
            {tab === 'wiki' && <WikiTab world={world} reloadKey={reloadKey} onOpenLocation={handleOpenLocation} />}
          </div>

          {wikiLocation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
              <button aria-label="閉じる" className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setWikiLocation(null)} />
              <div className="relative z-10 w-full max-w-2xl max-h-[calc(100vh-24px)] sm:max-h-[calc(100vh-48px)] overflow-hidden rounded-2xl bg-[#1b1c18] text-stone-100 border border-[#34372f] shadow-2xl flex flex-col">
                <div className="flex items-center justify-between px-4 sm:px-5 h-12 flex-shrink-0 border-b border-[#34372f] bg-[#171813]">
                  <h2 className="text-sm sm:text-base font-semibold">ロケーション</h2>
                  <button onClick={() => setWikiLocation(null)} aria-label="閉じる" className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:bg-[#292b24] hover:text-stone-100"><X className="w-5 h-5" /></button>
                </div>
                <div className="overflow-y-auto overscroll-contain">
                  <div className="p-4 sm:p-5 space-y-4">
                    {(() => {
                      const mainPhoto = wikiLocation.photos.find((photo) => photo.is_main);
                      return mainPhoto
                        ? <img src={getPhotoUrl(mainPhoto.storage_path)} alt={wikiLocation.name} className="w-full h-56 sm:h-72 rounded-xl object-cover border border-[#34372f]" />
                        : <div className="w-full h-56 sm:h-72 rounded-xl bg-[#24271f] flex items-center justify-center"><MapPin className="w-12 h-12 text-stone-600" /></div>;
                    })()}
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-bold break-words">{wikiLocation.name}</h3>
                      <div className="mt-4 rounded-xl bg-[#20221d] border border-[#34372f] p-4 sm:p-5">
                        <div className="flex items-center gap-2 text-sm text-stone-400 mb-3"><MapPin className="w-4 h-4 text-emerald-400" />座標</div>
                        <div className="grid grid-cols-3 gap-3 text-center font-mono">
                          <div><div className="text-sm font-semibold italic text-stone-300">X</div><div className="mt-1 text-xl font-semibold">{wikiLocation.x}</div></div>
                          <div><div className="text-sm font-semibold italic text-stone-300">Y</div><div className="mt-1 text-xl font-semibold">{wikiLocation.y}</div></div>
                          <div><div className="text-sm font-semibold italic text-stone-300">Z</div><div className="mt-1 text-xl font-semibold">{wikiLocation.z}</div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button onClick={() => navigate({ name: 'worldCreate', gameId: world.game_id, gameName: '', worldId: world.id })} className="fixed bottom-5 right-5 w-12 h-12 rounded-full bg-[#292b24] text-stone-200 border border-[#3a3d34] shadow-lg shadow-black/30 flex items-center justify-center hover:bg-[#34372e] active:scale-95 transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}
