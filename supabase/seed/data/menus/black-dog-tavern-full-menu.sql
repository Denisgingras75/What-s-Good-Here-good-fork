-- Black Dog - Full Menu
-- Run this in Supabase SQL Editor
-- NOTE: Sides excluded except fries

-- Delete old Black Dog dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Black Dog');

-- Insert complete menu (23 items)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
-- Chowder
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Classic Chowder', 'chowder', 12.00),

-- Apps
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Onion Rings', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Jalapeno Popper Puffs', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Spinach Artichoke Dip', 'apps', 18.00),

-- Wings
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Chicken Wings', 'wings', 17.00),

-- Tendys
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Chicken Tenders', 'tendys', 18.00),

-- Fish
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Drunken Sailor Shrimp', 'fish', 18.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Fish and Chips', 'fish', 30.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Garlic and Herb Panko Cod', 'fish', 34.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Roasted Salmon', 'fish', 35.00),

-- Salads
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Harvest Salad', 'salad', 18.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Caesar Salad', 'salad', 17.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Vineyard Cobb', 'salad', 18.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'House Salad', 'salad', 15.00),

-- Entrees
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Beef and Mushroom Pot Pie', 'entree', 30.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Steak Tips', 'entree', 34.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Rosemary and Apple Cider Braised Chicken', 'entree', 33.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Steak Frites', 'entree', 33.00),

-- Pasta
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Butternut Squash Ravioli', 'pasta', 23.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Sausage Broccoli Cavatelli', 'pasta', 25.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Cipolla Carmalizzata', 'pasta', 24.00),

-- Burgers
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Smash Burger', 'burger', 28.00),

-- Fries
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'French Fries', 'fries', 7.00);

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Black Dog');

-- Should show 23 dishes
