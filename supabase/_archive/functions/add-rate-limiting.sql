-- Server-side rate limiting using PostgreSQL
-- Run in Supabase SQL Editor

-- Create table to track rate limit attempts
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action
ON rate_limits(user_id, action, created_at DESC);

-- Auto-cleanup old entries (older than 1 hour)
CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup
ON rate_limits(created_at);

-- RLS: Users can only see their own rate limit records
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own rate limits" ON rate_limits;
CREATE POLICY "Users can view own rate limits" ON rate_limits
  FOR SELECT USING (auth.uid() = user_id);

-- Function to check and record rate limit
-- Returns: { allowed: boolean, retry_after_seconds: int }
CREATE OR REPLACE FUNCTION check_and_record_rate_limit(
  p_action TEXT,
  p_max_attempts INT DEFAULT 10,
  p_window_seconds INT DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_count INT;
  v_oldest TIMESTAMPTZ;
  v_cutoff TIMESTAMPTZ;
  v_retry_after INT;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'error', 'Not authenticated');
  END IF;

  -- Calculate cutoff time
  v_cutoff := NOW() - (p_window_seconds || ' seconds')::INTERVAL;

  -- Count recent attempts
  SELECT COUNT(*), MIN(created_at)
  INTO v_count, v_oldest
  FROM rate_limits
  WHERE user_id = v_user_id
    AND action = p_action
    AND created_at > v_cutoff;

  -- Check if limit exceeded
  IF v_count >= p_max_attempts THEN
    -- Calculate retry after
    v_retry_after := EXTRACT(EPOCH FROM (v_oldest + (p_window_seconds || ' seconds')::INTERVAL - NOW()))::INT;
    IF v_retry_after < 0 THEN v_retry_after := 0; END IF;

    RETURN jsonb_build_object(
      'allowed', false,
      'retry_after_seconds', v_retry_after,
      'message', 'Too many attempts. Please wait ' || v_retry_after || ' seconds.'
    );
  END IF;

  -- Record this attempt
  INSERT INTO rate_limits (user_id, action)
  VALUES (v_user_id, p_action);

  -- Cleanup old entries (probabilistic, ~1% of calls)
  IF random() < 0.01 THEN
    DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '1 hour';
  END IF;

  RETURN jsonb_build_object('allowed', true);
END;
$$;

-- Convenience function for vote rate limiting (10 per minute)
CREATE OR REPLACE FUNCTION check_vote_rate_limit()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT check_and_record_rate_limit('vote', 10, 60);
$$;

-- Convenience function for photo upload rate limiting (5 per minute)
CREATE OR REPLACE FUNCTION check_photo_upload_rate_limit()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT check_and_record_rate_limit('photo_upload', 5, 60);
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_and_record_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION check_vote_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION check_photo_upload_rate_limit TO authenticated;
