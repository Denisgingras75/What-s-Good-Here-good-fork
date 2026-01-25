-- Migration: Add dish variants support (parent-child relationship)
-- Allows dishes like "Wings" to have variants like "Buffalo Wings", "BBQ Wings", etc.
-- Users vote on specific variants, parent shows aggregated stats

-- ============================================
-- STEP 1: Add parent_dish_id column to dishes
-- ============================================
-- NULL means this is a parent dish (or standalone dish)
-- A UUID reference means this is a child variant
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS parent_dish_id UUID REFERENCES dishes(id) ON DELETE SET NULL;

-- Index for efficient lookups of children by parent
CREATE INDEX IF NOT EXISTS idx_dishes_parent ON dishes(parent_dish_id);

-- ============================================
-- STEP 2: Add display_order for variant sorting
-- ============================================
-- Lower numbers appear first in the variant list
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- ============================================
-- STEP 3: Update get_restaurant_dishes function
-- ============================================
-- Now returns:
-- - Only parent dishes and standalone dishes (not child variants)
-- - Aggregated stats from child variants for parent dishes
-- - has_variants, variant_count, best_variant_name, best_variant_rating
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
  avg_rating DECIMAL,
  has_variants BOOLEAN,
  variant_count INT,
  best_variant_id UUID,
  best_variant_name TEXT,
  best_variant_rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH variant_stats AS (
    -- Calculate stats for each parent dish from its children
    SELECT
      d.parent_dish_id,
      COUNT(DISTINCT d.id)::INT AS child_count,
      SUM(COALESCE(ds.vote_count, 0))::BIGINT AS total_child_votes,
      SUM(COALESCE(ds.yes_count, 0))::BIGINT AS total_child_yes,
      -- Weighted average rating across all child votes
      CASE
        WHEN SUM(COALESCE(ds.vote_count, 0)) > 0
        THEN ROUND((SUM(COALESCE(ds.rating_sum, 0)) / NULLIF(SUM(COALESCE(ds.vote_count, 0)), 0))::NUMERIC, 1)
        ELSE NULL
      END AS combined_avg_rating
    FROM dishes d
    LEFT JOIN (
      SELECT
        v.dish_id,
        COUNT(*)::BIGINT AS vote_count,
        SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END)::BIGINT AS yes_count,
        SUM(COALESCE(v.rating_10, 0))::DECIMAL AS rating_sum
      FROM votes v
      GROUP BY v.dish_id
    ) ds ON ds.dish_id = d.id
    WHERE d.parent_dish_id IS NOT NULL
    GROUP BY d.parent_dish_id
  ),
  best_variants AS (
    -- Find the best-rated variant for each parent
    SELECT DISTINCT ON (d.parent_dish_id)
      d.parent_dish_id,
      d.id AS best_id,
      d.name AS best_name,
      ROUND(AVG(v.rating_10)::NUMERIC, 1) AS best_rating
    FROM dishes d
    LEFT JOIN votes v ON v.dish_id = d.id
    WHERE d.parent_dish_id IS NOT NULL
    GROUP BY d.parent_dish_id, d.id, d.name
    HAVING COUNT(v.id) >= 1  -- At least one vote
    ORDER BY d.parent_dish_id, AVG(v.rating_10) DESC NULLS LAST, COUNT(v.id) DESC
  ),
  dish_vote_stats AS (
    -- Vote stats for individual dishes (parents/standalone only)
    SELECT
      d.id AS dish_id,
      COUNT(v.id)::BIGINT AS direct_votes,
      SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END)::BIGINT AS direct_yes,
      ROUND(AVG(v.rating_10)::NUMERIC, 1) AS direct_avg
    FROM dishes d
    LEFT JOIN votes v ON v.dish_id = d.id
    WHERE d.parent_dish_id IS NULL  -- Only parents/standalone
    GROUP BY d.id
  )
  SELECT
    d.id AS dish_id,
    d.name AS dish_name,
    r.id AS restaurant_id,
    r.name AS restaurant_name,
    d.category,
    d.price,
    d.photo_url,
    -- Use aggregated stats from children if this is a parent with variants, otherwise direct stats
    COALESCE(vs.total_child_votes, dvs.direct_votes, 0)::BIGINT AS total_votes,
    COALESCE(vs.total_child_yes, dvs.direct_yes, 0)::BIGINT AS yes_votes,
    CASE
      WHEN COALESCE(vs.total_child_votes, dvs.direct_votes, 0) > 0
      THEN ROUND(100.0 * COALESCE(vs.total_child_yes, dvs.direct_yes, 0) / COALESCE(vs.total_child_votes, dvs.direct_votes, 1))::INT
      ELSE 0
    END AS percent_worth_it,
    COALESCE(vs.combined_avg_rating, dvs.direct_avg) AS avg_rating,
    -- Variant info
    (vs.child_count IS NOT NULL AND vs.child_count > 0) AS has_variants,
    COALESCE(vs.child_count, 0)::INT AS variant_count,
    bv.best_id AS best_variant_id,
    bv.best_name AS best_variant_name,
    bv.best_rating AS best_variant_rating
  FROM dishes d
  INNER JOIN restaurants r ON d.restaurant_id = r.id
  LEFT JOIN variant_stats vs ON vs.parent_dish_id = d.id
  LEFT JOIN best_variants bv ON bv.parent_dish_id = d.id
  LEFT JOIN dish_vote_stats dvs ON dvs.dish_id = d.id
  WHERE d.restaurant_id = p_restaurant_id
    AND r.is_open = true
    AND d.parent_dish_id IS NULL  -- Only return parents and standalone dishes
  GROUP BY d.id, d.name, r.id, r.name, d.category, d.price, d.photo_url,
           vs.total_child_votes, vs.total_child_yes, vs.combined_avg_rating, vs.child_count,
           dvs.direct_votes, dvs.direct_yes, dvs.direct_avg,
           bv.best_id, bv.best_name, bv.best_rating
  ORDER BY
    -- Ranked dishes first (5+ votes)
    CASE WHEN COALESCE(vs.total_child_votes, dvs.direct_votes, 0) >= 5 THEN 0 ELSE 1 END,
    -- Then by percent_worth_it DESC (Confidence: "Would order again")
    CASE
      WHEN COALESCE(vs.total_child_votes, dvs.direct_votes, 0) > 0
      THEN ROUND(100.0 * COALESCE(vs.total_child_yes, dvs.direct_yes, 0) / COALESCE(vs.total_child_votes, dvs.direct_votes, 1))
      ELSE 0
    END DESC,
    -- Tiebreaker: most votes
    COALESCE(vs.total_child_votes, dvs.direct_votes, 0) DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 4: Create helper function to get variants
-- ============================================
CREATE OR REPLACE FUNCTION get_dish_variants(
  p_parent_dish_id UUID
)
RETURNS TABLE (
  dish_id UUID,
  dish_name TEXT,
  price DECIMAL,
  photo_url TEXT,
  display_order INT,
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
    d.price,
    d.photo_url,
    d.display_order,
    COUNT(v.id)::BIGINT AS total_votes,
    SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END)::BIGINT AS yes_votes,
    CASE
      WHEN COUNT(v.id) > 0
      THEN ROUND(100.0 * SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END) / COUNT(v.id))::INT
      ELSE 0
    END AS percent_worth_it,
    ROUND(AVG(v.rating_10)::NUMERIC, 1) AS avg_rating
  FROM dishes d
  LEFT JOIN votes v ON d.id = v.dish_id
  WHERE d.parent_dish_id = p_parent_dish_id
  GROUP BY d.id, d.name, d.price, d.photo_url, d.display_order
  ORDER BY d.display_order, d.name;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 5: Example migration for linking existing wing dishes
-- Uncomment and adapt for your specific data
-- ============================================
/*
-- First, ensure parent "Wings" dishes exist at restaurants that have wing variants
-- This example assumes you have dishes named exactly "Wings" as parents

-- Link Buffalo Wings to their parent
UPDATE dishes d
SET parent_dish_id = (
  SELECT p.id FROM dishes p
  WHERE p.restaurant_id = d.restaurant_id
  AND p.name = 'Wings'
  AND p.parent_dish_id IS NULL
  LIMIT 1
),
display_order = 1
WHERE d.name ILIKE '%buffalo wings%'
AND d.parent_dish_id IS NULL;

-- Link BBQ Wings to their parent
UPDATE dishes d
SET parent_dish_id = (
  SELECT p.id FROM dishes p
  WHERE p.restaurant_id = d.restaurant_id
  AND p.name = 'Wings'
  AND p.parent_dish_id IS NULL
  LIMIT 1
),
display_order = 2
WHERE d.name ILIKE '%bbq wings%'
AND d.parent_dish_id IS NULL;

-- Link Garlic Parm Wings to their parent
UPDATE dishes d
SET parent_dish_id = (
  SELECT p.id FROM dishes p
  WHERE p.restaurant_id = d.restaurant_id
  AND p.name = 'Wings'
  AND p.parent_dish_id IS NULL
  LIMIT 1
),
display_order = 3
WHERE (d.name ILIKE '%garlic%wings%' OR d.name ILIKE '%parm%wings%')
AND d.parent_dish_id IS NULL;
*/

-- ============================================
-- STEP 6: Update get_ranked_dishes to exclude child variants
-- ============================================
-- Child variants should not appear in browse/discovery views
-- Only parent dishes and standalone dishes appear there
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
  distance_miles DECIMAL,
  has_variants BOOLEAN,
  variant_count INT,
  best_variant_name TEXT,
  best_variant_rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH variant_stats AS (
    SELECT
      d.parent_dish_id,
      COUNT(DISTINCT d.id)::INT AS child_count,
      SUM(COALESCE(ds.vote_count, 0))::BIGINT AS total_child_votes,
      SUM(COALESCE(ds.yes_count, 0))::BIGINT AS total_child_yes
    FROM dishes d
    LEFT JOIN (
      SELECT
        v.dish_id,
        COUNT(*)::BIGINT AS vote_count,
        SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END)::BIGINT AS yes_count
      FROM votes v
      GROUP BY v.dish_id
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
    r.id AS restaurant_id,
    r.name AS restaurant_name,
    d.category,
    d.price,
    d.photo_url,
    COALESCE(vs.total_child_votes, COUNT(v.id))::BIGINT AS total_votes,
    COALESCE(vs.total_child_yes, SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END))::BIGINT AS yes_votes,
    CASE
      WHEN COALESCE(vs.total_child_votes, COUNT(v.id)) > 0
      THEN ROUND(100.0 * COALESCE(vs.total_child_yes, SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END)) / COALESCE(vs.total_child_votes, COUNT(v.id)))::INT
      ELSE 0
    END AS percent_worth_it,
    ROUND((
      3959 * ACOS(
        LEAST(1.0, GREATEST(-1.0,
          COS(RADIANS(user_lat)) * COS(RADIANS(r.lat)) *
          COS(RADIANS(r.lng) - RADIANS(user_lng)) +
          SIN(RADIANS(user_lat)) * SIN(RADIANS(r.lat))
        ))
      )
    )::NUMERIC, 2) AS distance_miles,
    (vs.child_count IS NOT NULL AND vs.child_count > 0) AS has_variants,
    COALESCE(vs.child_count, 0)::INT AS variant_count,
    bv.best_name AS best_variant_name,
    bv.best_rating AS best_variant_rating
  FROM dishes d
  INNER JOIN restaurants r ON d.restaurant_id = r.id
  LEFT JOIN votes v ON d.id = v.dish_id
  LEFT JOIN variant_stats vs ON vs.parent_dish_id = d.id
  LEFT JOIN best_variants bv ON bv.parent_dish_id = d.id
  WHERE (
    3959 * ACOS(
      LEAST(1.0, GREATEST(-1.0,
        COS(RADIANS(user_lat)) * COS(RADIANS(r.lat)) *
        COS(RADIANS(r.lng) - RADIANS(user_lng)) +
        SIN(RADIANS(user_lat)) * SIN(RADIANS(r.lat))
      ))
    )
  ) <= radius_miles
  AND (filter_category IS NULL OR d.category = filter_category)
  AND d.parent_dish_id IS NULL  -- Exclude child variants from browse
  GROUP BY d.id, d.name, r.id, r.name, d.category, d.price, d.photo_url, r.lat, r.lng,
           vs.total_child_votes, vs.total_child_yes, vs.child_count,
           bv.best_name, bv.best_rating
  ORDER BY percent_worth_it DESC, total_votes DESC;
END;
$$ LANGUAGE plpgsql STABLE;
