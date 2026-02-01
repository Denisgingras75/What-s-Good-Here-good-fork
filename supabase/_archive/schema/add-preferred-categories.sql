-- Add preferred_categories column to profiles table
-- This stores user's favorite food categories for personalized Top 10

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferred_categories text[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN profiles.preferred_categories IS 'Array of category IDs the user has selected as favorites (max 3)';
