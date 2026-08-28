export type WorldCategory = 'game' | 'travel' | 'hobby' | 'life' | 'other';

export interface WorldMember {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
}

export interface World {
  id: string;
  name: string;
  player: string;
  playerPhotoUrl?: string;
  memo?: string;
  category: WorldCategory;
  categoryLabel?: string;
  members: WorldMember[];
  createdAt: string;
  updatedAt: string;
}

export interface PhotoItem {
  id: string;
  url: string; // Base64 or Object URL
  caption?: string;
  createdAt: string;
}

export interface LogEntry {
  id: string;
  worldId: string;
  dayNumber: number;
  timestamp: string; // e.g. "2026/08/21 19:47" or ISO
  locationName: string; // 浅めの洞窟, 通天閣, etc.
  coordinates?: {
    x: number;
    y: number;
    z: number;
  };
  area?: string; // e.g. "大阪市浪速区", "東部山岳地帯"
  memo: string; // 何をした、体験メモ
  photos: PhotoItem[];
  memberIds?: string[];
  tags?: string[];
  starred?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type WikiStyleId = 'wikipedia' | 'scp' | 'ancient';

export interface WikiArticle {
  worldId: string;
  style: WikiStyleId;
  content: string;
  updatedAt: string;
}

export interface SoundConfig {
  masterVolume: number;
  bgmVolume: number;
  seVolume: number;
  reverbWet: number;
  bgmEnabled: boolean;
  seEnabled: boolean;
}
