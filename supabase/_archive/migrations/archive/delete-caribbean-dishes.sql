-- Delete all dishes from Vineyard Caribbean Cuisine
-- Run this in Supabase SQL Editor

DELETE FROM dishes
WHERE restaurant_id = (
  SELECT id FROM restaurants WHERE name = 'Vineyard Caribbean Cuisine'
);

-- Verify deletion
SELECT
  r.name as restaurant,
  COUNT(d.id) as dish_count
FROM restaurants r
LEFT JOIN dishes d ON r.id = d.restaurant_id
WHERE r.name = 'Vineyard Caribbean Cuisine'
GROUP BY r.name;
