export interface WorldMember {
  id: string;
  name: string;
  photo_path?: string | null;
}

export interface World {
  id: string;
  game_id: string;
  name: string;
  player?: string | null;
  player_photo_path?: string | null;
  memo?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface WorldWithMembers extends World {
  members: WorldMember[];
}

export interface LocationPhoto {
  id: string;
  location_id: string;
  storage_path: string;
  is_main: boolean;
  created_at: string;
}

export interface Location {
  id: string;
  world_id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  detail_memo?: string;
  created_at: string;
  updated_at?: string;
}

export interface LocationWithPhotos extends Location {
  photos: LocationPhoto[];
  members: WorldMember[];
}

export interface WikiArticle {
  id: string;
  world_id: string;
  style: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  name: string;
  description?: string;
}
