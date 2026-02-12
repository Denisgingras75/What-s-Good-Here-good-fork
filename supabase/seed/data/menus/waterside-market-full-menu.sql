-- Waterside Market - Full Menu
-- Run this in Supabase SQL Editor
-- NOTE: Drinks excluded

-- Delete old Waterside Market dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Waterside Market');

-- Insert complete menu (25 items)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
-- Breakfast
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Breakfast Sandwich', 'breakfast sandwich', 8.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Breakfast Burrito', 'breakfast sandwich', 13.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Skinny Wrap', 'breakfast sandwich', 13.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Traditional Breakfast', 'breakfast', 14.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Flapjacks', 'breakfast', 14.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Tex-Mex', 'breakfast', 20.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Eggs Benedict', 'breakfast', 19.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Lobster Benedict', 'breakfast', 36.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Cinnamon French Toast', 'breakfast', 14.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Avocado Toast', 'breakfast', 16.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Smoked Salmon & Tomato Caper Salsa', 'breakfast', 20.00),
-- Sandwiches (Lunch)
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Farmhouse', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'John Alden', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Red White & Green', 'sandwich', 15.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'C.A.B.', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Italian', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'French Quarter', 'sandwich', 18.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'B.L.T. "The Best!"', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Lucy Vincent', 'sandwich', 16.00),

-- Lobster Roll
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Lobster Roll', 'lobster roll', 36.00),

-- Fries
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Hand-Cut French Fries', 'fries', 9.00),

-- Salads
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Cobb Salad', 'salad', 18.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Kale Chicken Caesar', 'salad', 16.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Strawberry Quinoa', 'salad', 20.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Greek Salad', 'salad', 18.00);

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Waterside Market');

-- Should show 25 dishes
