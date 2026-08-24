import { useEffect, useRef, useState } from 'react';
import { Plus, MapPin, Trash2, Pencil, X, Search, ArrowUpDown, ChevronRight, AlertTriangle } from 'lucide-react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchLocations, createLocation, updateLocation, deleteLocation, getPhotoUrl } from '@/lib/db';
import { LocationForm } from '@/components/LocationForm';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';
import { playConfirmSound, playToggleSound, playModalOpenSound, playModalCloseSound, playDeleteSound, playCancelSound, playErrorSound } from '@/lib/sound';

type Mode =
  | { type: 'list' }
  | { type: 'create' }
  | { type: 'edit'; location: LocationWithPhotos };

type SortOrder = 'asc' | 'desc';

type CollectionItem = {
  location: LocationWithPhotos;
  storagePath: string;
};

export function LocationsTab({ world, reloadKey, onReload, openLocationId, onOpenLocationHandled }: { world: WorldWithMembers; reloadKey: number; onReload: () => void; openLocationId?: string | null; onOpenLocationHandled?: () => void }) {
  const [locations, setLocations] = useState<LocationWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>({ type: 'list' });
  const [saving, setSaving] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationWithPhotos | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LocationWithPhotos | null>(null);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const loadRequestRef = useRef(0);

  const load = async () => {
    const requestId = ++loadRequestRef.current;
    setLoading(true);
    try {
      const nextLocations = await fetchLocations(world.id);
      if (requestId !== loadRequestRef.current) return;
      setLocations(nextLocations);
    } catch (e) {
      if (requestId !== loadRequestRef.current) return;
      setError((e as Error).message);
    } finally {
      if (requestId === loadRequestRef.current) setLoading(false);
    }
  };

  useEffect(() => { load(); }, [world.id, reloadKey]);

  useEffect(() => {
    if (!openLocationId || loading) return;
    const location = locations.find((loc) => loc.id === openLocationId);
    if (!location) return;
    setSelectedLocation(location);
    onOpenLocationHandled?.();
  }, [openLocationId, loading, locations, onOpenLocationHandled]);

  const handleSave = async (input: { name: string; x: number; y: number; z: number; detail_memo: string; created_at: string; member_ids: string[] }): Promise<string> => {
    setSaving(true);
    try {
      if (mode.type === 'edit') {
        await updateLocation(mode.location.id, input);
        return mode.location.id;
      }
      const loc = await createLocation(world.id, input);
      return loc.id;
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    try {
      await load();
      setMode({ type: 'list' });
      onReload();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDelete = (loc: LocationWithPhotos) => {
    playErrorSound();
    setDeleteTarget(loc);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const locationId = deleteTarget.id;
    setDeleteTarget(null);
    playDeleteSound();
    try {
      await deleteLocation(locationId);
      setSelectedLocation((prev) => (prev?.id === locationId ? null : prev));
      onReload();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const closeModal = () => {
    if (saving) return;
    setMode({ type: 'list' });
  };

  const closeLocationDetail = () => {
    playModalCloseSound();
    setSelectedLocation(null);
  };

  const handleDetailEdit = () => {
    if (!selectedLocation) return;
    const location = selectedLocation;
    setSelectedLocation(null);
    setMode({ type: 'edit', location });
  };

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const filteredLocations = normalizedQuery
    ? locations.filter((loc) => loc.name.toLocaleLowerCase().includes(normalizedQuery) || loc.detail_memo?.toLocaleLowerCase().includes(normalizedQuery))
    : locations;

  const sortedLocations = [...filteredLocations].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
  });

  const collectionItems: CollectionItem[] = locations
    .flatMap((location) => location.photos.map((photo) => ({ location, storagePath: photo.storage_path, createdAt: photo.created_at })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(({ location, storagePath }) => ({ location, storagePath }));

  return (
    <div className="min-h-full bg-[#11120f] text-stone-100 px-4 py-4 max-w-3xl mx-auto">
      <div className="mb-4 space-y-3">
        <button onClick={() => { playConfirmSound(); setMode({ type: 'create' }); }} className="selectable-pulse group w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-950/55 via-zinc-900/95 to-zinc-900/90 border border-emerald-900/60 text-emerald-300 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.10)] hover:from-emerald-900/45 hover:via-zinc-900/95 hover:to-zinc-900/90 hover:border-emerald-500/60 hover:text-emerald-200 hover:shadow-[0_0_20px_rgba(16,185,129,0.14)] active:scale-[0.99] transition-all">
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" /> ロケーションを追加
        </button>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/70 pointer-events-none" />
          <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ロケーション名やメモで検索..." aria-label="ロケーションを検索" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-950/25 via-zinc-900/90 to-zinc-900/85 border border-emerald-950/70 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none transition-all focus:border-emerald-700/70 focus:shadow-[0_0_14px_rgba(16,185,129,0.06)] focus:ring-1 focus:ring-emerald-500/20" />
        </div>
      </div>
      {error && <ErrorBanner message={error} />}
      {loading && <Spinner label="ロケーションを読み込み中" />}
      {!loading && locations.length === 0 && <EmptyState message="ロケーションがありません。追加ボタンから記録を始めよう。" />}
      {!loading && locations.length > 0 && <>
        <div className="flex justify-between items-center px-1 mb-2.5 text-[11px] text-stone-500 font-mono gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button type="button" onClick={() => setCollectionOpen(true)} aria-label="コレクションを開く" title="コレクション" className="group shrink-0 w-9 h-8 rounded-lg border border-emerald-900/60 bg-emerald-950/20 hover:border-emerald-600/70 hover:bg-emerald-950/30 active:scale-[0.96] transition-all flex items-center justify-center">
              <span aria-hidden="true" className="relative block w-[18px] h-[15px] rounded-[2px] border border-amber-700/80 bg-gradient-to-b from-amber-700/90 to-amber-900/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(0,0,0,0.35)]">
                <span className="absolute left-[-1px] right-[-1px] top-[3px] h-[3px] border-y border-amber-500/60 bg-amber-800/90" />
                <span className="absolute left-1/2 top-[4px] -translate-x-1/2 w-[3px] h-[4px] rounded-[1px] border border-amber-300/60 bg-amber-500/80" />
              </span>
            </button>
            {normalizedQuery && <span className="truncate text-zinc-600">「{searchQuery.trim()}」で検索中</span>}
          </div>
          <button type="button" onClick={() => { playToggleSound(); setSortOrder((current) => current === 'asc' ? 'desc' : 'asc'); }} className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-900/60 bg-emerald-950/20 text-zinc-400 hover:text-emerald-300 hover:border-emerald-700/50 hover:bg-emerald-950/30 transition-colors" aria-label="ロケーションの並び順を変更">
            <ArrowUpDown className="w-3 h-3 text-emerald-400" />{sortOrder === 'asc' ? '古い順' : '新しい順'}
          </button>
        </div>
        {sortedLocations.length > 0 ? <div className="space-y-2.5">{sortedLocations.map((loc) => <LocationCard key={loc.id} loc={loc} onToggle={() => { playModalOpenSound(); setSelectedLocation(loc); }} />)}</div> : <EmptyState message="該当するロケーションがありません。" />}
      </>}

      {collectionOpen && (
        <div className="fixed inset-0 z-40 bg-[#11120f] text-stone-100 overflow-y-auto">
          <div className="min-h-full px-4 py-4 max-w-3xl mx-auto">
            <div className="flex items-center justify-between h-12 border-b border-[#2d3028] mb-5">
              <div className="flex items-center gap-2">
                <span className="relative block w-5 h-4 rounded-[2px] border border-amber-700/80 bg-gradient-to-b from-amber-700/90 to-amber-900/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(0,0,0,0.35)]" aria-hidden="true">
                  <span className="absolute left-[-1px] right-[-1px] top-[4px] h-[3px] border-y border-amber-500/60 bg-amber-800/90" />
                  <span className="absolute left-1/2 top-[5px] -translate-x-1/2 w-[3px] h-[4px] rounded-[1px] border border-amber-300/60 bg-amber-500/80" />
                </span>
                <h2 className="text-sm font-semibold tracking-[0.14em] text-zinc-200">COLLECTION</h2>
              </div>
              <button type="button" onClick={() => setCollectionOpen(false)} aria-label="コレクションを閉じる" className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:bg-[#292b24] hover:text-stone-100 active:scale-[0.96] transition-all"><X className="w-5 h-5" /></button>
            </div>
            {collectionItems.length === 0 ? (
              <EmptyState message="まだ記録写真がありません。" />
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                {collectionItems.map((item) => <CollectionSlot key={`${item.location.id}-${item.storagePath}`} item={item} onOpen={() => { playModalOpenSound(); setSelectedLocation(item.location); }} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <button aria-label="閉じる" className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={closeLocationDetail} />
          <div className="relative z-10 w-full max-w-2xl max-h-[calc(100vh-24px)] sm:max-h-[calc(100vh-48px)] overflow-hidden bg-[#1b1c18] text-stone-100 border border-[#34372f] shadow-2xl flex flex-col motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
            <div className="flex items-center justify-between px-4 sm:px-5 h-12 flex-shrink-0 border-b border-[#34372f] bg-[#171813]"><h2 className="text-sm sm:text-base font-semibold text-stone-100">ロケーション</h2><button onClick={closeLocationDetail} aria-label="閉じる" className="w-8 h-8 flex items-center justify-center text-stone-400 hover:bg-[#292b24] hover:text-stone-100"><X className="w-5 h-5" /></button></div>
            <div className="overflow-y-auto overscroll-contain">
              {(() => {
                const mainPhoto = selectedLocation.photos.find((p) => p.is_main);
                return <div className="p-4 sm:p-5 space-y-4">
                  {mainPhoto ? <div className="group w-full h-56 sm:h-72 overflow-hidden bg-[#24271f]"><img src={getPhotoUrl(mainPhoto.storage_path)} alt={selectedLocation.name} className="w-full h-full object-cover" /></div> : <div className="w-full h-56 sm:h-72 bg-[#24271f] flex items-center justify-center"><MapPin className="w-12 h-12 text-stone-600" /></div>}
                  <div><h3 className="text-2xl sm:text-3xl font-bold text-stone-100 break-words">{selectedLocation.name}</h3>
                    <div className="mt-4 bg-[#20221d] border border-[#34372f] p-4 sm:p-5"><div className="flex items-center gap-2 text-sm text-stone-400 mb-3"><MapPin className="w-4 h-4 text-emerald-400" />座標</div><div className="grid grid-cols-3 gap-3 text-center font-mono">
                      <div><div className="text-sm sm:text-base font-semibold italic text-stone-300">X</div><div className="mt-1 text-xl sm:text-2xl font-semibold text-stone-100">{selectedLocation.x}</div></div>
                      <div><div className="text-sm sm:text-base font-semibold italic text-stone-300">Y</div><div className="mt-1 text-xl sm:text-2xl font-semibold text-stone-100">{selectedLocation.y}</div></div>
                      <div><div className="text-sm sm:text-base font-semibold italic text-stone-300">Z</div><div className="mt-1 text-xl sm:text-2xl font-semibold text-stone-100">{selectedLocation.z}</div></div>
                    </div></div>
                  </div>
                  <div className="flex gap-3 pt-1"><button onClick={() => { playConfirmSound(); handleDetailEdit(); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#292b24] border border-[#3a3d34] text-stone-200 font-medium hover:bg-[#34382e] active:scale-[0.98] transition-all"><Pencil className="w-4 h-4" />編集</button><button onClick={() => handleDelete(selectedLocation)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-950/40 text-red-300 border border-red-900/40 font-medium hover:bg-red-950/60 hover:border-red-800 hover:text-red-200 active:scale-[0.98] transition-all"><Trash2 className="w-4 h-4" />削除</button></div>
                </div>;
              })()}
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { playCancelSound(); setDeleteTarget(null); } }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-location-title" className="w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900 to-[#151712] border border-emerald-900/70 shadow-[0_0_40px_rgba(0,0,0,0.55),0_0_24px_rgba(16,185,129,0.08)]">
            <div className="px-5 pt-6 pb-5 text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-950/50 border border-red-900/60 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.12)]"><AlertTriangle className="w-7 h-7 text-red-300" /></div>
              <h2 id="delete-location-title" className="text-lg font-bold text-zinc-100">ロケーションを削除しますか？</h2>
              <p className="mt-2 text-sm text-emerald-300 font-semibold break-words">「{deleteTarget.name}」</p>
              <p className="mt-3 text-xs leading-5 text-zinc-500">この操作は元に戻せません。<br />このロケーションに保存されている写真も削除されます。</p>
            </div>
            <div className="grid grid-cols-2 gap-3 px-5 pb-5">
              <button type="button" onClick={() => { playCancelSound(); setDeleteTarget(null); }} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-950/80 border border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-600 hover:text-zinc-100 active:scale-[0.98] transition-all"><X className="w-4 h-4" />キャンセル</button>
              <button type="button" onClick={confirmDelete} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-950/70 border border-red-900/70 text-red-200 hover:bg-red-900/60 hover:border-red-800 hover:text-red-100 active:scale-[0.98] transition-all"><Trash2 className="w-4 h-4" />削除する</button>
            </div>
          </div>
        </div>
      )}

      {mode.type !== 'list' && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) { playCancelSound(); closeModal(); } }}>
        <div className="w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl bg-gradient-to-r from-emerald-950/20 via-zinc-900/95 to-zinc-900/90 border border-emerald-900/60 shadow-[0_0_28px_rgba(16,185,129,0.08),0_20px_50px_rgba(0,0,0,0.45)] motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/90">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" /><h2 className="text-lg font-semibold text-zinc-100">{mode.type === 'edit' ? 'ロケーション編集' : 'ロケーション追加'}</h2></div>
            <button type="button" onClick={() => { playCancelSound(); closeModal(); }} disabled={saving} aria-label="閉じる" className="w-9 h-9 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/70 flex items-center justify-center transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="overflow-y-auto overscroll-contain"><LocationForm worldId={world.id} members={world.members} editing={mode.type === 'edit' ? mode.location : null} onSave={handleSave} onComplete={handleComplete} onCancel={closeModal} saving={saving} /></div>
        </div>
      </div>}
      <style>{`@keyframes modal-enter { from { opacity: 0; transform: translateY(8px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } } @media (prefers-reduced-motion: reduce) { .motion-safe\\:animate-\\[modal-enter_180ms_cubic-bezier\\(.22\\,.8\\.35\\,1)\\] { animation: none !important; } }`}</style>
    </div>
  );
}

function LocationCard({ loc, onToggle }: { loc: LocationWithPhotos; onToggle: () => void }) {
  const mainPhoto = loc.photos.find((p) => p.is_main);
  return <div className="selectable-pulse group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-950/20 via-zinc-900/90 to-zinc-900/85 border border-emerald-950/70 shadow-[0_0_16px_rgba(16,185,129,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:from-emerald-950/30 hover:via-zinc-900/90 hover:to-zinc-900/90 hover:border-emerald-700/60 hover:shadow-[0_0_18px_rgba(16,185,129,0.08)]">
    <button onClick={onToggle} className="w-full text-left active:scale-[0.99] transition-transform">
      <div className="flex gap-3.5 p-3.5 pr-4">
        {mainPhoto ? <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0"><img src={getPhotoUrl(mainPhoto.storage_path)} alt={loc.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" /></div> : <div className="w-20 h-20 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0"><MapPin className="w-7 h-7 text-zinc-700" /></div>}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-2.5">
          <div className="flex items-center gap-1.5 min-w-0"><MapPin className="w-4 h-4 text-emerald-400 shrink-0" /><div className="font-semibold text-zinc-100 truncate">{loc.name}</div><ChevronRight className="w-4 h-4 text-zinc-600 shrink-0 ml-auto" /></div>
          <div className="text-xs text-zinc-500 font-mono truncate">{loc.x}, {loc.y}, {loc.z}</div>
          {loc.detail_memo && <div className="text-xs text-zinc-500 truncate">{loc.detail_memo}</div>}
        </div>
      </div>
    </button>
  </div>;
}

function CollectionSlot({ item, onOpen }: { item: CollectionItem; onOpen: () => void }) {
  return <button type="button" onClick={onOpen} className="group aspect-square rounded-md border border-zinc-700/90 bg-[#1b1c18] p-1.5 sm:p-2 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),inset_0_0_14px_rgba(0,0,0,0.45)] hover:border-emerald-700/70 hover:bg-[#20221d] active:scale-[0.98] transition-all">
    <div className="relative w-full h-full overflow-hidden rounded-sm bg-zinc-950 border border-zinc-800/90">
      <img src={getPhotoUrl(item.storagePath)} alt={item.location.name} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]" />
      <div className="absolute inset-x-0 bottom-0 px-1.5 py-1 bg-gradient-to-t from-black/80 via-black/45 to-transparent pt-4">
        <div className="text-[10px] sm:text-[11px] text-zinc-200 truncate">{item.location.name}</div>
      </div>
    </div>
  </button>;
}