-- Delete all dishes from Bangkok Cuisine
-- Run this in Supabase SQL Editor

DELETE FROM dishes
WHERE restaurant_id = (
  SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'
);

-- Verify deletion
SELECT
  r.name as restaurant,
  COUNT(d.id) as dish_count
FROM restaurants r
LEFT JOIN dishes d ON r.id = d.restaurant_id
WHERE r.name = 'Bangkok Cuisine'
GROUP BY r.name;
