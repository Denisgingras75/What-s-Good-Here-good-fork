-- Town Bar - Full Menu
-- Run this in Supabase SQL Editor
-- NOTE: Kids menu, desserts, and sides excluded (no fry prices listed)

-- Delete old Town Bar dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Town Bar');

-- Insert complete menu (27 items)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
-- Chowder
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Clam Chowder', 'chowder', 12.00),

-- Apps (Snacks + Shareables)
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Popcorn Chicken', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Coconut Shrimp', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Mac Fritters', 'apps', 13.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Fried Pickles', 'apps', 11.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Seasonal Soup', 'apps', 12.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Pretzel Bites', 'apps', 10.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Big Mac Sliders', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Truffle Street Corn Nachos', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Town Triple Sampler', 'apps', 20.00),

-- Wings
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Chicken Wings', 'wings', 13.00),

-- Salads
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Sesame Ginger Crunch', 'salad', 16.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Harvest Bowl', 'salad', 18.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Nashville Hot Chicken Salad', 'salad', 20.00),

-- Burgers
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Town Burger', 'burger', 20.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Smash Burger', 'burger', 19.00),

-- Fried Chicken
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Southern Bird', 'fried chicken', 17.00),

-- Sandwiches
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Bulgogi Steak N Cheese', 'sandwich', 20.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Green Goddess', 'sandwich', 19.00),

-- Fish
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Spicy Baja Fish Sandwich', 'fish', 19.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Spicy Baja Fish & Chips', 'fish', 29.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Pistachio Salmon', 'fish', 38.00),

-- Entrees
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Brazilian Steak Tips', 'entree', 32.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Cider-Glazed Pork Chop', 'entree', 28.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Cilantro Lime Chicken', 'entree', 26.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Adults Kids Meal', 'entree', 30.00),

-- Pasta
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Gnocchi Cacio e Pepe', 'pasta', 28.00);

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Town Bar');

-- Should show 27 dishes
