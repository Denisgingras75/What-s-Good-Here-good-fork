-- Show all dishes currently in "apps" category
SELECT
  r.name as restaurant,
  d.name as dish_name,
  d.category
FROM dishes d
JOIN restaurants r ON d.restaurant_id = r.id
WHERE d.category = 'apps'
ORDER BY r.name, d.name;
