-- =============================================
-- Feature: Taste Compatibility
-- Calculate how closely two users' ratings align
-- Requires minimum 3 shared dishes to show a score
-- =============================================

CREATE OR REPLACE FUNCTION get_taste_compatibility(
  p_user_id UUID,
  p_other_user_id UUID
)
RETURNS TABLE (
  shared_dishes INT,
  avg_difference DECIMAL(3,1),
  compatibility_pct INT
)
LANGUAGE SQL
STABLE
AS $$
  WITH shared AS (
    SELECT
      a.rating_10 AS rating_a,
      b.rating_10 AS rating_b
    FROM votes a
    JOIN votes b ON a.dish_id = b.dish_id
    WHERE a.user_id = p_user_id
    AND b.user_id = p_other_user_id
    AND a.rating_10 IS NOT NULL
    AND b.rating_10 IS NOT NULL
  )
  SELECT
    COUNT(*)::INT AS shared_dishes,
    ROUND(AVG(ABS(rating_a - rating_b)), 1) AS avg_difference,
    CASE
      WHEN COUNT(*) >= 3
      THEN ROUND(100 - (AVG(ABS(rating_a - rating_b)) / 9.0 * 100))::INT
      ELSE NULL
    END AS compatibility_pct
  FROM shared;
$$;
