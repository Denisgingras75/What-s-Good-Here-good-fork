-- Drop the old 3-param version of find_nearby_restaurants
-- The new version has 4 params (p_name, p_lat, p_lng, p_radius_meters)
-- Our code always passes all 4 params, so the old version is unused
-- Run this in Supabase SQL Editor

DROP FUNCTION IF EXISTS find_nearby_restaurants(numeric, numeric, integer);
