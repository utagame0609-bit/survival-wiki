import { getPhotoUrl } from '@/lib/db';

type WikiPhoto = {
  storage_path: string;
};

export async function addWikiPhotoMarkers(content: string, photos: WikiPhoto[]) {
  if (!content || photos.length === 0) return content;

  const blocks = content.replace(/\r\n/g, '\n').split(/\n\s*\n/);
  const maxInsertions = Math.min(photos.length, Math.max(0, blocks.length - 1));
  if (maxInsertions === 0) return content;

  const positions: number[] = [];
  if (maxInsertions === blocks.length - 1) {
    for (let index = 1; index < blocks.length; index += 1) positions.push(index);
  } else {
    const available = blocks.length - 1;
    let previous = 0;
    for (let index = 0; index < maxInsertions; index += 1) {
      let position = Math.floor(((index + 1) * available) / (maxInsertions + 1));
      position = Math.max(1, position);
      if (position <= previous) position = previous + 1;
      position = Math.min(available, position);
      positions.push(position);
      previous = position;
    }
  }

  const urls = await Promise.all(
    photos.slice(0, maxInsertions).map((photo) => getPhotoUrl(photo.storage_path)),
  );
  const insertions = positions.map((position, index) => ({ position, url: urls[index] }));

  for (let index = insertions.length - 1; index >= 0; index -= 1) {
    const { position, url } = insertions[index];
    blocks.splice(position, 0, `<!--WIKI_PHOTO:${url}-->`);
  }

  return blocks.join('\n\n');
}
