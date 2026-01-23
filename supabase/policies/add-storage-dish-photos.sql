-- Storage policies for dish-photos bucket
-- Run in Supabase SQL Editor

-- Public read access for dish photos
DROP POLICY IF EXISTS "dish_photos_public_read" ON storage.objects;
CREATE POLICY "dish_photos_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'dish-photos');

-- Authenticated users can upload their own objects
DROP POLICY IF EXISTS "dish_photos_insert_own" ON storage.objects;
CREATE POLICY "dish_photos_insert_own" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'dish-photos'
    AND auth.uid() = owner
  );

-- Authenticated users can update their own objects
DROP POLICY IF EXISTS "dish_photos_update_own" ON storage.objects;
CREATE POLICY "dish_photos_update_own" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'dish-photos'
    AND auth.uid() = owner
  );

-- Authenticated users can delete their own objects
DROP POLICY IF EXISTS "dish_photos_delete_own" ON storage.objects;
CREATE POLICY "dish_photos_delete_own" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'dish-photos'
    AND auth.uid() = owner
  );
