-- =============================================
-- FOLLOWS TABLE - Social connections
-- =============================================
-- One-way follow system (like Twitter)
-- follower_id follows followed_id

-- Create the follows table
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate follows
  UNIQUE(follower_id, followed_id),

  -- Prevent self-follows
  CHECK (follower_id != followed_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followed ON follows(followed_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Anyone can view follows (public social graph)
CREATE POLICY "follows_select_public" ON follows
  FOR SELECT
  USING (true);

-- Users can only insert follows where they are the follower
CREATE POLICY "follows_insert_own" ON follows
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can only delete their own follows (unfollow)
CREATE POLICY "follows_delete_own" ON follows
  FOR DELETE
  USING (auth.uid() = follower_id);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Get follower count for a user
CREATE OR REPLACE FUNCTION get_follower_count(user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM follows
  WHERE followed_id = user_id;
$$;

-- Get following count for a user
CREATE OR REPLACE FUNCTION get_following_count(user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM follows
  WHERE follower_id = user_id;
$$;

-- Check if user A follows user B
CREATE OR REPLACE FUNCTION is_following(follower UUID, followed UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM follows
    WHERE follower_id = follower AND followed_id = followed
  );
$$;

-- Get friends (people you follow) who voted on a specific dish
-- Returns their user_id, display_name, rating, and vote date
CREATE OR REPLACE FUNCTION get_friends_votes_for_dish(
  p_user_id UUID,
  p_dish_id UUID
)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  rating_10 INTEGER,
  would_order_again BOOLEAN,
  voted_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    p.id AS user_id,
    p.display_name,
    v.rating_10,
    v.would_order_again,
    v.created_at AS voted_at
  FROM follows f
  JOIN profiles p ON p.id = f.followed_id
  JOIN votes v ON v.user_id = f.followed_id AND v.dish_id = p_dish_id
  WHERE f.follower_id = p_user_id
  ORDER BY v.created_at DESC;
$$;

-- =============================================
-- ADD COUNTS TO PROFILES (denormalized for performance)
-- =============================================

-- Add follower/following counts to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Function to update follower count
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following count for follower
    UPDATE profiles SET following_count = following_count + 1
    WHERE id = NEW.follower_id;
    -- Increment follower count for followed
    UPDATE profiles SET follower_count = follower_count + 1
    WHERE id = NEW.followed_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following count for follower
    UPDATE profiles SET following_count = GREATEST(0, following_count - 1)
    WHERE id = OLD.follower_id;
    -- Decrement follower count for followed
    UPDATE profiles SET follower_count = GREATEST(0, follower_count - 1)
    WHERE id = OLD.followed_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger to auto-update counts
DROP TRIGGER IF EXISTS trigger_update_follow_counts ON follows;
CREATE TRIGGER trigger_update_follow_counts
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();
