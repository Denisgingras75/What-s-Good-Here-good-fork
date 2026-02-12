-- Cleanup: Remove test data and recalculate all aggregates

-- 1. Delete test votes
DELETE FROM votes
WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE 'testuser%@ratingtest.local');

-- 2. Delete test user stats
DELETE FROM bias_events WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE 'testuser%@ratingtest.local');
DELETE FROM user_rating_stats WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE 'testuser%@ratingtest.local');

-- 3. Delete test profiles and users
DELETE FROM profiles WHERE id IN (SELECT id FROM auth.users WHERE email LIKE 'testuser%@ratingtest.local');
DELETE FROM auth.users WHERE email LIKE 'testuser%@ratingtest.local';

-- 4. Recalculate avg_rating and total_votes for all dishes
UPDATE dishes SET
  avg_rating = sub.avg_r,
  total_votes = sub.cnt
FROM (
  SELECT dish_id, ROUND(AVG(rating_10), 1) as avg_r, COUNT(*) as cnt
  FROM votes WHERE rating_10 IS NOT NULL
  GROUP BY dish_id
) sub
WHERE dishes.id = sub.dish_id;

-- 5. Reset dishes with no remaining votes
UPDATE dishes SET
  avg_rating = NULL,
  total_votes = 0,
  consensus_ready = FALSE,
  consensus_rating = NULL,
  consensus_votes = 0
WHERE id NOT IN (SELECT DISTINCT dish_id FROM votes);

-- 6. Recalculate consensus (only dishes with 5+ real votes)
UPDATE dishes SET
  consensus_ready = FALSE,
  consensus_rating = NULL,
  consensus_votes = 0
WHERE TRUE;

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

-- Done
SELECT 'Cleanup complete!' as status;
SELECT 'Remaining test users' as check, COUNT(*) as count FROM auth.users WHERE email LIKE 'testuser%@ratingtest.local';
