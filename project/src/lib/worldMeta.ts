import type { WorldWithMembers } from '@/lib/types';
import { fetchLocations } from '@/lib/db';

export type WorldMeta = {
  recordCount: number;
  dayCount: number;
  lastLocationName: string | null;
  lastLocationDate: string | null;
  lastPhotoPath: string | null;
};

export async function buildWorldMeta(worlds: WorldWithMembers[]): Promise<Record<string, WorldMeta>> {
  const metaEntries = await Promise.all(
    worlds.map(async (world) => {
      const locations = await fetchLocations(world.id);
      const sortedLocations = [...locations].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      const dayKeys = new Set(
        locations.map((location) => {
          const date = new Date(location.created_at);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        }),
      );
      const latestLocation = sortedLocations[0];
      const latestPhoto = latestLocation
        ? latestLocation.photos.find((photo) => photo.is_main) ?? latestLocation.photos[0] ?? null
        : null;

      return [
        world.id,
        {
          recordCount: locations.length,
          dayCount: dayKeys.size,
          lastLocationName: latestLocation?.name ?? null,
          lastLocationDate: latestLocation?.created_at ?? null,
          lastPhotoPath: latestPhoto?.storage_path ?? null,
        },
      ] as const;
    }),
  );

  return Object.fromEntries(metaEntries);
}
