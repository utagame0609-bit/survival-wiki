export type Member = {
  id: string;
  name: string;
  photo_path?: string | null;
};

export type World = {
  id: string;
  name: string;
  player?: string | null;
  player_photo_path?: string | null;
  memo?: string | null;
  created_at: string;
  updated_at?: string;
};

export type WorldWithMembers = World & {
  members: Member[];
};

export type LocationPhoto = {
  id: string;
  location_id: string;
  storage_path: string;
  caption?: string;
  created_at: string;
};

export type LocationWithPhotos = {
  id: string;
  world_id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  detail_memo: string;
  created_at: string;
  updated_at?: string;
  photos: LocationPhoto[];
  youtube_url?: string;
  youtube_id?: string;
  youtube_title?: string;
  member_ids?: string[];
  tags?: string[];
  is_checkpoint?: boolean;
};

export type WikiArticle = {
  world_id: string;
  style: 'wikipedia' | 'scp' | 'ancient';
  content: string;
  created_at: string;
  updated_at: string;
};

export type ViewMode = 'mobile' | 'pc';

export type SoundConfig = {
  masterVolume: number; // 0..1
  reverbWet: number; // 0..1
  seVolume: number; // 0..1
  seEnabled: boolean;
  bgmEnabled: boolean;
  bgmChannels: {
    melody: boolean;
    arpeggio: boolean;
    bass: boolean;
    drums: boolean;
  };
};

export type SnsShareData = {
  text: string;
  hashtags: string[];
  locationName: string;
  worldName: string;
  x?: number;
  y?: number;
  z?: number;
  memo?: string;
  photos?: string[];
  youtube_url?: string;
  youtube_title?: string;
};
