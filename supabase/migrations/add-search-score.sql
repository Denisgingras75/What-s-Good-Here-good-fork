-- Bayesian confidence-adjusted ranking score
-- Replaces raw avg_rating DESC sort with shrinkage toward global mean
-- Run in Supabase SQL Editor
--
-- Prior strength (m): start at 3 for early data, bump to 5 at 500 votes, 10 at 1000+
-- See NOTES.md "Ranking: Bayesian Prior Strength" for schedule

-- 1. Create the scoring function
CREATE OR REPLACE FUNCTION dish_search_score(
  p_avg_rating DECIMAL,
  p_total_votes BIGINT,
  p_distance_miles DECIMAL DEFAULT NULL,
  p_recent_votes_14d INT DEFAULT 0
)
RETURNS DECIMAL AS $$
DECLARE
  v_global_mean DECIMAL;
  v_prior_strength DECIMAL := 3;  -- m: see NOTES.md for when to increase
  v_base_score DECIMAL;
  v_distance_bonus DECIMAL := 0;
  v_trend_bonus DECIMAL := 0;
  v_votes DECIMAL;
BEGIN
  -- Global mean rating across all dishes with votes
  SELECT COALESCE(AVG(avg_rating), 7.0)
  INTO v_global_mean
  FROM dishes
  WHERE total_votes > 0 AND avg_rating IS NOT NULL;

  v_votes := COALESCE(p_total_votes, 0);

  -- Bayesian shrinkage: (v/(v+m)) * R + (m/(v+m)) * C
  IF v_votes = 0 OR p_avg_rating IS NULL THEN
    v_base_score := v_global_mean;
  ELSE
    v_base_score := (v_votes / (v_votes + v_prior_strength)) * p_avg_rating
                  + (v_prior_strength / (v_votes + v_prior_strength)) * v_global_mean;
  END IF;

  -- Distance bonus (nearby dishes get slight bump)
  IF p_distance_miles IS NOT NULL THEN
    IF p_distance_miles < 1 THEN
      v_distance_bonus := 0.3;
    ELSIF p_distance_miles < 3 THEN
      v_distance_bonus := 0.15;
    END IF;
  END IF;

  -- Trend bonus: log-based, capped at 0.25
  IF COALESCE(p_recent_votes_14d, 0) > 0 THEN
    v_trend_bonus := LEAST(0.05 * LN(1 + p_recent_votes_14d), 0.25);
  END IF;

  RETURN ROUND((v_base_score + v_distance_bonus + v_trend_bonus)::NUMERIC, 3);
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- 2. Update get_ranked_dishes to use the new score
-- Adds search_score to output and uses it for ORDER BY
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
  value_percentile DECIMAL,
  search_score DECIMAL
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
  ),
  recent_vote_counts AS (
    SELECT dish_id, COUNT(*)::INT AS recent_votes
    FROM votes
    WHERE created_at > NOW() - INTERVAL '14 days'
    GROUP BY dish_id
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
    d.value_percentile,
    dish_search_score(
      COALESCE(ROUND(AVG(v.rating_10), 1), 0),
      COALESCE(vs.total_child_votes, COUNT(v.id)),
      fr.distance,
      COALESCE(rvc.recent_votes, 0)
    ) AS search_score
  FROM dishes d
  INNER JOIN filtered_restaurants fr ON d.restaurant_id = fr.id
  LEFT JOIN votes v ON d.id = v.dish_id
  LEFT JOIN variant_stats vs ON vs.parent_dish_id = d.id
  LEFT JOIN best_variants bv ON bv.parent_dish_id = d.id
  LEFT JOIN recent_vote_counts rvc ON rvc.dish_id = d.id
  WHERE (filter_category IS NULL OR d.category = filter_category)
    AND d.parent_dish_id IS NULL
  GROUP BY d.id, d.name, fr.id, fr.name, fr.town, d.category, d.tags, fr.cuisine,
           d.price, d.photo_url, fr.distance,
           vs.total_child_votes, vs.total_child_yes, vs.child_count,
           bv.best_name, bv.best_rating,
           d.value_score, d.value_percentile,
           rvc.recent_votes
  ORDER BY search_score DESC NULLS LAST, total_votes DESC;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- 3. Verify
SELECT dish_search_score(9.0, 2, 1.5, 0) AS "9.0/2votes should be ~8.0";
SELECT dish_search_score(8.5, 30, 1.5, 5) AS "8.5/30votes should be ~8.5";
SELECT dish_search_score(NULL, 0, 1.5, 0) AS "no votes should be ~global mean";
