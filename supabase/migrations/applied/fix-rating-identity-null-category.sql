-- Fix: Handle null categories in rating identity calculation
-- The jsonb_object_agg fails when category is null

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
  SELECT
    ROUND(AVG(v.rating_10 - d.avg_rating), 1),
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

  -- Calculate per-category biases (filter out null categories!)
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
