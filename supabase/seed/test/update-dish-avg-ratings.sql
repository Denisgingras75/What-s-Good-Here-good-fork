-- Update avg_rating and total_votes on all dishes based on actual votes

UPDATE dishes SET
  avg_rating = sub.avg_r,
  total_votes = sub.cnt
FROM (
  SELECT dish_id, ROUND(AVG(rating_10), 1) as avg_r, COUNT(*) as cnt
  FROM votes
  WHERE rating_10 IS NOT NULL
  GROUP BY dish_id
) sub
WHERE dishes.id = sub.dish_id;

-- Show results
SELECT 'Dishes with ratings updated' as status, COUNT(*) as count
FROM dishes WHERE avg_rating IS NOT NULL;
