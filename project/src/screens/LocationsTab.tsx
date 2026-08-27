import { useEffect, useRef, useState } from 'react';
import { Plus, MapPin, Trash2, Search, ArrowUpDown, AlertTriangle } from 'lucide-react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchLocations, createLocation, updateLocation, deleteLocation, getPhotoUrl } from '@/lib/db';
import { LocationForm } from '@/components/LocationForm';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import { ChestModal } from '@/components/ChestModal';
import { LocationCard } from '@/components/LocationCard';
import { LocationDetailModal } from '@/components/LocationDetailModal';
import { playConfirmSound, playRecordSelectSound, playToggleSound, playModalOpenSound, playModalCloseSound, playDeleteSound, playCancelSound, playErrorSound, playChestOpenSound, playHoverSound, playInputFocusSound } from '@/lib/sound';

type Mode =
  | { type: 'list' }
  | { type: 'create' }
  | { type: 'edit'; location: LocationWithPhotos };

type SortOrder = 'asc' | 'desc';

type CollectionItem = { location: LocationWithPhotos; storagePath: string };

type LocationFormInput = {
  name: string;
  x: number;
  y: number;
  z: number;
  detail_memo: string;
  created_at: string;
  member_ids: string[];
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

  const handleSave = async (input: LocationFormInput): Promise<string> => {
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

  const openCreateModal = () => {
    playConfirmSound();
    setMode({ type: 'create' });
  };

  const closeModal = () => {
    if (saving) return;
    playModalCloseSound();
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
    playModalOpenSound();
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
    <div className="space-y-4 sm:space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between bg-[#1e2330] p-3 sm:p-4 border-2 border-[#2d3548] shadow-md">
        <div className="flex-1 flex items-center gap-2 bg-[#12151f] border border-slate-700 px-3.5 py-2.5 focus-within:border-amber-500 min-h-[44px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={playInputFocusSound} placeholder="ロケーション名やメモを検索..." aria-label="ロケーションを検索" className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none" />
          {searchQuery && <button type="button" onClick={() => setSearchQuery('')} onMouseEnter={playHoverSound} className="min-h-[32px] min-w-[32px] flex items-center justify-center text-slate-400 hover:text-white" aria-label="検索をクリア">×</button>}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => { playChestOpenSound(); setCollectionOpen(true); }} onMouseEnter={playHoverSound} className="min-h-[44px] px-3.5 py-2.5 bg-[#12151f] border border-amber-500/50 text-amber-400 text-xs sm:text-sm font-bold hover:bg-amber-500/15 flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer" aria-label="宝箱コレクションを開く">
            <span aria-hidden="true" className="relative block w-4 h-3.5 rounded-[1px] border border-amber-400 bg-[#cc8e00] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"><span className="absolute left-[-1px] right-[-1px] top-[2px] h-[2px] bg-[#12151f]" /><span className="absolute left-1/2 top-[3px] -translate-x-1/2 w-[2px] h-[3px] bg-amber-400" /></span>
            <span className="hidden sm:inline">CHEST</span><span className="font-mono">({collectionItems.length})</span>
          </button>
          <button type="button" onClick={openCreateModal} onMouseEnter={playHoverSound} className="min-h-[44px] flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 bg-amber-500 text-black text-xs sm:text-sm font-black border-b-3 border-amber-700 hover:bg-amber-400 active:border-b-0 active:translate-y-0.5 shadow-[0_2px_12px_rgba(245,158,11,0.25)] flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"><Plus className="w-4 h-4 stroke-[3]" /><span>+ 新規記録</span></button>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <Spinner label="ロケーション記録を読み込み中" />}

      {!loading && locations.length === 0 && (
        <div className="py-16 text-center border-2 border-dashed border-[#2d3548] bg-[#141824]/60 p-6"><MapPin className="w-12 h-12 mx-auto text-slate-500 mb-3" /><p className="text-base font-bold text-white">ロケーションがありません</p><p className="text-xs sm:text-sm text-slate-400 mt-1">「+ 新規記録」から最初の拠点を登録してください。</p></div>
      )}

      {!loading && locations.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3 text-xs text-slate-400 font-mono px-1">
            <span className="truncate">{normalizedQuery ? `「${searchQuery.trim()}」検索結果: ${sortedLocations.length}件` : `登録ロケーション: ${locations.length}件`}</span>
            <button type="button" onClick={() => { playToggleSound(); setSortOrder((current) => current === 'asc' ? 'desc' : 'asc'); }} onMouseEnter={playHoverSound} className="min-h-[38px] shrink-0 inline-flex items-center gap-1.5 px-3 py-2 bg-[#12151f] border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500 text-[11px] transition-colors" aria-label="ロケーションの並び順を変更"><ArrowUpDown className="w-3.5 h-3.5 text-amber-400" /><span>{sortOrder === 'asc' ? '古い順' : '新しい順'}</span></button>
          </div>
          {sortedLocations.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{sortedLocations.map((loc, index) => <LocationCard key={loc.id} index={index + 1} location={loc} onSelect={() => { playRecordSelectSound(); setSelectedLocation(loc); }} PhotoImage={PhotoImage} />)}</div> : <div className="py-14 text-center border-2 border-dashed border-[#2d3548] bg-[#141824]/60 p-6"><MapPin className="w-10 h-10 mx-auto text-slate-500 mb-3" /><p className="text-sm font-bold text-white">該当するロケーションが見つかりません</p><p className="text-xs text-slate-400 mt-1">検索条件を変更してください。</p></div>}
        </>
      )}

      {collectionOpen && <ChestModal collectionItems={collectionItems} onClose={() => setCollectionOpen(false)} onOpenLocation={(location) => setSelectedLocation(location)} />}

      {selectedLocation && <LocationDetailModal location={selectedLocation} onClose={closeLocationDetail} onEdit={handleDetailEdit} onDelete={() => handleDelete(selectedLocation)} PhotoImage={PhotoImage} />}

      {deleteTarget && <DeleteLocationConfirmModal location={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />}

      {mode.type !== 'list' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/85 backdrop-blur-sm font-sans" onMouseDown={(event) => { if (event.target === event.currentTarget) { playCancelSound(); closeModal(); } }}>
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#1e2330] border-2 border-amber-500/70 shadow-[0_0_40px_rgba(0,0,0,0.6)] motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
            <div className="px-4 sm:px-5 py-3 bg-[#161a24] border-b-2 border-[#2d3548] flex items-center justify-between"><div className="flex items-center gap-2.5"><span className="text-xs px-2.5 py-0.5 border border-amber-500/50 bg-amber-500/15 text-amber-300 font-bold font-mono">{mode.type === 'edit' ? 'EDIT' : 'NEW'}</span><h2 className="text-sm sm:text-base font-bold text-white">{mode.type === 'edit' ? 'ロケーション編集' : '新規拠点記録'}</h2></div><button type="button" onClick={() => { playCancelSound(); closeModal(); }} onMouseEnter={playHoverSound} disabled={saving} className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-300 hover:text-white text-lg cursor-pointer" aria-label="閉じる">×</button></div><LocationForm worldId={world.id} members={world.members} editing={mode.type === 'edit' ? mode.location : null} onSave={handleSave} onComplete={handleComplete} onCancel={closeModal} saving={saving} /></div></div>}

      <style>{`@keyframes modal-enter { from { opacity: 0; transform: translateY(8px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } } @media (prefers-reduced-motion: reduce) { .motion-safe\\:animate-\\[modal-enter_180ms_cubic-bezier\\(.22\\,.8\\,.35\\,1)\\] { animation: none !important; } }`}</style>
    </div>
  );
}

function PhotoImage({ storagePath, alt, className }: { storagePath: string; alt: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => { let active = true; let objectUrl: string | null = null; setSrc(null); getPhotoUrl(storagePath).then((url) => { if (!active) { if (url.startsWith('blob:')) URL.revokeObjectURL(url); return; } objectUrl = url.startsWith('blob:') ? url : null; setSrc(url); }).catch(() => { if (active) setSrc(null); }); return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); }; }, [storagePath]);
  if (!src) return <div className={className} aria-hidden="true" />;
  return <img src={src} alt={alt} className={className} />;
}
