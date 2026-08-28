import { World, AdventureRecord, WikiArticle, SoundConfig, WikiStyle } from '../types';
import { INITIAL_WORLDS, INITIAL_RECORDS, INITIAL_WIKI_ARTICLES } from '../data/sampleWorlds';

const STORAGE_KEYS = {
  WORLDS: 'utapedia:worlds:v2',
  RECORDS: 'utapedia:records:v2',
  WIKI_ARTICLES: 'utapedia:wiki_articles:v2',
  SOUND_CONFIG: 'utapedia:sound_config:v2',
  ACTIVE_WORLD_ID: 'utapedia:active_world_id:v2',
};

export class StorageService {
  public static init() {
    if (!localStorage.getItem(STORAGE_KEYS.WORLDS)) {
      localStorage.setItem(STORAGE_KEYS.WORLDS, JSON.stringify(INITIAL_WORLDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECORDS)) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_RECORDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WIKI_ARTICLES)) {
      localStorage.setItem(STORAGE_KEYS.WIKI_ARTICLES, JSON.stringify(INITIAL_WIKI_ARTICLES));
    }
  }

  // --- Worlds ---
  public static getWorlds(): World[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORLDS);
      return data ? JSON.parse(data) : INITIAL_WORLDS;
    } catch {
      return INITIAL_WORLDS;
    }
  }

  public static saveWorlds(worlds: World[]) {
    localStorage.setItem(STORAGE_KEYS.WORLDS, JSON.stringify(worlds));
  }

  public static getWorld(worldId: string): World | null {
    const worlds = this.getWorlds();
    return worlds.find((w) => w.id === worldId) || null;
  }

  public static saveWorld(world: World): World {
    const worlds = this.getWorlds();
    const existingIdx = worlds.findIndex((w) => w.id === world.id);
    if (existingIdx >= 0) {
      worlds[existingIdx] = { ...world, updatedAt: new Date().toISOString() };
    } else {
      worlds.push({
        ...world,
        createdAt: world.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.saveWorlds(worlds);
    return world;
  }

  public static deleteWorld(worldId: string) {
    const worlds = this.getWorlds().filter((w) => w.id !== worldId);
    this.saveWorlds(worlds);
    // Also cleanup records and articles
    const records = this.getRecords().filter((r) => r.worldId !== worldId);
    this.saveRecords(records);
  }

  public static getActiveWorldId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_WORLD_ID);
  }

  public static setActiveWorldId(worldId: string | null) {
    if (worldId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORLD_ID, worldId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORLD_ID);
    }
  }

  // --- Adventure Records ---
  public static getRecords(worldId?: string): AdventureRecord[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
      const all: AdventureRecord[] = data ? JSON.parse(data) : INITIAL_RECORDS;
      if (!worldId) return all;
      return all.filter((r) => r.worldId === worldId);
    } catch {
      return INITIAL_RECORDS.filter((r) => !worldId || r.worldId === worldId);
    }
  }

  public static saveRecords(records: AdventureRecord[]) {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  }

  public static addRecord(record: AdventureRecord): AdventureRecord {
    const all = this.getRecords();
    const next = [record, ...all];
    this.saveRecords(next);
    return record;
  }

  public static updateRecord(record: AdventureRecord): AdventureRecord {
    const all = this.getRecords();
    const next = all.map((r) => (r.id === record.id ? record : r));
    this.saveRecords(next);
    return record;
  }

  public static deleteRecord(recordId: string) {
    const all = this.getRecords();
    const next = all.filter((r) => r.id !== recordId);
    this.saveRecords(next);
  }

  // --- Wiki Articles ---
  public static getWikiArticle(worldId: string, style: WikiStyle): WikiArticle | null {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WIKI_ARTICLES);
      const all: Record<string, WikiArticle> = data ? JSON.parse(data) : INITIAL_WIKI_ARTICLES;
      const key = `${worldId}-${style}`;
      return all[key] || null;
    } catch {
      return null;
    }
  }

  public static saveWikiArticle(article: WikiArticle) {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WIKI_ARTICLES);
      const all: Record<string, WikiArticle> = data ? JSON.parse(data) : {};
      const key = `${article.worldId}-${article.style}`;
      all[key] = article;
      localStorage.setItem(STORAGE_KEYS.WIKI_ARTICLES, JSON.stringify(all));
    } catch {
      // Storage error
    }
  }

  public static resetWikiArticle(worldId: string, style: WikiStyle) {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WIKI_ARTICLES);
      const all: Record<string, WikiArticle> = data ? JSON.parse(data) : {};
      const key = `${worldId}-${style}`;
      delete all[key];
      localStorage.setItem(STORAGE_KEYS.WIKI_ARTICLES, JSON.stringify(all));
    } catch {
      // Storage error
    }
  }

  // --- Sound Config ---
  public static getSoundConfig(): SoundConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOUND_CONFIG);
      return data
        ? JSON.parse(data)
        : {
            masterVolume: 0.75,
            reverbWet: 0.35,
            bgmVolume: 0.55,
            seVolume: 0.8,
            muted: false,
            channels: { melody: true, arpeggio: true, bass: true, drums: true },
          };
    } catch {
      return {
        masterVolume: 0.75,
        reverbWet: 0.35,
        bgmVolume: 0.55,
        seVolume: 0.8,
        muted: false,
        channels: { melody: true, arpeggio: true, bass: true, drums: true },
      };
    }
  }

  public static saveSoundConfig(cfg: SoundConfig) {
    localStorage.setItem(STORAGE_KEYS.SOUND_CONFIG, JSON.stringify(cfg));
  }

  // --- Reset to Initial Default Data ---
  public static resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.WORLDS);
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.WIKI_ARTICLES);
    this.init();
  }
}
