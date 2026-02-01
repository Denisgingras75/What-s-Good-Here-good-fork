-- =============================================
-- USER STREAKS TABLE - Engagement tracking
-- =============================================
-- Tracks voting streaks and weekly vote counts for leaderboard

-- Create the user_streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  votes_this_week INTEGER NOT NULL DEFAULT 0,
  week_start DATE NOT NULL DEFAULT (date_trunc('week', now())::date),
  last_vote_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_streaks_votes_week ON user_streaks(votes_this_week DESC);
CREATE INDEX IF NOT EXISTS idx_user_streaks_current_streak ON user_streaks(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_streaks_week_start ON user_streaks(week_start);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Anyone can view streaks (public for leaderboard)
CREATE POLICY "user_streaks_select_public" ON user_streaks
  FOR SELECT
  USING (true);

-- Users can only update their own streak
CREATE POLICY "user_streaks_update_own" ON user_streaks
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only insert their own streak
CREATE POLICY "user_streaks_insert_own" ON user_streaks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- TRIGGER FUNCTION: Update streak on vote
-- =============================================

CREATE OR REPLACE FUNCTION update_user_streak_on_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE;
  v_yesterday DATE;
  v_current_week_start DATE;
  v_existing RECORD;
  v_new_streak INTEGER;
  v_votes_this_week INTEGER;
BEGIN
  -- Get today's date and week start
  v_today := CURRENT_DATE;
  v_yesterday := v_today - INTERVAL '1 day';
  v_current_week_start := date_trunc('week', v_today)::date;

  -- Get existing streak record
  SELECT * INTO v_existing
  FROM user_streaks
  WHERE user_id = NEW.user_id;

  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_streaks (
      user_id,
      current_streak,
      longest_streak,
      votes_this_week,
      week_start,
      last_vote_date
    ) VALUES (
      NEW.user_id,
      1,
      1,
      1,
      v_current_week_start,
      v_today
    );
    RETURN NEW;
  END IF;

  -- Calculate new streak
  IF v_existing.last_vote_date = v_today THEN
    -- Same day vote - streak unchanged
    v_new_streak := v_existing.current_streak;
  ELSIF v_existing.last_vote_date = v_yesterday THEN
    -- Consecutive day - increment streak
    v_new_streak := v_existing.current_streak + 1;
  ELSIF v_existing.last_vote_date IS NULL THEN
    -- First vote ever
    v_new_streak := 1;
  ELSE
    -- Streak broken - reset to 1
    v_new_streak := 1;
  END IF;

  -- Calculate votes this week (cap at 10 for leaderboard anti-spam)
  IF v_existing.week_start = v_current_week_start THEN
    -- Same week - increment (but cap at 10 for counting)
    v_votes_this_week := LEAST(v_existing.votes_this_week + 1, 10);
  ELSE
    -- New week - reset
    v_votes_this_week := 1;
  END IF;

  -- Update the record
  UPDATE user_streaks SET
    current_streak = v_new_streak,
    longest_streak = GREATEST(v_existing.longest_streak, v_new_streak),
    votes_this_week = v_votes_this_week,
    week_start = v_current_week_start,
    last_vote_date = v_today,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Create trigger on votes table
DROP TRIGGER IF EXISTS trigger_update_streak_on_vote ON votes;
CREATE TRIGGER trigger_update_streak_on_vote
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak_on_vote();

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Get user's streak info
CREATE OR REPLACE FUNCTION get_user_streak_info(p_user_id UUID)
RETURNS TABLE (
  current_streak INTEGER,
  longest_streak INTEGER,
  votes_this_week INTEGER,
  last_vote_date DATE,
  streak_status TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE;
  v_yesterday DATE;
  v_record RECORD;
BEGIN
  v_today := CURRENT_DATE;
  v_yesterday := v_today - INTERVAL '1 day';

  -- Get the user's streak record
  SELECT us.current_streak, us.longest_streak, us.votes_this_week, us.last_vote_date
  INTO v_record
  FROM user_streaks us
  WHERE us.user_id = p_user_id;

  -- If no record, return zeros
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 0, 0, NULL::DATE, 'none'::TEXT;
    RETURN;
  END IF;

  -- Determine streak status
  -- 'active' = voted today
  -- 'at_risk' = voted yesterday but not today
  -- 'broken' = hasn't voted in 2+ days
  RETURN QUERY SELECT
    v_record.current_streak,
    v_record.longest_streak,
    v_record.votes_this_week,
    v_record.last_vote_date,
    CASE
      WHEN v_record.last_vote_date = v_today THEN 'active'
      WHEN v_record.last_vote_date = v_yesterday THEN 'at_risk'
      ELSE 'broken'
    END AS streak_status;
END;
$$;

-- Get friends leaderboard (mutual follows only)
CREATE OR REPLACE FUNCTION get_friends_leaderboard(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  votes_this_week INTEGER,
  current_streak INTEGER,
  is_current_user BOOLEAN,
  rank INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH mutual_friends AS (
    -- Get users where both follow each other
    SELECT f1.followed_id AS friend_id
    FROM follows f1
    INNER JOIN follows f2 ON f1.followed_id = f2.follower_id
      AND f1.follower_id = f2.followed_id
    WHERE f1.follower_id = p_user_id
  ),
  -- Include the current user in the leaderboard
  all_participants AS (
    SELECT friend_id AS participant_id FROM mutual_friends
    UNION
    SELECT p_user_id AS participant_id
  ),
  ranked AS (
    SELECT
      ap.participant_id,
      p.display_name,
      COALESCE(us.votes_this_week, 0) AS votes_this_week,
      COALESCE(us.current_streak, 0) AS current_streak,
      ap.participant_id = p_user_id AS is_current_user,
      ROW_NUMBER() OVER (ORDER BY COALESCE(us.votes_this_week, 0) DESC, COALESCE(us.current_streak, 0) DESC) AS rank
    FROM all_participants ap
    LEFT JOIN user_streaks us ON us.user_id = ap.participant_id
    LEFT JOIN profiles p ON p.id = ap.participant_id
    WHERE us.week_start = date_trunc('week', CURRENT_DATE)::date
       OR us.week_start IS NULL
       OR ap.participant_id = p_user_id
  )
  SELECT
    r.participant_id,
    COALESCE(r.display_name, 'Anonymous'),
    r.votes_this_week,
    r.current_streak,
    r.is_current_user,
    r.rank::INTEGER
  FROM ranked r
  ORDER BY r.rank
  LIMIT p_limit;
END;
$$;

-- Get time until weekly reset (returns seconds)
CREATE OR REPLACE FUNCTION get_weekly_reset_countdown()
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT EXTRACT(EPOCH FROM (
    date_trunc('week', CURRENT_DATE + INTERVAL '1 week') - NOW()
  ))::INTEGER;
$$;

-- =============================================
-- PERMISSIONS
-- =============================================

GRANT EXECUTE ON FUNCTION get_user_streak_info TO authenticated;
GRANT EXECUTE ON FUNCTION get_friends_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_reset_countdown TO authenticated;
