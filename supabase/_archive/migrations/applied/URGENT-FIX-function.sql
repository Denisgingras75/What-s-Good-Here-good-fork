-- URGENT FIX: Restore get_ranked_dishes function with category field
-- Run this in Supabase SQL Editor immediately

-- Drop the broken function
DROP FUNCTION IF EXISTS get_ranked_dishes(DECIMAL, DECIMAL, INT, TEXT);
DROP FUNCTION IF EXISTS get_ranked_dishes;

-- Recreate the function with category included
CREATE OR REPLACE FUNCTION get_ranked_dishes(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_miles INT DEFAULT 5,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  dish_id UUID,
  dish_name TEXT,
  restaurant_name TEXT,
  category TEXT,
  price DECIMAL,
  photo_url TEXT,
  total_votes BIGINT,
  yes_votes BIGINT,
  percent_worth_it INT,
  distance_miles DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.name,
    r.name,
    d.category,
    d.price,
    d.photo_url,
    COUNT(v.id)::BIGINT,
    SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END)::BIGINT,
    CASE
      WHEN COUNT(v.id) > 0
      THEN ROUND(100.0 * SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END) / COUNT(v.id))::INT
      ELSE 0
    END,
    (
      3959 * ACOS(
        LEAST(1.0,
          COS(RADIANS(user_lat)) * COS(RADIANS(r.lat)) *
          COS(RADIANS(r.lng) - RADIANS(user_lng)) +
          SIN(RADIANS(user_lat)) * SIN(RADIANS(r.lat))
        )
      )
    )::DECIMAL
  FROM dishes d
  INNER JOIN restaurants r ON d.restaurant_id = r.id
  LEFT JOIN votes v ON d.id = v.dish_id
  WHERE (
    3959 * ACOS(
      LEAST(1.0,
        COS(RADIANS(user_lat)) * COS(RADIANS(r.lat)) *
        COS(RADIANS(r.lng) - RADIANS(user_lng)) +
        SIN(RADIANS(user_lat)) * SIN(RADIANS(r.lat))
      )
    )
  ) <= radius_miles
  AND (filter_category IS NULL OR d.category = filter_category)
  GROUP BY d.id, d.name, r.name, d.category, d.price, d.photo_url, r.lat, r.lng
  ORDER BY
    CASE
      WHEN COUNT(v.id) > 0
      THEN ROUND(100.0 * SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END) / COUNT(v.id))::INT
      ELSE 0
    END DESC,
    COUNT(v.id) DESC;
END;
$$;
