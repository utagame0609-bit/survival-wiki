import { useEffect, useMemo, useState } from 'react';
import type { LocationWithPhotos } from '@/lib/types';
import { getPhotoUrl } from '@/lib/db';

export type ScpEvidenceView = {
  id: string;
  code: string;
  url: string;
  title: string;
  caption: string;
  timestamp: string;
};

export function formatScpTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function useScpEvidencePhotos(locations: LocationWithPhotos[]) {
  const [evidencePhotos, setEvidencePhotos] = useState<ScpEvidenceView[]>([]);
  const [activeCarouselIdx, setActiveCarouselIdx] = useState(0);

  const sourcePhotos = useMemo(() => locations
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .flatMap((location) => location.photos.slice().sort((a, b) => a.sort_order - b.sort_order).map((photo) => ({ location, photo })))
    .filter((entry, index, list) => list.findIndex((item) => item.photo.storage_path === entry.photo.storage_path) === index)
    .slice(0, 5), [locations]);

  useEffect(() => {
    let cancelled = false;
    const blobUrls: string[] = [];

    const loadPhotos = async () => {
      const resolved = await Promise.all(sourcePhotos.map(async ({ location, photo }, index) => {
        const url = await getPhotoUrl(photo.storage_path);
        if (url.startsWith('blob:')) blobUrls.push(url);
        return {
          id: photo.id,
          code: index === 0 ? 'EXHIBIT A-1' : `EVIDENCE ${String(index + 1).padStart(2, '0')}`,
          url,
          title: location.name,
          caption: location.detail_memo?.trim() || `${location.name}で保全された観測写真。`,
          timestamp: formatScpTimestamp(photo.created_at),
        } satisfies ScpEvidenceView;
      }));

      if (!cancelled) {
        setEvidencePhotos(resolved);
        setActiveCarouselIdx(0);
      }
    };

    void loadPhotos().catch(() => {
      if (!cancelled) setEvidencePhotos([]);
    });

    return () => {
      cancelled = true;
      blobUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [sourcePhotos]);

  return { evidencePhotos, activeCarouselIdx, setActiveCarouselIdx };
}
