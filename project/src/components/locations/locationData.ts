import type { LocationWithPhotos } from '@/lib/types';

export type CollectionItem = {
  location: LocationWithPhotos;
  storagePath: string;
};

export function buildCollectionItems(locations: LocationWithPhotos[]): CollectionItem[] {
  return locations
    .flatMap((location) =>
      location.photos.map((photo) => ({
        location,
        storagePath: photo.storage_path,
        createdAt: photo.created_at,
      })),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(({ location, storagePath }) => ({ location, storagePath }));
}
