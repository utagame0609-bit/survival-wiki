export type Game = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  available: boolean;
  sort_order: number;
};

export type World = {
  id: string;
  user_id: string | null;
  game_id: string;
  name: string;
  player: string | null;
  player_photo_path: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export type WorldMember = {
  id: string;
  world_id: string;
  name: string;
  photo_path: string | null;
  created_at: string;
};

export type Location = {
  id: string;
  world_id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  has_coordinates: boolean;
  detail_memo: string | null;
  created_at: string;
  updated_at: string;
};

export type LocationPhoto = {
  id: string;
  location_id: string;
  storage_path: string;
  is_main: boolean;
  sort_order: number;
  created_at: string;
};

export type WikiArticle = {
  id: string;
  world_id: string;
  style: string;
  content: string | null;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LocationWithPhotos = Location & {
  photos: LocationPhoto[];
  members: WorldMember[];
};

export type WorldWithMembers = World & {
  members: WorldMember[];
};
