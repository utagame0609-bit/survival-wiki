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
    <div className="relative min-h-screen bg-[#050811] text-slate-100 font-mono flex flex-col select-none overflow-x-hidden">
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
              className="px-2.5 py-1.5 bg-[#070c18] border border-amber-500/40 text-xs text-slate-300 hover:text-amber-400 hover:border-amber-400 flex items-center gap-1.5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CONFIG // メンバー編集</span>
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
            <div className="mb-5 bg-[#0a1120] border-2 border-[#1a2333] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#070c18] border-2 border-amber-500 overflow-hidden shrink-0 flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                  {playerPhotoUrl ? (
                    <img src={playerPhotoUrl} alt="Player" className="w-full h-full object-cover pixelated" />
                  ) : (
                    <User className="w-6 h-6 text-amber-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      COMMANDER: {world.player || '名無しの生存者'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      FOUNDED: {new Date(world.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate">{world.name}</h2>
                  {world.memo && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{world.memo}</p>
                  )}
                </div>
              </div>

              {world.members.length > 0 && (
                <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-[#1a2333] pt-3 md:pt-0 md:pl-4">
                  <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="flex flex-wrap gap-1.5">
                    {world.members.map((m) => (
                      <span key={m.id} className="text-[11px] px-2 py-0.5 bg-[#070c18] border border-cyan-500/30 text-cyan-300">
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b-2 border-[#1a2333] mb-5 gap-1">
              <button
                type="button"
                onClick={() => handleTabChange('locations')}
                className={`px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border-b-2 -mb-[2px] ${
                  activeTab === 'locations'
                    ? 'border-amber-500 bg-[#0d1627] text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0a1120]'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>LOCATIONS // 拠点一覧</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-[#070c18] border border-emerald-500/40 text-emerald-400">
                  {locations.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('timeline')}
                className={`px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border-b-2 -mb-[2px] ${
                  activeTab === 'timeline'
                    ? 'border-amber-500 bg-[#0d1627] text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0a1120]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>TIMELINE // タイムライン</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('wiki')}
                className={`px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border-b-2 -mb-[2px] ${
                  activeTab === 'wiki'
                    ? 'border-amber-500 bg-[#0d1627] text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0a1120]'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>CHRONICLE // 旅の書 (Wiki)</span>
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
