/*
# Add optional photo path to world members

Each related world member can optionally have one portrait photo used by
world creation/editing and the save-data card. Existing members remain valid
because the column is nullable.
*/

ALTER TABLE world_members
  ADD COLUMN IF NOT EXISTS photo_path text;
