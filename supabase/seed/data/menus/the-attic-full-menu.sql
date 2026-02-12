-- The Attic - Full Menu
-- Run this in Supabase SQL Editor
-- NOTE: Sides excluded except fries

-- Delete old The Attic dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Attic');

-- Insert complete menu (34 items)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
-- Apps
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Short Rib Poutine', 'apps', 23.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Crispy Sweet Chili Brussel Sprouts', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Fried Cheese Curds', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Waterside''s House Potato Chips', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Beer Battered Onion Rings', 'apps', 17.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'French Onion Soup', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Soup of the Day', 'apps', 15.00),

-- Wings
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Attic Wings', 'wings', 12.00),

-- Fish
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Tuna Tartar', 'fish', 26.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Portuguese Mussels', 'fish', 25.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'House-made Crab Cakes', 'fish', 22.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Fried Codfish Sandwich', 'fish', 25.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Hoisin Glazed Salmon Rice Bowl', 'fish', 38.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Fish & Chips', 'fish', 30.00),

-- Salads
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Attic Salad', 'salad', 22.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Butternut Squash & Spinach Salad', 'salad', 22.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Caesar Salad', 'salad', 20.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Side Salad', 'salad', 12.00),

-- Burgers
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Classic Burger', 'burger', 24.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Attic Smash Burger', 'burger', 24.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Veggie Burger', 'burger', 23.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Turkey Burger', 'burger', 24.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Mr. Bowen', 'burger', 27.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Black & Bleu Burger', 'burger', 27.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Firehouse Burger', 'burger', 27.00),

-- Sandwiches
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Attic Fried Chicken Sandwich', 'sandwich', 24.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Pulled Pork Sandwich', 'sandwich', 25.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'American Wagyu Hot Dog', 'sandwich', 23.00),

-- Lobster Rolls
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Lobster Roll', 'lobster roll', 38.00),

-- Entrees
((SELECT id FROM restaurants WHERE name = 'The Attic'), '12 oz Prime N.Y. Strip', 'entree', 57.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Herb Roasted 1/2 Chicken', 'entree', 35.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Harissa Roasted Cauliflower', 'entree', 30.00),

-- Pasta
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Classic Mac & Cheese', 'pasta', 20.00),

-- Fries
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Hand-cut Fries', 'fries', 10.00);

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Attic');

-- Should show 34 dishes
