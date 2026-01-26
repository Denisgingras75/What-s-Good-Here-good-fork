-- Dynamic Rating Bias Calculation
-- Instead of storing stale bias, calculate it fresh from current avg_rating
-- This means everyone's bias updates automatically as more votes come in

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
  -- Calculate bias dynamically from current avg_rating
  -- Uses dishes.avg_rating which reflects ALL votes, not stale consensus
  SELECT
    ROUND(AVG(v.rating_10 - d.avg_rating), 1),
    COUNT(*)::INT
  INTO calculated_bias, calculated_votes_with_consensus
  FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  WHERE v.user_id = target_user_id
  AND v.rating_10 IS NOT NULL
  AND d.avg_rating IS NOT NULL
  AND d.total_votes >= 5;  -- Only dishes with enough votes for ranking

  -- Count pending votes (on dishes that don't have enough votes yet)
  SELECT COUNT(*)::INT
  INTO calculated_votes_pending
  FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  WHERE v.user_id = target_user_id
  AND v.rating_10 IS NOT NULL
  AND (d.total_votes < 5 OR d.avg_rating IS NULL);

  -- Count dishes helped establish (was one of first 3 voters)
  SELECT COUNT(*)::INT
  INTO calculated_dishes_helped
  FROM votes v
  JOIN dishes d ON v.dish_id = d.id
  WHERE v.user_id = target_user_id
  AND v.vote_position <= 3
  AND v.rating_10 IS NOT NULL
  AND d.total_votes >= 5;  -- Only count if dish reached consensus

  -- Calculate per-category biases dynamically
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
    GROUP BY COALESCE(v.category_snapshot, d.category)
  ) cat_biases;

  RETURN QUERY SELECT
    COALESCE(calculated_bias, 0.0)::NUMERIC(3,1),
    get_bias_label(COALESCE(calculated_bias, 0.0)),
    COALESCE(calculated_votes_with_consensus, 0),
    COALESCE(calculated_votes_pending, 0),
    COALESCE(calculated_dishes_helped, 0),
    COALESCE(calculated_category_biases, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Also update dishes.avg_rating automatically when votes change
-- This trigger keeps avg_rating current

CREATE OR REPLACE FUNCTION update_dish_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the dish's avg_rating and total_votes
  UPDATE dishes SET
    avg_rating = sub.avg_r,
    total_votes = sub.cnt
  FROM (
    SELECT
      ROUND(AVG(rating_10), 1) as avg_r,
      COUNT(*) as cnt
    FROM votes
    WHERE dish_id = COALESCE(NEW.dish_id, OLD.dish_id)
    AND rating_10 IS NOT NULL
  ) sub
  WHERE dishes.id = COALESCE(NEW.dish_id, OLD.dish_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_dish_rating_on_vote ON votes;

-- Create trigger for insert, update, and delete
CREATE TRIGGER update_dish_rating_on_vote
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION update_dish_avg_rating();
