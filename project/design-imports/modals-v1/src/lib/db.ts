import type { World, WorldMember, WorldWithMembers, Location, LocationPhoto, LocationWithPhotos } from './types';

// In-memory / localStorage database with IndexedDB blob photo cache
const DB_PREFIX = 'survival-wiki:v2:';

const photoBlobs = new Map<string, Blob>();

// Seed initial sample world and locations if empty
function initializeSeedData() {
  try {
    const existingWorlds = localStorage.getItem(`${DB_PREFIX}worlds`);
    if (!existingWorlds || JSON.parse(existingWorlds).length === 0) {
      const defaultWorldId = 'world-astoria-01';
      const sampleWorlds: WorldWithMembers[] = [
        {
          id: defaultWorldId,
          game_id: 'default-game',
          name: 'アストリア古王国・忘却の地',
          player: '探索者アルト',
          memo: '未知の文明跡と古代の神殿群が眠る危険地帯。魔導水晶の痕跡を調査中。',
          version: 'VER 1.0.4',
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          updated_at: new Date().toISOString(),
          members: [
            { id: 'm1', name: 'リリス (魔導師)' },
            { id: 'm2', name: 'ガルム (重戦士)' },
            { id: 'm3', name: 'セナ (偵察兵)' },
          ],
        },
      ];
      localStorage.setItem(`${DB_PREFIX}worlds`, JSON.stringify(sampleWorlds));

      // Initial locations matching screenshot
      const sampleLocations: LocationWithPhotos[] = [
        {
          id: 'loc-01',
          world_id: defaultWorldId,
          name: '始原のキャンプサイト',
          x: 120,
          y: 64,
          z: -340,
          detail_memo: 'この未知の大地に降り立った最初の拠点。水源と風除けの岩陰を確保した。',
          created_at: new Date(Date.now() - 86400000 * 3 + 3600000 * 2).toISOString(),
          updated_at: new Date().toISOString(),
          members: [{ id: 'm1', name: 'リリス (魔導師)' }, { id: 'm2', name: 'ガルム (重戦士)' }],
          photos: [
            {
              id: 'p-01',
              location_id: 'loc-01',
              storage_path: 'builtin:camp',
              is_main: true,
              created_at: new Date().toISOString(),
            },
          ],
        },
        {
          id: 'loc-02',
          world_id: defaultWorldId,
          name: '翡翠の古代遺跡群',
          x: 280,
          y: 82,
          z: -190,
          detail_memo: '草木に覆われた巨大な石柱と彫刻。古代文字で「星の門」と刻まれているのを確認。',
          created_at: new Date(Date.now() - 86400000 * 2 + 3600000 * 5).toISOString(),
          updated_at: new Date().toISOString(),
          members: [{ id: 'm1', name: 'リリス (魔導師)' }, { id: 'm3', name: 'セナ (偵察兵)' }],
          photos: [
            {
              id: 'p-02',
              location_id: 'loc-02',
              storage_path: 'builtin:ruins',
              is_main: true,
              created_at: new Date().toISOString(),
            },
          ],
        },
        {
          id: 'loc-03',
          world_id: defaultWorldId,
          name: '黒鉄の地下大空洞',
          x: 410,
          y: 28,
          z: 50,
          detail_memo: '地下深くへと続く大鉱脈。発光キノコと冷気の噴出孔があり、魔物の気配が濃い。',
          created_at: new Date(Date.now() - 86400000 * 1 + 3600000 * 8).toISOString(),
          updated_at: new Date().toISOString(),
          members: [{ id: 'm2', name: 'ガルム (重戦士)' }, { id: 'm3', name: 'セナ (偵察兵)' }],
          photos: [
            {
              id: 'p-03',
              location_id: 'loc-03',
              storage_path: 'builtin:cave',
              is_main: true,
              created_at: new Date().toISOString(),
            },
          ],
        },
      ];
      localStorage.setItem(`${DB_PREFIX}locations:${defaultWorldId}`, JSON.stringify(sampleLocations));
    }
  } catch (e) {
    console.error(e);
  }
}

initializeSeedData();

// Helper to generate retro vector pixel-art style SVG Data URLs for built-in photos
function getBuiltinGraphic(type: string): string {
  if (type === 'builtin:camp') {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="300" height="200">
        <rect width="300" height="200" fill="#091122"/>
        <circle cx="250" cy="50" r="18" fill="#ffb000" opacity="0.85"/>
        <path d="M0 160 L70 120 L160 165 L240 135 L300 170 L300 200 L0 200 Z" fill="#13213c"/>
        <polygon points="90,165 130,95 170,165" fill="#e65100"/>
        <polygon points="110,165 130,110 150,165" fill="#ffb000"/>
        <polygon points="120,165 130,135 140,165" fill="#ffe082"/>
        <text x="15" y="25" fill="#ffb000" font-family="monospace" font-size="10" font-weight="bold">HUD: CAMP GROUND</text>
      </svg>
    `);
  }
  if (type === 'builtin:ruins') {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="300" height="200">
        <rect width="300" height="200" fill="#071815"/>
        <rect x="40" y="70" width="20" height="90" fill="#00e676" opacity="0.8"/>
        <rect x="110" y="50" width="25" height="110" fill="#00e676"/>
        <rect x="190" y="60" width="22" height="100" fill="#00e676" opacity="0.9"/>
        <line x1="30" y1="70" x2="230" y2="70" stroke="#00e676" stroke-width="6"/>
        <circle cx="122" cy="115" r="16" fill="#071815" stroke="#00e676" stroke-width="4"/>
        <path d="M0 160 L300 160 L300 200 L0 200 Z" fill="#0d2b24"/>
        <text x="15" y="25" fill="#00e676" font-family="monospace" font-size="10" font-weight="bold">HUD: ANCIENT RUINS</text>
      </svg>
    `);
  }
  if (type === 'builtin:cave') {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="300" height="200">
        <rect width="300" height="200" fill="#050a12"/>
        <path d="M0 0 L100 0 L60 80 L180 30 L260 0 L300 0 L300 200 L240 150 L160 180 L80 140 L0 200 Z" fill="#10192d"/>
        <circle cx="100" cy="130" r="8" fill="#38bdf8" filter="drop-shadow(0px 0px 6px #38bdf8)"/>
        <circle cx="125" cy="145" r="6" fill="#4ade80" filter="drop-shadow(0px 0px 6px #4ade80)"/>
        <circle cx="180" cy="135" r="7" fill="#a855f7" filter="drop-shadow(0px 0px 6px #a855f7)"/>
        <text x="15" y="25" fill="#38bdf8" font-family="monospace" font-size="10" font-weight="bold">HUD: ABYSS CAVERN</text>
      </svg>
    `);
  }
  return '';
}

export async function fetchWorlds(gameId: string): Promise<WorldWithMembers[]> {
  try {
    const raw = localStorage.getItem(`${DB_PREFIX}worlds`);
    if (!raw) return [];
    const parsed: WorldWithMembers[] = JSON.parse(raw);
    return parsed.filter((w) => !gameId || w.game_id === gameId || gameId === 'default-game');
  } catch {
    return [];
  }
}

export async function fetchWorld(worldId: string): Promise<WorldWithMembers | null> {
  try {
    const raw = localStorage.getItem(`${DB_PREFIX}worlds`);
    if (!raw) return null;
    const parsed: WorldWithMembers[] = JSON.parse(raw);
    return parsed.find((w) => w.id === worldId) ?? null;
  } catch {
    return null;
  }
}

export async function createWorld(
  gameId: string,
  input: { name: string; player?: string; memo?: string; members: string[] }
): Promise<WorldWithMembers> {
  const worldId = `world-${Date.now()}`;
  const now = new Date().toISOString();
  const members: WorldMember[] = input.members.map((name, i) => ({
    id: `m-${Date.now()}-${i}`,
    name,
  }));
  const newWorld: WorldWithMembers = {
    id: worldId,
    game_id: gameId,
    name: input.name,
    player: input.player,
    memo: input.memo,
    version: 'VER 1.0.4',
    created_at: now,
    updated_at: now,
    members,
  };
  const worlds = await fetchWorlds(gameId);
  worlds.unshift(newWorld);
  localStorage.setItem(`${DB_PREFIX}worlds`, JSON.stringify(worlds));
  return newWorld;
}

export async function updateWorld(
  worldId: string,
  input: { name: string; player?: string; memo?: string; members: string[] }
): Promise<WorldWithMembers> {
  const raw = localStorage.getItem(`${DB_PREFIX}worlds`);
  const worlds: WorldWithMembers[] = raw ? JSON.parse(raw) : [];
  const targetIndex = worlds.findIndex((w) => w.id === worldId);
  if (targetIndex === -1) throw new Error('World not found');

  const prev = worlds[targetIndex];
  const members: WorldMember[] = input.members.map((name, i) => ({
    id: prev.members[i]?.id ?? `m-${Date.now()}-${i}`,
    name,
    photo_path: prev.members[i]?.photo_path,
  }));

  const updated: WorldWithMembers = {
    ...prev,
    name: input.name,
    player: input.player,
    memo: input.memo,
    updated_at: new Date().toISOString(),
    members,
  };
  worlds[targetIndex] = updated;
  localStorage.setItem(`${DB_PREFIX}worlds`, JSON.stringify(worlds));
  return updated;
}

export async function deleteWorld(worldId: string): Promise<void> {
  const raw = localStorage.getItem(`${DB_PREFIX}worlds`);
  const worlds: WorldWithMembers[] = raw ? JSON.parse(raw) : [];
  const filtered = worlds.filter((w) => w.id !== worldId);
  localStorage.setItem(`${DB_PREFIX}worlds`, JSON.stringify(filtered));
  localStorage.removeItem(`${DB_PREFIX}locations:${worldId}`);
}

export async function saveWorldPlayerPhoto(worldId: string, file: File): Promise<string> {
  const path = `player-${worldId}-${Date.now()}`;
  photoBlobs.set(path, file);
  const raw = localStorage.getItem(`${DB_PREFIX}worlds`);
  const worlds: WorldWithMembers[] = raw ? JSON.parse(raw) : [];
  const target = worlds.find((w) => w.id === worldId);
  if (target) {
    target.player_photo_path = path;
    localStorage.setItem(`${DB_PREFIX}worlds`, JSON.stringify(worlds));
  }
  return path;
}

export async function saveWorldMemberPhoto(memberId: string, file: File): Promise<string> {
  const path = `member-${memberId}-${Date.now()}`;
  photoBlobs.set(path, file);
  const raw = localStorage.getItem(`${DB_PREFIX}worlds`);
  const worlds: WorldWithMembers[] = raw ? JSON.parse(raw) : [];
  for (const w of worlds) {
    const member = w.members.find((m) => m.id === memberId);
    if (member) {
      member.photo_path = path;
      localStorage.setItem(`${DB_PREFIX}worlds`, JSON.stringify(worlds));
      break;
    }
  }
  return path;
}

export async function fetchLocations(worldId: string): Promise<LocationWithPhotos[]> {
  try {
    const raw = localStorage.getItem(`${DB_PREFIX}locations:${worldId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
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
): Promise<LocationWithPhotos> {
  const locId = `loc-${Date.now()}`;
  const world = await fetchWorld(worldId);
  const selectedMembers = (world?.members ?? []).filter((m) => input.member_ids.includes(m.id));

  const newLoc: LocationWithPhotos = {
    id: locId,
    world_id: worldId,
    name: input.name,
    x: input.x,
    y: input.y,
    z: input.z,
    detail_memo: input.detail_memo,
    created_at: input.created_at,
    updated_at: new Date().toISOString(),
    photos: [],
    members: selectedMembers,
  };

  const locations = await fetchLocations(worldId);
  locations.unshift(newLoc);
  localStorage.setItem(`${DB_PREFIX}locations:${worldId}`, JSON.stringify(locations));
  return newLoc;
}

export async function updateLocation(
  locationId: string,
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
  const rawWorlds = localStorage.getItem(`${DB_PREFIX}worlds`);
  const worlds: WorldWithMembers[] = rawWorlds ? JSON.parse(rawWorlds) : [];
  for (const w of worlds) {
    const locations = await fetchLocations(w.id);
    const targetIndex = locations.findIndex((l) => l.id === locationId);
    if (targetIndex !== -1) {
      const prev = locations[targetIndex];
      const selectedMembers = (w.members ?? []).filter((m) => input.member_ids.includes(m.id));
      locations[targetIndex] = {
        ...prev,
        name: input.name,
        x: input.x,
        y: input.y,
        z: input.z,
        detail_memo: input.detail_memo,
        created_at: input.created_at,
        updated_at: new Date().toISOString(),
        members: selectedMembers,
      };
      localStorage.setItem(`${DB_PREFIX}locations:${w.id}`, JSON.stringify(locations));
      return;
    }
  }
}

export async function deleteLocation(locationId: string): Promise<void> {
  const rawWorlds = localStorage.getItem(`${DB_PREFIX}worlds`);
  const worlds: WorldWithMembers[] = rawWorlds ? JSON.parse(rawWorlds) : [];
  for (const w of worlds) {
    const locations = await fetchLocations(w.id);
    const filtered = locations.filter((l) => l.id !== locationId);
    if (filtered.length !== locations.length) {
      localStorage.setItem(`${DB_PREFIX}locations:${w.id}`, JSON.stringify(filtered));
      return;
    }
  }
}

export async function uploadPhoto(locationId: string, file: File, isMain = true): Promise<LocationPhoto> {
  const photoId = `photo-${Date.now()}`;
  const storagePath = `loc-photo-${locationId}-${Date.now()}`;
  photoBlobs.set(storagePath, file);

  const rawWorlds = localStorage.getItem(`${DB_PREFIX}worlds`);
  const worlds: WorldWithMembers[] = rawWorlds ? JSON.parse(rawWorlds) : [];
  for (const w of worlds) {
    const locations = await fetchLocations(w.id);
    const target = locations.find((l) => l.id === locationId);
    if (target) {
      const newPhoto: LocationPhoto = {
        id: photoId,
        location_id: locationId,
        storage_path: storagePath,
        is_main: isMain,
        created_at: new Date().toISOString(),
      };
      if (isMain) {
        target.photos.forEach((p) => (p.is_main = false));
      }
      target.photos.push(newPhoto);
      localStorage.setItem(`${DB_PREFIX}locations:${w.id}`, JSON.stringify(locations));
      return newPhoto;
    }
  }
  throw new Error('Location not found');
}

export async function deletePhoto(photoId: string, storagePath: string): Promise<void> {
  photoBlobs.delete(storagePath);
  const rawWorlds = localStorage.getItem(`${DB_PREFIX}worlds`);
  const worlds: WorldWithMembers[] = rawWorlds ? JSON.parse(rawWorlds) : [];
  for (const w of worlds) {
    const locations = await fetchLocations(w.id);
    for (const loc of locations) {
      const idx = loc.photos.findIndex((p) => p.id === photoId);
      if (idx !== -1) {
        loc.photos.splice(idx, 1);
        localStorage.setItem(`${DB_PREFIX}locations:${w.id}`, JSON.stringify(locations));
        return;
      }
    }
  }
}

export async function getPhotoUrl(storagePath: string): Promise<string> {
  if (!storagePath) return '';
  if (storagePath.startsWith('builtin:')) {
    return getBuiltinGraphic(storagePath);
  }
  const blob = photoBlobs.get(storagePath);
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return '';
}
