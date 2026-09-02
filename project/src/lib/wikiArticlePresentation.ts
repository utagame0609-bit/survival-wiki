import { getPhotoUrl } from '@/lib/db';
import type { LocationWithPhotos } from '@/lib/types';

const NARRATOR_MARKER = /<!--WIKI_NARRATOR:([\s\S]*?)-->/;
const PHOTO_PATHS_MARKER = /<!--WIKI_PHOTO_PATHS:([\s\S]*?)-->/;

export function uniqueWikiPhotos(locations: LocationWithPhotos[]) {
  return locations
    .flatMap((location) => location.photos)
    .filter((photo, index, list) => list.findIndex((item) => item.storage_path === photo.storage_path) === index)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function splitWikiNarrator(content: string) {
  const narratorMatch = content.match(NARRATOR_MARKER);
  const photoPathsMatch = content.match(PHOTO_PATHS_MARKER);
  let photoStoragePaths: string[] = [];

  if (photoPathsMatch?.[1]) {
    try {
      const parsed = JSON.parse(photoPathsMatch[1]);
      if (Array.isArray(parsed)) {
        photoStoragePaths = parsed.filter((value): value is string => typeof value === 'string' && value.length > 0);
      }
    } catch {
      photoStoragePaths = [];
    }
  }

  return {
    content: content.replace(NARRATOR_MARKER, '').replace(PHOTO_PATHS_MARKER, '').trim(),
    line: narratorMatch?.[1]?.trim() ?? '',
    photoStoragePaths,
  };
}

export async function addWikiPhotoMarkers(content: string, photos: { storage_path: string }[]) {
  if (!content || photos.length === 0) return content;
  const blocks = content.replace(/\r\n/g, '\n').split(/\n\s*\n/);
  const maxInsertions = Math.min(photos.length, Math.max(0, blocks.length - 1));
  if (maxInsertions === 0) return content;

  const positions: number[] = [];
  const available = blocks.length - 1;
  let previous = 0;
  for (let index = 0; index < maxInsertions; index += 1) {
    let position = maxInsertions === available
      ? index + 1
      : Math.floor(((index + 1) * available) / (maxInsertions + 1));
    position = Math.max(1, position);
    if (position <= previous) position = previous + 1;
    position = Math.min(available, position);
    positions.push(position);
    previous = position;
  }

  const urls = await Promise.all(photos.slice(0, maxInsertions).map((photo) => getPhotoUrl(photo.storage_path)));
  for (let index = positions.length - 1; index >= 0; index -= 1) {
    blocks.splice(positions[index], 0, `<!--WIKI_PHOTO:${urls[index]}-->`);
  }
  return blocks.join('\n\n');
}
