-- Create function to get dishes for a specific restaurant with vote data
-- Sorted by percent_worth_it DESC for "Most loved here" ranking (Confidence view)

CREATE OR REPLACE FUNCTION get_restaurant_dishes(
  p_restaurant_id UUID
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
  avg_rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id AS dish_id,
    d.name AS dish_name,
    r.id AS restaurant_id,
    r.name AS restaurant_name,
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
    ROUND(AVG(v.rating_10)::NUMERIC, 1) AS avg_rating
  FROM dishes d
  INNER JOIN restaurants r ON d.restaurant_id = r.id
  LEFT JOIN votes v ON d.id = v.dish_id
  WHERE d.restaurant_id = p_restaurant_id
    AND r.is_open = true
  GROUP BY d.id, d.name, r.id, r.name, d.category, d.price, d.photo_url
  ORDER BY
    -- Ranked dishes first (5+ votes)
    CASE WHEN COUNT(v.id) >= 5 THEN 0 ELSE 1 END,
    -- Then by percent_worth_it DESC (Confidence: "Would order again")
    CASE
      WHEN COUNT(v.id) > 0
      THEN ROUND(100.0 * SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END) / COUNT(v.id))
      ELSE 0
    END DESC,
    -- Tiebreaker: most votes
    COUNT(v.id) DESC;
END;
$$ LANGUAGE plpgsql;
