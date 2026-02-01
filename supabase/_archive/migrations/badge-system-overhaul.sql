-- Badge System Overhaul: Mastery Over Participation
-- Adds rarity, family, and category columns; inserts 46 new badges;
-- rewrites evaluate_user_badges with accuracy-based category mastery.

-- ============================================
-- 2a. Schema Changes
-- ============================================

ALTER TABLE badges ADD COLUMN IF NOT EXISTS rarity TEXT NOT NULL DEFAULT 'common';
ALTER TABLE badges ADD COLUMN IF NOT EXISTS family TEXT NOT NULL DEFAULT 'volume';
ALTER TABLE badges ADD COLUMN IF NOT EXISTS category TEXT;

-- ============================================
-- 2b. Update existing 10 badges with rarity + family
-- ============================================

UPDATE badges SET rarity = 'common', family = 'volume' WHERE key = 'first_bite';
UPDATE badges SET rarity = 'common', family = 'volume' WHERE key = 'food_explorer';
UPDATE badges SET rarity = 'uncommon', family = 'volume' WHERE key = 'taste_tester';
UPDATE badges SET rarity = 'rare', family = 'volume' WHERE key = 'super_reviewer';
UPDATE badges SET rarity = 'epic', family = 'volume' WHERE key = 'top_1_percent_reviewer';
UPDATE badges SET rarity = 'common', family = 'volume' WHERE key = 'neighborhood_explorer';
UPDATE badges SET rarity = 'common', family = 'volume' WHERE key = 'city_taster';
UPDATE badges SET rarity = 'uncommon', family = 'volume' WHERE key = 'local_food_scout';
UPDATE badges SET rarity = 'rare', family = 'volume' WHERE key = 'restaurant_trailblazer';
UPDATE badges SET rarity = 'epic', family = 'volume' WHERE key = 'ultimate_explorer';

-- ============================================
-- 2c. Insert 46 new badges
-- ============================================

-- Discovery badges (3)
INSERT INTO badges (key, name, subtitle, description, icon, is_public_eligible, sort_order, rarity, family) VALUES
  ('first_to_find', 'First to Find', 'Early bird', 'Helped establish consensus on 1 dish', '🔭', false, 75, 'common', 'discovery'),
  ('trailblazer', 'Trailblazer', 'Pathfinder', 'Helped establish consensus on 5 dishes', '🗺️', false, 70, 'uncommon', 'discovery'),
  ('pioneer', 'Pioneer', 'Charting new territory', 'Helped establish consensus on 15 dishes', '⛰️', true, 65, 'rare', 'discovery')
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  icon = EXCLUDED.icon, is_public_eligible = EXCLUDED.is_public_eligible,
  sort_order = EXCLUDED.sort_order, rarity = EXCLUDED.rarity, family = EXCLUDED.family;

-- Consistency badges (3)
INSERT INTO badges (key, name, subtitle, description, icon, is_public_eligible, sort_order, rarity, family) VALUES
  ('steady_hand', 'Steady Hand', 'Right on target', 'Global bias within 0.5 of consensus with 20+ rated', '🎯', true, 60, 'uncommon', 'consistency'),
  ('tough_critic', 'Tough Critic', 'Holding the line', 'Consistently rates below consensus (bias <= -1.5)', '🧐', false, 58, 'uncommon', 'consistency'),
  ('generous_spirit', 'Generous Spirit', 'Spreading the love', 'Consistently rates above consensus (bias >= 1.5)', '💛', false, 56, 'uncommon', 'consistency')
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  icon = EXCLUDED.icon, is_public_eligible = EXCLUDED.is_public_eligible,
  sort_order = EXCLUDED.sort_order, rarity = EXCLUDED.rarity, family = EXCLUDED.family;

-- Community badges (3)
INSERT INTO badges (key, name, subtitle, description, icon, is_public_eligible, sort_order, rarity, family) VALUES
  ('helping_hand', 'Helping Hand', 'Early contributor', 'Helped establish consensus on 3 dishes', '🙌', false, 54, 'common', 'community'),
  ('community_builder', 'Community Builder', 'Building the foundation', 'Helped establish consensus on 10 dishes', '🏗️', true, 52, 'uncommon', 'community'),
  ('cornerstone', 'Cornerstone', 'Pillar of the community', 'Helped establish consensus on 25 dishes', '🏛️', true, 50, 'rare', 'community')
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  icon = EXCLUDED.icon, is_public_eligible = EXCLUDED.is_public_eligible,
  sort_order = EXCLUDED.sort_order, rarity = EXCLUDED.rarity, family = EXCLUDED.family;

-- Influence badges (3)
INSERT INTO badges (key, name, subtitle, description, icon, is_public_eligible, sort_order, rarity, family) VALUES
  ('taste_maker', 'Taste Maker', 'Building a following', '5+ followers trust your taste', '📣', false, 48, 'uncommon', 'influence'),
  ('trusted_voice', 'Trusted Voice', 'People listen', '15+ followers trust your taste', '🎙️', true, 46, 'rare', 'influence'),
  ('taste_authority', 'Taste Authority', 'A true influencer', '30+ followers trust your taste', '🏆', true, 44, 'epic', 'influence')
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  icon = EXCLUDED.icon, is_public_eligible = EXCLUDED.is_public_eligible,
  sort_order = EXCLUDED.sort_order, rarity = EXCLUDED.rarity, family = EXCLUDED.family;

-- Category Mastery badges (34 = 17 categories x 2 tiers)
-- Specialist tier (rare): 15+ consensus-rated in category, |bias| <= 1.5
-- Authority tier (epic): 30+ consensus-rated in category, |bias| <= 1.0

INSERT INTO badges (key, name, subtitle, description, icon, is_public_eligible, sort_order, rarity, family, category) VALUES
  -- Pizza
  ('specialist_pizza', 'Pizza Specialist', 'Pizza expert', '15+ consensus-rated pizza dishes with accurate taste', '🍕', true, 40, 'rare', 'category', 'pizza'),
  ('authority_pizza', 'Pizza Authority', 'Pizza master', '30+ consensus-rated pizza dishes with elite accuracy', '🍕', true, 39, 'epic', 'category', 'pizza'),
  -- Burger
  ('specialist_burger', 'Burger Specialist', 'Burger expert', '15+ consensus-rated burger dishes with accurate taste', '🍔', true, 40, 'rare', 'category', 'burger'),
  ('authority_burger', 'Burger Authority', 'Burger master', '30+ consensus-rated burger dishes with elite accuracy', '🍔', true, 39, 'epic', 'category', 'burger'),
  -- Taco
  ('specialist_taco', 'Taco Specialist', 'Taco expert', '15+ consensus-rated taco dishes with accurate taste', '🌮', true, 40, 'rare', 'category', 'taco'),
  ('authority_taco', 'Taco Authority', 'Taco master', '30+ consensus-rated taco dishes with elite accuracy', '🌮', true, 39, 'epic', 'category', 'taco'),
  -- Wings
  ('specialist_wings', 'Wings Specialist', 'Wings expert', '15+ consensus-rated wing dishes with accurate taste', '🍗', true, 40, 'rare', 'category', 'wings'),
  ('authority_wings', 'Wings Authority', 'Wings master', '30+ consensus-rated wing dishes with elite accuracy', '🍗', true, 39, 'epic', 'category', 'wings'),
  -- Sushi
  ('specialist_sushi', 'Sushi Specialist', 'Sushi expert', '15+ consensus-rated sushi dishes with accurate taste', '🍣', true, 40, 'rare', 'category', 'sushi'),
  ('authority_sushi', 'Sushi Authority', 'Sushi master', '30+ consensus-rated sushi dishes with elite accuracy', '🍣', true, 39, 'epic', 'category', 'sushi'),
  -- Sandwich
  ('specialist_sandwich', 'Sandwich Specialist', 'Sandwich expert', '15+ consensus-rated sandwich dishes with accurate taste', '🥪', true, 40, 'rare', 'category', 'sandwich'),
  ('authority_sandwich', 'Sandwich Authority', 'Sandwich master', '30+ consensus-rated sandwich dishes with elite accuracy', '🥪', true, 39, 'epic', 'category', 'sandwich'),
  -- Pasta
  ('specialist_pasta', 'Pasta Specialist', 'Pasta expert', '15+ consensus-rated pasta dishes with accurate taste', '🍝', true, 40, 'rare', 'category', 'pasta'),
  ('authority_pasta', 'Pasta Authority', 'Pasta master', '30+ consensus-rated pasta dishes with elite accuracy', '🍝', true, 39, 'epic', 'category', 'pasta'),
  -- Poke Bowl
  ('specialist_pokebowl', 'Poke Specialist', 'Poke expert', '15+ consensus-rated poke dishes with accurate taste', '🥗', true, 40, 'rare', 'category', 'pokebowl'),
  ('authority_pokebowl', 'Poke Authority', 'Poke master', '30+ consensus-rated poke dishes with elite accuracy', '🥗', true, 39, 'epic', 'category', 'pokebowl'),
  -- Lobster Roll
  ('specialist_lobster_roll', 'Lobster Roll Specialist', 'Lobster roll expert', '15+ consensus-rated lobster roll dishes with accurate taste', '🦞', true, 40, 'rare', 'category', 'lobster roll'),
  ('authority_lobster_roll', 'Lobster Roll Authority', 'Lobster roll master', '30+ consensus-rated lobster roll dishes with elite accuracy', '🦞', true, 39, 'epic', 'category', 'lobster roll'),
  -- Seafood
  ('specialist_seafood', 'Seafood Specialist', 'Seafood expert', '15+ consensus-rated seafood dishes with accurate taste', '🦐', true, 40, 'rare', 'category', 'seafood'),
  ('authority_seafood', 'Seafood Authority', 'Seafood master', '30+ consensus-rated seafood dishes with elite accuracy', '🦐', true, 39, 'epic', 'category', 'seafood'),
  -- Chowder
  ('specialist_chowder', 'Chowder Specialist', 'Chowder expert', '15+ consensus-rated chowder dishes with accurate taste', '🍲', true, 40, 'rare', 'category', 'chowder'),
  ('authority_chowder', 'Chowder Authority', 'Chowder master', '30+ consensus-rated chowder dishes with elite accuracy', '🍲', true, 39, 'epic', 'category', 'chowder'),
  -- Soup
  ('specialist_soup', 'Soup Specialist', 'Soup expert', '15+ consensus-rated soup dishes with accurate taste', '🍜', true, 40, 'rare', 'category', 'soup'),
  ('authority_soup', 'Soup Authority', 'Soup master', '30+ consensus-rated soup dishes with elite accuracy', '🍜', true, 39, 'epic', 'category', 'soup'),
  -- Breakfast
  ('specialist_breakfast', 'Breakfast Specialist', 'Breakfast expert', '15+ consensus-rated breakfast dishes with accurate taste', '🍳', true, 40, 'rare', 'category', 'breakfast'),
  ('authority_breakfast', 'Breakfast Authority', 'Breakfast master', '30+ consensus-rated breakfast dishes with elite accuracy', '🍳', true, 39, 'epic', 'category', 'breakfast'),
  -- Salad
  ('specialist_salad', 'Salad Specialist', 'Salad expert', '15+ consensus-rated salad dishes with accurate taste', '🥗', true, 40, 'rare', 'category', 'salad'),
  ('authority_salad', 'Salad Authority', 'Salad master', '30+ consensus-rated salad dishes with elite accuracy', '🥗', true, 39, 'epic', 'category', 'salad'),
  -- Fried Chicken
  ('specialist_fried_chicken', 'Fried Chicken Specialist', 'Fried chicken expert', '15+ consensus-rated fried chicken dishes with accurate taste', '🍗', true, 40, 'rare', 'category', 'fried chicken'),
  ('authority_fried_chicken', 'Fried Chicken Authority', 'Fried chicken master', '30+ consensus-rated fried chicken dishes with elite accuracy', '🍗', true, 39, 'epic', 'category', 'fried chicken'),
  -- Entree
  ('specialist_entree', 'Entree Specialist', 'Entree expert', '15+ consensus-rated entree dishes with accurate taste', '🍽️', true, 40, 'rare', 'category', 'entree'),
  ('authority_entree', 'Entree Authority', 'Entree master', '30+ consensus-rated entree dishes with elite accuracy', '🍽️', true, 39, 'epic', 'category', 'entree'),
  -- Dessert
  ('specialist_dessert', 'Dessert Specialist', 'Dessert expert', '15+ consensus-rated dessert dishes with accurate taste', '🍰', true, 40, 'rare', 'category', 'dessert'),
  ('authority_dessert', 'Dessert Authority', 'Dessert master', '30+ consensus-rated dessert dishes with elite accuracy', '🍰', true, 39, 'epic', 'category', 'dessert')
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  icon = EXCLUDED.icon, is_public_eligible = EXCLUDED.is_public_eligible,
  sort_order = EXCLUDED.sort_order, rarity = EXCLUDED.rarity, family = EXCLUDED.family,
  category = EXCLUDED.category;

-- ============================================
-- 2d. New RPC: get_badge_evaluation_stats
-- Returns all data needed for badge evaluation in one round-trip
-- ============================================

CREATE OR REPLACE FUNCTION get_badge_evaluation_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_total_dishes BIGINT;
  v_total_restaurants BIGINT;
  v_global_bias NUMERIC(3,1);
  v_votes_with_consensus INT;
  v_follower_count BIGINT;
  v_dishes_helped_establish INT;
  v_category_stats JSON;
BEGIN
  -- Basic volume stats
  SELECT
    COUNT(DISTINCT v.dish_id),
    COUNT(DISTINCT d.restaurant_id)
  INTO v_total_dishes, v_total_restaurants
  FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  WHERE v.user_id = p_user_id;

  -- Global bias and consensus stats from user_rating_stats
  SELECT
    COALESCE(urs.rating_bias, 0.0),
    COALESCE(urs.votes_with_consensus, 0),
    COALESCE(urs.dishes_helped_establish, 0)
  INTO v_global_bias, v_votes_with_consensus, v_dishes_helped_establish
  FROM user_rating_stats urs
  WHERE urs.user_id = p_user_id;

  -- Defaults if no rating stats row
  IF v_global_bias IS NULL THEN v_global_bias := 0.0; END IF;
  IF v_votes_with_consensus IS NULL THEN v_votes_with_consensus := 0; END IF;
  IF v_dishes_helped_establish IS NULL THEN v_dishes_helped_establish := 0; END IF;

  -- Follower count
  SELECT COUNT(*) INTO v_follower_count
  FROM follows
  WHERE following_id = p_user_id;

  -- Per-category stats: total ratings, consensus ratings, and dynamic bias
  SELECT COALESCE(json_agg(cat_row), '[]'::json)
  INTO v_category_stats
  FROM (
    SELECT
      v.category_snapshot AS category,
      COUNT(*) AS total_ratings,
      COUNT(*) FILTER (WHERE d.consensus_ready = TRUE) AS consensus_ratings,
      ROUND(
        AVG(v.rating_10 - d.avg_rating) FILTER (WHERE d.consensus_ready = TRUE AND v.rating_10 IS NOT NULL),
        1
      ) AS bias
    FROM votes v
    JOIN dishes d ON v.dish_id = d.id
    WHERE v.user_id = p_user_id
      AND v.category_snapshot IS NOT NULL
    GROUP BY v.category_snapshot
  ) cat_row;

  RETURN json_build_object(
    'totalDishes', v_total_dishes,
    'totalRestaurants', v_total_restaurants,
    'globalBias', v_global_bias,
    'votesWithConsensus', v_votes_with_consensus,
    'followerCount', v_follower_count,
    'dishesHelpedEstablish', v_dishes_helped_establish,
    'categoryStats', v_category_stats
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- 2e. Rewrite evaluate_user_badges
-- Uses get_badge_evaluation_stats internally, checks all badge families
-- ============================================

CREATE OR REPLACE FUNCTION evaluate_user_badges(p_user_id UUID)
RETURNS TABLE (
  badge_key TEXT,
  newly_unlocked BOOLEAN
) AS $$
DECLARE
  v_stats JSON;
  v_total_dishes BIGINT;
  v_total_restaurants BIGINT;
  v_global_bias NUMERIC;
  v_votes_with_consensus INT;
  v_follower_count BIGINT;
  v_dishes_helped INT;
  v_badge RECORD;
  v_already_has BOOLEAN;
  v_threshold INT;
  v_cat_stat RECORD;
  v_cat_consensus INT;
  v_cat_bias NUMERIC;
  v_parsed_cat TEXT;
  v_parsed_tier TEXT;
BEGIN
  -- Get all stats in one call
  v_stats := get_badge_evaluation_stats(p_user_id);

  v_total_dishes := (v_stats->>'totalDishes')::BIGINT;
  v_total_restaurants := (v_stats->>'totalRestaurants')::BIGINT;
  v_global_bias := (v_stats->>'globalBias')::NUMERIC;
  v_votes_with_consensus := (v_stats->>'votesWithConsensus')::INT;
  v_follower_count := (v_stats->>'followerCount')::BIGINT;
  v_dishes_helped := (v_stats->>'dishesHelpedEstablish')::INT;

  -- Iterate over all badge definitions
  FOR v_badge IN SELECT b.key, b.family, b.category, b.rarity FROM badges b ORDER BY b.sort_order DESC
  LOOP
    -- Skip if already earned
    SELECT EXISTS(
      SELECT 1 FROM user_badges ub WHERE ub.user_id = p_user_id AND ub.badge_key = v_badge.key
    ) INTO v_already_has;

    IF v_already_has THEN CONTINUE; END IF;

    -- Check by family
    CASE v_badge.family

      -- Volume badges
      WHEN 'volume' THEN
        CASE v_badge.key
          WHEN 'first_bite' THEN v_threshold := 1;
          WHEN 'food_explorer' THEN v_threshold := 10;
          WHEN 'taste_tester' THEN v_threshold := 25;
          WHEN 'super_reviewer' THEN v_threshold := 100;
          WHEN 'top_1_percent_reviewer' THEN v_threshold := 125;
          WHEN 'neighborhood_explorer' THEN v_threshold := 3;
          WHEN 'city_taster' THEN v_threshold := 5;
          WHEN 'local_food_scout' THEN v_threshold := 10;
          WHEN 'restaurant_trailblazer' THEN v_threshold := 20;
          WHEN 'ultimate_explorer' THEN v_threshold := 50;
          ELSE CONTINUE;
        END CASE;

        -- Dish-based or restaurant-based?
        IF v_badge.key IN ('first_bite', 'food_explorer', 'taste_tester', 'super_reviewer', 'top_1_percent_reviewer') THEN
          IF v_total_dishes >= v_threshold THEN
            INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
            badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
          END IF;
        ELSE
          IF v_total_restaurants >= v_threshold THEN
            INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
            badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
          END IF;
        END IF;

      -- Category mastery badges
      WHEN 'category' THEN
        IF v_badge.category IS NULL THEN CONTINUE; END IF;

        -- Parse tier from key (specialist_ or authority_)
        IF v_badge.key LIKE 'specialist_%' THEN
          v_parsed_tier := 'specialist';
        ELSIF v_badge.key LIKE 'authority_%' THEN
          v_parsed_tier := 'authority';
        ELSE
          CONTINUE;
        END IF;

        -- Find this category's stats
        v_cat_consensus := 0;
        v_cat_bias := NULL;

        FOR v_cat_stat IN SELECT * FROM json_to_recordset(v_stats->'categoryStats') AS x(category TEXT, total_ratings INT, consensus_ratings INT, bias NUMERIC)
        LOOP
          IF v_cat_stat.category = v_badge.category THEN
            v_cat_consensus := COALESCE(v_cat_stat.consensus_ratings, 0);
            v_cat_bias := v_cat_stat.bias;
            EXIT;
          END IF;
        END LOOP;

        -- Check requirements
        IF v_parsed_tier = 'specialist' THEN
          IF v_cat_consensus >= 15 AND v_cat_bias IS NOT NULL AND ABS(v_cat_bias) <= 1.5 THEN
            INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
            badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
          END IF;
        ELSIF v_parsed_tier = 'authority' THEN
          IF v_cat_consensus >= 30 AND v_cat_bias IS NOT NULL AND ABS(v_cat_bias) <= 1.0 THEN
            INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
            badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
          END IF;
        END IF;

      -- Discovery badges
      WHEN 'discovery' THEN
        CASE v_badge.key
          WHEN 'first_to_find' THEN v_threshold := 1;
          WHEN 'trailblazer' THEN v_threshold := 5;
          WHEN 'pioneer' THEN v_threshold := 15;
          ELSE CONTINUE;
        END CASE;

        IF v_dishes_helped >= v_threshold THEN
          INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
          badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
        END IF;

      -- Consistency badges
      WHEN 'consistency' THEN
        IF v_votes_with_consensus < 20 THEN CONTINUE; END IF;

        CASE v_badge.key
          WHEN 'steady_hand' THEN
            IF ABS(v_global_bias) <= 0.5 THEN
              INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
              badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
            END IF;
          WHEN 'tough_critic' THEN
            IF v_global_bias <= -1.5 THEN
              INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
              badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
            END IF;
          WHEN 'generous_spirit' THEN
            IF v_global_bias >= 1.5 THEN
              INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
              badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
            END IF;
          ELSE NULL;
        END CASE;

      -- Community badges
      WHEN 'community' THEN
        CASE v_badge.key
          WHEN 'helping_hand' THEN v_threshold := 3;
          WHEN 'community_builder' THEN v_threshold := 10;
          WHEN 'cornerstone' THEN v_threshold := 25;
          ELSE CONTINUE;
        END CASE;

        IF v_dishes_helped >= v_threshold THEN
          INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
          badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
        END IF;

      -- Influence badges
      WHEN 'influence' THEN
        CASE v_badge.key
          WHEN 'taste_maker' THEN v_threshold := 5;
          WHEN 'trusted_voice' THEN v_threshold := 15;
          WHEN 'taste_authority' THEN v_threshold := 30;
          ELSE CONTINUE;
        END CASE;

        IF v_follower_count >= v_threshold THEN
          INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
          badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
        END IF;

      ELSE
        -- Unknown family, skip
        NULL;
    END CASE;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2f. Update get_user_badges and get_public_badges
-- to return rarity, family, category columns
-- ============================================

CREATE OR REPLACE FUNCTION get_user_badges(p_user_id UUID, p_public_only BOOLEAN DEFAULT false)
RETURNS TABLE (
  badge_key TEXT,
  name TEXT,
  subtitle TEXT,
  description TEXT,
  icon TEXT,
  is_public_eligible BOOLEAN,
  sort_order INTEGER,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  rarity TEXT,
  family TEXT,
  category TEXT
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
    ub.unlocked_at,
    b.rarity,
    b.family,
    b.category
  FROM user_badges ub
  JOIN badges b ON ub.badge_key = b.key
  WHERE ub.user_id = p_user_id
    AND (NOT p_public_only OR b.is_public_eligible = true)
  ORDER BY b.sort_order ASC, ub.unlocked_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_public_badges(p_user_id UUID)
RETURNS TABLE (
  badge_key TEXT,
  name TEXT,
  subtitle TEXT,
  description TEXT,
  icon TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  rarity TEXT,
  family TEXT,
  category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.key as badge_key,
    b.name,
    b.subtitle,
    b.description,
    b.icon,
    ub.unlocked_at,
    b.rarity,
    b.family,
    b.category
  FROM user_badges ub
  JOIN badges b ON ub.badge_key = b.key
  WHERE ub.user_id = p_user_id
    AND b.is_public_eligible = true
  ORDER BY b.sort_order ASC, ub.unlocked_at DESC
  LIMIT 6;
END;
$$ LANGUAGE plpgsql STABLE;
