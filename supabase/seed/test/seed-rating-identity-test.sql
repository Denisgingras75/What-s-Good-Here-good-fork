-- Seed script: 100 test users vote on 50 real dishes each
-- Cleanup will remove votes and recalculate aggregates

-- ============================================
-- Step 1: Create 100 test users
-- ============================================
DO $$
DECLARE
  i INT;
  new_user_id UUID;
BEGIN
  FOR i IN 1..100 LOOP
    new_user_id := ('00000000-0000-0000-0002-' || LPAD(i::TEXT, 12, '0'))::UUID;

    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'testuser' || i || '@ratingtest.local',
      '', NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}', 'authenticated', 'authenticated'
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO profiles (id, display_name, created_at)
    VALUES (new_user_id, '[TEST] User' || i, NOW())
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- ============================================
-- Step 2: Each test user votes on 50 random REAL dishes
-- ============================================
DO $$
DECLARE
  test_user RECORD;
  real_dish RECORD;
  random_rating NUMERIC(3,1);
  base_bias NUMERIC;
BEGIN
  FOR test_user IN
    SELECT id, ROW_NUMBER() OVER () as user_num
    FROM auth.users
    WHERE email LIKE 'testuser%@ratingtest.local'
    ORDER BY id
  LOOP
    -- Give each user a personality bias
    base_bias := CASE
      WHEN test_user.user_num <= 20 THEN -1.5 + (random() * 1)   -- harsh
      WHEN test_user.user_num <= 40 THEN -0.5 + (random() * 0.5) -- slightly harsh
      WHEN test_user.user_num <= 60 THEN 0                        -- fair
      WHEN test_user.user_num <= 80 THEN 0.5 + (random() * 0.5)  -- slightly generous
      ELSE 1 + (random() * 1)                                     -- generous
    END;

    FOR real_dish IN
      SELECT id, category FROM dishes
      ORDER BY random()
      LIMIT 50
    LOOP
      -- Random rating between 5.5 and 9.5, with user bias influence
      random_rating := ROUND((5.5 + random() * 4 + base_bias * 0.3)::NUMERIC, 1);
      random_rating := GREATEST(5.5, LEAST(9.5, random_rating));

      INSERT INTO votes (dish_id, user_id, would_order_again, rating_10, category_snapshot)
      VALUES (real_dish.id, test_user.id, random_rating >= 7.0, random_rating, real_dish.category)
      ON CONFLICT (dish_id, user_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ============================================
-- Step 3: Set vote positions for test votes
-- ============================================
WITH numbered_votes AS (
  SELECT v.id, v.dish_id,
    ROW_NUMBER() OVER (PARTITION BY v.dish_id ORDER BY v.created_at, v.id) as pos
  FROM votes v
  WHERE v.vote_position IS NULL
)
UPDATE votes SET vote_position = numbered_votes.pos
FROM numbered_votes WHERE votes.id = numbered_votes.id;

-- ============================================
-- Step 4: Recalculate consensus for ALL dishes with 5+ votes
-- ============================================
UPDATE dishes SET
  consensus_rating = sub.avg_rating,
  consensus_ready = TRUE,
  consensus_votes = sub.vote_count,
  consensus_calculated_at = NOW()
FROM (
  SELECT dish_id, COUNT(*) as vote_count, ROUND(AVG(rating_10), 1) as avg_rating
  FROM votes WHERE rating_10 IS NOT NULL
  GROUP BY dish_id HAVING COUNT(*) >= 5
) sub
WHERE dishes.id = sub.dish_id;

-- ============================================
-- Step 5: Mark test votes as scored, calculate user biases
-- ============================================
UPDATE votes SET scored_at = NOW()
WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE 'testuser%@ratingtest.local')
AND scored_at IS NULL;

INSERT INTO user_rating_stats (user_id, rating_bias, bias_label, votes_with_consensus, votes_pending, dishes_helped_establish)
SELECT
  v.user_id,
  ROUND(AVG(v.rating_10 - d.consensus_rating), 1),
  get_bias_label(ROUND(AVG(v.rating_10 - d.consensus_rating), 1)),
  COUNT(*), 0,
  COUNT(*) FILTER (WHERE v.vote_position <= 3)
FROM votes v
JOIN dishes d ON v.dish_id = d.id
WHERE v.user_id IN (SELECT id FROM auth.users WHERE email LIKE 'testuser%@ratingtest.local')
AND d.consensus_ready = TRUE AND v.rating_10 IS NOT NULL
GROUP BY v.user_id
ON CONFLICT (user_id) DO UPDATE SET
  rating_bias = EXCLUDED.rating_bias,
  bias_label = EXCLUDED.bias_label,
  votes_with_consensus = EXCLUDED.votes_with_consensus,
  dishes_helped_establish = EXCLUDED.dishes_helped_establish,
  updated_at = NOW();

-- ============================================
-- Results
-- ============================================
SELECT 'Test users' as metric, COUNT(*)::TEXT as value FROM auth.users WHERE email LIKE 'testuser%@ratingtest.local'
UNION ALL SELECT 'Test votes', COUNT(*)::TEXT FROM votes WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE 'testuser%@ratingtest.local')
UNION ALL SELECT 'Dishes with consensus', COUNT(*)::TEXT FROM dishes WHERE consensus_ready = TRUE;
