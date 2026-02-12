-- Beach Road - Full Menu
-- Run this in Supabase SQL Editor

-- Delete old Beach Road dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Beach Road');

-- Insert complete menu (18 items)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
-- Chowder
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'New England Clam Chowder', 'chowder', 17.00),

-- Apps
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Daily Bread', 'apps', 12.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Cast Iron Cornbread', 'apps', 12.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Fig Toast', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Blistered Shishitos', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Beet Roulade', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Charred Savoy Cabbage', 'apps', 19.00),

-- Salads
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Autumn Salad', 'salad', 21.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Caesar Salad', 'salad', 19.00),

-- Fish
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Tempura Shrimp', 'fish', 20.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Bouillabaisse', 'fish', 50.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Atlantic Halibut', 'fish', 48.00),

-- Pasta
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Sugar Pumpkin & Mushroom Mafaldine', 'pasta', 42.00),

-- Entrees
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Lamb Chops', 'entree', 26.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Berkshire Pork Chop', 'entree', 48.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Braised Short Rib', 'entree', 47.00),

-- Sandwiches
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Hot Dog', 'sandwich', 24.00),

-- Fried Chicken
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Fried Chicken', 'fried chicken', 38.00);

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Beach Road');

-- Should show 18 dishes
