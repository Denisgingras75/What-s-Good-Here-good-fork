-- Nancy's Restaurant - Full Menu
-- Run this in Supabase SQL Editor
-- NOTE: 3 salads have no prices and are excluded (Caesar, Fattoush, Greek)

-- Delete old Nancy's Restaurant dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant');

-- Insert complete menu (48 items)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
-- Chowder
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'New England Clam Chowder', 'chowder', 9.95),

-- Apps
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Shrimp Nancy''s', 'apps', 21.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Fried Calamari', 'apps', 21.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Scallops Wrapped in Bacon', 'apps', 18.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'PEI Mussels', 'apps', 25.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Hummus or Baba Ganoush', 'apps', 15.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Mediterranean Sampler', 'apps', 25.95),

-- Fries
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Chowder Fries', 'fries', 16.95),

-- Wings
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Nancy''s Wings', 'wings', 19.95),

-- Sandwiches & Burgers
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Smash Burger', 'burger', 19.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Salmon BLT', 'fish', 26.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Fried Fish Sandwich', 'fish', 19.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Joe''s Chicken Sandwich', 'sandwich', 22.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Buffalo Chicken Wrap', 'fried chicken', 19.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Greek Wrap', 'sandwich', 18.95),

-- Tacos
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Fish or Shrimp Tacos', 'taco', 22.95),

-- Fried Seafood
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Fish & Chips', 'fish', 29.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Jumbo Shrimp', 'fish', 30.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Sea Scallops', 'fish', 31.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Clam Strips', 'fish', 32.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Clam Bellies', 'fish', 44.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Seafood Plate', 'fish', 48.95),

-- Lobster
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Lobster Mac & Cheese', 'lobster', 39.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Cold Lobster Roll', 'lobster roll', 30.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Hot Lobster Roll', 'lobster roll', 32.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Steamed Lobster', 'lobster', 39.95),

-- Entrees
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Baked Cod', 'fish', 34.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Baked Scallops', 'fish', 37.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Broiled Seafood Plate', 'fish', 39.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Shrimp Scampi', 'fish', 28.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Salmon', 'fish', 35.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Mediterranean Chicken Plate', 'entree', 29.95),

-- Sushi Appetizers
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Shumai', 'sushi', 12.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Gyoza', 'sushi', 12.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Tuna Avo Salad', 'sushi', 18.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Seared Peppered Tuna', 'sushi', 19.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Ceviche', 'sushi', 19.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Sushi Sandwich', 'sushi', 18.00),

-- Sushi Specialty Rolls
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Nancy''s Roll', 'sushi', 26.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Volcano Roll', 'sushi', 26.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Dragon Roll', 'sushi', 20.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Sneaky Steve Roll', 'sushi', 26.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Amazing Roll', 'sushi', 25.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Rainbow Roll', 'sushi', 22.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'MV Roll', 'sushi', 26.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Katama Roll', 'sushi', 26.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Coconut Shrimp Roll', 'sushi', 23.00);

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant');

-- Should show 48 dishes
