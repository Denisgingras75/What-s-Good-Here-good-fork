-- Badges System - Phase 1
-- Count-based badges with public/private visibility

-- Badge definitions table
CREATE TABLE IF NOT EXISTS badges (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_public_eligible BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 100, -- Lower = higher prestige
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges (unlocked badges)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL REFERENCES badges(key) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata_json JSONB DEFAULT '{}',
  UNIQUE(user_id, badge_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_key);
CREATE INDEX IF NOT EXISTS idx_user_badges_unlocked ON user_badges(unlocked_at DESC);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Badges: Public read
DROP POLICY IF EXISTS "Public read badges" ON badges;
CREATE POLICY "Public read badges" ON badges
  FOR SELECT USING (true);

-- User badges: Users can read their own, public can read public-eligible badges
DROP POLICY IF EXISTS "Users can read own badges" ON user_badges;
CREATE POLICY "Users can read own badges" ON user_badges
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM badges b
      WHERE b.key = badge_key AND b.is_public_eligible = true
    )
  );

-- User badges: Only system can insert (via service role)
DROP POLICY IF EXISTS "System can insert badges" ON user_badges;
CREATE POLICY "System can insert badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed badge definitions
INSERT INTO badges (key, name, subtitle, description, icon, is_public_eligible, sort_order) VALUES
  -- Private badges (milestone markers)
  ('first_bite', 'First Bite', 'Your journey begins', 'Rated your first dish', '🍽️', false, 100),
  ('food_explorer', 'Food Explorer', 'Getting warmed up', 'Rated 10 dishes', '🧭', false, 95),
  ('taste_tester', 'Taste Tester', 'Building expertise', 'Rated 25 dishes', '👅', false, 90),
  ('neighborhood_explorer', 'Neighborhood Explorer', 'Branching out', 'Rated dishes at 3 different restaurants', '🏘️', false, 85),
  ('city_taster', 'City Taster', 'Covering ground', 'Rated dishes at 5 different restaurants', '🌆', false, 80),

  -- Public badges (prestigious, visible on public profile)
  ('local_food_scout', 'Local Food Scout', 'A trusted local voice', 'Rated dishes at 10 different restaurants', '🔍', true, 8),
  ('restaurant_trailblazer', 'Restaurant Trailblazer', 'Discovering the scene', 'Rated dishes at 20 different restaurants', '🚀', true, 7),
  ('ultimate_explorer', 'Ultimate Explorer', 'The ultimate food adventurer', 'Rated dishes at 50 different restaurants', '🏆', true, 6),
  ('super_reviewer', 'Super Reviewer', 'A prolific contributor', 'Rated 100 dishes', '⭐', true, 5),
  ('top_1_percent_reviewer', 'Top 1% Reviewer', 'Elite status achieved', 'Rated 125 dishes - top tier contributor', '👑', true, 1)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  is_public_eligible = EXCLUDED.is_public_eligible,
  sort_order = EXCLUDED.sort_order;

-- Function to get user's badge stats for evaluation
CREATE OR REPLACE FUNCTION get_user_badge_stats(p_user_id UUID)
RETURNS TABLE (
  rated_dishes_count BIGINT,
  restaurants_rated_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT v.dish_id) as rated_dishes_count,
    COUNT(DISTINCT d.restaurant_id) as restaurants_rated_count
  FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  WHERE v.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to evaluate and award badges for a user
CREATE OR REPLACE FUNCTION evaluate_user_badges(p_user_id UUID)
RETURNS TABLE (
  badge_key TEXT,
  newly_unlocked BOOLEAN
) AS $$
DECLARE
  v_rated_dishes BIGINT;
  v_restaurants_rated BIGINT;
  v_badge RECORD;
  v_threshold INTEGER;
  v_already_has BOOLEAN;
BEGIN
  -- Get user stats
  SELECT rated_dishes_count, restaurants_rated_count
  INTO v_rated_dishes, v_restaurants_rated
  FROM get_user_badge_stats(p_user_id);

  -- Check each badge
  FOR v_badge IN
    SELECT b.key, b.name FROM badges b ORDER BY b.sort_order DESC
  LOOP
    -- Check if user already has this badge
    SELECT EXISTS(
      SELECT 1 FROM user_badges ub
      WHERE ub.user_id = p_user_id AND ub.badge_key = v_badge.key
    ) INTO v_already_has;

    -- Determine threshold based on badge key
    CASE v_badge.key
      -- Dish count badges
      WHEN 'first_bite' THEN
        IF v_rated_dishes >= 1 AND NOT v_already_has THEN
          INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
          badge_key := v_badge.key;
          newly_unlocked := true;
          RETURN NEXT;
        END IF;
      WHEN 'food_explorer' THEN
        IF v_rated_dishes >= 10 AND NOT v_already_has THEN
          INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
          badge_key := v_badge.key;
          newly_unlocked := true;
          RETURN NEXT;
        END IF;
      WHEN 'taste_tester' THEN
        IF v_rated_dishes >= 25 AND NOT v_already_has THEN
          INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
          badge_key := v_badge.key;
          newly_unlocked := true;
          RETURN NEXT;
        END IF;
      WHEN 'super_reviewer' THEN
        IF v_rated_dishes >= 100 AND NOT v_already_has THEN
          INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
          badge_key := v_badge.key;
          newly_unlocked := true;
          RETURN NEXT;
        END IF;
      WHEN 'top_1_percent_reviewer' THEN
        IF v_rated_dishes >= 125 AND NOT v_already_has THEN
          INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
          badge_key := v_badge.key;
          newly_unlocked := true;
          RETURN NEXT;
        END IF;

      -- Restaurant count badges
      WHEN 'neighborhood_explorer' THEN
        IF v_restaurants_rated >= 3 AND NOT v_already_has THEN
          INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
          badge_key := v_badge.key;
          newly_unlocked := true;
          RETURN NEXT;
        END IF;
      WHEN 'city_taster' THEN
        IF v_restaurants_rated >= 5 AND NOT v_already_has THEN
          INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
          badge_key := v_badge.key;
          newly_unlocked := true;
          RETURN NEXT;
        END IF;
      WHEN 'local_food_scout' THEN
        IF v_restaurants_rated >= 10 AND NOT v_already_has THEN
          INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
          badge_key := v_badge.key;
          newly_unlocked := true;
          RETURN NEXT;
        END IF;
      WHEN 'restaurant_trailblazer' THEN
        IF v_restaurants_rated >= 20 AND NOT v_already_has THEN
          INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
          badge_key := v_badge.key;
          newly_unlocked := true;
          RETURN NEXT;
        END IF;
      WHEN 'ultimate_explorer' THEN
        IF v_restaurants_rated >= 50 AND NOT v_already_has THEN
          INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
          badge_key := v_badge.key;
          newly_unlocked := true;
          RETURN NEXT;
        END IF;
      ELSE
        -- Unknown badge, skip
        NULL;
    END CASE;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's unlocked badges
CREATE OR REPLACE FUNCTION get_user_badges(p_user_id UUID, p_public_only BOOLEAN DEFAULT false)
RETURNS TABLE (
  badge_key TEXT,
  name TEXT,
  subtitle TEXT,
  description TEXT,
  icon TEXT,
  is_public_eligible BOOLEAN,
  sort_order INTEGER,
  unlocked_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.key as badge_key,
    b.name,
    b.subtitle,
    b.description,
    b.icon,
    b.is_public_eligible,
    b.sort_order,
    ub.unlocked_at
  FROM user_badges ub
  JOIN badges b ON ub.badge_key = b.key
  WHERE ub.user_id = p_user_id
    AND (NOT p_public_only OR b.is_public_eligible = true)
  ORDER BY b.sort_order ASC, ub.unlocked_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get public badges for display (max 6, by prestige)
CREATE OR REPLACE FUNCTION get_public_badges(p_user_id UUID)
RETURNS TABLE (
  badge_key TEXT,
  name TEXT,
  subtitle TEXT,
  description TEXT,
  icon TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.key as badge_key,
    b.name,
    b.subtitle,
    b.description,
    b.icon,
    ub.unlocked_at
  FROM user_badges ub
  JOIN badges b ON ub.badge_key = b.key
  WHERE ub.user_id = p_user_id
    AND b.is_public_eligible = true
  ORDER BY b.sort_order ASC, ub.unlocked_at DESC
  LIMIT 6;
END;
$$ LANGUAGE plpgsql STABLE;
