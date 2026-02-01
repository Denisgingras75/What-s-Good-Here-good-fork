-- =============================================
-- Feature: Expert Social Proof on Restaurant Pages
-- Returns per-dish counts of specialist/authority voters
-- for all dishes at a restaurant in a single query
-- =============================================

CREATE OR REPLACE FUNCTION get_expert_votes_for_restaurant(
  p_restaurant_id UUID
)
RETURNS TABLE (
  dish_id UUID,
  specialist_count INT,
  authority_count INT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    v.dish_id,
    COUNT(*) FILTER (
      WHERE ub.badge_key LIKE 'specialist_%'
    )::INT AS specialist_count,
    COUNT(*) FILTER (
      WHERE ub.badge_key LIKE 'authority_%'
    )::INT AS authority_count
  FROM votes v
  JOIN dishes d ON d.id = v.dish_id AND d.restaurant_id = p_restaurant_id
  JOIN user_badges ub ON ub.user_id = v.user_id
    AND ub.badge_key IN (
      'specialist_' || REPLACE(d.category, ' ', '_'),
      'authority_' || REPLACE(d.category, ' ', '_')
    )
  GROUP BY v.dish_id;
$$;
