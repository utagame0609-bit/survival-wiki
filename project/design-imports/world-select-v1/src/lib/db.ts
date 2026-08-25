import type { WorldWithMembers, LocationItem } from './types';

const INITIAL_WORLDS_KEY = 'retro-game-archive:worlds';
const INITIAL_LOCATIONS_KEY = 'retro-game-archive:locations';

// Seed initial worlds if empty
const DEFAULT_WORLDS: WorldWithMembers[] = [
  {
    id: 'world-01',
    game_id: 'game-survival',
    name: 'アレフガルド開拓史',
    player: 'ウタ',
    player_photo_path: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    members: [
      { id: 'm-1', name: 'ゴーレム', photo_path: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80' },
      { id: 'm-2', name: 'アレイ', photo_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80' },
      { id: 'm-3', name: 'ルーン', photo_path: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' },
      { id: 'm-4', name: 'ポポ', photo_path: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80' },
    ],
  },
  {
    id: 'world-02',
    game_id: 'game-survival',
    name: '天空の城塞・第２拠点',
    player: 'ウタ',
    player_photo_path: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    members: [
      { id: 'm-5', name: 'アレイ', photo_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80' },
      { id: 'm-6', name: 'ゴーレム', photo_path: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80' },
    ],
  },
  {
    id: 'world-03',
    game_id: 'game-survival',
    name: '海底神殿探索 Hardcore',
    player: 'ウタ',
    player_photo_path: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    members: [
      { id: 'm-7', name: 'アレイ', photo_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80' },
    ],
  },
];

const DEFAULT_LOCATIONS: Record<string, LocationItem[]> = {
  'world-01': [
    {
      id: 'loc-1',
      world_id: 'world-01',
      name: '竜王の城跡・最深部',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      photos: [{ id: 'p-1', storage_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', is_main: true }],
    },
    {
      id: 'loc-2',
      world_id: 'world-01',
      name: 'メルキド城壁防衛ライン',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      photos: [{ id: 'p-2', storage_path: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80' }],
    },
    {
      id: 'loc-3',
      world_id: 'world-01',
      name: '聖なるほこら',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      photos: [{ id: 'p-3', storage_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' }],
    },
  ],
  'world-02': [
    {
      id: 'loc-4',
      world_id: 'world-02',
      name: '浮遊島展望デッキ [高度 Y:256]',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      photos: [{ id: 'p-4', storage_path: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80', is_main: true }],
    },
    {
      id: 'loc-5',
      world_id: 'world-02',
      name: '自動仕分け倉庫エリア',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
      photos: [{ id: 'p-5', storage_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80' }],
    },
  ],
  'world-03': [
    {
      id: 'loc-6',
      world_id: 'world-03',
      name: 'エルダーガーディアンの間',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      photos: [{ id: 'p-6', storage_path: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80', is_main: true }],
    },
  ],
};

function getStoredWorlds(): WorldWithMembers[] {
  try {
    const raw = localStorage.getItem(INITIAL_WORLDS_KEY);
    if (!raw) {
      localStorage.setItem(INITIAL_WORLDS_KEY, JSON.stringify(DEFAULT_WORLDS));
      return DEFAULT_WORLDS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_WORLDS;
  }
}

function getStoredLocations(): Record<string, LocationItem[]> {
  try {
    const raw = localStorage.getItem(INITIAL_LOCATIONS_KEY);
    if (!raw) {
      localStorage.setItem(INITIAL_LOCATIONS_KEY, JSON.stringify(DEFAULT_LOCATIONS));
      return DEFAULT_LOCATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_LOCATIONS;
  }
}

export async function fetchWorlds(gameId: string): Promise<WorldWithMembers[]> {
  // Simulate quick fetch delay
  await new Promise((resolve) => setTimeout(resolve, 80));
  const worlds = getStoredWorlds();
  return worlds.filter((w) => w.game_id === gameId || !w.game_id || gameId === 'all');
}

export async function fetchLocations(worldId: string): Promise<LocationItem[]> {
  const locations = getStoredLocations();
  return locations[worldId] ?? [];
}

export async function getPhotoUrl(path: string): Promise<string> {
  return path;
}

export async function deleteWorld(worldId: string): Promise<void> {
  const worlds = getStoredWorlds();
  const next = worlds.filter((w) => w.id !== worldId);
  localStorage.setItem(INITIAL_WORLDS_KEY, JSON.stringify(next));

  const locs = getStoredLocations();
  delete locs[worldId];
  localStorage.setItem(INITIAL_LOCATIONS_KEY, JSON.stringify(locs));
}

export async function createWorld(gameId: string, name: string, player: string, members: Array<{ name: string; photo_path: string | null }>): Promise<WorldWithMembers> {
  const worlds = getStoredWorlds();
  const newWorld: WorldWithMembers = {
    id: `world-${Date.now()}`,
    game_id: gameId,
    name: name.trim() || '無題の冒険記',
    player: player.trim() || 'ウタ',
    player_photo_path: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
    members: members.map((m, idx) => ({
      id: `m-${Date.now()}-${idx}`,
      name: m.name,
      photo_path: m.photo_path || null,
    })),
  };

  const next = [...worlds, newWorld];
  localStorage.setItem(INITIAL_WORLDS_KEY, JSON.stringify(next));

  // Also seed an initial location
  const locs = getStoredLocations();
  locs[newWorld.id] = [
    {
      id: `loc-${Date.now()}`,
      world_id: newWorld.id,
      name: '初期リスポーン地点 [拠点01]',
      created_at: new Date().toISOString(),
      photos: [],
    },
  ];
  localStorage.setItem(INITIAL_LOCATIONS_KEY, JSON.stringify(locs));

  return newWorld;
}
