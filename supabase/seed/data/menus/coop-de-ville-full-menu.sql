-- Coop de Ville - Full Menu
-- Run this in Supabase SQL Editor

-- Delete old Coop de Ville dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Coop de Ville');

-- Insert complete menu (34 items)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
-- Chowder
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'New England Clam Chowder Cup', 'chowder', 8.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'New England Clam Chowder Bowl', 'chowder', 10.00),

-- Apps
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Stuffed Quahogs', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Peel n Eat Shrimp Half Pound', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Peel n Eat Shrimp One Pound', 'apps', 30.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'LJ''s Famous Fried Pickles', 'apps', 12.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Popcorn Chicken', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Popcorn Shrimp', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Local Hand-dug Steamers', 'apps', 32.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Coconut Shrimp', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Maryland Style Crab Cakes', 'apps', 20.00),

-- Fish
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Clam Strip Basket', 'fish', 19.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Beer Battered Shrimp Basket', 'fish', 18.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Whole Belly Clam Basket', 'fish', 29.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Fresh Sea Scallop Basket', 'fish', 26.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Popcorn Shrimp Basket', 'fish', 17.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Blackened Mahi Mahi', 'fish', 30.00),

-- Fried Chicken
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Popcorn Chicken Basket', 'fried chicken', 17.00),

-- Entrees
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'BBQ Ribs Half Rack', 'entree', 23.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'BBQ Ribs Full Rack', 'entree', 44.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Marinated Steak Tip', 'entree', 33.00),

-- Sandwiches
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Pulled Pork BBQ Sandwich', 'sandwich', 15.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Cod Fish Sandwich', 'sandwich', 18.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Grilled Marinated Chicken Sandwich', 'sandwich', 15.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Fried Whole Belly Clam Roll', 'sandwich', 29.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Fried Scallop Roll', 'sandwich', 24.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Pearl Beef Dog', 'sandwich', 13.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Grilled Steak Tip Sub', 'sandwich', 19.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Blackened Mahi Mahi Sandwich', 'sandwich', 20.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Tuna Melt', 'sandwich', 15.00),

-- Burgers
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Coop Cheese Burger', 'burger', 16.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Beyond Burger', 'burger', 16.00),

-- Lobster Rolls
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Lobster Salad Roll', 'lobster roll', 35.00),

-- Wings
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Wings', 'wings', 19.00);

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Coop de Ville');

-- Should show 34 dishes
