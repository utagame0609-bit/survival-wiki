/*
# Storage bucket for location photos

1. Creates a public storage bucket `location-photos` for uploading main and nearby photos.
2. Policies: public read + anon/authenticated write (single-tenant shared data).
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('location-photos', 'location-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "location_photos_read" ON storage.objects;
CREATE POLICY "location_photos_read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'location-photos');

DROP POLICY IF EXISTS "location_photos_insert" ON storage.objects;
CREATE POLICY "location_photos_insert" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'location-photos');

DROP POLICY IF EXISTS "location_photos_update" ON storage.objects;
CREATE POLICY "location_photos_update" ON storage.objects
  FOR UPDATE TO anon, authenticated USING (bucket_id = 'location-photos') WITH CHECK (bucket_id = 'location-photos');

DROP POLICY IF EXISTS "location_photos_delete" ON storage.objects;
CREATE POLICY "location_photos_delete" ON storage.objects
  FOR DELETE TO anon, authenticated USING (bucket_id = 'location-photos');
