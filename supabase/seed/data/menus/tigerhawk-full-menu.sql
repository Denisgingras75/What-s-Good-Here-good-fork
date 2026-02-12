-- TigerHawk Sandwich Company - Full Menu
-- Run this in Supabase SQL Editor
-- NOTE: 4 items excluded - 3 desserts, 1 Build Your Own

-- Delete old TigerHawk Sandwich Company dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company');

-- Insert complete menu (33 items)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
-- Breakfast Sandwiches
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Biggie Smalls', 'breakfast sandwich', 10.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Early Bird', 'breakfast sandwich', 11.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Rise and Shine', 'breakfast sandwich', 13.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'B.E.A.C.H. Please', 'breakfast sandwich', 14.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'K-Pop in the Morning', 'breakfast sandwich', 13.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Egg Banh Mi', 'breakfast sandwich', 13.00),

-- Breakfast
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Avocado Toast', 'breakfast', 13.00),

-- Sandwiches
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Seared Tofu K-Pop Star Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Seared Tofu & Shiitake Shroom Banh Mi Sandwich', 'sandwich', 15.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Crispy Parmesan Grilled Cheese', 'sandwich', 12.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Hawk Style Fried Chicken Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Chad''s Style Fried Chicken Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Tiger Style Fried Chicken Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Krispy K-Pop Fried Chicken Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Teriyaki Beef Banh Mi', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Teriyaki Chicken Banh Mi', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Fried Chicken Banh Mi', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Pork Belly Banh Mi', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'In Da Club', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Pac''s Pollo', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'K-Pop Star', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Notorious P.B.L.T.', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Cheesesteak Bomb', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Fried Chicken Caesar Wrap', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Biscuit Fried Chicken', 'sandwich', 17.00),

-- Salads
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Banh Mi Style Salad', 'salad', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Caesar Salad', 'salad', 13.00),

-- Tendys
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Chicken Tenders & Fries', 'tendys', 15.00),

-- Poke Bowls
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Teriyaki Beef Poke Bowl', 'pokebowl', 18.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Teriyaki Chicken Poke Bowl', 'pokebowl', 18.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Fried Chicken Poke Bowl', 'pokebowl', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Pork Belly Poke Bowl', 'pokebowl', 18.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Tuna Poke Bowl', 'pokebowl', 26.00);

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company');

-- Should show 33 dishes
