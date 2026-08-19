/*
# Initial schema for Minecraft location recording app

1. Overview
This is a single-tenant app (no sign-in screen) for recording Minecraft world locations,
viewing a timeline, and generating Wiki articles. All data is shared/public within the app,
so RLS policies allow anon + authenticated CRUD on every table.

2. New Tables
- `games`: catalog of supported games (seeded with Minecraft). Custom worlds are future work.
  - id (uuid pk), slug (text unique), name (text), icon (text), available (bool), sort_order (int), created_at
- `worlds`: a user-created world within a game.
  - id (uuid pk), game_id (uuid fk games), name (text), player (text), memo (text), created_at, updated_at
- `world_members`: related members for a world (player is stored on worlds; this holds additional members).
  - id (uuid pk), world_id (uuid fk worlds cascade), name (text), created_at
- `locations`: a recorded location within a world.
  - id (uuid pk), world_id (uuid fk worlds cascade), name (text), x (int), y (int), z (int),
    detail_memo (text), created_at (timestamptz, editable), updated_at
- `location_photos`: photos attached to a location. main photo flagged by is_main; up to 5 nearby.
  - id (uuid pk), location_id (uuid fk locations cascade), storage_path (text), is_main (bool),
    sort_order (int), created_at
- `wiki_articles`: generated wiki article for a world, per style.
  - id (uuid pk), world_id (uuid fk worlds cascade), style (text), content (text),
    generated_at (timestamptz), created_at, updated_at

3. Security
- RLS enabled on all tables.
- Policies: anon + authenticated full CRUD (intentionally shared single-tenant data).

4. Notes
- Coordinates stored as separate x/y/z integers parsed client-side from free-form input.
- created_at on locations is editable (user can change the recorded time later).
- Wiki content stored as text; AI provider is swappable and not fixed here.
*/

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  icon text,
  available boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS worlds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name text NOT NULL,
  player text,
  memo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS world_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id uuid NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id uuid NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name text NOT NULL,
  x int NOT NULL DEFAULT 0,
  y int NOT NULL DEFAULT 0,
  z int NOT NULL DEFAULT 0,
  detail_memo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS location_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  is_main boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wiki_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id uuid NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  style text NOT NULL,
  content text,
  generated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (world_id, style)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_worlds_game_id ON worlds(game_id);
CREATE INDEX IF NOT EXISTS idx_world_members_world_id ON world_members(world_id);
CREATE INDEX IF NOT EXISTS idx_locations_world_id ON locations(world_id);
CREATE INDEX IF NOT EXISTS idx_locations_world_created ON locations(world_id, created_at);
CREATE INDEX IF NOT EXISTS idx_location_photos_location_id ON location_photos(location_id);
CREATE INDEX IF NOT EXISTS idx_wiki_articles_world_id ON wiki_articles(world_id);

-- Seed Minecraft game
INSERT INTO games (slug, name, icon, available, sort_order)
VALUES ('minecraft', 'Minecraft', 'cube', true, 0)
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_articles ENABLE ROW LEVEL SECURITY;

-- Policies: anon + authenticated full CRUD (single-tenant shared data)

-- games (read-only for anon; managed via migrations) — allow read for everyone, write for anon+auth
DROP POLICY IF EXISTS "games_select" ON games;
CREATE POLICY "games_select" ON games FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "games_insert" ON games;
CREATE POLICY "games_insert" ON games FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "games_update" ON games;
CREATE POLICY "games_update" ON games FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "games_delete" ON games;
CREATE POLICY "games_delete" ON games FOR DELETE TO anon, authenticated USING (true);

-- worlds
DROP POLICY IF EXISTS "worlds_select" ON worlds;
CREATE POLICY "worlds_select" ON worlds FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "worlds_insert" ON worlds;
CREATE POLICY "worlds_insert" ON worlds FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "worlds_update" ON worlds;
CREATE POLICY "worlds_update" ON worlds FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "worlds_delete" ON worlds;
CREATE POLICY "worlds_delete" ON worlds FOR DELETE TO anon, authenticated USING (true);

-- world_members
DROP POLICY IF EXISTS "world_members_select" ON world_members;
CREATE POLICY "world_members_select" ON world_members FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "world_members_insert" ON world_members;
CREATE POLICY "world_members_insert" ON world_members FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "world_members_update" ON world_members;
CREATE POLICY "world_members_update" ON world_members FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "world_members_delete" ON world_members;
CREATE POLICY "world_members_delete" ON world_members FOR DELETE TO anon, authenticated USING (true);

-- locations
DROP POLICY IF EXISTS "locations_select" ON locations;
CREATE POLICY "locations_select" ON locations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "locations_insert" ON locations;
CREATE POLICY "locations_insert" ON locations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "locations_update" ON locations;
CREATE POLICY "locations_update" ON locations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "locations_delete" ON locations;
CREATE POLICY "locations_delete" ON locations FOR DELETE TO anon, authenticated USING (true);

-- location_photos
DROP POLICY IF EXISTS "location_photos_select" ON location_photos;
CREATE POLICY "location_photos_select" ON location_photos FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "location_photos_insert" ON location_photos;
CREATE POLICY "location_photos_insert" ON location_photos FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "location_photos_update" ON location_photos;
CREATE POLICY "location_photos_update" ON location_photos FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "location_photos_delete" ON location_photos;
CREATE POLICY "location_photos_delete" ON location_photos FOR DELETE TO anon, authenticated USING (true);

-- wiki_articles
DROP POLICY IF EXISTS "wiki_articles_select" ON wiki_articles;
CREATE POLICY "wiki_articles_select" ON wiki_articles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "wiki_articles_insert" ON wiki_articles;
CREATE POLICY "wiki_articles_insert" ON wiki_articles FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "wiki_articles_update" ON wiki_articles;
CREATE POLICY "wiki_articles_update" ON wiki_articles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "wiki_articles_delete" ON wiki_articles;
CREATE POLICY "wiki_articles_delete" ON wiki_articles FOR DELETE TO anon, authenticated USING (true);

-- updated_at triggers
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS worlds_updated_at ON worlds;
CREATE TRIGGER worlds_updated_at BEFORE UPDATE ON worlds
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS locations_updated_at ON locations;
CREATE TRIGGER locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS wiki_articles_updated_at ON wiki_articles;
CREATE TRIGGER wiki_articles_updated_at BEFORE UPDATE ON wiki_articles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
