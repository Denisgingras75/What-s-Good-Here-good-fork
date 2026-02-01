-- Rating Identity System Migration
-- Creates the two-layer engagement system:
-- 1. Identity Layer: Rating bias number (-1.3 "Tough Critic") - who you are
-- 2. Feedback Loop: Pending votes → Reveal notifications - why you come back

-- ============================================
-- NEW TABLES
-- ============================================

-- User's rating identity stats
CREATE TABLE IF NOT EXISTS user_rating_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rating_bias NUMERIC(3,1) DEFAULT 0.0,        -- The -1.3 number
  bias_label TEXT DEFAULT 'New Voter',          -- "Tough Critic", etc.
  votes_with_consensus INT DEFAULT 0,           -- "Based on 47 dishes"
  votes_pending INT DEFAULT 0,                  -- "12 votes waiting"
  dishes_helped_establish INT DEFAULT 0,        -- Early voter credit
  category_biases JSONB DEFAULT '{}',           -- Per-category breakdown
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Immutable log of bias changes (for reveal notifications)
CREATE TABLE IF NOT EXISTS bias_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  dish_name TEXT NOT NULL,                      -- Snapshot for notification
  user_rating NUMERIC(3,1) NOT NULL,            -- What they rated
  consensus_rating NUMERIC(3,1) NOT NULL,       -- What consensus settled at
  deviation NUMERIC(3,1) NOT NULL,              -- user_rating - consensus
  was_early_voter BOOLEAN DEFAULT FALSE,        -- Were they in first 3 votes?
  bias_before NUMERIC(3,1),                     -- Their bias before this
  bias_after NUMERIC(3,1),                      -- Their bias after this
  seen BOOLEAN DEFAULT FALSE,                   -- Has user seen this reveal?
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MODIFY EXISTING TABLES
-- ============================================

-- Add vote position tracking to votes table
ALTER TABLE votes ADD COLUMN IF NOT EXISTS vote_position INT;

-- Track when vote was scored against consensus
ALTER TABLE votes ADD COLUMN IF NOT EXISTS scored_at TIMESTAMPTZ;

-- Snapshot category at time of vote (in case dish category changes)
ALTER TABLE votes ADD COLUMN IF NOT EXISTS category_snapshot TEXT;

-- Add consensus tracking to dishes table
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS consensus_rating NUMERIC(3,1);
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS consensus_ready BOOLEAN DEFAULT FALSE;
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS consensus_votes INT DEFAULT 0;
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS consensus_calculated_at TIMESTAMPTZ;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_bias_events_user ON bias_events(user_id);
CREATE INDEX IF NOT EXISTS idx_bias_events_unseen ON bias_events(user_id, seen) WHERE seen = FALSE;
CREATE INDEX IF NOT EXISTS idx_user_rating_stats_bias ON user_rating_stats(rating_bias);
CREATE INDEX IF NOT EXISTS idx_dishes_consensus ON dishes(consensus_ready) WHERE consensus_ready = TRUE;
CREATE INDEX IF NOT EXISTS idx_votes_unscored ON votes(dish_id) WHERE scored_at IS NULL;

-- ============================================
-- HELPER FUNCTION: Get Bias Label
-- ============================================

CREATE OR REPLACE FUNCTION get_bias_label(bias NUMERIC)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN bias IS NULL THEN 'New Voter'
    WHEN bias <= -2.5 THEN 'Brutal Critic'
    WHEN bias <= -1.5 THEN 'Tough Critic'
    WHEN bias <= -0.5 THEN 'Discerning'
    WHEN bias <= 0.5 THEN 'Fair Judge'
    WHEN bias <= 1.5 THEN 'Generous'
    WHEN bias <= 2.5 THEN 'Loves Everything'
    ELSE 'Eternal Optimist'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- TRIGGER: On Vote Insert (Before)
-- Sets vote_position and category_snapshot
-- ============================================

CREATE OR REPLACE FUNCTION on_vote_insert()
RETURNS TRIGGER AS $$
DECLARE
  current_vote_count INT;
  dish_category TEXT;
BEGIN
  -- Get current vote count BEFORE this insert
  SELECT COUNT(*) INTO current_vote_count
  FROM votes WHERE dish_id = NEW.dish_id AND id != NEW.id;

  -- Set vote position (1-indexed)
  NEW.vote_position := current_vote_count + 1;

  -- Snapshot category
  SELECT category INTO dish_category
  FROM dishes WHERE id = NEW.dish_id;
  NEW.category_snapshot := dish_category;

  -- Update user's pending count (only if they have a rating)
  IF NEW.rating_10 IS NOT NULL THEN
    INSERT INTO user_rating_stats (user_id, votes_pending)
    VALUES (NEW.user_id, 1)
    ON CONFLICT (user_id) DO UPDATE
    SET votes_pending = user_rating_stats.votes_pending + 1,
        updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS vote_insert_trigger ON votes;

CREATE TRIGGER vote_insert_trigger
BEFORE INSERT ON votes
FOR EACH ROW EXECUTE FUNCTION on_vote_insert();

-- ============================================
-- TRIGGER: Check Consensus After Vote (After)
-- Calculates consensus when threshold is reached
-- ============================================

CREATE OR REPLACE FUNCTION check_consensus_after_vote()
RETURNS TRIGGER AS $$
DECLARE
  total_votes INT;
  avg_rating NUMERIC(3,1);
  v RECORD;
  user_bias_before NUMERIC(3,1);
  user_bias_after NUMERIC(3,1);
  user_deviation NUMERIC(3,1);
  is_early BOOLEAN;
  dish_name_snapshot TEXT;
  consensus_threshold INT := 5; -- Match MIN_VOTES_FOR_RANKING
BEGIN
  -- Only process if this vote has a rating
  IF NEW.rating_10 IS NULL THEN
    RETURN NEW;
  END IF;

  -- Count total votes with ratings for this dish
  SELECT COUNT(*), ROUND(AVG(rating_10), 1)
  INTO total_votes, avg_rating
  FROM votes
  WHERE dish_id = NEW.dish_id AND rating_10 IS NOT NULL;

  -- Check if we hit threshold and haven't calculated yet
  IF total_votes >= consensus_threshold THEN
    -- Check if consensus already calculated
    IF NOT EXISTS (
      SELECT 1 FROM dishes
      WHERE id = NEW.dish_id AND consensus_ready = TRUE
    ) THEN
      -- Get dish name for notifications
      SELECT name INTO dish_name_snapshot FROM dishes WHERE id = NEW.dish_id;

      -- Calculate consensus
      UPDATE dishes SET
        consensus_rating = avg_rating,
        consensus_ready = TRUE,
        consensus_votes = total_votes,
        consensus_calculated_at = NOW()
      WHERE id = NEW.dish_id;

      -- Score all unscored votes for this dish
      FOR v IN
        SELECT * FROM votes
        WHERE dish_id = NEW.dish_id
        AND scored_at IS NULL
        AND rating_10 IS NOT NULL
      LOOP
        -- Calculate deviation
        user_deviation := ROUND(v.rating_10 - avg_rating, 1);
        is_early := v.vote_position <= 3;

        -- Get user's current bias
        SELECT rating_bias INTO user_bias_before
        FROM user_rating_stats WHERE user_id = v.user_id;

        IF user_bias_before IS NULL THEN
          user_bias_before := 0.0;
        END IF;

        -- Mark vote as scored first (so it's included in the calculation)
        UPDATE votes SET scored_at = NOW() WHERE id = v.id;

        -- Calculate new bias (running average of all scored votes)
        SELECT
          ROUND(AVG(votes.rating_10 - d.consensus_rating), 1)
        INTO user_bias_after
        FROM votes
        JOIN dishes d ON votes.dish_id = d.id
        WHERE votes.user_id = v.user_id
        AND d.consensus_ready = TRUE
        AND votes.rating_10 IS NOT NULL
        AND votes.scored_at IS NOT NULL;

        IF user_bias_after IS NULL THEN
          user_bias_after := user_deviation;
        END IF;

        -- Create bias event (for reveal notification)
        INSERT INTO bias_events (
          user_id, dish_id, dish_name, user_rating,
          consensus_rating, deviation, was_early_voter,
          bias_before, bias_after
        )
        VALUES (
          v.user_id, v.dish_id, dish_name_snapshot, v.rating_10,
          avg_rating, user_deviation, is_early,
          user_bias_before, user_bias_after
        );

        -- Update user stats
        INSERT INTO user_rating_stats (
          user_id, rating_bias, votes_with_consensus, votes_pending,
          dishes_helped_establish, bias_label
        )
        VALUES (
          v.user_id, user_bias_after, 1, -1,
          CASE WHEN is_early THEN 1 ELSE 0 END,
          get_bias_label(user_bias_after)
        )
        ON CONFLICT (user_id) DO UPDATE SET
          rating_bias = user_bias_after,
          votes_with_consensus = user_rating_stats.votes_with_consensus + 1,
          votes_pending = GREATEST(0, user_rating_stats.votes_pending - 1),
          dishes_helped_establish = user_rating_stats.dishes_helped_establish +
            CASE WHEN is_early THEN 1 ELSE 0 END,
          bias_label = get_bias_label(user_bias_after),
          updated_at = NOW();

        -- Update category biases
        UPDATE user_rating_stats
        SET category_biases = jsonb_set(
          COALESCE(category_biases, '{}'::jsonb),
          ARRAY[v.category_snapshot],
          (
            SELECT to_jsonb(ROUND(AVG(votes.rating_10 - d.consensus_rating), 1))
            FROM votes
            JOIN dishes d ON votes.dish_id = d.id
            WHERE votes.user_id = v.user_id
            AND d.consensus_ready = TRUE
            AND votes.rating_10 IS NOT NULL
            AND votes.scored_at IS NOT NULL
            AND votes.category_snapshot = v.category_snapshot
          ),
          TRUE
        )
        WHERE user_id = v.user_id;
      END LOOP;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS consensus_check_trigger ON votes;

CREATE TRIGGER consensus_check_trigger
AFTER INSERT ON votes
FOR EACH ROW EXECUTE FUNCTION check_consensus_after_vote();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- user_rating_stats: public read (for viewing other profiles), only triggers can write
ALTER TABLE user_rating_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read stats" ON user_rating_stats;
CREATE POLICY "Public can read stats"
ON user_rating_stats FOR SELECT
USING (TRUE);

-- bias_events: users can only read their own, can mark as seen
ALTER TABLE bias_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own events" ON bias_events;
CREATE POLICY "Users can read own events"
ON bias_events FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark events as seen" ON bias_events;
CREATE POLICY "Users can mark events as seen"
ON bias_events FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PUBLIC API FUNCTIONS
-- ============================================

-- Get user's rating identity stats
CREATE OR REPLACE FUNCTION get_user_rating_identity(target_user_id UUID)
RETURNS TABLE (
  rating_bias NUMERIC(3,1),
  bias_label TEXT,
  votes_with_consensus INT,
  votes_pending INT,
  dishes_helped_establish INT,
  category_biases JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(urs.rating_bias, 0.0),
    COALESCE(urs.bias_label, 'New Voter'),
    COALESCE(urs.votes_with_consensus, 0),
    COALESCE(urs.votes_pending, 0),
    COALESCE(urs.dishes_helped_establish, 0),
    COALESCE(urs.category_biases, '{}'::jsonb)
  FROM user_rating_stats urs
  WHERE urs.user_id = target_user_id;

  -- If no row found, return defaults
  IF NOT FOUND THEN
    RETURN QUERY SELECT
      0.0::NUMERIC(3,1),
      'New Voter'::TEXT,
      0::INT,
      0::INT,
      0::INT,
      '{}'::JSONB;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get unseen reveal notifications
CREATE OR REPLACE FUNCTION get_unseen_reveals(target_user_id UUID)
RETURNS TABLE (
  id UUID,
  dish_id UUID,
  dish_name TEXT,
  user_rating NUMERIC(3,1),
  consensus_rating NUMERIC(3,1),
  deviation NUMERIC(3,1),
  was_early_voter BOOLEAN,
  bias_before NUMERIC(3,1),
  bias_after NUMERIC(3,1),
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Check if caller is the target user
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    be.id,
    be.dish_id,
    be.dish_name,
    be.user_rating,
    be.consensus_rating,
    be.deviation,
    be.was_early_voter,
    be.bias_before,
    be.bias_after,
    be.created_at
  FROM bias_events be
  WHERE be.user_id = target_user_id AND be.seen = FALSE
  ORDER BY be.created_at DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Mark reveals as seen
CREATE OR REPLACE FUNCTION mark_reveals_seen(event_ids UUID[])
RETURNS VOID AS $$
BEGIN
  UPDATE bias_events
  SET seen = TRUE
  WHERE id = ANY(event_ids)
  AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
