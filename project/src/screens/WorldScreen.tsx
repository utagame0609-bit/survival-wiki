import { useEffect, useState } from 'react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchLocations, fetchWorld, getPhotoUrl } from '@/lib/db';
import { Header } from '@/components/Navigation';
import { LocationsTab } from '@/screens/LocationsTab';
import { WikiTab } from '@/screens/WikiTab';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import type { NavigateFn } from '@/components/Navigation';
import { playModalOpenSound } from '@/lib/sound';
import { stopNpcBgm } from '@/lib/bgm';
import { WikiLocationDetailModal } from '@/components/WikiLocationDetailModal';
import { WorldHeader } from '@/components/WorldHeader';
import { WorldTabs } from '@/components/WorldTabs';

type Tab = 'records' | 'wiki';

export function WorldScreen({ worldId, worldName, navigate: _navigate, goBack }: { worldId: string; worldName: string; navigate: NavigateFn; goBack: () => void }) {
  const [world, setWorld] = useState<WorldWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('records');
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
      stopNpcBgm();
    };
  }, [worldId, reloadKey]);

  useEffect(() => {
    if (tab !== 'wiki') stopNpcBgm();
  }, [tab]);

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
    setWikiArticleBack(false);
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
      setTab('records');
      return;
    }
    goBack();
  };

  return (
    <div className="relative min-h-screen bg-[#0b1018] text-white font-sans flex flex-col select-none overflow-x-hidden">
      <div className="scanline-overlay" />
      <Header title={world?.name || worldName} onBack={handleWorldBack} />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col">
        {loading && <Spinner label="ワールドデータを読み込み中..." />}
        {error && <ErrorBanner message={error} />}

        {!loading && world && (
          <>
            <WorldHeader world={world} playerPhotoUrl={playerPhotoUrl} />
            <WorldTabs activeTab={tab} onTabChange={handleTabChange} />

            <div className="flex-1">
              {tab === 'records' && (
                <LocationsTab
                  world={world}
                  reloadKey={reloadKey}
                  onReload={reload}
                  openLocationId={openLocationId}
                  onOpenLocationHandled={() => setOpenLocationId(null)}
                />
              )}

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

      {wikiLocation && <WikiLocationDetailModal location={wikiLocation} onClose={handleCloseWikiLocation} />}
    </div>
  );
}
