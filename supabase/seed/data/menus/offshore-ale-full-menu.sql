-- Offshore Ale Company - Full Menu
-- Run this in Supabase SQL Editor
-- IMPORTANT: Delete existing Offshore Ale Company dishes first to avoid duplicates

-- Delete old Offshore Ale Company dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Offshore Ale Company');

-- Insert complete menu (36 items)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'New England Clam Chowder', 'chowder', 12.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Offshore Chili', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'French Onion Soup', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Tomato Soup', 'apps', 9.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Guacamole and Chips', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Grilled Brie', 'apps', 19.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Buffalo Cauliflower', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Bavarian Pretzel Sticks', 'apps', 10.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Steamed PEI Mussels', 'apps', 25.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Hand-Cut Fries', 'fries', 13.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Truffle Fries', 'fries', 17.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Wings', 'wings', 20.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Chicken Tenders', 'tendys', 20.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Knife and Fork Fried Chicken Sandwich', 'fried chicken', 24.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Power Bowl', 'salad', 20.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Caesar Salad', 'salad', 17.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Pub Salad', 'salad', 17.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Fish and Chips', 'fish', 30.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Fish Sandwich', 'fish', 24.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Salmon BLT', 'fish', 25.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Tuna Poke', 'fish', 34.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Grilled Cheese and Tomato Soup', 'sandwich', 18.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Tavern Burger', 'burger', 20.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Turkey Burger', 'burger', 23.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Classic Cheese Pizza', 'pizza', 21.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'BBQ Chicken Pizza', 'pizza', 26.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Meat Lovers Pizza', 'pizza', 26.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Veggie Pizza', 'pizza', 24.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Hawaiian Pizza', 'pizza', 25.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Margherita Pizza', 'pizza', 23.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Chicken Pesto Pizza', 'pizza', 25.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Potato Pizza', 'pizza', 26.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Chicken Quesadilla', 'taco', 23.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Steak Quesadilla', 'taco', 25.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Veggie Quesadilla', 'taco', 22.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Baby Back Ribs', 'entree', 30.00);

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Offshore Ale Company');

-- Should show 36 dishes
