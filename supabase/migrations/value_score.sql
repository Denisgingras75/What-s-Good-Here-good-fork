-- Value Score Migration
-- Run this in Supabase SQL Editor to add the value score feature

-- 1. Add columns to dishes
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS value_score DECIMAL(6, 2);
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS value_percentile DECIMAL(5, 2);
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS category_median_price DECIMAL(6, 2);

-- 2. Create category median prices view
CREATE OR REPLACE VIEW category_median_prices AS
SELECT category,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price) AS median_price,
  COUNT(*) AS dish_count
FROM dishes
WHERE price IS NOT NULL AND price > 0 AND total_votes >= 8
GROUP BY category;

-- 3. Trigger function: compute value_score on dish insert/update
CREATE OR REPLACE FUNCTION compute_value_score()
RETURNS TRIGGER AS $$
DECLARE
  v_median DECIMAL;
BEGIN
  IF NEW.price IS NULL OR NEW.price <= 0 OR NEW.total_votes < 8 OR NEW.avg_rating IS NULL THEN
    NEW.value_score := NULL;
    NEW.category_median_price := NULL;
    RETURN NEW;
  END IF;

  SELECT median_price INTO v_median
  FROM category_median_prices
  WHERE category = NEW.category;

  IF v_median IS NULL THEN
    NEW.value_score := NULL;
    NEW.category_median_price := NULL;
    RETURN NEW;
  END IF;

  NEW.category_median_price := v_median;
  NEW.value_score := ROUND(
    ((0.50 * NEW.avg_rating + 0.50 * (NEW.avg_rating / LOG(GREATEST(NEW.price / v_median, 0.1) + 2))) * 10)::NUMERIC,
    2
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_compute_value_score ON dishes;
CREATE TRIGGER trigger_compute_value_score
  BEFORE INSERT OR UPDATE OF avg_rating, total_votes, price, category ON dishes
  FOR EACH ROW EXECUTE FUNCTION compute_value_score();

-- 4. Batch function: recalculate percentiles
CREATE OR REPLACE FUNCTION recalculate_value_percentiles()
RETURNS VOID AS $$
BEGIN
  UPDATE dishes d SET
    category_median_price = cmp.median_price,
    value_score = ROUND(
      ((0.50 * d.avg_rating + 0.50 * (d.avg_rating / LOG(GREATEST(d.price / cmp.median_price, 0.1) + 2))) * 10)::NUMERIC,
      2
    )
  FROM category_median_prices cmp
  WHERE cmp.category = d.category
    AND d.price IS NOT NULL AND d.price > 0
    AND d.total_votes >= 8
    AND d.avg_rating IS NOT NULL;

  UPDATE dishes SET value_score = NULL, value_percentile = NULL, category_median_price = NULL
  WHERE price IS NULL OR price <= 0 OR total_votes < 8 OR avg_rating IS NULL;

  UPDATE dishes d SET value_percentile = ranked.pct
  FROM (
    SELECT id,
      ROUND((PERCENT_RANK() OVER (PARTITION BY category ORDER BY value_score ASC) * 100)::NUMERIC, 2) AS pct
    FROM dishes
    WHERE value_score IS NOT NULL
      AND category IN (
        SELECT category FROM dishes WHERE value_score IS NOT NULL GROUP BY category HAVING COUNT(*) >= 8
      )
  ) ranked
  WHERE d.id = ranked.id;

  UPDATE dishes SET value_percentile = NULL
  WHERE value_score IS NOT NULL
    AND category NOT IN (
      SELECT category FROM dishes WHERE value_score IS NOT NULL GROUP BY category HAVING COUNT(*) >= 8
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update get_ranked_dishes RPC to return value fields
DROP FUNCTION IF EXISTS get_ranked_dishes(DECIMAL, DECIMAL, INT, TEXT, TEXT);
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
  tags TEXT[],
  cuisine TEXT,
  price DECIMAL,
  photo_url TEXT,
  total_votes BIGINT,
  yes_votes BIGINT,
  percent_worth_it INT,
  avg_rating DECIMAL,
  distance_miles DECIMAL,
  has_variants BOOLEAN,
  variant_count INT,
  best_variant_name TEXT,
  best_variant_rating DECIMAL,
  value_score DECIMAL,
  value_percentile DECIMAL
) AS $$
DECLARE
  lat_delta DECIMAL := radius_miles / 69.0;
  lng_delta DECIMAL := radius_miles / (69.0 * COS(RADIANS(user_lat)));
BEGIN
  RETURN QUERY
  WITH nearby_restaurants AS (
    SELECT r.id, r.name, r.town, r.lat, r.lng, r.cuisine
    FROM restaurants r
    WHERE r.is_open = true
      AND r.lat BETWEEN (user_lat - lat_delta) AND (user_lat + lat_delta)
      AND r.lng BETWEEN (user_lng - lng_delta) AND (user_lng + lng_delta)
      AND (filter_town IS NULL OR r.town = filter_town)
  ),
  restaurants_with_distance AS (
    SELECT
      nr.id, nr.name, nr.town, nr.lat, nr.lng, nr.cuisine,
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
    SELECT * FROM restaurants_with_distance WHERE distance <= radius_miles
  ),
  variant_stats AS (
    SELECT
      d.parent_dish_id,
      COUNT(DISTINCT d.id)::INT AS child_count,
      SUM(COALESCE(ds.vote_count, 0))::BIGINT AS total_child_votes,
      SUM(COALESCE(ds.yes_count, 0))::BIGINT AS total_child_yes
    FROM dishes d
    LEFT JOIN (
      SELECT v.dish_id, COUNT(*)::BIGINT AS vote_count,
        SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END)::BIGINT AS yes_count
      FROM votes v GROUP BY v.dish_id
    ) ds ON ds.dish_id = d.id
    WHERE d.parent_dish_id IS NOT NULL
    GROUP BY d.parent_dish_id
  ),
  best_variants AS (
    SELECT DISTINCT ON (d.parent_dish_id)
      d.parent_dish_id,
      d.name AS best_name,
      ROUND(AVG(v.rating_10)::NUMERIC, 1) AS best_rating
    FROM dishes d
    LEFT JOIN votes v ON v.dish_id = d.id
    WHERE d.parent_dish_id IS NOT NULL
    GROUP BY d.parent_dish_id, d.id, d.name
    HAVING COUNT(v.id) >= 1
    ORDER BY d.parent_dish_id, AVG(v.rating_10) DESC NULLS LAST, COUNT(v.id) DESC
  )
  SELECT
    d.id AS dish_id,
    d.name AS dish_name,
    fr.id AS restaurant_id,
    fr.name AS restaurant_name,
    fr.town AS restaurant_town,
    d.category,
    d.tags,
    fr.cuisine,
    d.price,
    d.photo_url,
    COALESCE(vs.total_child_votes, COUNT(v.id))::BIGINT AS total_votes,
    COALESCE(vs.total_child_yes, SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END))::BIGINT AS yes_votes,
    CASE
      WHEN COALESCE(vs.total_child_votes, COUNT(v.id)) > 0
      THEN ROUND(100.0 * COALESCE(vs.total_child_yes, SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END)) / COALESCE(vs.total_child_votes, COUNT(v.id)))::INT
      ELSE 0
    END AS percent_worth_it,
    COALESCE(ROUND(AVG(v.rating_10), 1), 0) AS avg_rating,
    fr.distance AS distance_miles,
    (vs.child_count IS NOT NULL AND vs.child_count > 0) AS has_variants,
    COALESCE(vs.child_count, 0)::INT AS variant_count,
    bv.best_name AS best_variant_name,
    bv.best_rating AS best_variant_rating,
    d.value_score,
    d.value_percentile
  FROM dishes d
  INNER JOIN filtered_restaurants fr ON d.restaurant_id = fr.id
  LEFT JOIN votes v ON d.id = v.dish_id
  LEFT JOIN variant_stats vs ON vs.parent_dish_id = d.id
  LEFT JOIN best_variants bv ON bv.parent_dish_id = d.id
  WHERE (filter_category IS NULL OR d.category = filter_category)
    AND d.parent_dish_id IS NULL
  GROUP BY d.id, d.name, fr.id, fr.name, fr.town, d.category, d.tags, fr.cuisine,
           d.price, d.photo_url, fr.distance,
           vs.total_child_votes, vs.total_child_yes, vs.child_count,
           bv.best_name, bv.best_rating,
           d.value_score, d.value_percentile
  ORDER BY avg_rating DESC NULLS LAST, total_votes DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. Backfill: trigger value_score computation on existing qualifying dishes
UPDATE dishes SET avg_rating = avg_rating WHERE price IS NOT NULL AND total_votes >= 8;

-- 7. Calculate percentiles
SELECT recalculate_value_percentiles();

-- 8. (Optional) Schedule pg_cron job for recurring recalculation every 2 hours
-- SELECT cron.schedule('recalculate-value-percentiles', '0 */2 * * *', $$SELECT recalculate_value_percentiles()$$);
