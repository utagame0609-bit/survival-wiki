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
    <div className="min-h-screen overflow-y-scroll [scrollbar-gutter:stable] bg-[#11120f] text-stone-100 flex flex-col">
      <Header title={worldName} onBack={handleWorldBack} />
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
                  <button key={t.id} onClick={() => handleTabChange(t.id)} className={`flex-1 h-12 flex items-center justify-center gap-1.5 text-sm font-medium transition-colors relative ${tab === t.id ? 'text-emerald-400' : 'text-stone-500 hover:text-stone-300'}`}>
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
            {tab === 'wiki' && <WikiTab key={wikiArticleViewKey} world={world} reloadKey={reloadKey} onOpenLocation={handleOpenLocation} onArticleStateChange={handleWikiArticleStateChange} />}
          </div>

          {!wikiArticleBack && <SettingsButton />}

          {wikiLocation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <button aria-label="閉じる" className="absolute inset-0" onClick={handleCloseWikiLocation} />
              <div className="relative z-10 w-full max-w-lg max-h-[80vh] overflow-hidden bg-white text-gray-800 border border-gray-300 shadow-2xl flex flex-col font-serif motion-safe:animate-[wiki-modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
                <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0 border-b border-gray-300 bg-gray-100 text-gray-600">
                  <span className="text-xs tracking-wider flex items-center gap-2">
                    <img src={UTAPEDIA_AVATAR} alt="ウタペディア" className="w-6 h-6 object-cover border border-gray-300" />
                    <span className="text-sm font-serif">ウタペディア</span>
                    <span className="text-gray-400">//</span>
                    <span>ロケーション詳細</span>
                  </span>
                  <button onClick={handleCloseWikiLocation} aria-label="閉じる" className="p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"><X className="w-[18px] h-[18px]" /></button>
                </div>
                <div className="overflow-y-auto overscroll-contain p-5 space-y-4">
                  <h2 className="text-xl font-bold border-b border-gray-300 pb-2 text-gray-900 break-words">{wikiLocation.name}</h2>
                  <div className="p-1.5 border border-gray-300 bg-gray-50">
                    {(() => { const mainPhoto = wikiLocation.photos.find((photo) => photo.is_main); return mainPhoto ? <PhotoImage storagePath={mainPhoto.storage_path} alt={wikiLocation.name} className="w-full h-48 object-cover" /> : <div className="w-full h-48 bg-gray-100 flex items-center justify-center"><MapPin className="w-12 h-12 text-gray-300" /></div>; })()}
                  </div>
                  <table className="w-full text-sm border-collapse border border-gray-300"><tbody><tr className="border-b border-gray-300"><th className="w-1/3 bg-gray-100 p-2 text-left text-xs font-semibold text-gray-700 border-r border-gray-300">座標 (X, Y, Z)</th><td className="p-2 font-mono text-xs">{wikiLocation.x}, {wikiLocation.y}, {wikiLocation.z}</td></tr><tr><th className="bg-gray-100 p-2 text-left text-xs font-semibold text-gray-700 border-r border-gray-300">記録日時</th><td className="p-2 text-xs">{new Date(wikiLocation.created_at).toLocaleString('ja-JP')}</td></tr></tbody></table>
                  <div className="p-3 text-xs border-l-4 bg-amber-50/50 border-amber-400 text-gray-700"><div className="font-semibold mb-1 flex items-center gap-1"><FileText className="w-[13px] h-[13px]" /> 記録資料</div><p className="text-gray-500">このロケーションは、ウタペディアに記録された関連資料です。</p></div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <style>{`@keyframes wiki-modal-enter { from { opacity: 0; transform: translateY(8px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } } @media (prefers-reduced-motion: reduce) { .motion-safe\\:animate-\\[wiki-modal-enter_180ms_cubic-bezier\\(.22\\,.8\\,35\\,1\\)\\] { animation: none !important; } }`}</style>
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
