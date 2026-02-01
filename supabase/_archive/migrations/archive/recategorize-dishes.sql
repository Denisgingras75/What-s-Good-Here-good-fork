-- Recategorize dishes from "apps" to proper categories
-- Run this in Supabase SQL Editor

-- Move BREAKFAST items to 'breakfast' category
UPDATE dishes SET category = 'breakfast'
WHERE category = 'apps' AND name IN (
  'Biscuits Benedict',
  'Buttermilk Pancakes',
  'Blueberry Pancakes',
  'Lobster Benedict',
  'Avocado Toast',
  'Breakfast Burrito',
  'Apple Cider Donut',
  'Apple Fritter',
  'Boston Cream Donut',
  'Maple Bacon Donut',
  'Cinnamon Roll'
);

-- Move SALAD items to 'salad' category
UPDATE dishes SET category = 'salad'
WHERE category = 'apps' AND name IN (
  'Greek Salad',
  'Caesar Salad',
  'Cobb Salad',
  'Asian Sesame Salad',
  'Southwest Salad',
  'Beet Salad'
);

-- Move PASTA items to 'pasta' category
UPDATE dishes SET category = 'pasta'
WHERE category = 'apps' AND name IN (
  'Lobster Ravioli'
);

-- Verify changes
SELECT
  category,
  COUNT(*) as dish_count
FROM dishes
WHERE category IN ('breakfast', 'salad', 'pasta', 'apps')
GROUP BY category
ORDER BY category;

-- Show what got moved
SELECT
  r.name as restaurant,
  d.name as dish_name,
  d.category
FROM dishes d
JOIN restaurants r ON d.restaurant_id = r.id
WHERE d.category IN ('breakfast', 'salad', 'pasta')
ORDER BY d.category, r.name;
