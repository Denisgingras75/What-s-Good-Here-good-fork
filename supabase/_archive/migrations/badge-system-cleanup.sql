-- =============================================
-- Badge System Cleanup: 58+ → 41 badges
-- Kill volume, community, old discovery badges
-- Add steak + tendys category badges
-- Move called-it from consistency to discovery
-- Update thresholds: category 10/20, influence 10/25
-- =============================================

-- ============================================
-- 1. Delete badges that no longer exist
-- ============================================

-- Delete user_badges first (FK constraint)
DELETE FROM user_badges WHERE badge_key IN (
  -- Volume badges (10)
  'first_bite', 'food_explorer', 'taste_tester', 'super_reviewer', 'top_1_percent_reviewer',
  'neighborhood_explorer', 'city_taster', 'local_food_scout', 'restaurant_trailblazer', 'ultimate_explorer',
  -- Community badges (3)
  'helping_hand', 'community_builder', 'cornerstone',
  -- Old discovery badges (3)
  'first_to_find', 'trailblazer', 'pioneer',
  -- Order This badges (3)
  'taste_spotter', 'order_picker', 'menu_master',
  -- First Reviewer badges (3)
  'ice_breaker', 'first_taste', 'pioneer_spirit',
  -- Deleted influence badge (1)
  'taste_authority',
  -- Deleted category badges (8) — soup, pokebowl, fried_chicken, entree
  'specialist_soup', 'authority_soup',
  'specialist_pokebowl', 'authority_pokebowl',
  'specialist_fried_chicken', 'authority_fried_chicken',
  'specialist_entree', 'authority_entree'
);

-- Delete badge definitions
DELETE FROM badges WHERE key IN (
  'first_bite', 'food_explorer', 'taste_tester', 'super_reviewer', 'top_1_percent_reviewer',
  'neighborhood_explorer', 'city_taster', 'local_food_scout', 'restaurant_trailblazer', 'ultimate_explorer',
  'helping_hand', 'community_builder', 'cornerstone',
  'first_to_find', 'trailblazer', 'pioneer',
  'taste_spotter', 'order_picker', 'menu_master',
  'ice_breaker', 'first_taste', 'pioneer_spirit',
  'taste_authority',
  'specialist_soup', 'authority_soup',
  'specialist_pokebowl', 'authority_pokebowl',
  'specialist_fried_chicken', 'authority_fried_chicken',
  'specialist_entree', 'authority_entree'
);

-- ============================================
-- 2. Add steak + tendys category badges
-- ============================================

INSERT INTO badges (key, name, subtitle, description, icon, rarity, family, category, is_public_eligible, sort_order) VALUES
  ('specialist_steak', 'Steak Specialist', 'Steak connoisseur', 'Rated 10+ consensus-rated steak dishes with low bias', '🥩', 'rare', 'category', 'steak', true, 29),
  ('authority_steak', 'Steak Authority', 'Steak master', 'Rated 20+ consensus-rated steak dishes with very low bias', '🥩', 'epic', 'category', 'steak', true, 28),
  ('specialist_tendys', 'Tenders Specialist', 'Tender expert', 'Rated 10+ consensus-rated tenders dishes with low bias', '🍗', 'rare', 'category', 'tendys', true, 31),
  ('authority_tendys', 'Tenders Authority', 'Tender master', 'Rated 20+ consensus-rated tenders dishes with very low bias', '🍗', 'epic', 'category', 'tendys', true, 30)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description,
  icon = EXCLUDED.icon, rarity = EXCLUDED.rarity, family = EXCLUDED.family,
  category = EXCLUDED.category, is_public_eligible = EXCLUDED.is_public_eligible,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- 3. Move called-it badges to discovery family
-- ============================================

UPDATE badges SET family = 'discovery'
WHERE key IN ('good_call', 'taste_prophet', 'oracle');

-- ============================================
-- 4. Update gem thresholds in badge descriptions
-- ============================================

-- gem_hunter: was "3 hidden gems", now "5 hidden gems"
UPDATE badges SET
  description = 'Found 5 hidden gems before the crowd'
WHERE key = 'gem_hunter';

-- taste_prophet: was "5 dishes", now "3 dishes"
UPDATE badges SET
  description = 'Called it right on 3 dishes before consensus'
WHERE key = 'taste_prophet';

-- oracle: was "15 dishes", now "5 dishes"
UPDATE badges SET
  description = 'Predicted 5 crowd favorites before anyone else'
WHERE key = 'oracle';

-- ============================================
-- 5. Recreate evaluate_user_badges with clean logic
-- Only: category (10/20), discovery (gems + called-it),
--       consistency (rating style), influence (followers 10/25)
-- ============================================

CREATE OR REPLACE FUNCTION evaluate_user_badges(p_user_id UUID)
RETURNS TABLE (
  badge_key TEXT,
  newly_unlocked BOOLEAN
) AS $$
DECLARE
  v_stats JSON;
  v_global_bias NUMERIC;
  v_votes_with_consensus INT;
  v_follower_count BIGINT;
  v_hidden_gems INT;
  v_called_it INT;
  v_badge RECORD;
  v_already_has BOOLEAN;
  v_threshold INT;
  v_cat_stat RECORD;
  v_cat_consensus INT;
  v_cat_bias NUMERIC;
  v_parsed_tier TEXT;
BEGIN
  -- Get all stats in one call
  v_stats := get_badge_evaluation_stats(p_user_id);

  v_global_bias := (v_stats->>'globalBias')::NUMERIC;
  v_votes_with_consensus := (v_stats->>'votesWithConsensus')::INT;
  v_follower_count := (v_stats->>'followerCount')::BIGINT;
  v_hidden_gems := (v_stats->>'hiddenGemsFound')::INT;
  v_called_it := (v_stats->>'calledItCount')::INT;

  -- Iterate over all badge definitions
  FOR v_badge IN SELECT b.key, b.family, b.category FROM badges b ORDER BY b.sort_order DESC
  LOOP
    -- Skip if already earned
    SELECT EXISTS(
      SELECT 1 FROM user_badges ub WHERE ub.user_id = p_user_id AND ub.badge_key = v_badge.key
    ) INTO v_already_has;

    IF v_already_has THEN CONTINUE; END IF;

    CASE v_badge.family

      -- Category mastery badges (thresholds: 10/20)
      WHEN 'category' THEN
        IF v_badge.category IS NULL THEN CONTINUE; END IF;

        IF v_badge.key LIKE 'specialist_%' THEN
          v_parsed_tier := 'specialist';
        ELSIF v_badge.key LIKE 'authority_%' THEN
          v_parsed_tier := 'authority';
        ELSE
          CONTINUE;
        END IF;

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

        IF v_parsed_tier = 'specialist' THEN
          IF v_cat_consensus >= 10 AND v_cat_bias IS NOT NULL AND ABS(v_cat_bias) <= 1.5 THEN
            INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
            badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
          END IF;
        ELSIF v_parsed_tier = 'authority' THEN
          IF v_cat_consensus >= 20 AND v_cat_bias IS NOT NULL AND ABS(v_cat_bias) <= 1.0 THEN
            INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
            badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
          END IF;
        END IF;

      -- Discovery badges: hidden gems + called-it predictions
      WHEN 'discovery' THEN
        -- Hidden Gem badges
        IF v_badge.key IN ('hidden_gem_finder', 'gem_hunter', 'gem_collector') THEN
          CASE v_badge.key
            WHEN 'hidden_gem_finder' THEN v_threshold := 1;
            WHEN 'gem_hunter' THEN v_threshold := 5;
            WHEN 'gem_collector' THEN v_threshold := 10;
            ELSE NULL;
          END CASE;

          IF v_hidden_gems >= v_threshold THEN
            INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
            badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
          END IF;
          CONTINUE;
        END IF;

        -- Called It badges
        IF v_badge.key IN ('good_call', 'taste_prophet', 'oracle') THEN
          CASE v_badge.key
            WHEN 'good_call' THEN v_threshold := 1;
            WHEN 'taste_prophet' THEN v_threshold := 3;
            WHEN 'oracle' THEN v_threshold := 5;
            ELSE NULL;
          END CASE;

          IF v_called_it >= v_threshold THEN
            INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
            badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
          END IF;
        END IF;

      -- Consistency badges: rating style (require 20 consensus votes)
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

      -- Influence badges: follower milestones (10/25)
      WHEN 'influence' THEN
        CASE v_badge.key
          WHEN 'taste_maker' THEN v_threshold := 10;
          WHEN 'trusted_voice' THEN v_threshold := 25;
          ELSE CONTINUE;
        END CASE;

        IF v_follower_count >= v_threshold THEN
          INSERT INTO user_badges (user_id, badge_key) VALUES (p_user_id, v_badge.key);
          badge_key := v_badge.key; newly_unlocked := true; RETURN NEXT;
        END IF;

      ELSE
        NULL;
    END CASE;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
