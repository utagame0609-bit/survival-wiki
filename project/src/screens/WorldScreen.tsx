import { useEffect, useState } from 'react';
import { BookOpen, Clock3, MapPin, User, Users } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { fetchLocations, fetchWorld, getPhotoUrl } from '@/lib/db';
import { Header } from '@/components/Navigation';
import { LocationsTab } from '@/screens/LocationsTab';
import { TimelineTab } from '@/screens/TimelineTab';
import { WikiTab } from '@/screens/WikiTab';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import type { NavigateFn } from '@/components/Navigation';
import { SettingsButton } from '@/components/SettingsModal';
import { playHoverSound, playModalCloseSound, playModalOpenSound, playTabSwitchSound } from '@/lib/sound';
import { WikiLocationDetailModal } from '@/components/WikiLocationDetailModal';

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
    playModalCloseSound();
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
            <div className="mb-4 sm:mb-6 bg-[#1e2330] border-2 border-[#2d3548] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-[52px] h-[52px] sm:w-14 sm:h-14 bg-[#141824] border-2 border-amber-500 overflow-hidden shrink-0 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.25)]">
                  {playerPhotoUrl ? (
                    <img src={playerPhotoUrl} alt="Player" className="w-full h-full object-cover pixelated" />
                  ) : (
                    <User className="w-7 h-7 text-amber-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono">
                      生存者: {world.player || '名無しの司令官'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      設立日: {new Date(world.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-wide truncate">{world.name}</h2>
                  {world.memo && (
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2 leading-relaxed">{world.memo}</p>
                  )}
                </div>
              </div>

              {world.members.length > 0 && (
                <div className="flex items-center gap-2.5 border-t md:border-t-0 md:border-l border-[#2d3548] pt-3 md:pt-0 md:pl-5">
                  <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="flex flex-wrap gap-1.5">
                    {world.members.map((member) => (
                      <span key={member.id} className="text-xs px-2.5 py-1 bg-[#141824] border border-cyan-500/40 text-cyan-300 font-medium">
                        @{member.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
