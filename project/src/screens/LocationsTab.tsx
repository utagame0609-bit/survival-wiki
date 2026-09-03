import { useEffect, useState } from 'react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import { ChestModal } from '@/components/ChestModal';
import { LocationDetailModal } from '@/components/LocationDetailModal';
import { LocationFormModal } from '@/components/LocationFormModal';
import { LocationPhotoImage } from '@/components/LocationPhotoImage';
import { buildCollectionItems, type CollectionItem } from '@/lib/chestCollection';
import { TimelineRecordsView } from '@/components/TimelineRecordsView';
import { SnsShareModal } from '@/components/SnsShareModal';
import { useLocationsData, type LocationSaveInput } from '@/hooks/useLocationsData';
import { playModalOpenSound } from '@/lib/sound';

type Mode =
  | { type: 'list' }
  | { type: 'create' }
  | { type: 'edit'; location: LocationWithPhotos };

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
  const {
    locations,
    loading,
    saving,
    error,
    setError,
    load,
    saveLocation,
    removeLocation,
  } = useLocationsData(world.id, reloadKey);
  const [mode, setMode] = useState<Mode>({ type: 'list' });
  const [selectedLocation, setSelectedLocation] = useState<LocationWithPhotos | null>(null);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [snsLocation, setSnsLocation] = useState<LocationWithPhotos | null>(null);

  useEffect(() => {
    if (!openLocationId || loading) return;
    const location = locations.find((loc) => loc.id === openLocationId);
    if (!location) return;
    setSelectedLocation(location);
    onOpenLocationHandled?.();
  }, [openLocationId, loading, locations, onOpenLocationHandled]);

  const handleSave = async (input: LocationSaveInput): Promise<string> => {
    try {
      return await saveLocation(mode.type === 'edit' ? mode.location : null, input);
    } catch (e) {
      setError((e as Error).message);
      throw e;
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

  const handleDelete = async (loc: LocationWithPhotos) => {
    try {
      await removeLocation(loc.id);
      setSelectedLocation((prev) => (prev?.id === loc.id ? null : prev));
      setSnsLocation((prev) => (prev?.id === loc.id ? null : prev));
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
    setMode({ type: 'list' });
  };

  const closeLocationDetail = () => {
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
            setSelectedLocation(location);
          }}
          onOpenSns={(location) => {
            playModalOpenSound();
            setSnsLocation(location);
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
          onDelete={() => void handleDelete(selectedLocation)}
          PhotoImage={LocationPhotoImage}
        />
      )}

      {snsLocation && (
        <SnsShareModal
          world={world}
          location={snsLocation}
          onClose={() => setSnsLocation(null)}
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
