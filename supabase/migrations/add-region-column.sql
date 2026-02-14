-- Add region column to restaurants for multi-city expansion
-- All existing restaurants default to 'mv' (Martha's Vineyard)
-- Run this in Supabase SQL Editor

ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS region TEXT NOT NULL DEFAULT 'mv';

-- Index for filtering by region
CREATE INDEX IF NOT EXISTS idx_restaurants_region ON restaurants(region);
