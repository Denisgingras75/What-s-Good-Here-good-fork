-- Seed Varied Ratings - Makes the app feel realistic with a range of dish quality
-- Creates ratings from ~4.0 to 9.0+ across different dishes
-- Run this in Supabase SQL Editor

-- IMPORTANT: The votes table has a foreign key to auth.users
-- We need to temporarily disable it to insert test data with fake user IDs

-- Step 1: Drop the foreign key constraint temporarily
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_user_id_fkey;

-- Step 2: Clear existing test votes (votes with fake user IDs not in auth.users)
DELETE FROM votes WHERE user_id NOT IN (SELECT id FROM auth.users);

DO $$
DECLARE
  dish_record RECORD;
  vote_count INT;
  rating_tier TEXT;
  base_rating DECIMAL;
  actual_rating DECIMAL;
  fake_user_id UUID;
  i INT;
  dish_count INT := 0;
BEGIN
  -- Loop through all dishes
  FOR dish_record IN
    SELECT d.id, d.name, d.category, random() as rand
    FROM dishes d
    ORDER BY random()
  LOOP
    dish_count := dish_count + 1;

    -- Assign vote counts (5-20 votes per dish to make them "ranked")
    vote_count := floor(random() * 15 + 5)::INT; -- 5-20 votes

    -- Assign rating tier based on random distribution
    -- This creates a realistic bell curve of quality:
    -- - 10% are excellent (8.0-9.5) - the standouts
    -- - 25% are very good (7.0-8.0) - solid recommendations
    -- - 35% are good (6.0-7.0) - decent but not special
    -- - 20% are mediocre (5.0-6.0) - meh
    -- - 10% are poor (4.0-5.0) - not worth it

    IF dish_record.rand < 0.10 THEN
      rating_tier := 'excellent';
      base_rating := 8.0 + random() * 1.5; -- 8.0-9.5
    ELSIF dish_record.rand < 0.35 THEN
      rating_tier := 'very_good';
      base_rating := 7.0 + random() * 1.0; -- 7.0-8.0
    ELSIF dish_record.rand < 0.70 THEN
      rating_tier := 'good';
      base_rating := 6.0 + random() * 1.0; -- 6.0-7.0
    ELSIF dish_record.rand < 0.90 THEN
      rating_tier := 'mediocre';
      base_rating := 5.0 + random() * 1.0; -- 5.0-6.0
    ELSE
      rating_tier := 'poor';
      base_rating := 4.0 + random() * 1.0; -- 4.0-5.0
    END IF;

    -- Add votes with variance around the base rating
    FOR i IN 1..vote_count LOOP
      -- Generate a fake user UUID for each vote
      fake_user_id := uuid_generate_v4();

      -- Add some variance to individual ratings (+/- 1.0)
      actual_rating := GREATEST(1, LEAST(10, base_rating + (random() * 2.0 - 1.0)));
      actual_rating := ROUND(actual_rating * 2) / 2.0; -- Round to nearest 0.5

      -- would_order_again correlates with rating
      INSERT INTO votes (dish_id, user_id, rating_10, would_order_again, created_at)
      VALUES (
        dish_record.id,
        fake_user_id,
        actual_rating,
        actual_rating >= 6.0, -- Would order again if rating >= 6
        NOW() - (random() * INTERVAL '90 days') -- Random time in last 90 days
      );
    END LOOP;

  END LOOP;

  RAISE NOTICE 'Added varied ratings to % dishes', dish_count;
END $$;

-- Show the distribution of ratings
SELECT
  CASE
    WHEN avg_rating >= 8.0 THEN '⭐ Excellent (8.0+)'
    WHEN avg_rating >= 7.0 THEN '👍 Very Good (7.0-7.9)'
    WHEN avg_rating >= 6.0 THEN '👌 Good (6.0-6.9)'
    WHEN avg_rating >= 5.0 THEN '😐 Mediocre (5.0-5.9)'
    ELSE '👎 Poor (<5.0)'
  END as tier,
  COUNT(*) as dish_count,
  ROUND(AVG(avg_rating)::numeric, 1) as avg_of_tier
FROM (
  SELECT
    d.id,
    d.name,
    ROUND(AVG(v.rating_10)::numeric, 1) as avg_rating
  FROM dishes d
  LEFT JOIN votes v ON d.id = v.dish_id
  GROUP BY d.id, d.name
  HAVING COUNT(v.id) >= 5
) rated_dishes
GROUP BY tier
ORDER BY avg_of_tier DESC;

-- Show top 10 dishes by rating
SELECT
  d.name as dish_name,
  r.name as restaurant_name,
  ROUND(AVG(v.rating_10)::numeric, 1) as avg_rating,
  COUNT(v.id) as vote_count
FROM dishes d
JOIN restaurants r ON d.restaurant_id = r.id
LEFT JOIN votes v ON d.id = v.dish_id
GROUP BY d.id, d.name, r.name
HAVING COUNT(v.id) >= 5
ORDER BY avg_rating DESC
LIMIT 10;

-- Show bottom 10 dishes by rating
SELECT
  d.name as dish_name,
  r.name as restaurant_name,
  ROUND(AVG(v.rating_10)::numeric, 1) as avg_rating,
  COUNT(v.id) as vote_count
FROM dishes d
JOIN restaurants r ON d.restaurant_id = r.id
LEFT JOIN votes v ON d.id = v.dish_id
GROUP BY d.id, d.name, r.name
HAVING COUNT(v.id) >= 5
ORDER BY avg_rating ASC
LIMIT 10;

-- NOTE: We intentionally leave the FK constraint dropped for test data
-- In production, you would want to re-add it:
-- ALTER TABLE votes ADD CONSTRAINT votes_user_id_fkey
--   FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
