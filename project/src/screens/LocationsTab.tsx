import { useEffect, useRef, useState } from 'react';
import { Plus, MapPin, Trash2, Pencil, X, Search, ArrowUpDown, ChevronRight, AlertTriangle, Compass } from 'lucide-react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchLocations, createLocation, updateLocation, deleteLocation, getPhotoUrl } from '@/lib/db';
import { LocationForm } from '@/components/LocationForm';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';
import { ChestModal } from '@/components/ChestModal';
import { playConfirmSound, playToggleSound, playModalOpenSound, playModalCloseSound, playDeleteSound, playCancelSound, playErrorSound, playChestOpenSound } from '@/lib/sound';

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
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ロケーション名やメモを検索..."
            aria-label="ロケーションを検索"
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="min-h-[32px] min-w-[32px] flex items-center justify-center text-slate-400 hover:text-white" aria-label="検索をクリア">
              ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { playChestOpenSound(); setCollectionOpen(true); }}
            className="min-h-[44px] px-3.5 py-2.5 bg-[#12151f] border border-amber-500/50 text-amber-400 text-xs sm:text-sm font-bold hover:bg-amber-500/15 flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
            aria-label="宝箱コレクションを開く"
          >
            <span aria-hidden="true" className="relative block w-4 h-3.5 rounded-[1px] border border-amber-400 bg-[#cc8e00] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              <span className="absolute left-[-1px] right-[-1px] top-[2px] h-[2px] bg-[#12151f]" />
              <span className="absolute left-1/2 top-[3px] -translate-x-1/2 w-[2px] h-[3px] bg-amber-400" />
            </span>
            <span className="hidden sm:inline">CHEST</span>
            <span className="font-mono">({collectionItems.length})</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="min-h-[44px] flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 bg-amber-500 text-black text-xs sm:text-sm font-black border-b-3 border-amber-700 hover:bg-amber-400 active:border-b-0 active:translate-y-0.5 shadow-[0_2px_12px_rgba(245,158,11,0.25)] flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ 新規記録</span>
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <Spinner label="ロケーション記録を読み込み中" />}

      {!loading && locations.length === 0 && (
        <div className="py-16 text-center border-2 border-dashed border-[#2d3548] bg-[#141824]/60 p-6">
          <MapPin className="w-12 h-12 mx-auto text-slate-500 mb-3" />
          <p className="text-base font-bold text-white">ロケーションがありません</p>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">「+ 新規記録」から最初の拠点を登録してください。</p>
        </div>
      )}

      {!loading && locations.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3 text-xs text-slate-400 font-mono px-1">
            <span className="truncate">
              {normalizedQuery ? `「${searchQuery.trim()}」検索結果: ${sortedLocations.length}件` : `登録ロケーション: ${locations.length}件`}
            </span>
            <button
              type="button"
              onClick={() => { playToggleSound(); setSortOrder((current) => current === 'asc' ? 'desc' : 'asc'); }}
              className="min-h-[38px] shrink-0 inline-flex items-center gap-1.5 px-3 py-2 bg-[#12151f] border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500 text-[11px] transition-colors"
              aria-label="ロケーションの並び順を変更"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span>{sortOrder === 'asc' ? '古い順' : '新しい順'}</span>
            </button>
          </div>

          {sortedLocations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedLocations.map((loc, index) => (
                <LocationCard key={loc.id} index={index + 1} location={loc} onSelect={() => { playConfirmSound(); setSelectedLocation(loc); }} />
              ))}
            </div>
          ) : (
            <div className="py-14 text-center border-2 border-dashed border-[#2d3548] bg-[#141824]/60 p-6">
              <MapPin className="w-10 h-10 mx-auto text-slate-500 mb-3" />
              <p className="text-sm font-bold text-white">該当するロケーションが見つかりません</p>
              <p className="text-xs text-slate-400 mt-1">検索条件を変更してください。</p>
            </div>
          )}
        </>
      )}

      {collectionOpen && <ChestModal collectionItems={collectionItems} onClose={() => setCollectionOpen(false)} onOpenLocation={(location) => setSelectedLocation(location)} />}

      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm text-xs sm:text-sm font-sans">
          <button aria-label="閉じる" className="absolute inset-0" onClick={closeLocationDetail} />
          <div className="relative z-10 w-full max-w-lg bg-[#1e2330] border-2 border-amber-500/70 shadow-[0_0_40px_rgba(0,0,0,0.6)] overflow-hidden motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
            <div className="px-4 sm:px-5 py-3.5 bg-[#161a24] border-b-2 border-[#2d3548] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
                <h2 className="text-base font-bold text-white truncate">{selectedLocation.name}</h2>
              </div>
              <button type="button" onClick={closeLocationDetail} className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-300 hover:text-white text-lg cursor-pointer" aria-label="閉じる">×</button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {(() => {
                const mainPhoto = selectedLocation.photos.find((p) => p.is_main);
                return mainPhoto ? (
                  <div className="w-full h-36 sm:h-44 overflow-hidden bg-[#12151f] border border-[#2d3548]">
                    <PhotoImage storagePath={mainPhoto.storage_path} alt={selectedLocation.name} className="w-full h-full object-cover pixelated" />
                  </div>
                ) : null;
              })()}

              <div className="p-3.5 bg-[#12151f] border border-slate-700 flex items-center justify-around text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">X COORDINATE</div>
                  <div className="text-base font-bold text-emerald-400 font-mono">{selectedLocation.x}</div>
                </div>
                <div className="h-7 w-px bg-slate-700" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Y ELEVATION</div>
                  <div className="text-base font-bold text-emerald-400 font-mono">{selectedLocation.y}</div>
                </div>
                <div className="h-7 w-px bg-slate-700" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Z COORDINATE</div>
                  <div className="text-base font-bold text-cyan-300 font-mono">{selectedLocation.z}</div>
                </div>
              </div>

              {selectedLocation.detail_memo && (
                <div className="p-4 bg-[#141824] border border-[#2d3548]">
                  <h4 className="text-xs text-amber-400 font-bold uppercase mb-2">探索・観測メモ</h4>
                  <p className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">{selectedLocation.detail_memo}</p>
                </div>
              )}

              {selectedLocation.members.length > 0 && (
                <div>
                  <h4 className="text-xs text-cyan-400 font-bold uppercase mb-2">同行メンバー</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLocation.members.map((m) => (
                      <span key={m.id} className="px-2.5 py-1 bg-[#12151f] border border-cyan-500/40 text-cyan-300 text-xs font-medium">@{m.name}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-400 text-right font-mono">記録日時: {new Date(selectedLocation.created_at).toLocaleString('ja-JP')}</div>
            </div>

            <div className="px-4 sm:px-5 py-3.5 bg-[#161a24] border-t border-[#2d3548] flex items-center justify-end gap-2">
              <button type="button" onClick={handleDetailEdit} className="min-h-[40px] px-3.5 py-2 bg-[#12151f] text-slate-200 border border-slate-700 hover:border-amber-500 hover:text-amber-400 font-bold text-xs cursor-pointer">編集</button>
              <button type="button" onClick={() => handleDelete(selectedLocation)} className="min-h-[40px] px-3.5 py-2 bg-red-950/50 text-red-300 border border-red-800 hover:bg-red-900/60 font-bold text-xs cursor-pointer">削除</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-sans" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { playCancelSound(); setDeleteTarget(null); } }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-location-title" className="w-full max-w-md overflow-hidden bg-[#1e2330] border-2 border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <div className="px-5 pt-6 pb-5 text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-950/80 border-2 border-red-700 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]"><AlertTriangle className="w-7 h-7 text-red-400" /></div>
              <h2 id="delete-location-title" className="text-base sm:text-lg font-bold text-red-200 font-mono uppercase">ロケーションを抹消しますか？</h2>
              <p className="mt-2 text-sm text-amber-400 font-bold break-words">「{deleteTarget.name}」</p>
              <p className="mt-3 text-xs leading-5 text-slate-400 font-mono">この操作は冒険の書から元に戻せません。<br />保存された写真と座標データもすべて破棄されます。</p>
            </div>
            <div className="grid grid-cols-2 gap-3 px-5 pb-5">
              <button type="button" onClick={() => { playCancelSound(); setDeleteTarget(null); }} className="min-h-[40px] bg-[#12151f] border border-slate-700 text-slate-300 hover:text-white text-xs font-bold font-mono"><X className="w-4 h-4 inline mr-1" />キャンセル</button>
              <button type="button" onClick={confirmDelete} className="min-h-[40px] rounded-sm bg-red-800 border-2 border-red-500 text-white hover:bg-red-700 active:scale-[0.98] transition-all text-xs font-bold font-mono shadow-[0_0_15px_rgba(239,68,68,0.4)]"><Trash2 className="w-4 h-4 inline mr-1" />抹消する</button>
            </div>
          </div>
        </div>
      )}

      {mode.type !== 'list' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/85 backdrop-blur-sm font-sans" onMouseDown={(event) => { if (event.target === event.currentTarget) { playCancelSound(); closeModal(); } }}>
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#1e2330] border-2 border-amber-500/70 shadow-[0_0_40px_rgba(0,0,0,0.6)] motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
            <div className="px-4 sm:px-5 py-3 bg-[#161a24] border-b-2 border-[#2d3548] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xs px-2.5 py-0.5 border border-amber-500/50 bg-amber-500/15 text-amber-300 font-bold font-mono">{mode.type === 'edit' ? 'EDIT' : 'NEW'}</span>
                <h2 className="text-sm sm:text-base font-bold text-white">{mode.type === 'edit' ? 'ロケーション編集' : '新規拠点記録'}</h2>
              </div>
              <button type="button" onClick={() => { playCancelSound(); closeModal(); }} disabled={saving} className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-300 hover:text-white text-lg cursor-pointer" aria-label="閉じる">×</button>
            </div>
            <LocationForm worldId={world.id} members={world.members} editing={mode.type === 'edit' ? mode.location : null} onSave={handleSave} onComplete={handleComplete} onCancel={closeModal} saving={saving} />
          </div>
        </div>
      )}

      <style>{`@keyframes modal-enter { from { opacity: 0; transform: translateY(8px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } } @media (prefers-reduced-motion: reduce) { .motion-safe\\:animate-\\[modal-enter_180ms_cubic-bezier\\(.22,.8,.35,1)\\] { animation: none !important; } }`}</style>
    </div>
  );
}

function LocationCard({ location, index, onSelect }: { key?: string | number; location: LocationWithPhotos; index: number; onSelect: () => void }) {
  const mainPhoto = location.photos.find((p) => p.is_main) || location.photos[0];
  const locCode = String(index).padStart(2, '0');

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative text-left bg-[#1e2330] border-2 border-[#2d3548] hover:border-amber-500/80 p-4 flex flex-col justify-between transition-all duration-150 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] cursor-pointer w-full"
    >
      <div className="w-full">
        {mainPhoto ? (
          <div className="w-full h-36 mb-3 overflow-hidden bg-[#12151f] border border-[#2d3548]">
            <PhotoImage storagePath={mainPhoto.storage_path} alt={location.name} className="w-full h-full object-cover pixelated group-hover:scale-105 transition-transform duration-300" />
          </div>
        ) : (
          <div className="w-full h-36 mb-3 overflow-hidden bg-[#12151f] border border-[#2d3548] flex items-center justify-center">
            <MapPin className="w-10 h-10 text-slate-600" />
          </div>
        )}

        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/15 px-2 py-0.5 border border-cyan-500/40 shrink-0 font-mono">LOC_{locCode}</span>
            <h3 className="font-bold text-base text-white group-hover:text-amber-300 truncate">{location.name}</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono shrink-0">{new Date(location.created_at).toLocaleDateString('ja-JP')}</span>
        </div>

        <div className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-[#12151f] border border-slate-700 text-xs text-emerald-400 font-bold mb-3 font-mono">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>X: {location.x}</span>
          <span className="text-slate-600">|</span>
          <span>Y: {location.y}</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-300">Z: {location.z}</span>
        </div>

        {location.detail_memo && (
          <p className="text-xs sm:text-sm text-slate-200 line-clamp-3 leading-relaxed mb-3 bg-[#141824]/80 p-2.5 border border-[#2d3548]">{location.detail_memo}</p>
        )}

        {location.members.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {location.members.map((m) => (
              <span key={m.id} className="text-xs px-2 py-0.5 bg-[#12151f] border border-cyan-500/40 text-cyan-300 font-medium">@{m.name}</span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-[#2d3548] flex items-center justify-end text-xs text-slate-500">
        <span className="flex items-center gap-1 group-hover:text-amber-400 transition-colors">詳細を見る <ChevronRight className="w-4 h-4" /></span>
      </div>
    </button>
  );
}

function PhotoImage({ storagePath, alt, className }: { storagePath: string; alt: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setSrc(null);
    getPhotoUrl(storagePath)
      .then((url) => {
        if (!active) {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url.startsWith('blob:') ? url : null;
        setSrc(url);
      })
      .catch(() => {
        if (active) setSrc(null);
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [storagePath]);
  if (!src) return <div className={className} aria-hidden="true" />;
  return <img src={src} alt={alt} className={className} />;
}