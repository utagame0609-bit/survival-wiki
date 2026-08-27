import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchLocations, createLocation, updateLocation, deleteLocation } from '@/lib/db';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import { ChestModal } from '@/components/ChestModal';
import { LocationCard } from '@/components/LocationCard';
import { LocationDetailModal } from '@/components/LocationDetailModal';
import { DeleteLocationConfirmModal } from '@/components/DeleteLocationConfirmModal';
import { LocationFormModal } from '@/components/LocationFormModal';
import { LocationPhotoImage } from '@/components/LocationPhotoImage';
import { LocationsToolbar } from '@/components/LocationsToolbar';
import { LocationsListHeader } from '@/components/LocationsListHeader';
import { LocationsGrid } from '@/components/LocationsGrid';
import {
  playRecordSelectSound,
  playModalOpenSound,
  playModalCloseSound,
  playDeleteSound,
  playErrorSound,
} from '@/lib/sound';

type Mode =
  | { type: 'list' }
  | { type: 'create' }
  | { type: 'edit'; location: LocationWithPhotos };

type SortOrder = 'asc' | 'desc';

type CollectionItem = {
  location: LocationWithPhotos;
  storagePath: string;
};

type LocationFormInput = {
  name: string;
  x: number;
  y: number;
  z: number;
  detail_memo: string;
  created_at: string;
  member_ids: string[];
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

  const collectionItems: CollectionItem[] = locations
    .flatMap((location) =>
      location.photos.map((photo) => ({
        location,
        storagePath: photo.storage_path,
        createdAt: photo.created_at,
      })),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(({ location, storagePath }) => ({ location, storagePath }));

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      <LocationsToolbar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        collectionCount={collectionItems.length}
        onOpenCollection={() => setCollectionOpen(true)}
        onCreate={openCreateModal}
      />

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
          <LocationsListHeader
            searchQuery={searchQuery}
            locationCount={locations.length}
            resultCount={sortedLocations.length}
            sortOrder={sortOrder}
            onSortOrderChange={() => setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'))}
          />

          <LocationsGrid
            locations={sortedLocations}
            onSelect={(location) => {
              playRecordSelectSound();
              setSelectedLocation(location);
            }}
            PhotoImage={LocationPhotoImage}
          />
        </>
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

      <style>{` 
        @keyframes modal-enter {
          from { opacity: 0; transform: translateY(8px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-safe\\:animate-\\[modal-enter_180ms_cubic-bezier\\(.22\\,.8\\.35\\,1)\\] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
