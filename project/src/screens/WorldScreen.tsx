import { useEffect, useState } from 'react';
import { BookOpen, Clock3, FileText, MapPin, X } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { fetchLocations, fetchWorld, getPhotoUrl } from '@/lib/db';
import { Header } from '@/components/Navigation';
import { LocationsTab } from '@/screens/LocationsTab';
import { TimelineTab } from '@/screens/TimelineTab';
import { WikiTab } from '@/screens/WikiTab';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import type { NavigateFn } from '@/components/Navigation';
import { SettingsButton } from '@/components/SettingsModal';
import { UTAPEDIA_AVATAR } from '@/assets/utapediaAvatar';
import { playModalCloseSound, playModalOpenSound, playTabSwitchSound } from '@/lib/sound';

type Tab = 'locations' | 'timeline' | 'wiki';

export function WorldScreen({ worldId, worldName, navigate, goBack }: { worldId: string; worldName: string; navigate: NavigateFn; goBack: () => void }) {
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
    <div className="min-h-screen overflow-y-scroll [scrollbar-gutter:stable] bg-[#0a1120] text-[#e2e8f0] flex flex-col relative">
      <Header title={worldName} onBack={handleWorldBack} />

      {error && <ErrorBanner message={error} />}
      {loading && <Spinner label="ワールド冒険の書を読み込み中" />}

      {!loading && world && (
        <>
          <nav className="sticky top-14 z-20 bg-[#0d1627] border-b-2 border-[#1a2333] shadow-lg">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5">
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
                {tabs.map((t, index) => {
                  const Icon = t.icon;
                  const label = t.id === 'locations' ? 'ロケーション' : t.id === 'timeline' ? 'タイムライン' : '旅の書 (WIKI)';
                  const pageNum = `0${index + 1}`;
                  const isActive = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleTabChange(t.id)}
                      className={`h-11 sm:h-12 px-3.5 sm:px-5 flex items-center gap-2.5 rounded-sm text-xs sm:text-sm font-bold select-none transition-all ${
                        isActive
                          ? 'bg-[#1a2333] border-2 border-[#ffb000] text-[#ffb000] shadow-[0_0_15px_rgba(255,176,0,0.25)]'
                          : 'bg-[#050a14] border-2 border-[#1a2333] text-zinc-400 hover:text-zinc-200 hover:border-[#334155]'
                      }`}
                    >
                      <span className={`text-[11px] font-mono ${isActive ? 'text-[#32cd32]' : 'opacity-0'}`}>▶</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm border ${
                        isActive ? 'bg-[#ffb000]/20 border-[#ffb000] text-[#ffb000]' : 'bg-[#1a2333] border-[#334155] text-zinc-500'
                      }`}>
                        PAGE {pageNum}
                      </span>
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#ffb000]' : 'text-zinc-400'}`} />
                      <span className="tracking-wide whitespace-nowrap">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          <main className="flex-1 pb-12">
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
          </main>

          <footer className="h-12 bg-[#050a14] border-t-2 border-[#1a2333] flex items-center justify-between px-4 sm:px-8 text-[10px] text-zinc-500 font-mono font-bold tracking-widest mt-auto">
            <div className="truncate">SYSTEM STATUS: ONLINE // SUPABASE_CONNECTED: TRUE // R2_STORAGE: READY</div>
            <div className="hidden sm:block shrink-0">© ADVENTURE_LOG_SYS 1998-2024</div>
          </footer>

          {!wikiArticleBack && <SettingsButton />}

          {wikiLocation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <button aria-label="閉じる" className="absolute inset-0" onClick={handleCloseWikiLocation} />
              <div className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-hidden rounded-sm bg-[#0a1120] text-[#e2e8f0] border-4 border-double border-[#ffb000] shadow-[0_0_25px_rgba(255,176,0,0.2),inset_0_0_10px_rgba(255,176,0,0.1)] flex flex-col motion-safe:animate-[wiki-modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
                <div className="flex items-center justify-between px-5 py-3 flex-shrink-0 border-b-2 border-[#1a2333] bg-[#0d1627] text-[#ffb000]">
                  <div className="text-xs tracking-wider flex items-center gap-2.5">
                    <img
                      src={UTAPEDIA_AVATAR}
                      alt="ウタペディア"
                      className="w-6 h-6 object-cover rounded-sm border border-[#ffb000]"
                    />
                    <span className="font-bold text-[#ffb000]">ウタペディア</span>
                    <span className="text-zinc-600 font-mono">//</span>
                    <span className="text-zinc-300">ロケーション詳細</span>
                  </div>
                  <button
                    onClick={handleCloseWikiLocation}
                    aria-label="閉じる"
                    className="p-1 rounded-sm text-zinc-400 hover:bg-[#1a2333] hover:text-[#ffb000] transition-colors border border-transparent hover:border-[#334155]"
                  >
                    <X className="w-[18px] h-[18px]" />
                  </button>
                </div>

                <div className="overflow-y-auto overscroll-contain p-5 space-y-4">
                  <div className="flex items-center gap-2 border-l-4 border-[#ffb000] pl-3">
                    <h2 className="text-lg sm:text-xl font-bold text-[#ffb000] break-words">
                      {wikiLocation.name}
                    </h2>
                  </div>

                  <div className="p-1 rounded-sm border-2 border-[#334155] bg-[#0d1627]">
                    {(() => {
                      const mainPhoto = wikiLocation.photos.find((photo) => photo.is_main);
                      return mainPhoto ? (
                        <PhotoImage
                          storagePath={mainPhoto.storage_path}
                          alt={wikiLocation.name}
                          className="w-full h-48 sm:h-56 object-cover rounded-sm"
                        />
                      ) : (
                        <div className="w-full h-48 sm:h-56 bg-[#1a2333] rounded-sm flex items-center justify-center">
                          <MapPin className="w-12 h-12 text-zinc-600" />
                        </div>
                      );
                    })()}
                  </div>

                  <table className="w-full text-xs border-collapse rounded-sm overflow-hidden border-2 border-[#1a2333] bg-[#0d1627]">
                    <tbody>
                      <tr className="border-b border-[#1a2333]">
                        <th className="w-1/3 bg-[#1a2333] p-2.5 text-left font-bold text-[#ffb000] border-r border-[#1a2333]">
                          座標 (X, Y, Z)
                        </th>
                        <td className="p-2.5 font-mono text-[#32cd32] font-bold">
                          X: {wikiLocation.x} / Y: {wikiLocation.y} / Z: {wikiLocation.z}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-[#1a2333] p-2.5 text-left font-bold text-[#ffb000] border-r border-[#1a2333]">
                          記録日時
                        </th>
                        <td className="p-2.5 text-zinc-300 font-mono">
                          {new Date(wikiLocation.created_at).toLocaleString('ja-JP')}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="p-3 text-xs rounded-sm border-l-4 bg-[#0d1627] border-[#32cd32] text-zinc-300">
                    <div className="font-bold mb-1 flex items-center gap-1.5 text-[#32cd32]">
                      <FileText className="w-3.5 h-3.5" />
                      <span>記録資料</span>
                    </div>
                    <p className="text-zinc-400 text-[11px] leading-relaxed font-mono">
                      このロケーションは、ウタペディア冒険の書に永久記録された関連資料です。
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#0d1627] border-t-2 border-[#1a2333] flex justify-end">
                  <button
                    onClick={handleCloseWikiLocation}
                    className="px-4 py-2 bg-[#1a2333] text-[#ffb000] text-xs font-bold font-mono border border-[#334155] hover:border-[#ffb000] transition-colors"
                  >
                    閉じる (ESC)
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <style>{`@keyframes wiki-modal-enter { from { opacity: 0; transform: translateY(8px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } } @media (prefers-reduced-motion: reduce) { .motion-safe\\:animate-\\[wiki-modal-enter_180ms_cubic-bezier\\(.22\\,.8\\,.35\\,1\\)\\] { animation: none !important; } }`}</style>
    </div>
  );
}

function PhotoImage({ storagePath, alt, className }: { storagePath: string; alt: string; className: string }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    getPhotoUrl(storagePath)
      .then((url) => {
        if (!active) {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url.startsWith('blob:') ? url : '';
        setSrc(url);
      })
      .catch(() => {
        if (active) setSrc('');
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [storagePath]);

  if (!src) return <div className={className} />;
  return <img src={src} alt={alt} className={className} />;
}