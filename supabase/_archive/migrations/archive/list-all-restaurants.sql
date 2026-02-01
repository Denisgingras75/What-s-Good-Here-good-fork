-- List all restaurants (excluding Bangkok and Caribbean)
SELECT name, address
FROM restaurants
WHERE name NOT IN ('Bangkok Cuisine', 'Vineyard Caribbean Cuisine')
ORDER BY name;
