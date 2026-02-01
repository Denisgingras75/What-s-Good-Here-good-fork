-- Enforce unique display names (case-insensitive)
-- Run this in Supabase SQL Editor

CREATE UNIQUE INDEX IF NOT EXISTS profiles_display_name_unique
ON profiles (LOWER(display_name))
WHERE display_name IS NOT NULL;
