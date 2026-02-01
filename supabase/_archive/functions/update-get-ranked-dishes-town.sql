-- Update get_ranked_dishes to support town filtering
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_ranked_dishes(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_miles INT DEFAULT 50,
  filter_category TEXT DEFAULT NULL,
  filter_town TEXT DEFAULT NULL
)
RETURNS TABLE (
  dish_id UUID,
  dish_name TEXT,
  restaurant_id UUID,
  restaurant_name TEXT,
  restaurant_town TEXT,
  category TEXT,
  price DECIMAL,
  photo_url TEXT,
  total_votes BIGINT,
  yes_votes BIGINT,
  percent_worth_it INT,
  avg_rating DECIMAL,
  distance_miles DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id AS dish_id,
    d.name AS dish_name,
    r.id AS restaurant_id,
    r.name AS restaurant_name,
    r.town AS restaurant_town,
    d.category,
    d.price,
    d.photo_url,
    COUNT(v.id) AS total_votes,
    SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END) AS yes_votes,
    CASE
      WHEN COUNT(v.id) > 0
      THEN ROUND(100.0 * SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END) / COUNT(v.id))::INT
      ELSE 0
    END AS percent_worth_it,
    COALESCE(ROUND(AVG(v.rating_10), 1), 0) AS avg_rating,
    ROUND((
      3959 * ACOS(
        LEAST(1.0, GREATEST(-1.0,
          COS(RADIANS(user_lat)) * COS(RADIANS(r.lat)) *
          COS(RADIANS(r.lng) - RADIANS(user_lng)) +
          SIN(RADIANS(user_lat)) * SIN(RADIANS(r.lat))
        ))
      )
    )::NUMERIC, 2) AS distance_miles
  FROM dishes d
  INNER JOIN restaurants r ON d.restaurant_id = r.id
  LEFT JOIN votes v ON d.id = v.dish_id
  WHERE r.is_open = true
  AND (
    3959 * ACOS(
      LEAST(1.0, GREATEST(-1.0,
        COS(RADIANS(user_lat)) * COS(RADIANS(r.lat)) *
        COS(RADIANS(r.lng) - RADIANS(user_lng)) +
        SIN(RADIANS(user_lat)) * SIN(RADIANS(r.lat))
      ))
    )
  ) <= radius_miles
  AND (filter_category IS NULL OR d.category = filter_category)
  AND (filter_town IS NULL OR r.town = filter_town)
  GROUP BY d.id, d.name, r.id, r.name, r.town, d.category, d.price, d.photo_url, r.lat, r.lng
  ORDER BY avg_rating DESC, total_votes DESC;
END;
$$ LANGUAGE plpgsql STABLE;
