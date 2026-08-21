import type { LocationWithPhotos } from '@/lib/types';

/**
 * Wiki本文用の写真を、代表写真を除外して古い順に最大5枚選ぶ。
 */
export function selectWikiPhotos(locations: LocationWithPhotos[]) {
  return locations
    .flatMap((location) => location.photos)
    .filter((photo) => !photo.is_main)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, 5);
}
