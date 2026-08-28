import { WorldWithMembers, LocationWithPhotos, WikiArticle } from '../types';

const STORAGE_WORLDS_KEY = 'survival-wiki:worlds:v3';
const STORAGE_LOCATIONS_KEY = 'survival-wiki:locations:v3';
const STORAGE_WIKI_KEY = 'survival-wiki:wiki:v3';

// Built-in high-quality SVG themed pixel game screenshots (No external broken images)
export const SAMPLE_IMAGES = {
  cave: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect width="640" height="480" fill="%231a1a1f"/><rect x="0" y="320" width="640" height="160" fill="%232b2b2b"/><rect x="180" y="160" width="280" height="320" fill="%230d0d12"/><rect x="200" y="240" width="120" height="80" fill="%23050508"/><rect x="40" y="80" width="560" height="120" fill="%23455238"/><rect x="0" y="0" width="640" height="140" fill="%23567d46"/><circle cx="210" cy="270" r="4" fill="%23ff3333"/><circle cx="230" cy="270" r="4" fill="%23ff3333"/><circle cx="340" cy="290" r="4" fill="%2300ffcc"/><circle cx="360" cy="290" r="4" fill="%2300ffcc"/><text x="20" y="40" font-family="monospace" font-size="20" font-weight="bold" fill="%23ffffff" opacity="0.9">POS: X:-177 Y:62 Z:168</text><text x="20" y="70" font-family="monospace" font-size="14" fill="%23a3e635">LIGHT: 4 // ENTITIES: 2</text></svg>`,
  plains: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect width="640" height="260" fill="%235c94fc"/><rect x="460" y="40" width="100" height="100" fill="%23fcfc00"/><rect x="0" y="260" width="640" height="220" fill="%2358a834"/><rect x="0" y="320" width="640" height="160" fill="%23488828"/><rect x="140" y="200" width="40" height="120" fill="%23684820"/><circle cx="160" cy="180" r="50" fill="%232c6b14"/><rect x="420" y="220" width="30" height="90" fill="%23684820"/><circle cx="435" cy="200" r="40" fill="%232c6b14"/><text x="20" y="40" font-family="monospace" font-size="20" font-weight="bold" fill="%23ffffff">PLAINS BIOME [DAY 02]</text><text x="20" y="70" font-family="monospace" font-size="14" fill="%23facc15">BIOME: PLAINS // VILLAGE SEARCHING...</text></svg>`,
  cliff: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect width="640" height="480" fill="%233a4a58"/><polygon points="0,480 0,160 220,190 280,480" fill="%2355606e"/><polygon points="360,480 420,120 640,90 640,480" fill="%23404c5a"/><rect x="0" y="0" width="640" height="180" fill="%237ca2be"/><rect x="250" y="300" width="130" height="180" fill="%2310151c"/><text x="20" y="40" font-family="monospace" font-size="20" font-weight="bold" fill="%23ffffff">CLIFF CANYON</text><text x="20" y="70" font-family="monospace" font-size="14" fill="%2338bdf8">X:116 Y:72 Z:342</text></svg>`,
  mineshaft: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect width="640" height="480" fill="%23111114"/><rect x="180" y="100" width="20" height="380" fill="%23855325"/><rect x="440" y="100" width="20" height="380" fill="%23855325"/><rect x="180" y="100" width="280" height="24" fill="%23855325"/><rect x="0" y="380" width="640" height="100" fill="%23222226"/><line x1="0" y1="420" x2="640" y2="420" stroke="%2355555e" stroke-width="8"/><rect x="300" y="340" width="50" height="40" fill="%23b87428"/><rect x="320" y="355" width="10" height="10" fill="%23f59e0b"/><text x="20" y="40" font-family="monospace" font-size="20" font-weight="bold" fill="%23ffffff">ABANDONED MINESHAFT</text><text x="20" y="70" font-family="monospace" font-size="14" fill="%23fbbf24">CHEST LOOT // GOLD: 4</text></svg>`,
  cherry: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect width="640" height="480" fill="%23e0f2fe"/><rect x="0" y="280" width="640" height="200" fill="%234ade80"/><circle cx="160" cy="180" r="70" fill="%23f472b6"/><circle cx="320" cy="160" r="90" fill="%23f472b6"/><circle cx="480" cy="190" r="75" fill="%23f472b6"/><rect x="260" y="320" width="120" height="100" fill="%23854d0e"/><polygon points="240,320 320,240 400,320" fill="%23fbcfe8"/><text x="20" y="40" font-family="monospace" font-size="20" font-weight="bold" fill="%23831843">CHERRY GROVE BASE</text><text x="20" y="70" font-family="monospace" font-size="14" fill="%23db2777">X:430 Y:98 Z:620 // HOME SET</text></svg>`,
  player_uta: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%231e293b"/><circle cx="64" cy="50" r="32" fill="%23fde047"/><rect x="42" y="30" width="44" height="20" fill="%231e1b4b"/><rect x="46" y="48" width="8" height="8" fill="%230f172a"/><rect x="74" y="48" width="8" height="8" fill="%230f172a"/><rect x="58" y="64" width="12" height="4" fill="%23e11d48"/><path d="M 28 118 C 28 88, 100 88, 100 118 Z" fill="%233b82f6"/></svg>`,
  member_golem: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%231e293b"/><rect x="36" y="24" width="56" height="60" fill="%23e2e8f0"/><rect x="44" y="42" width="10" height="10" fill="%23ef4444"/><rect x="74" y="42" width="10" height="10" fill="%23ef4444"/><rect x="58" y="58" width="12" height="18" fill="%2394a3b8"/><path d="M 20 118 C 20 84, 108 84, 108 118 Z" fill="%23cbd5e1"/></svg>`,
  member_allay: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%230f172a"/><circle cx="64" cy="54" r="26" fill="%2338bdf8"/><circle cx="56" cy="52" r="4" fill="%23ffffff"/><circle cx="72" cy="52" r="4" fill="%23ffffff"/><ellipse cx="36" cy="62" rx="16" ry="8" fill="%23bae6fd" opacity="0.8"/><ellipse cx="92" cy="62" rx="16" ry="8" fill="%23bae6fd" opacity="0.8"/><path d="M 46 80 Q 64 114 82 80 Z" fill="%230284c7"/></svg>`,
};

// Initial Seed Data
const SEED_WORLDS: WorldWithMembers[] = [
  {
    id: 'world-demo-01',
    name: 'テストプレイ',
    player: 'ウタ',
    player_photo_path: SAMPLE_IMAGES.player_uta,
    memo: 'アプリ開発、デバッグ用サバイバルワールド。',
    created_at: '2026-08-21T10:00:00.000Z',
    updated_at: '2026-08-24T20:06:00.000Z',
    members: [
      { id: 'mem-1', name: 'ウタ', photo_path: SAMPLE_IMAGES.player_uta },
      { id: 'mem-2', name: 'ゴーレム', photo_path: SAMPLE_IMAGES.member_golem },
      { id: 'mem-3', name: 'アレイ', photo_path: SAMPLE_IMAGES.member_allay },
    ],
  },
  {
    id: 'world-demo-02',
    name: '孤島サバイバル Hardcore',
    player: 'ウタ',
    player_photo_path: SAMPLE_IMAGES.player_uta,
    memo: '大海原にポツンと浮かぶ1本の木から始まる極限サバイバル。',
    created_at: '2026-08-25T14:30:00.000Z',
    updated_at: '2026-08-26T18:45:00.000Z',
    members: [
      { id: 'mem-21', name: 'ウタ', photo_path: SAMPLE_IMAGES.player_uta },
      { id: 'mem-22', name: '相棒の狼', photo_path: SAMPLE_IMAGES.member_golem },
    ],
  },
];

const SEED_LOCATIONS: LocationWithPhotos[] = [
  {
    id: 'loc-01',
    world_id: 'world-demo-01',
    name: '浅めの洞窟',
    x: -177,
    y: 62,
    z: 168,
    detail_memo: 'ゾンビ2体を目視、初めての洞窟なので探索してみたが、そう深くはない石炭が少量手に入った。',
    created_at: '2026-08-21T19:47:00.000Z',
    updated_at: '2026-08-21T19:47:00.000Z',
    photos: [
      {
        id: 'photo-01',
        location_id: 'loc-01',
        storage_path: SAMPLE_IMAGES.cave,
        caption: '浅めの洞窟の入り口',
        created_at: '2026-08-21T19:47:00.000Z',
      },
    ],
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtube_id: 'dQw4w9WgXcQ',
    youtube_title: '【マイクラ】第1話: 初めての洞窟と石炭採掘',
    member_ids: ['mem-1'],
    tags: ['#洞窟', '#石炭採掘', '#Day1'],
    is_checkpoint: true,
  },
  {
    id: 'loc-02',
    world_id: 'world-demo-01',
    name: 'どこだろう。',
    x: 37,
    y: 64,
    z: 62,
    detail_memo: '集落や、村を探して歩き続けているが、生き物の気配は皆無である。夕暮れまでに仮宿を作らねば。',
    created_at: '2026-08-22T15:20:00.000Z',
    updated_at: '2026-08-22T15:20:00.000Z',
    photos: [
      {
        id: 'photo-02',
        location_id: 'loc-02',
        storage_path: SAMPLE_IMAGES.plains,
        caption: '広大な平原のパノラマ',
        created_at: '2026-08-22T15:20:00.000Z',
      },
    ],
    member_ids: ['mem-1'],
    tags: ['#平原', '#探索', '#Day2'],
    is_checkpoint: false,
  },
  {
    id: 'loc-03',
    world_id: 'world-demo-01',
    name: '断崖の洞窟前',
    x: 116,
    y: 72,
    z: 342,
    detail_memo: '大きな亀裂が入った断崖がある、村を探すのは一旦ストップしよう。急造の銅装備では心許ないが、探索しない選択は無い。文字数がオーバーした際のスクロール挙動を確認するため無駄に文字を入力している。どうやら問題なく収まっているようだ。',
    created_at: '2026-08-23T11:05:00.000Z',
    updated_at: '2026-08-23T11:05:00.000Z',
    photos: [
      {
        id: 'photo-03',
        location_id: 'loc-03',
        storage_path: SAMPLE_IMAGES.cliff,
        caption: '断崖絶壁の大亀裂',
        created_at: '2026-08-23T11:05:00.000Z',
      },
    ],
    member_ids: ['mem-1', 'mem-2'],
    tags: ['#断崖', '#亀裂', '#Day3'],
    is_checkpoint: true,
  },
  {
    id: 'loc-04',
    world_id: 'world-demo-01',
    name: '地下の廃坑探検',
    x: 204,
    y: 28,
    z: 410,
    detail_memo: '亀裂の奥深くに広大な廃坑が広がっていた！毒蜘蛛の巣を焼き払い、ゴーレムと共にトロッコチェストを3つ回収。金インゴットとダイヤのツルハシを獲得！',
    created_at: '2026-08-23T17:30:00.000Z',
    updated_at: '2026-08-23T17:30:00.000Z',
    photos: [
      {
        id: 'photo-04',
        location_id: 'loc-04',
        storage_path: SAMPLE_IMAGES.mineshaft,
        caption: '木造の支柱が残る廃坑',
        created_at: '2026-08-23T17:30:00.000Z',
      },
    ],
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtube_id: 'dQw4w9WgXcQ',
    youtube_title: '【マイクラ】第3話: 廃坑攻略と金塊発掘',
    member_ids: ['mem-1', 'mem-2'],
    tags: ['#廃坑', '#お宝チェスト', '#Day3'],
    is_checkpoint: false,
  },
  {
    id: 'loc-05',
    world_id: 'world-demo-01',
    name: '桜の丘の拠点 (Home Base)',
    x: 430,
    y: 98,
    z: 620,
    detail_memo: '廃坑を出て北東に進むと、一面ピンクの桜バイオームを発見！アレイも仲間に加わり、ここに念願のメイン拠点を建築開始。チェスト倉庫と畑が完成した。',
    created_at: '2026-08-24T20:06:00.000Z',
    updated_at: '2026-08-24T20:06:00.000Z',
    photos: [
      {
        id: 'photo-05',
        location_id: 'loc-05',
        storage_path: SAMPLE_IMAGES.cherry,
        caption: '満開の桜の丘と本拠点',
        created_at: '2026-08-24T20:06:00.000Z',
      },
    ],
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtube_id: 'dQw4w9WgXcQ',
    youtube_title: '【マイクラ】第4話: 桜の丘に夢のマイホーム建築！',
    member_ids: ['mem-1', 'mem-2', 'mem-3'],
    tags: ['#桜バイオーム', '#本拠点完成', '#Day4', '#アレイ'],
    is_checkpoint: true,
  },
  {
    id: 'loc-21',
    world_id: 'world-demo-02',
    name: '孤独な1本の木',
    x: 0,
    y: 64,
    z: 0,
    detail_memo: '周囲360度すべて海。砂浜に1本の樫の木のみ。苗木を1つも落とさずに回収できるかが生存の命運を分ける。',
    created_at: '2026-08-25T15:00:00.000Z',
    photos: [
      {
        id: 'photo-21',
        location_id: 'loc-21',
        storage_path: SAMPLE_IMAGES.plains,
        caption: '孤島の始まり',
        created_at: '2026-08-25T15:00:00.000Z',
      },
    ],
    member_ids: ['mem-21'],
    tags: ['#孤島', '#Hardcore', '#Day1'],
  },
];

// In-memory / LocalStorage Helper
function getStoredWorlds(): WorldWithMembers[] {
  try {
    const raw = localStorage.getItem(STORAGE_WORLDS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_WORLDS_KEY, JSON.stringify(SEED_WORLDS));
      return SEED_WORLDS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_WORLDS;
  }
}

function saveStoredWorlds(worlds: WorldWithMembers[]) {
  try {
    localStorage.setItem(STORAGE_WORLDS_KEY, JSON.stringify(worlds));
  } catch (e) {
    console.error('Save worlds error:', e);
  }
}

function getStoredLocations(): LocationWithPhotos[] {
  try {
    const raw = localStorage.getItem(STORAGE_LOCATIONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_LOCATIONS_KEY, JSON.stringify(SEED_LOCATIONS));
      return SEED_LOCATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_LOCATIONS;
  }
}

function saveStoredLocations(locations: LocationWithPhotos[]) {
  try {
    localStorage.setItem(STORAGE_LOCATIONS_KEY, JSON.stringify(locations));
  } catch (e) {
    console.error('Save locations error:', e);
  }
}

function getStoredWiki(): WikiArticle[] {
  try {
    const raw = localStorage.getItem(STORAGE_WIKI_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredWiki(articles: WikiArticle[]) {
  try {
    localStorage.setItem(STORAGE_WIKI_KEY, JSON.stringify(articles));
  } catch (e) {
    console.error('Save wiki error:', e);
  }
}

// Database API Methods
export async function fetchWorlds(): Promise<WorldWithMembers[]> {
  return getStoredWorlds();
}

export async function fetchWorld(worldId: string): Promise<WorldWithMembers | null> {
  const worlds = getStoredWorlds();
  return worlds.find((w) => w.id === worldId) || null;
}

export async function createWorld(data: {
  name: string;
  player?: string;
  player_photo_path?: string;
  memo?: string;
  members?: string[];
}): Promise<WorldWithMembers> {
  const worlds = getStoredWorlds();
  const id = `world-${Date.now()}`;
  const now = new Date().toISOString();

  const membersList = (data.members || []).map((name, i) => ({
    id: `mem-${id}-${i}`,
    name,
    photo_path: i === 0 ? SAMPLE_IMAGES.player_uta : SAMPLE_IMAGES.member_golem,
  }));

  const newWorld: WorldWithMembers = {
    id,
    name: data.name,
    player: data.player || 'プレイヤー',
    player_photo_path: data.player_photo_path || SAMPLE_IMAGES.player_uta,
    memo: data.memo || '',
    created_at: now,
    updated_at: now,
    members: membersList.length > 0 ? membersList : [{ id: `mem-${id}-0`, name: data.player || 'プレイヤー', photo_path: SAMPLE_IMAGES.player_uta }],
  };

  worlds.unshift(newWorld);
  saveStoredWorlds(worlds);
  return newWorld;
}

export async function updateWorld(
  worldId: string,
  data: Partial<WorldWithMembers> & { memberNames?: string[] }
): Promise<WorldWithMembers> {
  const worlds = getStoredWorlds();
  const index = worlds.findIndex((w) => w.id === worldId);
  if (index === -1) throw new Error('ワールドが見つかりません');

  let members = worlds[index].members;
  if (data.memberNames) {
    members = data.memberNames.map((name, i) => {
      const existing = members[i];
      return {
        id: existing ? existing.id : `mem-${worldId}-${Date.now()}-${i}`,
        name,
        photo_path: existing?.photo_path || (i === 0 ? SAMPLE_IMAGES.player_uta : SAMPLE_IMAGES.member_golem),
      };
    });
  }

  const updated: WorldWithMembers = {
    ...worlds[index],
    ...data,
    members,
    updated_at: new Date().toISOString(),
  };

  worlds[index] = updated;
  saveStoredWorlds(worlds);
  return updated;
}

export async function deleteWorld(worldId: string): Promise<void> {
  const worlds = getStoredWorlds().filter((w) => w.id !== worldId);
  saveStoredWorlds(worlds);

  const locations = getStoredLocations().filter((loc) => loc.world_id !== worldId);
  saveStoredLocations(locations);

  const wiki = getStoredWiki().filter((art) => art.world_id !== worldId);
  saveStoredWiki(wiki);
}

// Location / Record methods
export async function fetchLocations(worldId: string): Promise<LocationWithPhotos[]> {
  const locations = getStoredLocations();
  return locations.filter((loc) => loc.world_id === worldId);
}

export async function createLocation(
  worldId: string,
  data: {
    name: string;
    detail_memo: string;
    x?: number;
    y?: number;
    z?: number;
    created_at?: string;
    photos?: string[];
    youtube_url?: string;
    youtube_title?: string;
    member_ids?: string[];
    tags?: string[];
    is_checkpoint?: boolean;
  }
): Promise<LocationWithPhotos> {
  const locations = getStoredLocations();
  const id = `loc-${Date.now()}`;
  const now = data.created_at || new Date().toISOString();

  // Extract YouTube ID if present
  let youtube_id: string | undefined = undefined;
  if (data.youtube_url) {
    const match = data.youtube_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match) youtube_id = match[1];
  }

  const photosList = (data.photos || []).map((storage_path, idx) => ({
    id: `photo-${id}-${idx}`,
    location_id: id,
    storage_path,
    caption: `${data.name} の記録写真`,
    created_at: now,
  }));

  const newLoc: LocationWithPhotos = {
    id,
    world_id: worldId,
    name: data.name.trim() || '無名の拠点',
    x: data.x ?? 0,
    y: data.y ?? 64,
    z: data.z ?? 0,
    detail_memo: data.detail_memo || '',
    created_at: now,
    updated_at: now,
    photos: photosList,
    youtube_url: data.youtube_url,
    youtube_id,
    youtube_title: data.youtube_title,
    member_ids: data.member_ids || [],
    tags: data.tags || [],
    is_checkpoint: data.is_checkpoint ?? false,
  };

  locations.push(newLoc);
  saveStoredLocations(locations);

  // Update world updated_at
  const worlds = getStoredWorlds();
  const wIdx = worlds.findIndex((w) => w.id === worldId);
  if (wIdx !== -1) {
    worlds[wIdx].updated_at = now;
    saveStoredWorlds(worlds);
  }

  return newLoc;
}

export async function updateLocation(
  locationId: string,
  data: Partial<LocationWithPhotos> & { newPhotos?: string[] }
): Promise<LocationWithPhotos> {
  const locations = getStoredLocations();
  const idx = locations.findIndex((l) => l.id === locationId);
  if (idx === -1) throw new Error('記録が見つかりません');

  let youtube_id = locations[idx].youtube_id;
  if (data.youtube_url) {
    const match = data.youtube_url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match) youtube_id = match[1];
  }

  let photos = locations[idx].photos;
  if (data.newPhotos) {
    photos = data.newPhotos.map((storage_path, i) => ({
      id: `photo-${locationId}-${Date.now()}-${i}`,
      location_id: locationId,
      storage_path,
      created_at: new Date().toISOString(),
    }));
  }

  const updated: LocationWithPhotos = {
    ...locations[idx],
    ...data,
    photos,
    youtube_id,
    updated_at: new Date().toISOString(),
  };

  locations[idx] = updated;
  saveStoredLocations(locations);
  return updated;
}

export async function deleteLocation(locationId: string): Promise<void> {
  const locations = getStoredLocations().filter((l) => l.id !== locationId);
  saveStoredLocations(locations);
}

// Wiki Article Persistence
export async function fetchWikiArticle(
  worldId: string,
  style: 'wikipedia' | 'scp' | 'ancient'
): Promise<WikiArticle | null> {
  const list = getStoredWiki();
  return list.find((a) => a.world_id === worldId && a.style === style) || null;
}

export async function saveWikiArticle(
  worldId: string,
  style: 'wikipedia' | 'scp' | 'ancient',
  content: string
): Promise<WikiArticle> {
  const list = getStoredWiki();
  const now = new Date().toISOString();
  const existingIdx = list.findIndex((a) => a.world_id === worldId && a.style === style);

  const article: WikiArticle = {
    world_id: worldId,
    style,
    content,
    created_at: existingIdx !== -1 ? list[existingIdx].created_at : now,
    updated_at: now,
  };

  if (existingIdx !== -1) {
    list[existingIdx] = article;
  } else {
    list.push(article);
  }

  saveStoredWiki(list);
  return article;
}

export async function resetWikiArticle(
  worldId: string,
  style: 'wikipedia' | 'scp' | 'ancient'
): Promise<void> {
  const list = getStoredWiki().filter((a) => !(a.world_id === worldId && a.style === style));
  saveStoredWiki(list);
}

export async function getPhotoUrl(storagePath: string): Promise<string> {
  return storagePath;
}
