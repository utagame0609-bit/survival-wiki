import { useEffect, useRef, useState } from 'react';
import { Plus, MapPin, Trash2, Pencil, X, Search, ArrowUpDown, ChevronRight, AlertTriangle, Compass, Shield, Sparkles } from 'lucide-react';
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
    <div className="min-h-full bg-[#0a1120] text-[#e2e8f0] px-4 sm:px-6 py-6 max-w-4xl mx-auto font-dot">
      {/* Action Header: Create Command & Retro Item Search */}
      <div className="mb-6 space-y-3">
        {/* Command Button: Add Location (Elegant Dark Hero Button) */}
        <button
          onClick={() => { playConfirmSound(); setMode({ type: 'create' }); }}
          className="group w-full flex items-center justify-center gap-3 px-5 py-4 rounded-sm bg-[#ffb000] text-[#0a1120] font-black text-sm sm:text-base border-2 border-[#ffb000] shadow-[0_0_20px_rgba(255,176,0,0.25)] hover:bg-white hover:border-white hover:text-[#0a1120] active:scale-[0.99] transition-all"
        >
          <span className="text-[#0a1120] font-mono text-sm group-hover:translate-x-0.5 transition-transform">▶</span>
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform text-[#0a1120]" />
          <span className="tracking-wide">新たなロケーションを記録する (NEW LOG)</span>
        </button>

        {/* Item Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#32cd32] pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="探検ログ・地名や調査メモを検索..."
            aria-label="ロケーションを検索"
            className="w-full pl-10 pr-4 py-3 rounded-sm bg-[#0d1627] border-2 border-[#334155] text-xs sm:text-sm text-[#e2e8f0] placeholder:text-zinc-500 outline-none transition-all focus:border-[#32cd32] focus:shadow-[0_0_15px_rgba(50,205,50,0.2)]"
          />
        </div>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <Spinner label="ロケーション記録を読み込み中" />}
      {!loading && locations.length === 0 && <EmptyState message="ロケーションがありません。上記の追加コマンドから最初の拠点を記録しよう。" />}

      {!loading && locations.length > 0 && (
        <>
          {/* Sub-bar: Treasure chest & Sort order */}
          <div className="flex justify-between items-center px-1 mb-4 text-xs text-zinc-400 font-mono gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {/* Treasure Chest Button */}
              <button
                type="button"
                onClick={() => { playChestOpenSound(); setCollectionOpen(true); }}
                aria-label="コレクションを開く"
                title="宝箱・写真コレクション"
                className="command-btn shrink-0 px-3 py-2 rounded-sm bg-[#1a2333] text-[#ffb000] hover:text-[#ffb000] active:scale-[0.96] transition-all flex items-center gap-2"
              >
                <span aria-hidden="true" className="relative block w-4 h-3.5 rounded-[1px] border border-[#ffb000] bg-[#cc8e00] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                  <span className="absolute left-[-1px] right-[-1px] top-[2px] h-[2px] bg-[#0a1120]" />
                  <span className="absolute left-1/2 top-[3px] -translate-x-1/2 w-[2px] h-[3px] bg-[#ffb000]" />
                </span>
                <span className="text-[11px] font-bold">宝箱コレクション</span>
              </button>
              {normalizedQuery && <span className="truncate text-zinc-500 text-[11px]">「{searchQuery.trim()}」検索結果</span>}
            </div>

            {/* Sort Toggle */}
            <button
              type="button"
              onClick={() => { playToggleSound(); setSortOrder((current) => current === 'asc' ? 'desc' : 'asc'); }}
              className="command-btn shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-[#1a2333] text-zinc-300 hover:text-[#ffb000] text-[11px]"
              aria-label="ロケーションの並び順を変更"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#ffb000]" />
              <span>{sortOrder === 'asc' ? '古い順' : '新しい順'}</span>
            </button>
          </div>

          {/* Location Cards (Save-slot window style) */}
          {sortedLocations.length > 0 ? (
            <div className="space-y-3">
              {sortedLocations.map((loc, index) => (
                <LocationCard
                  key={loc.id}
                  slotNumber={index + 1}
                  loc={loc}
                  onToggle={() => { playModalOpenSound(); setSelectedLocation(loc); }}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="該当するロケーションが見つかりません。" />
          )}
        </>
      )}

      {/* Collection / Treasure Chest Modal */}
      {collectionOpen && (
        <ChestModal
          collectionItems={collectionItems}
          onClose={() => setCollectionOpen(false)}
          onOpenLocation={(location) => setSelectedLocation(location)}
        />
      )}

      {/* Location Detail Modal - RPG Save Slot / Status View */}
      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 font-dot">
          <button aria-label="閉じる" className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeLocationDetail} />
          <div className="relative z-10 w-full max-w-2xl max-h-[calc(100vh-24px)] sm:max-h-[calc(100vh-48px)] overflow-hidden rounded-sm bg-[#0a1120] text-[#e2e8f0] border-4 border-double border-[#ffb000] shadow-[0_0_30px_rgba(255,176,0,0.25)] flex flex-col motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0 border-b-2 border-[#1a2333] bg-[#0d1627]">
              <div className="flex items-center gap-2">
                <span className="text-[#ffb000] font-mono text-sm">▶</span>
                <h2 className="text-sm sm:text-base font-bold text-[#ffb000] uppercase tracking-wide">
                  LOCATION STATUS // 拠点詳細記録
                </h2>
              </div>
              <button
                onClick={closeLocationDetail}
                aria-label="閉じる"
                className="p-1 rounded-sm text-zinc-400 hover:bg-[#1a2333] hover:text-[#ffb000] transition-colors border border-transparent hover:border-[#334155]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto overscroll-contain">
              {(() => {
                const mainPhoto = selectedLocation.photos.find((p) => p.is_main);
                return (
                  <div className="p-5 sm:p-6 space-y-5">
                    {mainPhoto ? (
                      <div className="group w-full h-56 sm:h-64 rounded-sm overflow-hidden bg-[#050a14] border-2 border-[#334155]">
                        <PhotoImage storagePath={mainPhoto.storage_path} alt={selectedLocation.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-56 sm:h-64 rounded-sm bg-[#0d1627] border-2 border-[#334155] flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-zinc-600" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 border-l-4 border-[#ffb000] pl-3">
                        <h3 className="text-xl sm:text-2xl font-bold text-[#ffb000] break-words">
                          {selectedLocation.name}
                        </h3>
                      </div>

                      {/* Coordinates Stats Display */}
                      <div className="mt-4 bg-[#0d1627] border-2 border-[#1a2333] rounded-sm p-4 sm:p-5">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#32cd32] mb-3 font-mono">
                          <Compass className="w-4 h-4 text-[#32cd32]" />
                          <span>WORLD COORDINATES // 空間座標</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center font-mono">
                          <div className="p-3 rounded-sm bg-[#050a14] border border-[#1a2333]">
                            <div className="text-xs font-bold text-[#ffb000]">X AXIS</div>
                            <div className="mt-1 text-lg sm:text-xl font-bold text-[#e2e8f0]">{selectedLocation.x}</div>
                          </div>
                          <div className="p-3 rounded-sm bg-[#050a14] border border-[#1a2333]">
                            <div className="text-xs font-bold text-[#32cd32]">Y HEIGHT</div>
                            <div className="mt-1 text-lg sm:text-xl font-bold text-[#e2e8f0]">{selectedLocation.y}</div>
                          </div>
                          <div className="p-3 rounded-sm bg-[#050a14] border border-[#1a2333]">
                            <div className="text-xs font-bold text-sky-400">Z AXIS</div>
                            <div className="mt-1 text-lg sm:text-xl font-bold text-[#e2e8f0]">{selectedLocation.z}</div>
                          </div>
                        </div>
                      </div>

                      {/* Detail Memo */}
                      {selectedLocation.detail_memo && (
                        <div className="mt-4 p-4 rounded-sm bg-[#0d1627] border border-[#1a2333] text-xs sm:text-sm text-zinc-300 leading-relaxed font-mono">
                          <div className="text-[11px] font-bold text-[#ffb000] mb-1">【冒険記録メモ】</div>
                          <p className="whitespace-pre-wrap">{selectedLocation.detail_memo}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => { playConfirmSound(); handleDetailEdit(); }}
                        className="command-btn flex-1 flex items-center justify-center gap-2 py-3 bg-[#1a2333] text-[#ffb000] font-bold text-xs sm:text-sm"
                      >
                        <Pencil className="w-4 h-4" />
                        <span>記録を編集</span>
                      </button>
                      <button
                        onClick={() => handleDelete(selectedLocation)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-sm bg-red-950/80 text-red-300 border-2 border-red-800 font-bold hover:bg-red-900 hover:text-white active:scale-[0.98] transition-all text-xs sm:text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>記録を抹消</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-dot"
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) { playCancelSound(); setDeleteTarget(null); } }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="delete-location-title" className="w-full max-w-md overflow-hidden rounded-sm bg-[#0a1120] border-4 border-double border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <div className="px-5 pt-6 pb-5 text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-950/80 border-2 border-red-700 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <h2 id="delete-location-title" className="text-base sm:text-lg font-bold text-red-200 font-mono uppercase">
                ロケーションを抹消しますか？
              </h2>
              <p className="mt-2 text-sm text-[#ffb000] font-bold break-words">
                「{deleteTarget.name}」
              </p>
              <p className="mt-3 text-xs leading-5 text-zinc-400 font-mono">
                この操作は冒険の書から元に戻せません。<br />
                保存された写真と座標データもすべて破棄されます。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 px-5 pb-5">
              <button
                type="button"
                onClick={() => { playCancelSound(); setDeleteTarget(null); }}
                className="command-btn py-2.5 bg-[#1a2333] text-zinc-300 hover:text-white text-xs font-bold font-mono"
              >
                <X className="w-4 h-4 inline mr-1" />
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="py-2.5 rounded-sm bg-red-800 border-2 border-red-500 text-white hover:bg-red-700 active:scale-[0.98] transition-all text-xs font-bold font-mono shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                抹消する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {mode.type !== 'list' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-dot"
          onMouseDown={(event) => { if (event.target === event.currentTarget) { playCancelSound(); closeModal(); } }}
        >
          <div className="w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto rounded-sm bg-[#0a1120] border-4 border-double border-[#ffb000] shadow-[0_0_30px_rgba(255,176,0,0.25)] motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-[#1a2333] bg-[#0d1627]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffb000] shadow-[0_0_8px_#ffb000]" />
                <h2 className="text-base font-bold text-[#ffb000] tracking-wide">
                  {mode.type === 'edit' ? 'ロケーション情報の更新' : '新たな拠点の記録'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => { playCancelSound(); closeModal(); }}
                disabled={saving}
                aria-label="閉じる"
                className="p-1 rounded-sm text-zinc-400 hover:bg-[#1a2333] hover:text-[#ffb000] transition-colors border border-transparent hover:border-[#334155]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain">
              <LocationForm
                worldId={world.id}
                members={world.members}
                editing={mode.type === 'edit' ? mode.location : null}
                onSave={handleSave}
                onComplete={handleComplete}
                onCancel={closeModal}
                saving={saving}
              />
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes modal-enter { from { opacity: 0; transform: translateY(8px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } } @media (prefers-reduced-motion: reduce) { .motion-safe\\:animate-\\[modal-enter_180ms_cubic-bezier\\(.22\\,.8\\.35\\,1)\\] { animation: none !important; } }`}</style>
    </div>
  );
}

function LocationCard({ loc, slotNumber, onToggle }: { key?: string | number; loc: LocationWithPhotos; slotNumber?: number; onToggle: () => void }) {
  const mainPhoto = loc.photos.find((p) => p.is_main);
  return (
    <div className="group relative overflow-hidden rounded-sm bg-[#0d1627] border-2 border-[#1a2333] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ffb000] hover:shadow-[0_0_20px_rgba(255,176,0,0.2)]">
      <button onClick={onToggle} className="w-full text-left active:scale-[0.99] transition-transform">
        <div className="flex gap-3.5 sm:gap-4 p-3.5 sm:p-4 pr-5 items-center">
          {/* Photo / Slot Icon Frame */}
          {mainPhoto ? (
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-sm overflow-hidden bg-[#050a14] border-2 border-[#334155] group-hover:border-[#ffb000] transition-colors shrink-0">
              <PhotoImage storagePath={mainPhoto.storage_path} alt={loc.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-sm bg-[#050a14] border-2 border-[#334155] group-hover:border-[#ffb000] flex flex-col items-center justify-center gap-1 shrink-0 transition-colors">
              <MapPin className="w-6 h-6 text-[#ffb000]/60 group-hover:text-[#ffb000] transition-colors" />
              <span className="text-[9px] text-zinc-500 font-mono">NO IMAGE</span>
            </div>
          )}

          {/* Information & Save Slot Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
            <div className="flex items-center gap-2 min-w-0">
              {slotNumber !== undefined && (
                <span className="px-2 py-0.5 rounded-sm bg-[#050a14] border border-[#334155] text-[10px] font-mono text-[#ffb000] font-bold shrink-0">
                  SLOT {String(slotNumber).padStart(2, '0')}
                </span>
              )}
              <div className="font-bold text-[#e2e8f0] text-sm sm:text-base group-hover:text-[#ffb000] truncate">
                {loc.name}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#ffb000] group-hover:translate-x-1 transition-transform shrink-0 ml-auto font-mono">
                <span className="hidden sm:inline text-[11px]">詳細</span>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#ffb000]" />
              </div>
            </div>

            {/* XYZ Coordinates */}
            <div className="text-[11px] text-[#32cd32] font-mono flex items-center gap-2">
              <span className="text-zinc-500 font-bold">POS:</span>
              <span className="font-bold">X:{loc.x} Y:{loc.y} Z:{loc.z}</span>
            </div>

            {loc.detail_memo && (
              <div className="text-xs text-zinc-400 truncate max-w-full font-mono">
                {loc.detail_memo}
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
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
