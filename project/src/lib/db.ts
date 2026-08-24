import { supabase, PHOTOS_BUCKET } from './supabase';
import { deleteR2Photo } from './r2Worker';
import type {
  Game,
  World,
  WorldMember,
  Location,
  LocationPhoto,
  WikiArticle,
  WorldWithMembers,
  LocationWithPhotos,
} from './types';

// ---- Games ----

export async function fetchGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ---- Worlds ----

export async function fetchWorlds(gameId: string): Promise<WorldWithMembers[]> {
  const { data, error } = await supabase
    .from('worlds')
    .select('*, world_members(*)')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((w) => ({
    ...w,
    members: w.world_members ?? [],
  }));
}

export async function fetchLatestLocationDates(
  worldIds: string[]
): Promise<Record<string, string | null>> {
  if (worldIds.length === 0) return {};

  const { data, error } = await supabase
    .from('locations')
    .select('world_id, created_at')
    .in('world_id', worldIds)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const latest: Record<string, string | null> = {};
  for (const worldId of worldIds) latest[worldId] = null;

  for (const row of data ?? []) {
    if (latest[row.world_id] === null) {
      latest[row.world_id] = row.created_at;
    }
  }

  return latest;
}

export async function fetchWorld(id: string): Promise<WorldWithMembers | null> {
  const { data, error } = await supabase
    .from('worlds')
    .select('*, world_members(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...data, members: data.world_members ?? [] };
}

export async function createWorld(
  gameId: string,
  input: { name: string; player: string; memo: string; members: string[] }
): Promise<World> {
  const { data, error } = await supabase
    .from('worlds')
    .insert({ game_id: gameId, name: input.name, player: input.player, memo: input.memo })
    .select()
    .single();
  if (error) throw error;

  const world = data as World;

  if (input.members.length > 0) {
    const rows = input.members
      .filter((m) => m.trim())
      .map((m) => ({ world_id: world.id, name: m.trim() }));
    if (rows.length > 0) {
      const { error: mErr } = await supabase.from('world_members').insert(rows);
      if (mErr) throw mErr;
    }
  }

  return world;
}

export async function updateWorld(
  id: string,
  input: { name: string; player: string; memo: string; members: string[] }
): Promise<void> {
  const { error } = await supabase
    .from('worlds')
    .update({ name: input.name, player: input.player, memo: input.memo })
    .eq('id', id);
  if (error) throw error;

  const { error: dErr } = await supabase.from('world_members').delete().eq('world_id', id);
  if (dErr) throw dErr;

  if (input.members.length > 0) {
    const rows = input.members
      .filter((m) => m.trim())
      .map((m) => ({ world_id: id, name: m.trim() }));
    if (rows.length > 0) {
      const { error: mErr } = await supabase.from('world_members').insert(rows);
      if (mErr) throw mErr;
    }
  }
}

export async function deleteWorld(id: string): Promise<void> {
  // A world deletion must also remove every photo belonging to its locations
  // from Storage. Database cascade rules handle the related DB rows.
  const { data: locations, error: lErr } = await supabase
    .from('locations')
    .select('id')
    .eq('world_id', id);
  if (lErr) throw lErr;

  const locationIds = (locations ?? []).map((location) => location.id);

  if (locationIds.length > 0) {
    const { data: photos, error: pErr } = await supabase
      .from('location_photos')
      .select('storage_path')
      .in('location_id', locationIds);
    if (pErr) throw pErr;

    const paths = (photos ?? []).map((photo) => photo.storage_path);
    if (paths.length > 0) {
      const { error: storageErr } = await supabase.storage.from(PHOTOS_BUCKET).remove(paths);
      if (storageErr) throw storageErr;
    }
  }

  const { error } = await supabase.from('worlds').delete().eq('id', id);
  if (error) throw error;
}

// ---- Locations ----

export async function fetchLocations(worldId: string): Promise<LocationWithPhotos[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*, location_photos(*)')
    .eq('world_id', worldId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const locations = (data ?? []) as (Location & { location_photos: LocationPhoto[] })[];

  console.debug('[Survival Wiki] fetched location photos', locations.map((location) => ({
    location: location.name,
    photos: (location.location_photos ?? []).map((photo) => ({
      id: photo.id,
      path: photo.storage_path,
      isMain: photo.is_main,
    })),
  })));

  const { data: lmData, error: lmErr } = await supabase
    .from('location_members')
    .select('location_id, world_members(*)')
    .in(
      'location_id',
      locations.map((l) => l.id)
    );
  if (lmErr) throw lmErr;

  const memberMap = new Map<string, WorldMember[]>();
  for (const lm of lmData ?? []) {
    const arr = memberMap.get(lm.location_id) ?? [];
    if (lm.world_members) arr.push(lm.world_members as unknown as WorldMember);
    memberMap.set(lm.location_id, arr);
  }

  return locations.map((l) => ({
    ...l,
    photos: l.location_photos ?? [],
    members: memberMap.get(l.id) ?? [],
  }));
}

export async function createLocation(
  worldId: string,
  input: {
    name: string;
    x: number;
    y: number;
    z: number;
    detail_memo: string;
    created_at: string;
    member_ids: string[];
  }
): Promise<Location> {
  const { data, error } = await supabase
    .from('locations')
    .insert({
      world_id: worldId,
      name: input.name,
      x: input.x,
      y: input.y,
      z: input.z,
      detail_memo: input.detail_memo || null,
      created_at: input.created_at || undefined,
    })
    .select()
    .single();
  if (error) throw error;

  const loc = data as Location;

  if (input.member_ids.length > 0) {
    const rows = input.member_ids.map((mid) => ({
      location_id: loc.id,
      member_id: mid,
    }));
    const { error: lmErr } = await supabase.from('location_members').insert(rows);
    if (lmErr) throw lmErr;
  }

  return loc;
}

export async function updateLocation(
  id: string,
  input: {
    name: string;
    x: number;
    y: number;
    z: number;
    detail_memo: string;
    created_at: string;
    member_ids: string[];
  }
): Promise<void> {
  const { error } = await supabase
    .from('locations')
    .update({
      name: input.name,
      x: input.x,
      y: input.y,
      z: input.z,
      detail_memo: input.detail_memo || null,
      created_at: input.created_at,
    })
    .eq('id', id);
  if (error) throw error;

  const { error: dErr } = await supabase.from('location_members').delete().eq('location_id', id);
  if (dErr) throw dErr;

  if (input.member_ids.length > 0) {
    const rows = input.member_ids.map((mid) => ({
      location_id: id,
      member_id: mid,
    }));
    const { error: lmErr } = await supabase.from('location_members').insert(rows);
    if (lmErr) throw lmErr;
  }
}

export async function deleteLocation(id: string): Promise<void> {
  const { data: photos, error: pErr } = await supabase
    .from('location_photos')
    .select('storage_path')
    .eq('location_id', id);
  if (pErr) throw pErr;

  if (photos && photos.length > 0) {
    for (const photo of photos) {
      const pathParts = photo.storage_path.split('/');
      const isR2StoragePath = pathParts.length === 3 && pathParts.every((part) => part.length > 0);

      if (isR2StoragePath) {
        const result = await deleteR2Photo(photo.storage_path);
        if (!result.deleted) {
          throw new Error(result.error ?? 'R2写真の削除に失敗しました');
        }
      } else {
        const { error: storageErr } = await supabase.storage
          .from(PHOTOS_BUCKET)
          .remove([photo.storage_path]);
        if (storageErr) throw storageErr;
      }
    }
  }

  const { error } = await supabase.from('locations').delete().eq('id', id);
  if (error) throw error;
}

// ---- Photos ----

const MAX_IMAGE_SIZE = 1280;
const WEBP_QUALITY = 0.82;

async function resizeAndConvertToWebP(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    throw new Error('画像ファイルを選択してください');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('画像を読み込めませんでした'));
      img.src = objectUrl;
    });

    const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('画像処理を開始できませんでした');
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error('WebPへの変換に失敗しました'));
        },
        'image/webp',
        WEBP_QUALITY
      );
    });

    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function uploadPhoto(
  locationId: string,
  file: File,
  isMain: boolean
): Promise<LocationPhoto> {
  const imageBlob = await resizeAndConvertToWebP(file);
  const path = `${locationId}/${crypto.randomUUID()}.webp`;

  const { error: upErr } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(path, imageBlob, { contentType: 'image/webp' });
  if (upErr) throw upErr;

  const { data, error } = await supabase
    .from('location_photos')
    .insert({ location_id: locationId, storage_path: path, is_main: isMain, sort_order: 0 })
    .select()
    .single();
  if (error) throw error;

  return data as LocationPhoto;
}

export async function deletePhoto(photoId: string, storagePath: string): Promise<void> {
  const pathParts = storagePath.split('/');
  const isR2StoragePath = pathParts.length === 3 && pathParts.every((part) => part.length > 0);

  if (isR2StoragePath) {
    const result = await deleteR2Photo(storagePath);
    if (!result.deleted) {
      throw new Error(result.error ?? 'R2写真の削除に失敗しました');
    }
  } else {
    const { error: storageErr } = await supabase.storage.from(PHOTOS_BUCKET).remove([storagePath]);
    if (storageErr) throw storageErr;
  }

  const { error } = await supabase.from('location_photos').delete().eq('id', photoId);
  if (error) throw error;
}

export function getPhotoUrl(storagePath: string): string {
  const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

// ---- Wiki ----

export async function fetchWikiArticle(
  worldId: string,
  style: string
): Promise<WikiArticle | null> {
  const { data, error } = await supabase
    .from('wiki_articles')
    .select('*')
    .eq('world_id', worldId)
    .eq('style', style)
    .maybeSingle();
  if (error) throw error;
  return data as WikiArticle | null;
}

export async function saveWikiArticle(
  worldId: string,
  style: string,
  content: string
): Promise<WikiArticle> {
  const existing = await fetchWikiArticle(worldId, style);
  if (existing) {
    const { data, error } = await supabase
      .from('wiki_articles')
      .update({ content, generated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as WikiArticle;
  }
  const { data, error } = await supabase
    .from('wiki_articles')
    .insert({
      world_id: worldId,
      style,
      content,
      generated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as WikiArticle;
}

export async function resetWikiArticle(worldId: string, style: string): Promise<void> {
  const { error } = await supabase
    .from('wiki_articles')
    .delete()
    .eq('world_id', worldId)
    .eq('style', style);
  if (error) throw error;
}