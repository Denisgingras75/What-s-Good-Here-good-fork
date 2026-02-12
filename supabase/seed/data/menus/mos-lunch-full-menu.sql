-- Mo's Lunch - Full Menu
-- Run this in Supabase SQL Editor

-- Delete old Mo's Lunch dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Mo''s Lunch');

-- Insert complete menu (26 items)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
-- Sandwiches
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Roast Pork Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Italian Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Cauliflower Melt', 'sandwich', 15.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Chickpea Salad Sandwich', 'sandwich', 14.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Turkey Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Beef Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Cold Tuna Sub', 'sandwich', 14.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Tuna Melt', 'sandwich', 14.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Banh Mi', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Filet o'' Fish', 'sandwich', 12.00),

-- Burgers
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Leo Burger', 'burger', 11.00),

-- Fries
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Waffle Fries', 'fries', 16.00),

-- Salads
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Chopped Salad', 'salad', 15.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Kale Caesar Salad', 'salad', 15.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Nicoise Salad', 'salad', 18.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Side Salad', 'salad', 8.00),

-- Apps
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Country Pate', 'apps', 20.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Tinned Fish', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Today''s Cheese', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Smoked Bluefish Pate', 'apps', 21.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Mortadella', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Meat + Cheese', 'apps', 22.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Broccoli Rabe', 'apps', 9.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Polenta Frys', 'apps', 9.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Onion Rings', 'apps', 9.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Pickles', 'apps', 7.00);

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Mo''s Lunch');

-- Should show 26 dishes
