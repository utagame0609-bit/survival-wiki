import { useEffect, useRef, useState } from 'react';
import { ArrowUpDown, Clock3, MapPin, Package, Plus, ChevronRight, Youtube } from 'lucide-react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchLocations, createLocation, updateLocation, deleteLocation } from '@/lib/db';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import { ChestModal } from '@/components/ChestModal';
import { LocationDetailModal } from '@/components/LocationDetailModal';
import { DeleteLocationConfirmModal } from '@/components/DeleteLocationConfirmModal';
import { LocationFormModal } from '@/components/LocationFormModal';
import { LocationPhotoImage } from '@/components/LocationPhotoImage';
import { buildCollectionItems, type CollectionItem } from '@/components/locations/locationData';
import {
  playRecordSelectSound,
  playModalCloseSound,
  playModalOpenSound,
  playDeleteSound,
  playErrorSound,
  playHoverSound,
} from '@/lib/sound';

type Mode =
  | { type: 'list' }
  | { type: 'create' }
  | { type: 'edit'; location: LocationWithPhotos };

type SortOrder = 'asc' | 'desc';

type LocationFormInput = {
  name: string;
  x: number;
  y: number;
  z: number;
  detail_memo: string;
  created_at: string;
  member_ids: string[];
};

type TimelineGroup = {
  date: string;
  label: string;
  locations: LocationWithPhotos[];
};

export function LocationsTab({
  world,
  reloadKey,
  onReload,
  openLocationId,
  onOpenLocationHandled,
}: {
  world: WorldWithMembers;
  reloadKey: number;
  onReload: () => void;
  openLocationId?: string | null;
  onOpenLocationHandled?: () => void;
}) {
  const [locations, setLocations] = useState<LocationWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>({ type: 'list' });
  const [saving, setSaving] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationWithPhotos | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LocationWithPhotos | null>(null);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const loadRequestRef = useRef(0);

  const load = async () => {
    const requestId = ++loadRequestRef.current;
    setLoading(true);
    try {
      const nextLocations = await fetchLocations(world.id);
      if (requestId !== loadRequestRef.current) return;
      setLocations(nextLocations);
      setError('');
    } catch (e) {
      if (requestId !== loadRequestRef.current) return;
      setError((e as Error).message);
    } finally {
      if (requestId === loadRequestRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [world.id, reloadKey]);

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
    ? locations.filter(
        (loc) =>
          loc.name.toLocaleLowerCase().includes(normalizedQuery) ||
          loc.detail_memo?.toLocaleLowerCase().includes(normalizedQuery),
      )
    : locations;

  const sortedLocations = [...filteredLocations].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
  });

  const collectionItems: CollectionItem[] = buildCollectionItems(locations);
  const totalPhotos = collectionItems.length;

  const groupsByDate = new Map<string, LocationWithPhotos[]>();
  for (const location of sortedLocations) {
    const key = location.created_at.split('T')[0];
    const group = groupsByDate.get(key);
    if (group) group.push(location);
    else groupsByDate.set(key, [location]);
  }

  const timelineGroups: TimelineGroup[] = Array.from(groupsByDate.entries()).map(([date, items]) => {
    const dateObj = new Date(items[0]?.created_at || date);
    return {
      date,
      label: dateObj.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      }),
      locations: items,
    };
  });

  return (
    <div className="space-y-4 sm:space-y-5 font-sans">
      <div className="bg-[#141824] border-2 border-slate-800 p-2.5 sm:p-3 rounded-xs space-y-2.5 shadow-md">
        <div className="relative w-full">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="記録・ロケーション・メモを検索..."
            className="w-full min-h-[42px] pl-9 pr-4 py-2 bg-[#0f121b] border-2 border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:border-amber-400 outline-none transition-colors rounded-xs"
          />
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">並び順:</span>
            </span>
            <button
              type="button"
              onClick={() => setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'))}
              onMouseEnter={playHoverSound}
              className="min-h-[38px] bg-[#0f121b] border-2 border-slate-700 text-slate-200 text-xs px-2.5 py-1 outline-none font-mono cursor-pointer rounded-xs hover:border-amber-500"
            >
              {sortOrder === 'desc' ? '新しい順 (NEWEST)' : '古い順 (OLDEST)'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playModalOpenSound();
                setCollectionOpen(true);
              }}
              onMouseEnter={playHoverSound}
              className="min-h-[38px] px-3 py-1.5 border-2 border-amber-500/80 bg-[#161a25] text-amber-300 hover:border-amber-400 font-mono text-xs font-black flex items-center gap-1.5 active:scale-95 cursor-pointer rounded-xs shadow-sm"
            >
              <Package className="w-4 h-4 text-amber-400" />
              <span>CHEST ({totalPhotos})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                openCreateModal();
              }}
              onMouseEnter={playHoverSound}
              className="min-h-[38px] px-3.5 sm:px-4 py-1.5 bg-amber-500 text-black font-black text-xs font-mono border-b-2 border-amber-700 hover:bg-amber-400 active:translate-y-0.5 shadow-md flex items-center gap-1.5 cursor-pointer rounded-xs"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>新規記録</span>
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <Spinner label="冒険記録を読み込み中" />}

      {!loading && sortedLocations.length === 0 && (
        <div className="py-16 text-center border-2 border-dashed border-[#2d3548] bg-[#141824]/60 p-6 rounded-xs">
          <MapPin className="w-12 h-12 mx-auto text-slate-500 mb-3" />
          <p className="text-base font-bold text-white">記録がありません</p>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">「＋ 新規記録」から最初の冒険を残してください。</p>
        </div>
      )}

      {!loading && sortedLocations.length > 0 && (
        <div className="space-y-5 sm:space-y-7">
          {timelineGroups.map((group) => (
            <section key={group.date} className="relative pl-4 sm:pl-6 border-l-2 border-amber-500/60 space-y-3">
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-black shadow-[0_0_10px_#f59e0b]" />

              <div className="inline-flex items-center gap-2 bg-[#10141f] border-2 border-amber-500/50 px-3 py-1 font-mono text-xs font-bold text-amber-300 rounded-xs shadow-sm">
                <Clock3 className="w-3.5 h-3.5" />
                <span>{group.label}</span>
                <span className="text-[10px] text-amber-400/80 bg-amber-500/20 px-1.5 py-0.5 rounded-xs">
                  {group.locations.length}件
                </span>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {group.locations.map((location) => {
                  const primaryPhoto = location.photos[0]?.storage_path;
                  const time = new Date(location.created_at).toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => {
                        playRecordSelectSound();
                        setSelectedLocation(location);
                      }}
                      onMouseEnter={playHoverSound}
                      className="group w-full text-left border-2 border-slate-700/90 bg-[#161a25] hover:border-amber-400 transition-all p-2.5 sm:p-3 flex items-start gap-3 cursor-pointer rounded-xs shadow-[0_3px_12px_rgba(0,0,0,0.3)]"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-black border-2 border-slate-800 group-hover:border-amber-500/60 overflow-hidden rounded-xs relative">
                        {primaryPhoto ? (
                          <LocationPhotoImage
                            storagePath={primaryPhoto}
                            alt={location.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 bg-[#0d1017]">
                            <MapPin className="w-5 h-5 text-amber-500/60" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400">
                          <span>{time}</span>
                          {location.is_checkpoint && (
                            <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-400/70 text-amber-300">CHECKPOINT</span>
                          )}
                          {location.youtube_url && (
                            <span className="px-1.5 py-0.5 bg-red-600/80 border border-red-400/60 text-white flex items-center gap-0.5">
                              <Youtube className="w-2.5 h-2.5" />VIDEO
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 truncate">
                          {location.name}
                        </h3>

                        <div className="font-mono text-[10px] sm:text-[11px] text-emerald-400 truncate">
                          X:{location.x} Y:{location.y} Z:{location.z}
                        </div>

                        <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {location.detail_memo || '（メモ未入力）'}
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 self-center" />
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {collectionOpen && (
        <ChestModal
          collectionItems={collectionItems}
          onClose={() => setCollectionOpen(false)}
          onOpenLocation={(location) => setSelectedLocation(location)}
        />
      )}

      {selectedLocation && (
        <LocationDetailModal
          location={selectedLocation}
          onClose={closeLocationDetail}
          onEdit={handleDetailEdit}
          onDelete={() => handleDelete(selectedLocation)}
          PhotoImage={LocationPhotoImage}
        />
      )}

      {deleteTarget && (
        <DeleteLocationConfirmModal
          location={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}

      {mode.type !== 'list' && (
        <LocationFormModal
          world={world}
          mode={mode.type}
          editingLocation={mode.type === 'edit' ? mode.location : null}
          saving={saving}
          onSave={handleSave}
          onComplete={handleComplete}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}
