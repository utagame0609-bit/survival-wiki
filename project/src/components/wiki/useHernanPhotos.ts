import { useEffect, useState } from 'react';
import type { LocationWithPhotos } from '@/lib/types';
import { getPhotoUrl } from '@/lib/db';

export type HernanResolvedPhoto = {
  id: string;
  url: string;
  title: string;
  alt: string;
  locationName?: string;
  timestamp?: string;
};

function uniqueLocationPhotos(locations: LocationWithPhotos[]) {
  return locations
    .flatMap((location) => location.photos.map((photo) => ({ location, photo })))
    .filter((entry, index, list) => list.findIndex((item) => item.photo.storage_path === entry.photo.storage_path) === index)
    .sort((a, b) => a.photo.created_at.localeCompare(b.photo.created_at))
    .slice(0, 5);
}

export function formatHernanRecordedDate(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function useHernanPhotos(locations: LocationWithPhotos[], worldName: string) {
  const [photos, setPhotos] = useState<HernanResolvedPhoto[]>([]);

  useEffect(() => {
    let cancelled = false;
    const entries = uniqueLocationPhotos(locations);

    const resolve = async () => {
      const resolved = await Promise.all(entries.map(async ({ location, photo }, index) => ({
        id: photo.id,
        url: await getPhotoUrl(photo.storage_path),
        title: location.detail_memo?.trim() || location.name || `記録写真 ${index + 1}`,
        alt: `${location.name || worldName}の記録写真 ${index + 1}`,
        locationName: location.name || undefined,
        timestamp: formatHernanRecordedDate(photo.created_at) || undefined,
      })));
      if (!cancelled) setPhotos(resolved);
    };

    void resolve().catch(() => {
      if (!cancelled) setPhotos([]);
    });

    return () => {
      cancelled = true;
    };
  }, [locations, worldName]);

  return photos;
}
