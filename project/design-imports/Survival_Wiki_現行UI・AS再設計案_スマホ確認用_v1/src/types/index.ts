export type ActivityGenre = 'game' | 'travel' | 'hobby' | 'daily';

export type RecordCategory = 
  | 'exploration' 
  | 'discovery' 
  | 'battle' 
  | 'building' 
  | 'gourmet' 
  | 'culture'
  | 'misc';

export type ActiveTab = 'journal' | 'chest' | 'atlas' | 'wiki';

export interface PartyMember {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
}

export interface Coordinates {
  x?: number;
  y?: number;
  z?: number;
  rawText?: string;
}

export interface RecordPhoto {
  id: string;
  url: string;
  caption?: string;
  takenAt?: string;
}

export interface AdventureRecord {
  id: string;
  worldId: string;
  dayNumber: number;
  recordedAt: string; // e.g. "2026-08-21 19:47" or ISO string
  locationName: string; // "浅めの洞窟", "通天閣", "断崖の洞窟前"
  areaTag?: string; // "地下洞窟", "新世界", "拠点南側"
  coords?: Coordinates;
  memo: string; // Detailed narrative/activity log
  photos: RecordPhoto[];
  memberIds: string[]; // references PartyMember.id
  category: RecordCategory;
  isFavorite?: boolean;
  importance?: 'normal' | 'major' | 'legendary';
}

export interface World {
  id: string;
  name: string;
  genre: ActivityGenre;
  player: string;
  playerPhotoUrl?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
  members: PartyMember[];
  themeColor?: string;
}

export type WikiStyle = 'wikipedia' | 'scp' | 'ancient';

export interface NarratorInfo {
  id: WikiStyle;
  name: string;
  title: string;
  tagline: string;
  quote: string;
  avatarEmoji: string;
  tone: string;
  description: string;
  sampleVoiceLine: string;
  styleBadge: string;
  bgmId: string;
  themeColors: {
    primary: string;
    border: string;
    bg: string;
    accent: string;
  };
}

export interface WikiArticle {
  id: string;
  worldId: string;
  style: WikiStyle;
  title: string;
  summary: string;
  content: string; // Full markdown
  generatedAt: string;
  stats: {
    recordsCount: number;
    daysCount: number;
    photosCount: number;
    locationsCount: number;
  };
}

export interface SoundConfig {
  masterVolume: number;
  reverbWet: number;
  bgmVolume: number;
  seVolume: number;
  muted: boolean;
  channels: {
    melody: boolean;
    arpeggio: boolean;
    bass: boolean;
    drums: boolean;
  };
}
