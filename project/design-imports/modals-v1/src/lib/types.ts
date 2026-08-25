export type WorldMember = {
  id: string;
  name: string;
  photo_path?: string;
};

export type World = {
  id: string;
  game_id: string;
  name: string;
  player?: string;
  player_photo_path?: string;
  memo?: string;
  version?: string;
  created_at: string;
  updated_at: string;
};

export type WorldWithMembers = World & {
  members: WorldMember[];
};

export type LocationPhoto = {
  id: string;
  location_id: string;
  storage_path: string;
  is_main: boolean;
  created_at: string;
};

export type Location = {
  id: string;
  world_id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  detail_memo?: string;
  created_at: string;
  updated_at: string;
};

export type LocationWithPhotos = Location & {
  photos: LocationPhoto[];
  members: WorldMember[];
};
