import { useEffect, useRef, useState } from 'react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchLocations, createLocation, updateLocation, deleteLocation } from '@/lib/db';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import { ChestModal } from '@/components/ChestModal';
import { LocationDetailModal } from '@/components/LocationDetailModal';
import { DeleteLocationConfirmModal } from '@/components/DeleteLocationConfirmModal';
import { LocationFormModal } from '@/components/LocationFormModal';
import { LocationPhotoImage } from '@/components/LocationPhotoImage';
import { buildCollectionItems, type CollectionItem } from '@/components/locations/locationData';
import { TimelineRecordsView } from '@/components/TimelineRecordsView';
import {
  playRecordSelectSound,
  playModalCloseSound,
  playModalOpenSound,
  playDeleteSound,
  playErrorSound,
} from '@/lib/sound';

type Mode =
  | { type: 'list' }
  | { type: 'create' }
  | { type: 'edit'; location: LocationWithPhotos };

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

  const collectionItems: CollectionItem[] = buildCollectionItems(locations);

  return (
    <div className="space-y-4 sm:space-y-5 font-sans">
      {error && <ErrorBanner message={error} />}
      {loading && <Spinner label="冒険記録を読み込み中" />}

      {!loading && (
        <TimelineRecordsView
          world={world}
          locations={locations}
          onSelectLocation={(location) => {
            playRecordSelectSound();
            setSelectedLocation(location);
          }}
          onOpenChest={() => {
            playModalOpenSound();
            setCollectionOpen(true);
          }}
          onCreate={openCreateModal}
        />
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
          world={world}
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
