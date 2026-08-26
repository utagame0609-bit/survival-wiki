import { useState, useEffect, useCallback } from 'react';
import { MapPin, Calendar, BookOpen, User, Users, Edit } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { fetchWorld, fetchLocations, getPhotoUrl } from '@/lib/db';
import { Header } from '@/components/Navigation';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import { LocationsTab } from '@/screens/LocationsTab';
import { TimelineTab } from '@/screens/TimelineTab';
import { WikiTab } from '@/screens/WikiTab';
import { SettingsButton } from '@/components/SettingsModal';
import type { NavigateFn } from '@/components/Navigation';
import { playTabSwitchSound, playConfirmSound } from '@/lib/sound';
import { playWorldBgm, stopWorldBgm } from '@/lib/bgm';

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
  const [locations, setLocations] = useState<LocationWithPhotos[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('locations');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [highlightLocationId, setHighlightLocationId] = useState<string | null>(null);
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const [w, locs] = await Promise.all([fetchWorld(worldId), fetchLocations(worldId)]);
      if (!w) throw new Error('ワールドが見つかりませんでした。');
      setWorld(w);
      setLocations(locs);

      if (w.player_photo_path) {
        getPhotoUrl(w.player_photo_path).then(setPlayerPhotoUrl).catch(() => {});
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [worldId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    playWorldBgm();
    return () => stopWorldBgm(300);
  }, []);

  const handleTabChange = (tab: Tab) => {
    playTabSwitchSound();
    setActiveTab(tab);
  };

  const handleNavigateToTimeline = (locId: string) => {
    setHighlightLocationId(locId);
    setActiveTab('timeline');
  };

  const handleNavigateToLocation = (locId: string) => {
    setActiveTab('locations');
  };

  return (
    <div className="relative min-h-screen bg-[#161922] text-white font-sans flex flex-col select-none overflow-x-hidden">
      <div className="scanline-overlay" />
      <Header
        title={world?.name || worldName}
        onBack={goBack}
        rightElement={
          world && (
            <button
              type="button"
              onClick={() => {
                playConfirmSound();
                navigate({
                  name: 'worldCreate',
                  gameId: world.game_id,
                  gameName: 'SURVIVAL_WIKI',
                  worldId: world.id,
                });
              }}
              className="min-h-[40px] px-3 py-2 bg-[#141824] border border-amber-500/50 text-xs sm:text-sm text-slate-200 hover:text-amber-400 hover:border-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit className="w-4 h-4 text-amber-400" />
              <span className="font-bold">編集</span>
            </button>
          )
        }
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col">
        {loading && <Spinner label="ワールドデータを読み込み中..." />}
        {error && <ErrorBanner message={error} />}

        {!loading && world && (
          <>
            {/* World Header Info Card */}
            <div className="mb-4 sm:mb-6 bg-[#1e2330] border-2 border-[#2d3548] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-13 h-13 sm:w-14 sm:h-14 bg-[#141824] border-2 border-amber-500 overflow-hidden shrink-0 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.25)]">
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
                    {world.members.map((m) => (
                      <span key={m.id} className="text-xs px-2.5 py-1 bg-[#141824] border border-cyan-500/40 text-cyan-300 font-medium">
                        @{m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Tabs - Full width on mobile for thumb friendliness */}
            <div className="grid grid-cols-3 border-b-2 border-[#2d3548] mb-5 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => handleTabChange('locations')}
                className={`min-h-[48px] sm:min-h-[44px] px-2 sm:px-6 py-2.5 text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all border-b-3 -mb-[2px] cursor-pointer ${
                  activeTab === 'locations'
                    ? 'border-amber-500 bg-[#1e2330] text-amber-400 shadow-[0_2px_12px_rgba(245,158,11,0.2)]'
                    : 'border-transparent bg-[#141824] text-slate-300 hover:text-white hover:bg-[#181d2c]'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span className="tracking-wide">拠点一覧</span>
                <span className="text-[10px] sm:text-xs px-1.5 py-0.2 bg-[#12151f] border border-emerald-500/50 text-emerald-400 font-mono font-bold">
                  {locations.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('timeline')}
                className={`min-h-[48px] sm:min-h-[44px] px-2 sm:px-6 py-2.5 text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all border-b-3 -mb-[2px] cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'border-amber-500 bg-[#1e2330] text-amber-400 shadow-[0_2px_12px_rgba(245,158,11,0.2)]'
                    : 'border-transparent bg-[#141824] text-slate-300 hover:text-white hover:bg-[#181d2c]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="tracking-wide">タイムライン</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('wiki')}
                className={`min-h-[48px] sm:min-h-[44px] px-2 sm:px-6 py-2.5 text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all border-b-3 -mb-[2px] cursor-pointer ${
                  activeTab === 'wiki'
                    ? 'border-amber-500 bg-[#1e2330] text-amber-400 shadow-[0_2px_12px_rgba(245,158,11,0.2)]'
                    : 'border-transparent bg-[#141824] text-slate-300 hover:text-white hover:bg-[#181d2c]'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="tracking-wide">旅の書 (Wiki)</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1">
              {activeTab === 'locations' && (
                <LocationsTab
                  world={world}
                  locations={locations}
                  onRefresh={load}
                  onNavigateToTimeline={handleNavigateToTimeline}
                />
              )}

              {activeTab === 'timeline' && (
                <TimelineTab
                  world={world}
                  locations={locations}
                  highlightLocationId={highlightLocationId}
                />
              )}

              {activeTab === 'wiki' && (
                <WikiTab
                  world={world}
                  locations={locations}
                  onNavigateToLocation={handleNavigateToLocation}
                />
              )}
            </div>
          </>
        )}
      </div>

      <SettingsButton onOpenSoundStudio={() => navigate({ name: 'soundStudio' })} />
    </div>
  );
}
