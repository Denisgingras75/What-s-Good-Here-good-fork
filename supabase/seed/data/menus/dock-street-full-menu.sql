-- Dock Street - Full Menu (Breakfast Specials + Breakfast Sandwiches + Lunch Specials)
-- Run this in Supabase SQL Editor
-- IMPORTANT: Delete existing Dock Street dishes first to avoid duplicates

-- Delete old Dock Street dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Dock Street');

-- Insert complete menu (23 items)
INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
-- Breakfast Specials
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'The Number One', 'breakfast', 'Breakfast Specials', 10.50),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'The Number Two', 'breakfast', 'Breakfast Specials', 7.95),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'The Number Three', 'breakfast', 'Breakfast Specials', 11.50),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'The Number Four', 'breakfast', 'Breakfast Specials', 12.95),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'The Number Five', 'breakfast', 'Breakfast Specials', 12.25),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'The Number Six', 'breakfast', 'Breakfast Specials', 11.95),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'The Number Seven', 'breakfast', 'Breakfast Specials', 13.95),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'The Number Eight', 'breakfast', 'Breakfast Specials', 15.95),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'The Number Nine', 'breakfast sandwich', 'Breakfast Specials', 9.50),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'The Number Ten', 'breakfast', 'Breakfast Specials', 7.95),
-- Breakfast Sandwiches
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'Egg Mac', 'breakfast sandwich', 'Breakfast Sandwiches', 5.00),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'Bacon Mac', 'breakfast sandwich', 'Breakfast Sandwiches', 5.75),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'Ham Mac', 'breakfast sandwich', 'Breakfast Sandwiches', 5.75),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'Sausage Mac', 'breakfast sandwich', 'Breakfast Sandwiches', 5.75),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'Port Mac', 'breakfast sandwich', 'Breakfast Sandwiches', 5.75),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'Hash Mac', 'breakfast sandwich', 'Breakfast Sandwiches', 8.50),
-- Lunch Specials
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'Cheeseburger Delux', 'burger', 'Lunch Specials', 8.95),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'California Burger', 'burger', 'Lunch Specials', 7.95),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'Patty Melt', 'burger', 'Lunch Specials', 7.95),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'Steak and Cheese Sub', 'sandwich', 'Lunch Specials', 9.00),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'Turkey Melt', 'sandwich', 'Lunch Specials', 8.00),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'Turkey Delux', 'sandwich', 'Lunch Specials', 9.50),
((SELECT id FROM restaurants WHERE name = 'Dock Street'), 'Home Fries', 'fries', 'Lunch Specials', 2.95);

-- Update menu_section_order
UPDATE restaurants
SET menu_section_order = ARRAY['Breakfast Specials', 'Breakfast Sandwiches', 'Lunch Specials']
WHERE name = 'Dock Street';

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Dock Street');

-- Should show 23 dishes
