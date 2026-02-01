-- Fix get_category_experts to deduplicate users with both specialist + authority badges
-- Previously returned one row per badge, so users with both tiers appeared twice

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
  SELECT DISTINCT ON (ub.user_id)
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
    ub.user_id,
    CASE WHEN b.key LIKE 'authority_%' THEN 0 ELSE 1 END,
    COALESCE(fc.cnt, 0) DESC
  LIMIT p_limit;
$$;
