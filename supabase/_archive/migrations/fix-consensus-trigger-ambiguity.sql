-- Fix: Rename ambiguous variable in check_consensus_after_vote trigger

CREATE OR REPLACE FUNCTION check_consensus_after_vote()
RETURNS TRIGGER AS $$
DECLARE
  total_votes_count INT;
  consensus_avg NUMERIC(3,1);  -- Renamed from avg_rating to avoid ambiguity
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
  INTO total_votes_count, consensus_avg
  FROM votes
  WHERE dish_id = NEW.dish_id AND rating_10 IS NOT NULL;

  IF total_votes_count >= consensus_threshold THEN
    IF NOT EXISTS (
      SELECT 1 FROM dishes
      WHERE id = NEW.dish_id AND consensus_ready = TRUE
    ) THEN
      SELECT name INTO dish_name_snapshot FROM dishes WHERE id = NEW.dish_id;

      UPDATE dishes SET
        consensus_rating = consensus_avg,
        consensus_ready = TRUE,
        consensus_votes = total_votes_count,
        consensus_calculated_at = NOW()
      WHERE id = NEW.dish_id;

      FOR v IN
        SELECT * FROM votes
        WHERE dish_id = NEW.dish_id
        AND scored_at IS NULL
        AND rating_10 IS NOT NULL
      LOOP
        user_deviation := ROUND(v.rating_10 - consensus_avg, 1);
        is_early := v.vote_position <= 3;

        SELECT rating_bias INTO user_bias_before
        FROM user_rating_stats WHERE user_id = v.user_id;

        IF user_bias_before IS NULL THEN
          user_bias_before := 0.0;
        END IF;

        UPDATE votes SET scored_at = NOW() WHERE id = v.id;

        SELECT ROUND(AVG(votes.rating_10 - d.consensus_rating), 1)
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

        INSERT INTO bias_events (
          user_id, dish_id, dish_name, user_rating,
          consensus_rating, deviation, was_early_voter,
          bias_before, bias_after
        )
        VALUES (
          v.user_id, v.dish_id, dish_name_snapshot, v.rating_10,
          consensus_avg, user_deviation, is_early,
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
