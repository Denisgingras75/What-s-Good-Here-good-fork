-- Lookout Tavern - Full Menu
-- Run this in Supabase SQL Editor
-- NOTE: 10 items excluded due to missing prices

-- Delete old Lookout Tavern dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Lookout Tavern');

-- Insert complete menu (70 items)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
-- Apps
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Jumbo Shrimp Cocktail', 'apps', 16.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Jumbo Shrimp Cocktail (Half Dozen)', 'apps', 22.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Jumbo Shrimp Cocktail (Dozen)', 'apps', 44.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Spearpoint Oysters (4)', 'apps', 16.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Spearpoint Oysters (Half Dozen)', 'apps', 22.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Spearpoint Oysters (Dozen)', 'apps', 44.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Littlenecks (Half Dozen)', 'apps', 19.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Littlenecks (Dozen)', 'apps', 22.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Raw Bar Sampler', 'apps', 20.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'House Made Chips', 'apps', 12.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'House Made Chips with Ranch', 'apps', 13.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Steak Skewers', 'apps', 22.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Crab Cakes', 'apps', 23.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Fried Calamari', 'apps', 19.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Popcorn Shrimp', 'apps', 19.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Popcorn Shrimp Buffalo', 'apps', 20.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Coconut Shrimp', 'apps', 20.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Fish Bites', 'apps', 15.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Sautéed Mussels', 'apps', 20.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Coconut Curry Mussels', 'apps', 22.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Steamers', 'apps', 24.95),

-- Chowder
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'New England Clam Chowder', 'chowder', 12.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Creamy Lobster Bisque', 'chowder', 15.95),

-- Fries
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'French Fries', 'fries', 13.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Cajun Fries with Blue Cheese', 'fries', 14.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Sweet Potato Fries Basket', 'fries', 14.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Sweet Potato Fries with Honey Mustard', 'fries', 15.95),

-- Wings
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Breaded Chicken Wings', 'wings', 20.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Breaded Chicken Wings Habanero Mango', 'wings', 21.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Breaded Chicken Wings Buffalo', 'wings', 22.95),

-- Fried Chicken
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Fresh Breaded Chicken Fingers', 'fried chicken', 19.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Chicken Fingers Habanero Mango', 'fried chicken', 20.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Chicken Fingers Buffalo', 'fried chicken', 21.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Buttermilk Crispy Fried Chicken Breast', 'fried chicken', 20.95),

-- Salads
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Caesar Salad', 'salad', 16.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Cobb Salad', 'salad', 18.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Cobb Salad with Chicken', 'salad', 24.95),

-- Burgers
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Cheeseburger', 'burger', 20.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Texas Burger', 'burger', 22.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'B.B. King Burger', 'burger', 23.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Honey Mustard Burger', 'burger', 22.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Patty Melt', 'burger', 22.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Surf n Turf Burger', 'burger', 30.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Beyond Burger', 'burger', 22.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Mike''s Burger', 'burger', 26.95),

-- Sandwiches
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Italian Caprese Sandwich', 'sandwich', 23.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Grilled Chicken Club', 'sandwich', 21.95),

-- Tacos
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Chicken Tacos', 'taco', 20.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Mahi Mahi Tacos', 'taco', 21.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Tuna Tacos', 'taco', 21.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Steak Tacos', 'taco', 22.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Fish Tacos', 'taco', 18.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Lobster Tacos', 'taco', 30.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Cajun Shrimp Tacos', 'taco', 20.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Veggie Tacos', 'taco', 19.95),

-- Fish
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Cajun Mahi Mahi', 'fish', 26.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Grilled Salmon', 'fish', 29.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Grilled Yellowfin Tuna', 'fish', 22.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Grilled Salmon BLT', 'fish', 23.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Beer Battered Fish & Chips', 'fish', 25.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Scallop Plate', 'fish', 34.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Shrimp Plate', 'fish', 26.95),

-- Entrees
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Sirloin Tips', 'entree', 32.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Grilled Jumbo Shrimp', 'entree', 27.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Guava BBQ Ribs', 'entree', 33.95),

-- Lobster Rolls
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Lobster Roll (Jumbo Tavern)', 'lobster roll', 36.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Jumbo Sautéed Lobster Roll', 'lobster roll', 38.95),

-- Lobster
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Lobster BLT', 'lobster', 39.95),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Lobster Mac & Cheese', 'lobster', 38.95);

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Lookout Tavern');

-- Should show 70 dishes
