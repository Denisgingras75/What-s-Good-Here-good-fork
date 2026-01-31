-- =============================================
-- Feature: Friend Opinions at Decision Time
-- Get all votes from followed users on dishes at a restaurant
-- =============================================

CREATE OR REPLACE FUNCTION get_friends_votes_for_restaurant(
  p_user_id UUID,
  p_restaurant_id UUID
)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  dish_id UUID,
  dish_name TEXT,
  rating_10 DECIMAL(3,1),
  would_order_again BOOLEAN,
  voted_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    p.id AS user_id,
    p.display_name,
    d.id AS dish_id,
    d.name AS dish_name,
    v.rating_10,
    v.would_order_again,
    v.created_at AS voted_at
  FROM follows f
  JOIN profiles p ON p.id = f.followed_id
  JOIN votes v ON v.user_id = f.followed_id
  JOIN dishes d ON d.id = v.dish_id AND d.restaurant_id = p_restaurant_id
  WHERE f.follower_id = p_user_id
  ORDER BY d.name, v.created_at DESC;
$$;
