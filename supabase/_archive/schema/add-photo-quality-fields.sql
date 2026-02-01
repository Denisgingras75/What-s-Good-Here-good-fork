-- Add photo quality and placement fields to dish_photos table
-- Run this migration in Supabase SQL Editor

ALTER TABLE dish_photos
ADD COLUMN IF NOT EXISTS width int,
ADD COLUMN IF NOT EXISTS height int,
ADD COLUMN IF NOT EXISTS mime_type text,
ADD COLUMN IF NOT EXISTS file_size_bytes bigint,
ADD COLUMN IF NOT EXISTS avg_brightness real,
ADD COLUMN IF NOT EXISTS bright_pixel_pct real,
ADD COLUMN IF NOT EXISTS dark_pixel_pct real,
ADD COLUMN IF NOT EXISTS quality_score int,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'community',
ADD COLUMN IF NOT EXISTS reject_reason text,
ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'user';

-- Add check constraints
ALTER TABLE dish_photos
ADD CONSTRAINT dish_photos_status_check
CHECK (status IN ('featured', 'community', 'hidden', 'rejected'));

ALTER TABLE dish_photos
ADD CONSTRAINT dish_photos_source_type_check
CHECK (source_type IN ('user', 'restaurant'));

-- Create index for efficient photo queries by status
CREATE INDEX IF NOT EXISTS idx_dish_photos_status ON dish_photos(dish_id, status, quality_score DESC);

-- Update existing photos to have 'community' status (already default, but explicit)
UPDATE dish_photos SET status = 'community' WHERE status IS NULL;
