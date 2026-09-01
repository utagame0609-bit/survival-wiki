import { useEffect, useRef, useState } from 'react';
import type { LocationWithPhotos } from '@/lib/types';
import { createLocation, deleteLocation, fetchLocations, updateLocation } from '@/lib/db';

export type LocationSaveInput = {
  name: string;
  x: number;
  y: number;
  z: number;
  has_coordinates: boolean;
  detail_memo: string;
  created_at: string;
  member_ids: string[];
};

export function useLocationsData(worldId: string, reloadKey: number) {
  const [locations, setLocations] = useState<LocationWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const loadRequestRef = useRef(0);

  const load = async () => {
    const requestId = ++loadRequestRef.current;
    setLoading(true);
    try {
      const nextLocations = await fetchLocations(worldId);
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
    void load();
  }, [worldId, reloadKey]);

  const saveLocation = async (
    editing: LocationWithPhotos | null,
    input: LocationSaveInput,
  ): Promise<string> => {
    setSaving(true);
    try {
      if (editing) {
        await updateLocation(editing.id, input);
        return editing.id;
      }
      const location = await createLocation(worldId, input);
      return location.id;
    } finally {
      setSaving(false);
    }
  };

  const removeLocation = (locationId: string) => deleteLocation(locationId);

  return {
    locations,
    loading,
    saving,
    error,
    setError,
    load,
    saveLocation,
    removeLocation,
  };
}
