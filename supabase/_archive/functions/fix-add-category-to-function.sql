-- Fix: Update get_ranked_dishes function to include category field
-- This ensures dish cards show the correct category-based image

DROP FUNCTION IF EXISTS get_ranked_dishes(DECIMAL, DECIMAL, INT, TEXT);

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
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id AS dish_id,
    d.name AS dish_name,
    r.name AS restaurant_name,
    d.category AS category,
    d.price,
    d.photo_url,
    COUNT(v.id) AS total_votes,
    SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END) AS yes_votes,
    CASE
      WHEN COUNT(v.id) > 0
      THEN ROUND(100.0 * SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END) / COUNT(v.id))::INT
      ELSE 0
    END AS percent_worth_it,
    (
      3959 * ACOS(
        COS(RADIANS(user_lat)) * COS(RADIANS(r.lat)) *
        COS(RADIANS(r.lng) - RADIANS(user_lng)) +
        SIN(RADIANS(user_lat)) * SIN(RADIANS(r.lat))
      )
    ) AS distance_miles
  FROM dishes d
  INNER JOIN restaurants r ON d.restaurant_id = r.id
  LEFT JOIN votes v ON d.id = v.dish_id
  WHERE (
    3959 * ACOS(
      COS(RADIANS(user_lat)) * COS(RADIANS(r.lat)) *
      COS(RADIANS(r.lng) - RADIANS(user_lng)) +
      SIN(RADIANS(user_lat)) * SIN(RADIANS(r.lat))
    )
  ) <= radius_miles
  AND (filter_category IS NULL OR d.category = filter_category)
  GROUP BY d.id, d.name, r.name, d.category, d.price, d.photo_url, r.lat, r.lng
  ORDER BY percent_worth_it DESC, total_votes DESC;
END;
$$ LANGUAGE plpgsql;
