import type {
  WorldWithMembers,
  LocationWithPhotos,
  Location,
  WikiArticle,
  Member
} from './types';

// Default initial data for immersive RPG quest log experience
const DEFAULT_MEMBERS: Member[] = [
  { id: 'm1', name: 'ユーリ（勇者）' },
  { id: 'm2', name: 'フィーネ（魔導士）' },
  { id: 'm3', name: 'バルガス（重装兵）' }
];

const DEFAULT_WORLD: WorldWithMembers = {
  id: 'world-001',
  name: 'アストリア古王国・忘却の地',
  description: 'かつて栄華を極めたが、古代の災厄により封印された大地。',
  player: '冒険者カイト',
  created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
  members: DEFAULT_MEMBERS
};

const DEFAULT_LOCATIONS: LocationWithPhotos[] = [
  {
    id: 'loc-01',
    world_id: 'world-001',
    name: '始原のキャンプサイト',
    x: 120,
    y: 64,
    z: -340,
    detail_memo: 'この未知の大地に降り立った最初の拠点。水源と風除けの岩陰を確保した。',
    created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000 + 3600 * 1000 * 2).toISOString(),
    members: [DEFAULT_MEMBERS[0]],
    photos: [
      {
        id: 'p1',
        location_id: 'loc-01',
        storage_path: 'mock/camp.jpg',
        is_main: true,
        created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000 + 3600 * 1000 * 2).toISOString()
      }
    ]
  },
  {
    id: 'loc-02',
    world_id: 'world-001',
    name: '翡翠の古代遺跡群',
    x: 280,
    y: 82,
    z: -190,
    detail_memo: '草木に覆われた巨大な石柱と彫刻。古代文字で「星の門」と刻まれているのを確認。',
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 3600 * 1000 * 5).toISOString(),
    members: [DEFAULT_MEMBERS[0], DEFAULT_MEMBERS[1]],
    photos: [
      {
        id: 'p2',
        location_id: 'loc-02',
        storage_path: 'mock/ruins.jpg',
        is_main: true,
        created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 3600 * 1000 * 5).toISOString()
      }
    ]
  },
  {
    id: 'loc-03',
    world_id: 'world-001',
    name: '黒鉄の地下大空洞',
    x: 410,
    y: 28,
    z: 50,
    detail_memo: '地下深くへと続く大鉱脈。発光キノコと冷気の噴出孔があり、魔物の気配が濃い。',
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 3600 * 1000 * 8).toISOString(),
    members: [DEFAULT_MEMBERS[0], DEFAULT_MEMBERS[1], DEFAULT_MEMBERS[2]],
    photos: [
      {
        id: 'p3',
        location_id: 'loc-03',
        storage_path: 'mock/cave.jpg',
        is_main: true,
        created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 3600 * 1000 * 8).toISOString()
      }
    ]
  },
  {
    id: 'loc-04',
    world_id: 'world-001',
    name: '天守の監視塔跡',
    x: 550,
    y: 140,
    z: -80,
    detail_memo: '山頂に聳える白亜の望楼。ここから王国全域と北方の雲海を一望できる。',
    created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000 + 3600 * 1000 * 4).toISOString(),
    members: [DEFAULT_MEMBERS[0], DEFAULT_MEMBERS[2]],
    photos: [
      {
        id: 'p4',
        location_id: 'loc-04',
        storage_path: 'mock/tower.jpg',
        is_main: true,
        created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000 + 3600 * 1000 * 4).toISOString()
      }
    ]
  }
];

function getStoredLocations(worldId: string): LocationWithPhotos[] {
  try {
    const raw = localStorage.getItem(`rpg_quest_log:locations:${worldId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_LOCATIONS;
}

function saveStoredLocations(worldId: string, locs: LocationWithPhotos[]) {
  try {
    localStorage.setItem(`rpg_quest_log:locations:${worldId}`, JSON.stringify(locs));
  } catch {
    // fallback
  }
}

export async function fetchWorld(worldId: string): Promise<WorldWithMembers> {
  // simulate brief network fetch
  await new Promise((r) => setTimeout(r, 120));
  return {
    ...DEFAULT_WORLD,
    id: worldId
  };
}

export async function fetchLocations(worldId: string): Promise<LocationWithPhotos[]> {
  await new Promise((r) => setTimeout(r, 100));
  return getStoredLocations(worldId);
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
  const current = getStoredLocations(worldId);
  const newId = `loc-${Date.now().toString(36)}`;
  const members = DEFAULT_MEMBERS.filter((m) => input.member_ids?.includes(m.id));

  const newLoc: LocationWithPhotos = {
    id: newId,
    world_id: worldId,
    name: input.name,
    x: input.x,
    y: input.y,
    z: input.z,
    detail_memo: input.detail_memo,
    created_at: input.created_at || new Date().toISOString(),
    members: members.length > 0 ? members : [DEFAULT_MEMBERS[0]],
    photos: [
      {
        id: `photo-${Date.now()}`,
        location_id: newId,
        storage_path: `mock/relic_${Math.floor(Math.random() * 4) + 1}.jpg`,
        is_main: true,
        created_at: new Date().toISOString()
      }
    ]
  };

  const updated = [newLoc, ...current];
  saveStoredLocations(worldId, updated);
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
  const current = getStoredLocations('world-001');
  const members = DEFAULT_MEMBERS.filter((m) => input.member_ids?.includes(m.id));
  const updated = current.map((loc) => {
    if (loc.id === locationId) {
      return {
        ...loc,
        ...input,
        members: members.length > 0 ? members : loc.members
      };
    }
    return loc;
  });
  saveStoredLocations('world-001', updated);
}

export async function deleteLocation(locationId: string): Promise<void> {
  const current = getStoredLocations('world-001');
  const updated = current.filter((loc) => loc.id !== locationId);
  saveStoredLocations('world-001', updated);
}

export async function fetchWikiArticle(worldId: string, style: string): Promise<WikiArticle | null> {
  try {
    const raw = localStorage.getItem(`rpg_quest_log:wiki:${worldId}:${style}`);
    if (raw) return JSON.parse(raw);
  } catch {
    //
  }
  return null;
}

export async function saveWikiArticle(worldId: string, style: string, content: string): Promise<void> {
  const article: WikiArticle = {
    id: `art-${Date.now()}`,
    world_id: worldId,
    style,
    content,
    created_at: new Date().toISOString()
  };
  try {
    localStorage.setItem(`rpg_quest_log:wiki:${worldId}:${style}`, JSON.stringify(article));
  } catch {
    //
  }
}

export async function resetWikiArticle(worldId: string, style: string): Promise<void> {
  try {
    localStorage.removeItem(`rpg_quest_log:wiki:${worldId}:${style}`);
  } catch {
    //
  }
}

// Generates high quality pixel/fantasy SVG placeholder previews for photo paths
export async function getPhotoUrl(storagePath: string): Promise<string> {
  if (storagePath.startsWith('http') || storagePath.startsWith('blob:') || storagePath.startsWith('data:')) {
    return storagePath;
  }

  // Generate an authentic pixel art fantasy scene based on path name
  if (storagePath.includes('camp')) {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%230b1426"/><circle cx="340" cy="60" r="30" fill="%23fef08a"/><path d="M0 220 L100 160 L220 230 L320 170 L400 240 L400 300 L0 300 Z" fill="%23172554"/><path d="M0 240 L120 200 L260 260 L400 220 L400 300 L0 300 Z" fill="%230f172a"/><polygon points="200,180 160,250 240,250" fill="%23b45309"/><polygon points="200,180 180,250 220,250" fill="%23f59e0b"/><circle cx="200" cy="245" r="8" fill="%23ef4444"/><circle cx="200" cy="242" r="5" fill="%23fbbf24"/><text x="20" y="40" fill="%2338bdf8" font-family="monospace" font-size="14" font-weight="bold">LOCATION: CAMP GROUND</text></svg>`;
  }
  if (storagePath.includes('ruins')) {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23061a14"/><rect x="60" y="100" width="30" height="150" fill="%23064e3b" stroke="%2334d399" stroke-width="2"/><rect x="130" y="80" width="35" height="170" fill="%23064e3b" stroke="%2334d399" stroke-width="2"/><rect x="220" y="110" width="30" height="140" fill="%23064e3b" stroke="%2334d399" stroke-width="2"/><rect x="290" y="90" width="35" height="160" fill="%23064e3b" stroke="%2334d399" stroke-width="2"/><path d="M40 100 L340 80" stroke="%2310b981" stroke-width="6"/><circle cx="190" cy="180" r="30" fill="%23047857" stroke="%236ee7b7" stroke-width="3"/><text x="20" y="40" fill="%2334d399" font-family="monospace" font-size="14" font-weight="bold">ANCIENT JADE RUINS</text></svg>`;
  }
  if (storagePath.includes('cave')) {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23020617"/><path d="M0 0 L400 0 L400 300 L0 300 Z" fill="%230b0f19"/><path d="M80 60 L140 160 L120 220 L300 240 L340 120 L260 50 Z" fill="%23020617"/><circle cx="150" cy="190" r="12" fill="%2338bdf8" filter="drop-shadow(0 0 8px %2338bdf8)"/><circle cx="270" cy="160" r="10" fill="%23a855f7" filter="drop-shadow(0 0 8px %23a855f7)"/><circle cx="210" cy="210" r="14" fill="%2310b981" filter="drop-shadow(0 0 8px %2310b981)"/><text x="20" y="40" fill="%2394a3b8" font-family="monospace" font-size="14" font-weight="bold">BLACK-IRON CAVERN</text></svg>`;
  }
  if (storagePath.includes('tower')) {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23081b29"/><polygon points="200,40 160,260 240,260" fill="%231e293b" stroke="%23f59e0b" stroke-width="2"/><rect x="185" y="100" width="30" height="40" fill="%23fef08a"/><path d="M0 240 Q100 200 200 250 T400 240 L400 300 L0 300 Z" fill="%230c4a6e"/><circle cx="80" cy="70" r="20" fill="%23fcd34d"/><text x="20" y="40" fill="%23fbbf24" font-family="monospace" font-size="14" font-weight="bold">CELESTIAL WATCHTOWER</text></svg>`;
  }

  // Default treasure relic
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%230f1c34"/><rect x="100" y="80" width="200" height="140" rx="10" fill="%2378350f" stroke="%23f59e0b" stroke-width="4"/><circle cx="200" cy="150" r="24" fill="%23fef08a"/><text x="20" y="40" fill="%23f59e0b" font-family="monospace" font-size="14" font-weight="bold">DISCOVERED RELIC</text></svg>`;
}
