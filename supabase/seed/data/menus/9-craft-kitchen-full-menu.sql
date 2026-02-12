-- 9 Craft Kitchen and Bar - Dinner Menu
-- Run this in Supabase SQL Editor
-- NOTE: Sides excluded except fries, oysters excluded

-- Delete old 9 Craft Kitchen and Bar dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar');

-- Insert complete menu (38 items)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
-- Apps (Smaller & Shareable)
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Filet Mignon Deviled Eggs', 'apps', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Fried Chicken Bao Bun', 'fried chicken', 15.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Herbed Ricotta Cheese', 'apps', 13.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Mussels Puttanesca', 'apps', 22.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Spicy Tuna Lettuce Wraps', 'apps', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Lobster Tostadas', 'apps', 22.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Sesame Chicken Bites', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Corn & Cheddar Fritters', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Oak Smoked Pork Belly', 'apps', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Foie Gras Sausage', 'apps', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Bacon Lollipop Bouquet', 'apps', 16.00),

-- Salads
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'House Caesar', 'salad', 16.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Olive Oil Poached Niçoise Salad', 'salad', 24.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Strawberry Fields', 'salad', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Arcadia Green Salad', 'salad', 15.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Warm Spinach Salad', 'salad', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Roasted Cauliflower Salad', 'salad', 19.00),

-- Chowder
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Chowder', 'chowder', 14.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Smoked Tomato Bisque', 'chowder', 14.00),

-- Fries
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'French Fries', 'fries', 12.00),

-- Pasta
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Lamb Ragout Rigatoni', 'pasta', 37.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Pappardelle Bourguignon', 'pasta', 37.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Lobster Crawfish Risotto', 'pasta', 42.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Parmesan Koginut Squash Risotto', 'pasta', 34.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Cast-Iron Baked Gnocchi', 'pasta', 29.00),

-- Fish
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Scottish Salmon', 'fish', 36.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Miso Cod', 'fish', 36.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Swordfish Steak', 'fish', 39.00),

-- Entrees
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Filet Mignon', 'entree', 49.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Chicken Tagine (Serves 2)', 'entree', 49.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Dry-Aged Pork Chop', 'entree', 42.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Wagyu Skirt Steak', 'entree', 56.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Slow Braised Short Rib', 'entree', 42.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Chicken Thigh Schnitzel', 'entree', 27.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Boneless Prime Ribeye', 'entree', 69.00),

-- Burgers
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'The Burger', 'burger', 26.00);

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar');

-- Should show 38 dishes
