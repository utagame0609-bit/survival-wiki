import { World, LogEntry, WikiArticle, WikiStyleId, SoundConfig } from '../types';

const STORAGE_KEYS = {
  WORLDS: 'survival-wiki:worlds:v2',
  LOGS: 'survival-wiki:logs:v2',
  WIKIS: 'survival-wiki:wikis:v2',
  SOUND_CONFIG: 'survival-wiki:sound-config:v2',
  LAST_OPENED_WORLD: 'survival-wiki:last-world',
  DEVICE_MODE: 'survival-wiki:device-mode', // 'mobile-frame' | 'responsive'
};

// Initial Seed Data: Realistic Game + Travel/Hobby Examples
const SEED_WORLDS: World[] = [
  {
    id: 'world-mc-survival',
    name: '第1サバイバル期 // 辺境開拓',
    player: 'ウタ',
    playerPhotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    memo: '拠点作りと地下要塞の探索、村人交易の自動化を目指す長期開拓ワールド。',
    category: 'game',
    categoryLabel: 'MINECRAFT SURVIVAL',
    members: [
      { id: 'm1', name: 'ゴーレム', role: '防衛・採掘' },
      { id: 'm2', name: 'アレイ', role: 'アイテム回収' },
    ],
    createdAt: '2026-08-20T10:00:00.000Z',
    updatedAt: '2026-08-24T20:00:00.000Z',
  },
  {
    id: 'world-kansai-trip',
    name: '大阪〜京都 食べ歩き・レトロ街歩き',
    player: 'ウタ',
    playerPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    memo: '新世界、通天閣、道頓堀、祇園のレトロ喫茶と名物グルメを巡る2泊3日の旅。',
    category: 'travel',
    categoryLabel: 'TRAVEL / GOURMET',
    members: [
      { id: 'm3', name: 'カメラ担当', role: '記録' },
      { id: 'm4', name: '食い倒れ隊長', role: 'ナビ' },
    ],
    createdAt: '2026-08-25T09:00:00.000Z',
    updatedAt: '2026-08-27T18:30:00.000Z',
  },
];

const SEED_LOGS: LogEntry[] = [
  // --- Minecraft Logs ---
  {
    id: 'log-mc-1',
    worldId: 'world-mc-survival',
    dayNumber: 1,
    timestamp: '2026/08/21 19:47',
    locationName: '浅めの洞窟',
    coordinates: { x: -177, y: 62, z: 168 },
    area: '初期リスポーン北西',
    memo: 'ゾンビ2体を目視。初めての洞窟なので探索してみたが、そう深くはない。石炭が少量手に入った。松明を多めに設置して安全確保。',
    photos: [
      {
        id: 'p-mc-1',
        url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
        caption: '洞窟の入口。石炭鉱石が見える',
        createdAt: '2026/08/21 19:47',
      },
    ],
    memberIds: ['m1'],
    tags: ['採掘', '洞窟', '石炭'],
    starred: true,
    createdAt: '2026-08-21T19:47:00.000Z',
  },
  {
    id: 'log-mc-2',
    worldId: 'world-mc-survival',
    dayNumber: 2,
    timestamp: '2026/08/22 14:15',
    locationName: '平原の開拓地',
    coordinates: { x: 37, y: 64, z: 62 },
    area: '第一拠点予定地',
    memo: '集落や村を探して歩き続けているが、生き物の気配は皆無である。見晴らしの良い丘の上に小さな木造の仮小屋を建設開始。',
    photos: [
      {
        id: 'p-mc-2',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        caption: '開拓予定の草原と仮拠点',
        createdAt: '2026/08/22 14:15',
      },
    ],
    memberIds: ['m1', 'm2'],
    tags: ['拠点', '建築', '草原'],
    starred: false,
    createdAt: '2026-08-22T14:15:00.000Z',
  },
  {
    id: 'log-mc-3',
    worldId: 'world-mc-survival',
    dayNumber: 3,
    timestamp: '2026/08/23 11:30',
    locationName: '断崖の洞窟前',
    coordinates: { x: 116, y: 72, z: 342 },
    area: '山岳バイオーム境目',
    memo: '大きな亀裂が入った断崖がある。急造の銅装備では心許ないが、探索しない選択は無い。奥から鉄鉱石とマグマの音が響く。',
    photos: [
      {
        id: 'p-mc-3',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
        caption: '断崖絶壁と深部への亀裂',
        createdAt: '2026/08/23 11:30',
      },
    ],
    memberIds: ['m1'],
    tags: ['探検', '鉄鉱石', '山岳'],
    starred: true,
    createdAt: '2026-08-23T11:30:00.000Z',
  },
  {
    id: 'log-mc-4',
    worldId: 'world-mc-survival',
    dayNumber: 4,
    timestamp: '2026/08/24 20:06',
    locationName: '第1地下農場',
    coordinates: { x: 42, y: 55, z: 70 },
    area: '拠点地下第1層',
    memo: '夜間でも安全に食料供給できるよう地下小麦畑とサトウキビ自動水流収穫機を試作。骨粉で小麦が大量に実り食糧難が解決！',
    photos: [
      {
        id: 'p-mc-4',
        url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
        caption: '完成した地下水流農場',
        createdAt: '2026/08/24 20:06',
      },
    ],
    memberIds: ['m2'],
    tags: ['農業', '自動化', '食料'],
    starred: true,
    createdAt: '2026-08-24T20:06:00.000Z',
  },

  // --- Kansai Trip Logs ---
  {
    id: 'log-ks-1',
    worldId: 'world-kansai-trip',
    dayNumber: 1,
    timestamp: '2026/08/25 12:30',
    locationName: '新世界・通天閣',
    coordinates: { x: 34, y: 65, z: 135 },
    area: '大阪市浪速区恵美須東',
    memo: '新世界に到着。通天閣を見上げる広場で名物の元祖串カツ（牛カツ・紅生姜・アスパラ）を実食。ソース二度漬け禁止のルールを守ってサクサク完食！',
    photos: [
      {
        id: 'p-ks-1',
        url: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&auto=format&fit=crop&q=80',
        caption: '青空にそびえる通天閣とレトロな看板',
        createdAt: '2026/08/25 12:30',
      },
    ],
    memberIds: ['m3', 'm4'],
    tags: ['グルメ', '大阪', '串カツ'],
    starred: true,
    createdAt: '2026-08-25T12:30:00.000Z',
  },
  {
    id: 'log-ks-2',
    worldId: 'world-kansai-trip',
    dayNumber: 2,
    timestamp: '2026/08/26 15:45',
    locationName: '道頓堀・戎橋',
    coordinates: { x: 34, y: 66, z: 135 },
    area: '大阪市中央区道頓堀',
    memo: 'グリコ看板前で定番のポーズ撮影。たこ焼きの有名店で外カリ中トロの出汁たこ焼きを食べる。外国人観光客と活気にあふれている。',
    photos: [
      {
        id: 'p-ks-2',
        url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
        caption: '道頓堀川沿いのネオンサインと賑わい',
        createdAt: '2026/08/26 15:45',
      },
    ],
    memberIds: ['m3'],
    tags: ['観光', 'たこ焼き', '道頓堀'],
    starred: false,
    createdAt: '2026-08-26T15:45:00.000Z',
  },
];

export const storage = {
  // --- Worlds ---
  getWorlds(): World[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORLDS);
      if (!data) {
        this.saveWorlds(SEED_WORLDS);
        return SEED_WORLDS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_WORLDS;
    }
  },

  saveWorlds(worlds: World[]): void {
    localStorage.setItem(STORAGE_KEYS.WORLDS, JSON.stringify(worlds));
  },

  getWorldById(id: string): World | undefined {
    return this.getWorlds().find((w) => w.id === id);
  },

  createWorld(worldData: Omit<World, 'id' | 'createdAt' | 'updatedAt'>): World {
    const worlds = this.getWorlds();
    const newWorld: World = {
      ...worldData,
      id: 'world-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    worlds.unshift(newWorld);
    this.saveWorlds(worlds);
    return newWorld;
  },

  updateWorld(id: string, updateData: Partial<World>): World {
    const worlds = this.getWorlds();
    const index = worlds.findIndex((w) => w.id === id);
    if (index === -1) throw new Error('World not found');
    const updated = {
      ...worlds[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    worlds[index] = updated;
    this.saveWorlds(worlds);
    return updated;
  },

  deleteWorld(id: string): void {
    const worlds = this.getWorlds().filter((w) => w.id !== id);
    this.saveWorlds(worlds);
    // Delete related logs and wikis
    const logs = this.getAllLogs().filter((l) => l.worldId !== id);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    const wikis = this.getAllWikis().filter((w) => w.worldId !== id);
    localStorage.setItem(STORAGE_KEYS.WIKIS, JSON.stringify(wikis));
  },

  // --- Logs (1つの記録) ---
  getAllLogs(): LogEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(SEED_LOGS));
        return SEED_LOGS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_LOGS;
    }
  },

  getLogsByWorld(worldId: string): LogEntry[] {
    const logs = this.getAllLogs().filter((l) => l.worldId === worldId);
    return logs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  createLog(worldId: string, logData: Omit<LogEntry, 'id' | 'worldId' | 'createdAt'>): LogEntry {
    const all = this.getAllLogs();
    const worldLogs = all.filter((l) => l.worldId === worldId);
    
    // Auto Day Number if not specified
    const currentMaxDay = worldLogs.reduce((max, l) => Math.max(max, l.dayNumber || 1), 1);
    const dayNumber = logData.dayNumber || currentMaxDay;

    const newLog: LogEntry = {
      ...logData,
      id: 'log-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      worldId,
      dayNumber,
      createdAt: new Date().toISOString(),
    };

    all.push(newLog);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(all));

    // Update World updatedAt
    const worlds = this.getWorlds();
    const worldIndex = worlds.findIndex((w) => w.id === worldId);
    if (worldIndex !== -1) {
      worlds[worldIndex].updatedAt = new Date().toISOString();
      this.saveWorlds(worlds);
    }

    return newLog;
  },

  updateLog(logId: string, updateData: Partial<LogEntry>): LogEntry {
    const all = this.getAllLogs();
    const index = all.findIndex((l) => l.id === logId);
    if (index === -1) throw new Error('Log entry not found');

    const updated = {
      ...all[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    all[index] = updated;
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(all));
    return updated;
  },

  deleteLog(logId: string): void {
    const all = this.getAllLogs().filter((l) => l.id !== logId);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(all));
  },

  // --- Wikis ---
  getAllWikis(): WikiArticle[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WIKIS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getWiki(worldId: string, style: WikiStyleId): WikiArticle | undefined {
    return this.getAllWikis().find((w) => w.worldId === worldId && w.style === style);
  },

  saveWiki(worldId: string, style: WikiStyleId, content: string): WikiArticle {
    const all = this.getAllWikis();
    const index = all.findIndex((w) => w.worldId === worldId && w.style === style);
    const item: WikiArticle = {
      worldId,
      style,
      content,
      updatedAt: new Date().toISOString(),
    };
    if (index !== -1) {
      all[index] = item;
    } else {
      all.push(item);
    }
    localStorage.setItem(STORAGE_KEYS.WIKIS, JSON.stringify(all));
    return item;
  },

  deleteWiki(worldId: string, style?: WikiStyleId): void {
    let all = this.getAllWikis();
    if (style) {
      all = all.filter((w) => !(w.worldId === worldId && w.style === style));
    } else {
      all = all.filter((w) => w.worldId !== worldId);
    }
    localStorage.setItem(STORAGE_KEYS.WIKIS, JSON.stringify(all));
  },

  // --- Config ---
  getLastOpenedWorld(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_OPENED_WORLD);
  },

  setLastOpenedWorld(id: string): void {
    localStorage.setItem(STORAGE_KEYS.LAST_OPENED_WORLD, id);
  },

  getDeviceMode(): 'mobile-frame' | 'responsive' {
    return (localStorage.getItem(STORAGE_KEYS.DEVICE_MODE) as any) || 'mobile-frame';
  },

  setDeviceMode(mode: 'mobile-frame' | 'responsive'): void {
    localStorage.setItem(STORAGE_KEYS.DEVICE_MODE, mode);
  },

  getSoundConfig(): SoundConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOUND_CONFIG);
      return data
        ? JSON.parse(data)
        : {
            masterVolume: 0.8,
            bgmVolume: 0.5,
            seVolume: 0.8,
            reverbWet: 0.35,
            bgmEnabled: true,
            seEnabled: true,
          };
    } catch {
      return {
        masterVolume: 0.8,
        bgmVolume: 0.5,
        seVolume: 0.8,
        reverbWet: 0.35,
        bgmEnabled: true,
        seEnabled: true,
      };
    }
  },

  saveSoundConfig(config: SoundConfig): void {
    localStorage.setItem(STORAGE_KEYS.SOUND_CONFIG, JSON.stringify(config));
  },
};
