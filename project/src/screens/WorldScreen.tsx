import { useEffect, useState } from 'react';
import { BookOpen, Clock3, MapPin } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { fetchLocations, fetchWorld, getPhotoUrl } from '@/lib/db';
import { Header } from '@/components/Navigation';
import { LocationsTab } from '@/screens/LocationsTab';
import { TimelineTab } from '@/screens/TimelineTab';
import { WikiTab } from '@/screens/WikiTab';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import type { NavigateFn } from '@/components/Navigation';
import { SettingsButton } from '@/components/SettingsModal';
import { playHoverSound, playModalOpenSound, playTabSwitchSound } from '@/lib/sound';
import { WikiLocationDetailModal } from '@/components/WikiLocationDetailModal';
import { WorldHeader } from '@/components/WorldHeader';

type Tab = 'locations' | 'timeline' | 'wiki';

export function WorldScreen({ worldId, worldName, navigate: _navigate, goBack }: { worldId: string; worldName: string; navigate: NavigateFn; goBack: () => void }) {
  const [world, setWorld] = useState<WorldWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('locations');
  const [tabHistory, setTabHistory] = useState<Tab[]>([]);
  const [wikiArticleBack, setWikiArticleBack] = useState(false);
  const [wikiArticleViewKey, setWikiArticleViewKey] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [openLocationId, setOpenLocationId] = useState<string | null>(null);
  const [wikiLocation, setWikiLocation] = useState<LocationWithPhotos | null>(null);
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState('');

  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetchWorld(worldId)
      .then((nextWorld) => {
        if (!active) return;
        setWorld(nextWorld);
        if (nextWorld?.player_photo_path) {
          getPhotoUrl(nextWorld.player_photo_path).then((url) => {
            if (active) setPlayerPhotoUrl(url);
          }).catch(() => {
            if (active) setPlayerPhotoUrl('');
          });
        } else {
          setPlayerPhotoUrl('');
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [worldId, reloadKey]);

  const handleOpenLocation = async (locationId: string) => {
    try {
      const locations = await fetchLocations(worldId);
      const location = locations.find((item) => item.id === locationId);
      if (!location) throw new Error('ロケーションが見つかりません。');
      playModalOpenSound();
      setWikiLocation(location);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleCloseWikiLocation = () => {
    setWikiLocation(null);
  };

  const handleTabChange = (nextTab: Tab) => {
    if (nextTab === tab) return;
    playTabSwitchSound();
    setWikiArticleBack(false);
    setTabHistory([]);
    setTab(nextTab);
  };

  const handleWikiArticleStateChange = (isArticle: boolean) => {
    setWikiArticleBack(isArticle);
  };

  const handleWorldBack = () => {
    if (tab === 'wiki' && wikiArticleBack) {
      setWikiArticleBack(false);
      setWikiArticleViewKey((key) => key + 1);
      return;
    }
    if (tab === 'wiki') {
      setTab('timeline');
      return;
    }
    if (tab === 'timeline') {
      setTab('locations');
      return;
    }
    goBack();
  };

  const tabs: { id: Tab; label: string; icon: typeof MapPin }[] = [
    { id: 'locations', label: 'ロケーション', icon: MapPin },
    { id: 'timeline', label: 'タイムライン', icon: Clock3 },
    { id: 'wiki', label: 'Wiki', icon: BookOpen },
  ];

  return (
    <div className="relative min-h-screen bg-[#161922] text-white font-sans flex flex-col select-none overflow-x-hidden">
      <div className="scanline-overlay" />
      <Header title={world?.name || worldName} onBack={handleWorldBack} />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col">
        {loading && <Spinner label="ワールドデータを読み込み中..." />}
        {error && <ErrorBanner message={error} />}

        {!loading && world && (
          <>
            <WorldHeader world={world} playerPhotoUrl={playerPhotoUrl} />

            <div className="grid grid-cols-3 border-b-2 border-[#2d3548] mb-5 gap-1.5 sm:gap-2">
              {tabs.map((item) => {
                const Icon = item.icon;
                const isActive = tab === item.id;
                const count = item.id === 'locations' ? <span className="text-[10px] sm:text-xs px-1.5 py-0.2 bg-[#12151f] border border-emerald-500/50 text-emerald-400 font-mono font-bold">—</span> : null;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabChange(item.id)}
                    onMouseEnter={playHoverSound}
                    className={`min-h-[48px] sm:min-h-[44px] px-2 sm:px-6 py-2.5 text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all border-b-[3px] -mb-[2px] cursor-pointer ${
                      isActive
                        ? 'border-amber-500 bg-[#1e2330] text-amber-400 shadow-[0_2px_12px_rgba(245,158,11,0.2)]'
                        : 'border-transparent bg-[#141824] text-slate-300 hover:text-white hover:bg-[#181d2c]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="tracking-wide whitespace-nowrap">{item.id === 'wiki' ? '旅の書 (Wiki)' : item.label}</span>
                    {count}
                  </button>
                );
              })}
            </div>

            <div className="flex-1">
              {tab === 'locations' && (
                <LocationsTab
                  world={world}
                  reloadKey={reloadKey}
                  onReload={reload}
                  openLocationId={openLocationId}
                  onOpenLocationHandled={() => setOpenLocationId(null)}
                />
              )}

              {tab === 'timeline' && <TimelineTab world={world} reloadKey={reloadKey} />}

              {tab === 'wiki' && (
                <WikiTab
                  key={wikiArticleViewKey}
                  world={world}
                  reloadKey={reloadKey}
                  onOpenLocation={handleOpenLocation}
                  onArticleStateChange={handleWikiArticleStateChange}
                />
              )}
            </div>
          </>
        )}
      </div>

      {!wikiArticleBack && <SettingsButton />}

      {wikiLocation && <WikiLocationDetailModal location={wikiLocation} onClose={handleCloseWikiLocation} />}
    </div>
  );
}
