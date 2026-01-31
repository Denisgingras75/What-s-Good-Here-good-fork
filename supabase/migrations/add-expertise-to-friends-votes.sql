-- =============================================
-- Feature: Visible Expertise
-- Enhance friend vote RPCs with category_expertise column
-- Shows specialist/authority status for friends' votes
-- =============================================

-- Enhanced get_friends_votes_for_dish with category expertise
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
  voted_at TIMESTAMPTZ,
  category_expertise TEXT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    p.id AS user_id,
    p.display_name,
    v.rating_10,
    v.would_order_again,
    v.created_at AS voted_at,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM user_badges ub
        WHERE ub.user_id = p.id
        AND ub.badge_key = 'authority_' || REPLACE(d.category, ' ', '_')
      ) THEN 'authority'
      WHEN EXISTS (
        SELECT 1 FROM user_badges ub
        WHERE ub.user_id = p.id
        AND ub.badge_key = 'specialist_' || REPLACE(d.category, ' ', '_')
      ) THEN 'specialist'
      ELSE NULL
    END AS category_expertise
  FROM follows f
  JOIN profiles p ON p.id = f.followed_id
  JOIN votes v ON v.user_id = f.followed_id AND v.dish_id = p_dish_id
  JOIN dishes d ON d.id = p_dish_id
  WHERE f.follower_id = p_user_id
  ORDER BY v.created_at DESC;
$$;

-- Enhanced get_friends_votes_for_restaurant with category expertise
DROP FUNCTION IF EXISTS get_friends_votes_for_restaurant(uuid, uuid);

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
  voted_at TIMESTAMPTZ,
  category_expertise TEXT
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
    v.created_at AS voted_at,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM user_badges ub
        WHERE ub.user_id = p.id
        AND ub.badge_key = 'authority_' || REPLACE(d.category, ' ', '_')
      ) THEN 'authority'
      WHEN EXISTS (
        SELECT 1 FROM user_badges ub
        WHERE ub.user_id = p.id
        AND ub.badge_key = 'specialist_' || REPLACE(d.category, ' ', '_')
      ) THEN 'specialist'
      ELSE NULL
    END AS category_expertise
  FROM follows f
  JOIN profiles p ON p.id = f.followed_id
  JOIN votes v ON v.user_id = f.followed_id
  JOIN dishes d ON d.id = v.dish_id AND d.restaurant_id = p_restaurant_id
  WHERE f.follower_id = p_user_id
  ORDER BY d.name, v.created_at DESC;
$$;
