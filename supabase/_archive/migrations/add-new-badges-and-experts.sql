-- =============================================
-- New Badges + Category Experts
-- 12 new badges (Hidden Gem, Called It, Order This, First Reviewer)
-- Enhanced evaluation stats with 4 new metrics
-- Fix follower count bug (following_id -> followed_id)
-- New get_category_experts RPC
-- =============================================

-- ============================================
-- 1. Insert 12 new badge definitions
-- ============================================

-- Hidden Gem badges (discovery family) - reward early voters on dishes that became popular
INSERT INTO badges (key, name, subtitle, description, icon, is_public_eligible, sort_order, rarity, family) VALUES
  ('hidden_gem_finder', 'Hidden Gem Finder', 'Spotted potential', 'Voted early on a dish that became a hidden gem', '💎', false, 84, 'common', 'discovery'),
  ('gem_hunter', 'Gem Hunter', 'Sharp eye for quality', 'Found 3 hidden gems before the crowd', '🔍', false, 82, 'uncommon', 'discovery'),
  ('gem_collector', 'Gem Collector', 'Treasure hunter', 'Discovered 10 hidden gems early', '🏆', true, 80, 'rare', 'discovery')
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  icon = EXCLUDED.icon, is_public_eligible = EXCLUDED.is_public_eligible,
  sort_order = EXCLUDED.sort_order, rarity = EXCLUDED.rarity, family = EXCLUDED.family;

-- Called It badges (consistency family) - reward predictive accuracy
INSERT INTO badges (key, name, subtitle, description, icon, is_public_eligible, sort_order, rarity, family) VALUES
  ('good_call', 'Good Call', 'Nailed it', 'Predicted a dish would be great and the crowd agreed', '📞', false, 102, 'common', 'consistency'),
  ('taste_prophet', 'Taste Prophet', 'Ahead of the curve', 'Called it right on 5 dishes before consensus', '🔮', false, 100, 'uncommon', 'consistency'),
  ('oracle', 'Oracle', 'The taste whisperer', 'Predicted 15 crowd favorites before anyone else', '🌟', true, 98, 'rare', 'consistency')
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  icon = EXCLUDED.icon, is_public_eligible = EXCLUDED.is_public_eligible,
  sort_order = EXCLUDED.sort_order, rarity = EXCLUDED.rarity, family = EXCLUDED.family;

-- Order This badges (discovery family) - reward voting on #1 dishes
INSERT INTO badges (key, name, subtitle, description, icon, is_public_eligible, sort_order, rarity, family) VALUES
  ('taste_spotter', 'Taste Spotter', 'Good instincts', 'Voted on a dish that became #1 at its restaurant', '📍', false, 90, 'common', 'discovery'),
  ('order_picker', 'Order Picker', 'Menu navigator', 'Voted on 5 dishes that became #1 at their restaurant', '🎯', false, 88, 'uncommon', 'discovery'),
  ('menu_master', 'Menu Master', 'Always picks the best', 'Voted on 15 dishes that became #1 at their restaurant', '📋', true, 86, 'rare', 'discovery')
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  icon = EXCLUDED.icon, is_public_eligible = EXCLUDED.is_public_eligible,
  sort_order = EXCLUDED.sort_order, rarity = EXCLUDED.rarity, family = EXCLUDED.family;

-- First Reviewer badges (discovery family) - reward being first to vote
INSERT INTO badges (key, name, subtitle, description, icon, is_public_eligible, sort_order, rarity, family) VALUES
  ('ice_breaker', 'Ice Breaker', 'Breaking new ground', 'Was the first person to vote on a dish', '🧊', false, 96, 'common', 'discovery'),
  ('first_taste', 'First Taste', 'Fearless foodie', 'Was first to vote on 5 dishes', '👅', false, 94, 'uncommon', 'discovery'),
  ('pioneer_spirit', 'Pioneer Spirit', 'Blazing the trail', 'Was first to vote on 15 dishes', '🚩', true, 92, 'rare', 'discovery')
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  icon = EXCLUDED.icon, is_public_eligible = EXCLUDED.is_public_eligible,
  sort_order = EXCLUDED.sort_order, rarity = EXCLUDED.rarity, family = EXCLUDED.family;

-- ============================================
-- 2. Enhanced get_badge_evaluation_stats
-- Adds 4 new stats + fixes follower count bug
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
  v_hidden_gems INT;
  v_called_it INT;
  v_top_dish_votes INT;
  v_first_voter_count INT;
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

  -- Follower count (FIXED: was following_id, should be followed_id)
  SELECT COUNT(*) INTO v_follower_count
  FROM follows
  WHERE followed_id = p_user_id;

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

  -- NEW: Hidden gems found - voted early (position <= 3) on dishes that became highly rated
  SELECT COUNT(DISTINCT v.dish_id) INTO v_hidden_gems
  FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  WHERE v.user_id = p_user_id
    AND v.vote_position <= 3
    AND d.avg_rating >= 8.0
    AND d.total_votes >= 10;

  -- Defaults
  IF v_hidden_gems IS NULL THEN v_hidden_gems := 0; END IF;

  -- NEW: Called it - voted early and high on dishes where consensus agrees
  SELECT COUNT(DISTINCT v.dish_id) INTO v_called_it
  FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  WHERE v.user_id = p_user_id
    AND v.vote_position <= 5
    AND v.rating_10 >= 8
    AND d.consensus_ready = TRUE
    AND d.avg_rating >= 8.0;

  IF v_called_it IS NULL THEN v_called_it := 0; END IF;

  -- NEW: Top dish votes - user voted on dishes that are #1 at their restaurant
  SELECT COUNT(DISTINCT v.dish_id) INTO v_top_dish_votes
  FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  WHERE v.user_id = p_user_id
    AND d.total_votes >= 5
    AND d.avg_rating = (
      SELECT MAX(d2.avg_rating)
      FROM dishes d2
      WHERE d2.restaurant_id = d.restaurant_id
        AND d2.total_votes >= 5
    );

  IF v_top_dish_votes IS NULL THEN v_top_dish_votes := 0; END IF;

  -- NEW: First voter count - dishes where user was vote_position = 1
  SELECT COUNT(*) INTO v_first_voter_count
  FROM votes v
  WHERE v.user_id = p_user_id
    AND v.vote_position = 1;

  IF v_first_voter_count IS NULL THEN v_first_voter_count := 0; END IF;

  RETURN json_build_object(
    'totalDishes', v_total_dishes,
    'totalRestaurants', v_total_restaurants,
    'globalBias', v_global_bias,
    'votesWithConsensus', v_votes_with_consensus,
    'followerCount', v_follower_count,
    'dishesHelpedEstablish', v_dishes_helped_establish,
    'categoryStats', v_category_stats,
    'hiddenGemsFound', v_hidden_gems,
    'calledItCount', v_called_it,
    'topDishVotes', v_top_dish_votes,
    'firstVoterCount', v_first_voter_count
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- 3. Enhanced evaluate_user_badges
-- Adds 12 new badge evaluation blocks
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
  v_hidden_gems INT;
  v_called_it INT;
  v_top_dish_votes INT;
  v_first_voter_count INT;
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
  v_hidden_gems := (v_stats->>'hiddenGemsFound')::INT;
  v_called_it := (v_stats->>'calledItCount')::INT;
  v_top_dish_votes := (v_stats->>'topDishVotes')::INT;
  v_first_voter_count := (v_stats->>'firstVoterCount')::INT;

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

      -- Discovery badges (existing + new types)
      WHEN 'discovery' THEN
        -- Hidden Gem badges (hiddenGemsFound)
        IF v_badge.key IN ('hidden_gem_finder', 'gem_hunter', 'gem_collector') THEN
          CASE v_badge.key
            WHEN 'hidden_gem_finder' THEN v_threshold := 1;
            WHEN 'gem_hunter' THEN v_threshold := 3;
            WHEN 'gem_collector' THEN v_threshold := 10;
            ELSE NULL;
          END CASE;

          IF v_hidden_gems >= v_threshold THEN
            INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
            badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
          END IF;
          CONTINUE;
        END IF;

        -- Order This badges (topDishVotes)
        IF v_badge.key IN ('taste_spotter', 'order_picker', 'menu_master') THEN
          CASE v_badge.key
            WHEN 'taste_spotter' THEN v_threshold := 1;
            WHEN 'order_picker' THEN v_threshold := 5;
            WHEN 'menu_master' THEN v_threshold := 15;
            ELSE NULL;
          END CASE;

          IF v_top_dish_votes >= v_threshold THEN
            INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
            badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
          END IF;
          CONTINUE;
        END IF;

        -- First Reviewer badges (firstVoterCount)
        IF v_badge.key IN ('ice_breaker', 'first_taste', 'pioneer_spirit') THEN
          CASE v_badge.key
            WHEN 'ice_breaker' THEN v_threshold := 1;
            WHEN 'first_taste' THEN v_threshold := 5;
            WHEN 'pioneer_spirit' THEN v_threshold := 15;
            ELSE NULL;
          END CASE;

          IF v_first_voter_count >= v_threshold THEN
            INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
            badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
          END IF;
          CONTINUE;
        END IF;

        -- Existing discovery badges (dishesHelpedEstablish)
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

      -- Consistency badges (existing + Called It)
      WHEN 'consistency' THEN
        -- Called It badges (no minimum consensus requirement)
        IF v_badge.key IN ('good_call', 'taste_prophet', 'oracle') THEN
          CASE v_badge.key
            WHEN 'good_call' THEN v_threshold := 1;
            WHEN 'taste_prophet' THEN v_threshold := 5;
            WHEN 'oracle' THEN v_threshold := 15;
            ELSE NULL;
          END CASE;

          IF v_called_it >= v_threshold THEN
            INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
            badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
          END IF;
          CONTINUE;
        END IF;

        -- Existing consistency badges require 20 consensus votes
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
-- 4. New RPC: get_category_experts
-- Returns users with specialist/authority badges for a category
-- ============================================

CREATE OR REPLACE FUNCTION get_category_experts(
  p_category TEXT,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  badge_tier TEXT,
  follower_count BIGINT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT
    ub.user_id,
    p.display_name,
    CASE
      WHEN b.key LIKE 'authority_%' THEN 'authority'
      ELSE 'specialist'
    END AS badge_tier,
    COALESCE(fc.cnt, 0) AS follower_count
  FROM user_badges ub
  JOIN badges b ON ub.badge_key = b.key
  JOIN profiles p ON ub.user_id = p.id
  LEFT JOIN (
    SELECT followed_id, COUNT(*) AS cnt
    FROM follows
    GROUP BY followed_id
  ) fc ON fc.followed_id = ub.user_id
  WHERE b.category = p_category
    AND b.family = 'category'
  ORDER BY
    CASE WHEN b.key LIKE 'authority_%' THEN 0 ELSE 1 END,
    COALESCE(fc.cnt, 0) DESC
  LIMIT p_limit;
$$;
