-- Porto Pizza - Full Menu
-- Run this in Supabase SQL Editor
-- NOTE: All pizzas set to $20 (prices not provided)

-- Delete old Porto Pizza dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Porto Pizza');

-- Insert complete menu (8 items)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
-- Pizzas
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Veggie Pizza', 'pizza', 20.00),
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'White Pizza', 'pizza', 20.00),
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Bacon Jalapeño Pizza', 'pizza', 20.00),
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Linguica Peppers Pizza', 'pizza', 20.00),
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Deep Dish Pepperoni', 'pizza', 20.00),
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Deep Dish BBQ Pizza', 'pizza', 20.00),
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Cheese Pizza', 'pizza', 20.00),
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Pepperoni Pizza', 'pizza', 20.00);

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Porto Pizza');

-- Should show 8 dishes
