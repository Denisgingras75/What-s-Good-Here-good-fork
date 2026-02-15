-- Migration: Fix restaurants page + enable places-nearby-search
-- Run in Supabase SQL Editor
--
-- Fixes:
-- 1. Add parent_dish_id column (get_restaurants_within_radius RPC depends on it)
-- 2. Create rate_limits table (places-nearby-search edge function depends on it)
-- 3. Create check_and_record_rate_limit function
-- 4. Add missing indexes and RLS policies

-- =============================================
-- 1. Add parent_dish_id to dishes table
-- =============================================
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS parent_dish_id UUID REFERENCES dishes(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_dishes_parent ON dishes(parent_dish_id);


-- =============================================
-- 2. Create rate_limits table
-- =============================================
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON rate_limits(user_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup ON rate_limits(created_at);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS: users can view own rate limits
DROP POLICY IF EXISTS "Users can view own rate limits" ON rate_limits;
CREATE POLICY "Users can view own rate limits" ON rate_limits FOR SELECT USING ((select auth.uid()) = user_id);


-- =============================================
-- 3. Create check_and_record_rate_limit function
-- =============================================
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

GRANT EXECUTE ON FUNCTION check_and_record_rate_limit TO authenticated;


-- =============================================
-- 4. Hourly cleanup of old rate limits (if pg_cron available)
-- =============================================
-- Note: This may fail if pg_cron is not enabled. That's OK - it just means
-- old rate limit records won't auto-cleanup. They won't affect functionality.
DO $$
BEGIN
  PERFORM cron.schedule('cleanup-old-rate-limits', '15 * * * *', $$DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '1 hour'$$);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron not available - skipping rate limit cleanup job';
END;
$$;
