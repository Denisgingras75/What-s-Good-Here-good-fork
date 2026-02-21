-- Migration: User-Driven Restaurant & Dish Creation
-- Lets any authenticated user add restaurants and dishes (Untappd model)

-- =============================================
-- 1. NEW COLUMNS
-- =============================================

-- restaurants: track who created it + Google Places data
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS google_place_id TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS phone TEXT;

-- dishes: track who created it
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- =============================================
-- 2. INDEXES
-- =============================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurants_google_place_id
  ON restaurants(google_place_id) WHERE google_place_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_restaurants_created_by
  ON restaurants(created_by);

-- =============================================
-- 3. RLS POLICY CHANGES
-- =============================================

-- Drop existing admin-only insert policies
DROP POLICY IF EXISTS "Admins can insert restaurants" ON restaurants;
DROP POLICY IF EXISTS "Admin or manager insert dishes" ON dishes;

-- restaurants: any authenticated user can insert (with created_by = their ID)
CREATE POLICY "Authenticated users can insert restaurants" ON restaurants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- dishes: any authenticated user can insert
CREATE POLICY "Authenticated users can insert dishes" ON dishes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Keep existing UPDATE/DELETE as admin/manager-only (unchanged)

-- =============================================
-- 4. RATE LIMIT RPCs
-- =============================================

-- Restaurant creation: 5 per hour
CREATE OR REPLACE FUNCTION check_restaurant_create_rate_limit()
RETURNS JSONB LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT check_and_record_rate_limit('restaurant_create', 5, 3600);
$$;

-- Dish creation: 20 per hour
CREATE OR REPLACE FUNCTION check_dish_create_rate_limit()
RETURNS JSONB LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT check_and_record_rate_limit('dish_create', 20, 3600);
$$;

GRANT EXECUTE ON FUNCTION check_restaurant_create_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION check_dish_create_rate_limit TO authenticated;

-- =============================================
-- 5. NEARBY RESTAURANT SEARCH RPC
-- =============================================

CREATE OR REPLACE FUNCTION find_nearby_restaurants(
  p_name TEXT DEFAULT NULL,
  p_lat DECIMAL DEFAULT NULL,
  p_lng DECIMAL DEFAULT NULL,
  p_radius_meters INT DEFAULT 150
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  lat DECIMAL,
  lng DECIMAL,
  google_place_id TEXT,
  distance_meters DECIMAL
) AS $$
DECLARE
  -- Convert meters to approximate degree offset
  lat_delta DECIMAL := p_radius_meters / 111320.0;
  lng_delta DECIMAL := p_radius_meters / (111320.0 * COS(RADIANS(COALESCE(p_lat, 0))));
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.name,
    r.address,
    r.lat,
    r.lng,
    r.google_place_id,
    ROUND((
      6371000 * ACOS(
        LEAST(1.0, GREATEST(-1.0,
          COS(RADIANS(p_lat)) * COS(RADIANS(r.lat)) *
          COS(RADIANS(r.lng) - RADIANS(p_lng)) +
          SIN(RADIANS(p_lat)) * SIN(RADIANS(r.lat))
        ))
      )
    )::NUMERIC, 1) AS distance_meters
  FROM restaurants r
  WHERE
    -- Bounding box filter (fast index scan)
    (p_lat IS NULL OR (
      r.lat BETWEEN (p_lat - lat_delta) AND (p_lat + lat_delta)
      AND r.lng BETWEEN (p_lng - lng_delta) AND (p_lng + lng_delta)
    ))
    -- Name search (optional)
    AND (p_name IS NULL OR r.name ILIKE '%' || p_name || '%')
  ORDER BY
    CASE WHEN p_lat IS NOT NULL THEN
      6371000 * ACOS(
        LEAST(1.0, GREATEST(-1.0,
          COS(RADIANS(p_lat)) * COS(RADIANS(r.lat)) *
          COS(RADIANS(r.lng) - RADIANS(p_lng)) +
          SIN(RADIANS(p_lat)) * SIN(RADIANS(r.lat))
        ))
      )
    ELSE 0 END ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

GRANT EXECUTE ON FUNCTION find_nearby_restaurants TO authenticated;
GRANT EXECUTE ON FUNCTION find_nearby_restaurants TO anon;
