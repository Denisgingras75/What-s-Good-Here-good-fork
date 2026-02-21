-- =============================================
-- Fix missing database objects
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, dish_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own favorites" ON favorites FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own favorites" ON favorites FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING ((select auth.uid()) = user_id);

-- 2. Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits" ON rate_limits FOR SELECT USING ((select auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON rate_limits(user_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup ON rate_limits(created_at);

-- 3. Create check_and_record_rate_limit function
CREATE OR REPLACE FUNCTION check_and_record_rate_limit(
  p_action TEXT, p_max_attempts INT DEFAULT 10, p_window_seconds INT DEFAULT 60
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id UUID; v_count INT; v_oldest TIMESTAMPTZ; v_cutoff TIMESTAMPTZ; v_retry_after INT;
BEGIN
  v_user_id := (select auth.uid());
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'error', 'Not authenticated');
  END IF;

  v_cutoff := NOW() - (p_window_seconds || ' seconds')::INTERVAL;

  SELECT COUNT(*), MIN(created_at) INTO v_count, v_oldest
  FROM rate_limits WHERE user_id = v_user_id AND action = p_action AND created_at > v_cutoff;

  IF v_count >= p_max_attempts THEN
    v_retry_after := EXTRACT(EPOCH FROM (v_oldest + (p_window_seconds || ' seconds')::INTERVAL - NOW()))::INT;
    IF v_retry_after < 0 THEN v_retry_after := 0; END IF;
    RETURN jsonb_build_object('allowed', false, 'retry_after_seconds', v_retry_after,
      'message', 'Too many attempts. Please wait ' || v_retry_after || ' seconds.');
  END IF;

  INSERT INTO rate_limits (user_id, action) VALUES (v_user_id, p_action);

  RETURN jsonb_build_object('allowed', true);
END;
$$;

-- 4. Create convenience rate limit functions
CREATE OR REPLACE FUNCTION check_vote_rate_limit()
RETURNS JSONB LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT check_and_record_rate_limit('vote', 10, 60);
$$;

CREATE OR REPLACE FUNCTION check_photo_upload_rate_limit()
RETURNS JSONB LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT check_and_record_rate_limit('photo_upload', 5, 60);
$$;

CREATE OR REPLACE FUNCTION check_restaurant_create_rate_limit()
RETURNS JSONB LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT check_and_record_rate_limit('restaurant_create', 5, 3600);
$$;

CREATE OR REPLACE FUNCTION check_dish_create_rate_limit()
RETURNS JSONB LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT check_and_record_rate_limit('dish_create', 20, 3600);
$$;

-- 5. Create find_nearby_restaurants function
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
    (p_lat IS NULL OR (
      r.lat BETWEEN (p_lat - lat_delta) AND (p_lat + lat_delta)
      AND r.lng BETWEEN (p_lng - lng_delta) AND (p_lng + lng_delta)
    ))
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

-- 6. Grants
GRANT EXECUTE ON FUNCTION check_and_record_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION check_vote_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION check_photo_upload_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION check_restaurant_create_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION check_dish_create_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION find_nearby_restaurants TO authenticated;
GRANT EXECUTE ON FUNCTION find_nearby_restaurants TO anon;

-- 7. Add purity_score column to votes (from earlier change)
ALTER TABLE votes ADD COLUMN IF NOT EXISTS purity_score DECIMAL(5, 2);
