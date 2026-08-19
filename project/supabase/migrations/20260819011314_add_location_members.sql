/*
# Add location_members join table

1. New Table
- `location_members`: many-to-many between locations and world_members.
  - id (uuid pk), location_id (uuid fk locations cascade), member_id (uuid fk world_members cascade), created_at

2. Security
- RLS enabled, anon + authenticated full CRUD (single-tenant shared data).
*/

CREATE TABLE IF NOT EXISTS location_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES world_members(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (location_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_location_members_location_id ON location_members(location_id);
CREATE INDEX IF NOT EXISTS idx_location_members_member_id ON location_members(member_id);

ALTER TABLE location_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "location_members_select" ON location_members;
CREATE POLICY "location_members_select" ON location_members FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "location_members_insert" ON location_members;
CREATE POLICY "location_members_insert" ON location_members FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "location_members_update" ON location_members;
CREATE POLICY "location_members_update" ON location_members FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "location_members_delete" ON location_members;
CREATE POLICY "location_members_delete" ON location_members FOR DELETE TO anon, authenticated USING (true);
