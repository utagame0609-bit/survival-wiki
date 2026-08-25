export interface Member {
  id: string;
  name: string;
  photo_path: string | null;
  role?: string;
}

export interface WorldWithMembers {
  id: string;
  game_id: string;
  name: string;
  player: string | null;
  player_photo_path: string | null;
  created_at: string;
  members: Member[];
}

export interface LocationPhoto {
  id: string;
  storage_path: string;
  is_main?: boolean;
}

export interface LocationItem {
  id: string;
  world_id: string;
  name: string;
  created_at: string;
  photos: LocationPhoto[];
}
