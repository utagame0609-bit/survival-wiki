import type { WorldWithMembers, LocationWithPhotos, WikiArticle, LocationPhoto, WorldMember } from './types';

const STORAGE_WORLDS_KEY = 'survival-wiki:worlds:v1';
const STORAGE_LOCATIONS_KEY = 'survival-wiki:locations:v1';
const STORAGE_WIKI_KEY = 'survival-wiki:wiki-articles:v1';
const STORAGE_BLOBS_KEY = 'survival-wiki:blobs:v1';

// Seed pixel photos for demo
function createPixelDataUrl(color: string, label: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width="320" height="240" shape-rendering="crispEdges">
  <rect width="320" height="240" fill="#0a1120"/>
  <rect x="10" y="10" width="300" height="220" fill="${color}" opacity="0.85"/>
  <rect x="30" y="30" width="260" height="180" fill="#050a14" opacity="0.7"/>
  <!-- 16bit Cyber terrain grid -->
  <line x1="30" y1="160" x2="290" y2="160" stroke="#ffb000" stroke-width="2"/>
  <line x1="30" y1="180" x2="290" y2="180" stroke="#32cd32" stroke-width="1"/>
  <polygon points="60,160 100,100 140,160" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <polygon points="180,160 230,80 270,160" fill="#0f172a" stroke="#ffb000" stroke-width="2"/>
  <circle cx="240" cy="60" r="14" fill="#ffb000"/>
  <text x="160" y="200" fill="#e2e8f0" font-size="14" font-family="monospace" text-anchor="middle" font-weight="bold">${label}</text>
</svg>
`)}`;
}

const DEFAULT_DEMO_GAME_ID = 'game-main-01';

const INITIAL_WORLDS: WorldWithMembers[] = [
  {
    id: 'world-demo-01',
    game_id: DEFAULT_DEMO_GAME_ID,
    name: '第壱セクター：荒野の監視哨 (Hardcore)',
    player: 'クロノス (Commander)',
    player_photo_path: 'blob://player-chronos',
    memo: '資源枯渇後の旧地下シェルター網を開拓中。目標：汚染地帯の防衛拠点構築。',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    members: [
      { id: 'mem-1', name: 'ライカ (Scout)', photo_path: 'blob://member-laika' },
      { id: 'mem-2', name: 'ガウス (Engineer)', photo_path: 'blob://member-gauss' },
      { id: 'mem-3', name: 'セナ (Medic)', photo_path: 'blob://member-sena' },
    ],
  },
  {
    id: 'world-demo-02',
    game_id: DEFAULT_DEMO_GAME_ID,
    name: 'オアシス地下都市 (Casual)',
    player: 'アリア (Explorer)',
    player_photo_path: 'blob://player-aria',
    memo: '巨大水脈の調査と古代アーカイブの復元記録。',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    members: [
      { id: 'mem-4', name: 'カイ (Builder)', photo_path: '' },
    ],
  },
];

const INITIAL_LOCATIONS: LocationWithPhotos[] = [
  {
    id: 'loc-01',
    world_id: 'world-demo-01',
    name: '旧電波監視タワー [ALPHA]',
    x: 124,
    y: 78,
    z: -340,
    detail_memo: '北側断崖に建てられた通信施設。屋上から周囲3kmの砂漠を一望可能。ソーラーパネルと予備バッテリーが稼働中。',
    created_at: new Date(Date.now() - 6 * 86400000 + 3600000 * 4).toISOString(),
    photos: [
      {
        id: 'photo-01',
        location_id: 'loc-01',
        storage_path: 'blob://loc-tower-main',
        is_main: true,
        created_at: new Date(Date.now() - 6 * 86400000 + 3600000 * 4).toISOString(),
      },
    ],
    members: [{ id: 'mem-1', name: 'ライカ (Scout)' }],
  },
  {
    id: 'loc-02',
    world_id: 'world-demo-01',
    name: '地下バイオドーム入口 [SECTOR 4]',
    x: 480,
    y: 32,
    z: 110,
    detail_memo: '厚さ40cmの防爆扉を発見。内部から微弱な水流音と酸素供給の稼働ログを確認。ガウスがロック解除を試みている。',
    created_at: new Date(Date.now() - 4 * 86400000 + 3600000 * 6).toISOString(),
    photos: [
      {
        id: 'photo-02',
        location_id: 'loc-02',
        storage_path: 'blob://loc-biodome',
        is_main: true,
        created_at: new Date(Date.now() - 4 * 86400000 + 3600000 * 6).toISOString(),
      },
    ],
    members: [{ id: 'mem-2', name: 'ガウス (Engineer)' }],
  },
  {
    id: 'loc-03',
    world_id: 'world-demo-01',
    name: '水晶洞窟・地下水汲み上げ所',
    x: 820,
    y: -14,
    z: 560,
    detail_memo: '地下水脈に面した美しい水晶層。飲用可能な純水が湧出しており、今後の主要補給ハブに指定。',
    created_at: new Date(Date.now() - 2 * 86400000 + 3600000 * 10).toISOString(),
    photos: [
      {
        id: 'photo-03',
        location_id: 'loc-03',
        storage_path: 'blob://loc-crystal',
        is_main: true,
        created_at: new Date(Date.now() - 2 * 86400000 + 3600000 * 10).toISOString(),
      },
    ],
    members: [
      { id: 'mem-1', name: 'ライカ (Scout)' },
      { id: 'mem-3', name: 'セナ (Medic)' },
    ],
  },
  {
    id: 'loc-04',
    world_id: 'world-demo-01',
    name: '放棄された軍用前哨基地 [BETA]',
    x: -310,
    y: 92,
    z: -680,
    detail_memo: '装甲車両の残骸と物資コンテナ多数。防具の修理素材と弾薬を回収。防衛タレットの残骸あり。',
    created_at: new Date(Date.now() - 86400000 + 3600000 * 2).toISOString(),
    photos: [
      {
        id: 'photo-04',
        location_id: 'loc-04',
        storage_path: 'blob://loc-outpost',
        is_main: true,
        created_at: new Date(Date.now() - 86400000 + 3600000 * 2).toISOString(),
      },
    ],
    members: [{ id: 'mem-2', name: 'ガウス (Engineer)' }],
  },
];

const PRE_SEEDED_BLOBS: Record<string, string> = {
  'blob://player-chronos': createPixelDataUrl('#1e3a8a', 'CHRONOS'),
  'blob://player-aria': createPixelDataUrl('#047857', 'ARIA'),
  'blob://member-laika': createPixelDataUrl('#b45309', 'LAIKA'),
  'blob://member-gauss': createPixelDataUrl('#4338ca', 'GAUSS'),
  'blob://member-sena': createPixelDataUrl('#be123c', 'SENA'),
  'blob://loc-tower-main': createPixelDataUrl('#1e293b', 'TOWER ALPHA'),
  'blob://loc-biodome': createPixelDataUrl('#064e3b', 'BIODOME S4'),
  'blob://loc-crystal': createPixelDataUrl('#0369a1', 'CRYSTAL CAVE'),
  'blob://loc-outpost': createPixelDataUrl('#78350f', 'OUTPOST BETA'),
};

function getStoredWorlds(): WorldWithMembers[] {
  try {
    const raw = localStorage.getItem(STORAGE_WORLDS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_WORLDS_KEY, JSON.stringify(INITIAL_WORLDS));
      return INITIAL_WORLDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_WORLDS;
  }
}

function saveStoredWorlds(worlds: WorldWithMembers[]) {
  try {
    localStorage.setItem(STORAGE_WORLDS_KEY, JSON.stringify(worlds));
  } catch {}
}

function getStoredLocations(): LocationWithPhotos[] {
  try {
    const raw = localStorage.getItem(STORAGE_LOCATIONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_LOCATIONS_KEY, JSON.stringify(INITIAL_LOCATIONS));
      return INITIAL_LOCATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LOCATIONS;
  }
}

function saveStoredLocations(locations: LocationWithPhotos[]) {
  try {
    localStorage.setItem(STORAGE_LOCATIONS_KEY, JSON.stringify(locations));
  } catch {}
}

function getStoredWikis(): Record<string, WikiArticle> {
  try {
    const raw = localStorage.getItem(STORAGE_WIKI_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredWikis(wikis: Record<string, WikiArticle>) {
  try {
    localStorage.setItem(STORAGE_WIKI_KEY, JSON.stringify(wikis));
  } catch {}
}

// In-memory / localStorage Blobs Map
const blobStore = new Map<string, string>();
Object.entries(PRE_SEEDED_BLOBS).forEach(([k, v]) => blobStore.set(k, v));

export async function getPhotoUrl(storagePath: string): Promise<string> {
  if (!storagePath) return '';
  if (blobStore.has(storagePath)) {
    return blobStore.get(storagePath)!;
  }
  try {
    const rawBlobs = localStorage.getItem(STORAGE_BLOBS_KEY);
    if (rawBlobs) {
      const parsed = JSON.parse(rawBlobs);
      if (parsed[storagePath]) {
        blobStore.set(storagePath, parsed[storagePath]);
        return parsed[storagePath];
      }
    }
  } catch {}
  return storagePath;
}

export async function savePhotoBlob(path: string, dataUrl: string) {
  blobStore.set(path, dataUrl);
  try {
    const rawBlobs = localStorage.getItem(STORAGE_BLOBS_KEY);
    const parsed = rawBlobs ? JSON.parse(rawBlobs) : {};
    parsed[path] = dataUrl;
    localStorage.setItem(STORAGE_BLOBS_KEY, JSON.stringify(parsed));
  } catch {}
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function fetchWorlds(gameId: string): Promise<WorldWithMembers[]> {
  const worlds = getStoredWorlds();
  return worlds.filter((w) => !gameId || w.game_id === gameId || true);
}

export async function fetchWorld(worldId: string): Promise<WorldWithMembers | null> {
  const worlds = getStoredWorlds();
  return worlds.find((w) => w.id === worldId) || null;
}

export async function createWorld(gameId: string, input: { name: string; player?: string; memo?: string; members?: string[] }): Promise<WorldWithMembers> {
  const worlds = getStoredWorlds();
  const id = `world-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const memberObjs: WorldMember[] = (input.members || []).map((mName, idx) => ({
    id: `mem-${Date.now()}-${idx}`,
    name: mName,
    photo_path: '',
  }));

  const newWorld: WorldWithMembers = {
    id,
    game_id: gameId,
    name: input.name,
    player: input.player || '',
    player_photo_path: '',
    memo: input.memo || '',
    created_at: new Date().toISOString(),
    members: memberObjs,
  };

  worlds.unshift(newWorld);
  saveStoredWorlds(worlds);
  return newWorld;
}

export async function updateWorld(worldId: string, input: { name: string; player?: string; memo?: string; members?: string[] }): Promise<WorldWithMembers> {
  const worlds = getStoredWorlds();
  const index = worlds.findIndex((w) => w.id === worldId);
  if (index === -1) throw new Error('ワールドが見つかりません');

  const existing = worlds[index];
  const memberNames = input.members || [];
  
  // Preserve existing member ids and photos if names match
  const updatedMembers: WorldMember[] = memberNames.map((name, i) => {
    const found = existing.members.find((m) => m.name === name) || existing.members[i];
    return {
      id: found ? found.id : `mem-${Date.now()}-${i}`,
      name,
      photo_path: found ? found.photo_path : '',
    };
  });

  const updated: WorldWithMembers = {
    ...existing,
    name: input.name,
    player: input.player ?? existing.player,
    memo: input.memo ?? existing.memo,
    members: updatedMembers,
    updated_at: new Date().toISOString(),
  };

  worlds[index] = updated;
  saveStoredWorlds(worlds);
  return updated;
}

export async function deleteWorld(worldId: string): Promise<void> {
  const worlds = getStoredWorlds().filter((w) => w.id !== worldId);
  saveStoredWorlds(worlds);

  const locs = getStoredLocations().filter((l) => l.world_id !== worldId);
  saveStoredLocations(locs);
}

export async function saveWorldPlayerPhoto(worldId: string, file: File): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  const path = `blob://player-${worldId}-${Date.now()}`;
  await savePhotoBlob(path, dataUrl);

  const worlds = getStoredWorlds();
  const world = worlds.find((w) => w.id === worldId);
  if (world) {
    world.player_photo_path = path;
    saveStoredWorlds(worlds);
  }
  return path;
}

export async function saveWorldMemberPhoto(memberId: string, file: File): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  const path = `blob://member-${memberId}-${Date.now()}`;
  await savePhotoBlob(path, dataUrl);

  const worlds = getStoredWorlds();
  for (const w of worlds) {
    const mem = w.members.find((m) => m.id === memberId);
    if (mem) {
      mem.photo_path = path;
      saveStoredWorlds(worlds);
      break;
    }
  }
  return path;
}

export async function deleteWorldMemberPhoto(storagePath: string): Promise<void> {
  blobStore.delete(storagePath);
}

export async function fetchLocations(worldId: string): Promise<LocationWithPhotos[]> {
  const locations = getStoredLocations();
  return locations.filter((l) => l.world_id === worldId);
}

export async function createLocation(worldId: string, input: { name: string; x: number; y: number; z: number; detail_memo?: string; created_at?: string; member_ids?: string[] }): Promise<LocationWithPhotos> {
  const locations = getStoredLocations();
  const worlds = getStoredWorlds();
  const world = worlds.find((w) => w.id === worldId);
  const selectedMembers = world ? world.members.filter((m) => input.member_ids?.includes(m.id)) : [];

  const id = `loc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const newLoc: LocationWithPhotos = {
    id,
    world_id: worldId,
    name: input.name,
    x: input.x,
    y: input.y,
    z: input.z,
    detail_memo: input.detail_memo || '',
    created_at: input.created_at || new Date().toISOString(),
    photos: [],
    members: selectedMembers,
  };

  locations.push(newLoc);
  saveStoredLocations(locations);
  return newLoc;
}

export async function updateLocation(locationId: string, input: { name: string; x: number; y: number; z: number; detail_memo?: string; created_at?: string; member_ids?: string[] }): Promise<LocationWithPhotos> {
  const locations = getStoredLocations();
  const index = locations.findIndex((l) => l.id === locationId);
  if (index === -1) throw new Error('ロケーションが見つかりません');

  const existing = locations[index];
  const worlds = getStoredWorlds();
  const world = worlds.find((w) => w.id === existing.world_id);
  const selectedMembers = world ? world.members.filter((m) => input.member_ids?.includes(m.id)) : existing.members;

  const updated: LocationWithPhotos = {
    ...existing,
    name: input.name,
    x: input.x,
    y: input.y,
    z: input.z,
    detail_memo: input.detail_memo ?? existing.detail_memo,
    created_at: input.created_at ?? existing.created_at,
    members: selectedMembers,
    updated_at: new Date().toISOString(),
  };

  locations[index] = updated;
  saveStoredLocations(locations);
  return updated;
}

export async function saveLocationPhoto(locationId: string, file: File, isMain = true): Promise<LocationPhoto> {
  const dataUrl = await fileToDataUrl(file);
  const photoPath = `blob://loc-photo-${locationId}-${Date.now()}`;
  await savePhotoBlob(photoPath, dataUrl);

  const locations = getStoredLocations();
  const loc = locations.find((l) => l.id === locationId);
  if (!loc) throw new Error('ロケーションが見つかりません');

  if (isMain) {
    loc.photos.forEach((p) => { p.is_main = false; });
  }

  const newPhoto: LocationPhoto = {
    id: `photo-${Date.now()}`,
    location_id: locationId,
    storage_path: photoPath,
    is_main: isMain,
    created_at: new Date().toISOString(),
  };

  loc.photos.push(newPhoto);
  saveStoredLocations(locations);
  return newPhoto;
}

export async function deleteLocation(locationId: string): Promise<void> {
  const locations = getStoredLocations().filter((l) => l.id !== locationId);
  saveStoredLocations(locations);
}

export async function fetchWikiArticle(worldId: string, style: string): Promise<WikiArticle | null> {
  const wikis = getStoredWikis();
  const key = `${worldId}:${style}`;
  return wikis[key] || null;
}

export async function saveWikiArticle(worldId: string, style: string, content: string): Promise<WikiArticle> {
  const wikis = getStoredWikis();
  const key = `${worldId}:${style}`;
  const article: WikiArticle = {
    id: `wiki-${Date.now()}`,
    world_id: worldId,
    style,
    content,
    created_at: wikis[key]?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  wikis[key] = article;
  saveStoredWikis(wikis);
  return article;
}

export async function resetWikiArticle(worldId: string, style: string): Promise<void> {
  const wikis = getStoredWikis();
  const key = `${worldId}:${style}`;
  delete wikis[key];
  saveStoredWikis(wikis);
}

export function resetAllDemoData() {
  localStorage.removeItem(STORAGE_WORLDS_KEY);
  localStorage.removeItem(STORAGE_LOCATIONS_KEY);
  localStorage.removeItem(STORAGE_WIKI_KEY);
  localStorage.removeItem(STORAGE_BLOBS_KEY);
  window.location.reload();
}
