export type Screen =
  | { name: 'worldList'; gameId: string; gameName: string }
  | {
      name: 'world';
      gameId: string;
      worldId: string;
      worldName: string;
      initialTab?: 'records' | 'wiki';
    };

export type Tab = 'records' | 'wiki';

export interface WorldMember {
  id: string;
  world_id?: string;
  name: string;
  photo_path?: string;
  photoUrl?: string;
  created_at?: string;
}

export interface World {
  id: string;
  game_id: string;
  name: string;
  player: string;
  player_photo_path?: string;
  playerPhotoUrl?: string;
  memo: string;
  created_at: string;
  updated_at?: string;
  slotNumber: number;
  daysCount: number;
  recordsCount: number;
  lastRecordDate: string;
  members: WorldMember[];
}

export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

export interface LocationPhoto {
  id: string;
  location_id?: string;
  storage_path?: string;
  url: string;
  is_main?: boolean;
  sort_order?: number;
  caption?: string;
  created_at?: string;
}

export interface RecordItem {
  id: string;
  world_id: string;
  name: string;
  x?: number;
  y?: number;
  z?: number;
  has_coordinates: boolean;
  detail_memo: string;
  date: string;
  time: string;
  photos: LocationPhoto[];
  members: string[]; // member names or IDs
  category?: 'base' | 'exploration' | 'battle' | 'resource' | 'hazard' | 'structure';
  created_at: string;
  updated_at?: string;
}

export type WikiCompilerStyle = 'wikipedia' | 'scp' | 'ancient';

export interface WikiCompiler {
  id: WikiCompilerStyle;
  name: string;
  title: string;
  subtitle: string;
  avatarUrl: string;
  description: string;
  sampleTone: string;
  badgeColor: string;
}

export type WikiScope = 'month' | 'year' | 'world';

export interface WikiArticle {
  id: string;
  world_id: string;
  compiler_style: WikiCompilerStyle;
  compiler_name: string;
  scope: WikiScope;
  period_label: string;
  title: string;
  subtitle: string;
  lead_text: string;
  sections: {
    heading: string;
    body: string;
    quote?: string;
    subheading?: string;
  }[];
  verdict_or_classification?: string;
  generated_at: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  bgmVolume: number;
  seVolume: number;
  crtScanlines: boolean;
  hapticFeedback: boolean;
  theme: 'sfc' | 'fc_dark';
}
