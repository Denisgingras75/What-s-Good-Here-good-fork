-- Spatial index for faster distance queries
-- Run in Supabase SQL Editor

-- Create index on lat/lng for bounding box filtering
CREATE INDEX IF NOT EXISTS idx_restaurants_lat_lng ON restaurants(lat, lng);

-- Create composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_restaurants_open_lat_lng ON restaurants(is_open, lat, lng) WHERE is_open = true;

-- Optimized get_ranked_dishes with bounding box pre-filter
-- The bounding box filter uses the index, then Haversine refines
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
  price DECIMAL,
  photo_url TEXT,
  total_votes BIGINT,
  yes_votes BIGINT,
  percent_worth_it INT,
  avg_rating DECIMAL,
  distance_miles DECIMAL
) AS $$
DECLARE
  -- Convert radius to approximate lat/lng degrees for bounding box
  -- 1 degree lat ≈ 69 miles, 1 degree lng varies by latitude
  lat_delta DECIMAL := radius_miles / 69.0;
  lng_delta DECIMAL := radius_miles / (69.0 * COS(RADIANS(user_lat)));
BEGIN
  RETURN QUERY
  WITH nearby_restaurants AS (
    -- First: fast bounding box filter using index
    SELECT r.id, r.name, r.lat, r.lng
    FROM restaurants r
    WHERE r.is_open = true
      AND r.lat BETWEEN (user_lat - lat_delta) AND (user_lat + lat_delta)
      AND r.lng BETWEEN (user_lng - lng_delta) AND (user_lng + lng_delta)
  ),
  restaurants_with_distance AS (
    -- Second: calculate actual distance for bounding box results
    SELECT
      nr.id,
      nr.name,
      nr.lat,
      nr.lng,
      ROUND((
        3959 * ACOS(
          LEAST(1.0, GREATEST(-1.0,
            COS(RADIANS(user_lat)) * COS(RADIANS(nr.lat)) *
            COS(RADIANS(nr.lng) - RADIANS(user_lng)) +
            SIN(RADIANS(user_lat)) * SIN(RADIANS(nr.lat))
          ))
        )
      )::NUMERIC, 2) AS distance
    FROM nearby_restaurants nr
  ),
  filtered_restaurants AS (
    -- Third: filter by actual radius
    SELECT * FROM restaurants_with_distance
    WHERE distance <= radius_miles
  )
  SELECT
    d.id AS dish_id,
    d.name AS dish_name,
    fr.id AS restaurant_id,
    fr.name AS restaurant_name,
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
    ROUND(AVG(v.rating_10)::NUMERIC, 1) AS avg_rating,
    fr.distance AS distance_miles
  FROM dishes d
  INNER JOIN filtered_restaurants fr ON d.restaurant_id = fr.id
  LEFT JOIN votes v ON d.id = v.dish_id
  WHERE (filter_category IS NULL OR d.category = filter_category)
  GROUP BY d.id, d.name, fr.id, fr.name, d.category, d.price, d.photo_url, fr.distance
  ORDER BY
    CASE WHEN COUNT(v.id) >= 5 THEN 0 ELSE 1 END,
    AVG(v.rating_10) DESC NULLS LAST,
    COUNT(v.id) DESC;
END;
$$ LANGUAGE plpgsql;
