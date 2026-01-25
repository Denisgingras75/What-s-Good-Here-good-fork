-- Update get_ranked_dishes to include tags and cuisine for search filtering
-- Must drop first because we're changing the return type
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
  restaurant_id UUID,
  restaurant_name TEXT,
  category TEXT,
  tags TEXT[],
  cuisine TEXT,
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
    d.category,
    d.tags,
    r.cuisine,
    d.price,
    d.photo_url,
    COUNT(v.id) AS total_votes,
    SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END) AS yes_votes,
    CASE
      WHEN COUNT(v.id) > 0
      THEN ROUND(100.0 * SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END) / COUNT(v.id))::INT
      ELSE 0
    END AS percent_worth_it,
    ROUND(AVG(v.rating_10)::NUMERIC, 1) AS avg_rating,
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
  GROUP BY d.id, d.name, r.id, r.name, d.category, d.tags, r.cuisine, d.price, d.photo_url, r.lat, r.lng
  ORDER BY
    CASE WHEN COUNT(v.id) >= 5 THEN 0 ELSE 1 END,
    AVG(v.rating_10) DESC NULLS LAST,
    COUNT(v.id) DESC;
END;
$$ LANGUAGE plpgsql;
