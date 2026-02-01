-- Switch rating bias from signed average to Mean Absolute Deviation (MAD)
--
-- Before: AVG(user_rating - consensus) → cancels out (+2 and -2 = 0)
-- After:  AVG(ABS(user_rating - consensus)) → measures spread/consistency
--
-- Per-category biases stay SIGNED for directional taste phrases ("loves seafood")

-- ============================================
-- 1. Update get_bias_label for always-positive MAD scale
-- ============================================

CREATE OR REPLACE FUNCTION get_bias_label(bias NUMERIC)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN bias IS NULL THEN 'New Voter'
    WHEN bias < 0.5 THEN 'Consensus Voter'
    WHEN bias < 1.0 THEN 'Has Opinions'
    WHEN bias < 2.0 THEN 'Strong Opinions'
    ELSE 'Wild Card'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 2. Update get_user_rating_identity to use ABS for overall bias
--    (keep per-category biases signed)
-- ============================================

CREATE OR REPLACE FUNCTION get_user_rating_identity(target_user_id UUID)
RETURNS TABLE (
  rating_bias NUMERIC(3,1),
  bias_label TEXT,
  votes_with_consensus INT,
  votes_pending INT,
  dishes_helped_establish INT,
  category_biases JSONB
) AS $$
DECLARE
  calculated_bias NUMERIC(3,1);
  calculated_votes_with_consensus INT;
  calculated_votes_pending INT;
  calculated_dishes_helped INT;
  calculated_category_biases JSONB;
BEGIN
  -- Calculate MAD (mean absolute deviation) dynamically
  SELECT
    ROUND(AVG(ABS(v.rating_10 - d.avg_rating)), 1),
    COUNT(*)::INT
  INTO calculated_bias, calculated_votes_with_consensus
  FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  WHERE v.user_id = target_user_id
  AND v.rating_10 IS NOT NULL
  AND d.avg_rating IS NOT NULL
  AND d.total_votes >= 5;

  -- Count pending votes
  SELECT COUNT(*)::INT
  INTO calculated_votes_pending
  FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  WHERE v.user_id = target_user_id
  AND v.rating_10 IS NOT NULL
  AND (d.total_votes < 5 OR d.avg_rating IS NULL);

  -- Count dishes helped establish
  SELECT COUNT(*)::INT
  INTO calculated_dishes_helped
  FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  WHERE v.user_id = target_user_id
  AND v.vote_position <= 3
  AND v.rating_10 IS NOT NULL
  AND d.total_votes >= 5;

  -- Per-category biases stay SIGNED (directional for taste phrases)
  SELECT COALESCE(jsonb_object_agg(category, bias), '{}'::jsonb)
  INTO calculated_category_biases
  FROM (
    SELECT
      COALESCE(v.category_snapshot, d.category) as category,
      ROUND(AVG(v.rating_10 - d.avg_rating), 1) as bias
    FROM votes v
    JOIN dishes d ON v.dish_id = d.id
    WHERE v.user_id = target_user_id
    AND v.rating_10 IS NOT NULL
    AND d.avg_rating IS NOT NULL
    AND d.total_votes >= 5
    AND COALESCE(v.category_snapshot, d.category) IS NOT NULL
    GROUP BY COALESCE(v.category_snapshot, d.category)
  ) cat_biases
  WHERE category IS NOT NULL;

  RETURN QUERY SELECT
    COALESCE(calculated_bias, 0.0)::NUMERIC(3,1),
    get_bias_label(COALESCE(calculated_bias, 0.0)),
    COALESCE(calculated_votes_with_consensus, 0),
    COALESCE(calculated_votes_pending, 0),
    COALESCE(calculated_dishes_helped, 0),
    COALESCE(calculated_category_biases, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- 3. Update check_consensus_after_vote trigger
--    Use ABS for overall bias calculation
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
  consensus_threshold INT := 5;
BEGIN
  IF NEW.rating_10 IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*), ROUND(AVG(rating_10), 1)
  INTO total_votes, avg_rating
  FROM votes
  WHERE dish_id = NEW.dish_id AND rating_10 IS NOT NULL;

  IF total_votes >= consensus_threshold THEN
    IF NOT EXISTS (
      SELECT 1 FROM dishes
      WHERE id = NEW.dish_id AND consensus_ready = TRUE
    ) THEN
      SELECT name INTO dish_name_snapshot FROM dishes WHERE id = NEW.dish_id;

      UPDATE dishes SET
        consensus_rating = avg_rating,
        consensus_ready = TRUE,
        consensus_votes = total_votes,
        consensus_calculated_at = NOW()
      WHERE id = NEW.dish_id;

      FOR v IN
        SELECT * FROM votes
        WHERE dish_id = NEW.dish_id
        AND scored_at IS NULL
        AND rating_10 IS NOT NULL
      LOOP
        user_deviation := ROUND(v.rating_10 - avg_rating, 1);
        is_early := v.vote_position <= 3;

        SELECT rating_bias INTO user_bias_before
        FROM user_rating_stats WHERE user_id = v.user_id;

        IF user_bias_before IS NULL THEN
          user_bias_before := 0.0;
        END IF;

        UPDATE votes SET scored_at = NOW() WHERE id = v.id;

        -- Use ABS for overall bias (MAD)
        SELECT
          ROUND(AVG(ABS(votes.rating_10 - d.consensus_rating)), 1)
        INTO user_bias_after
        FROM votes
        JOIN dishes d ON votes.dish_id = d.id
        WHERE votes.user_id = v.user_id
        AND d.consensus_ready = TRUE
        AND votes.rating_10 IS NOT NULL
        AND votes.scored_at IS NOT NULL;

        IF user_bias_after IS NULL THEN
          user_bias_after := ABS(user_deviation);
        END IF;

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

        -- Category biases stay SIGNED
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

-- ============================================
-- 4. Backfill existing user_rating_stats with MAD
-- ============================================

UPDATE user_rating_stats urs
SET
  rating_bias = sub.mad,
  bias_label = get_bias_label(sub.mad),
  updated_at = NOW()
FROM (
  SELECT
    v.user_id,
    ROUND(AVG(ABS(v.rating_10 - d.avg_rating)), 1) as mad
  FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  WHERE v.rating_10 IS NOT NULL
  AND d.avg_rating IS NOT NULL
  AND d.total_votes >= 5
  GROUP BY v.user_id
) sub
WHERE urs.user_id = sub.user_id;
