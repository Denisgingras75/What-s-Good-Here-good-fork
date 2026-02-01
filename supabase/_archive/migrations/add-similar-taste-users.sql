-- =============================================
-- Feature: Similar Taste Discovery
-- Find users with highest taste compatibility
-- who the caller doesn't already follow
-- =============================================

CREATE OR REPLACE FUNCTION get_similar_taste_users(
  p_user_id UUID,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  shared_dishes INT,
  compatibility_pct INT
)
LANGUAGE SQL
STABLE
AS $$
  WITH candidates AS (
    -- Find all users who share 3+ rated dishes with the caller
    SELECT
      b.user_id AS other_id,
      COUNT(*)::INT AS shared,
      ROUND(100 - (AVG(ABS(a.rating_10 - b.rating_10)) / 9.0 * 100))::INT AS compat
    FROM votes a
    JOIN votes b ON a.dish_id = b.dish_id
      AND b.user_id != p_user_id
      AND b.rating_10 IS NOT NULL
    WHERE a.user_id = p_user_id
      AND a.rating_10 IS NOT NULL
    GROUP BY b.user_id
    HAVING COUNT(*) >= 3
  )
  SELECT
    c.other_id AS user_id,
    p.display_name,
    c.shared AS shared_dishes,
    c.compat AS compatibility_pct
  FROM candidates c
  JOIN profiles p ON p.id = c.other_id
  -- Exclude users already followed
  WHERE NOT EXISTS (
    SELECT 1 FROM follows f
    WHERE f.follower_id = p_user_id AND f.followed_id = c.other_id
  )
  ORDER BY c.compat DESC, c.shared DESC
  LIMIT p_limit;
$$;
