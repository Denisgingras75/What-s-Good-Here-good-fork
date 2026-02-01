-- Fix get_friends_votes_for_dish to return DECIMAL rating instead of INTEGER

DROP FUNCTION IF EXISTS get_friends_votes_for_dish(uuid, uuid);

CREATE OR REPLACE FUNCTION get_friends_votes_for_dish(
  p_user_id UUID,
  p_dish_id UUID
)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
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
    v.rating_10,
    v.would_order_again,
    v.created_at AS voted_at
  FROM follows f
  JOIN profiles p ON p.id = f.followed_id
  JOIN votes v ON v.user_id = f.followed_id AND v.dish_id = p_dish_id
  WHERE f.follower_id = p_user_id
  ORDER BY v.created_at DESC;
$$;
