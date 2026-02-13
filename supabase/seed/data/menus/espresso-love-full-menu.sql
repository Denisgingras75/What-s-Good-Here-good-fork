-- Espresso Love - Full Menu
-- Run this in Supabase SQL Editor
-- IMPORTANT: Delete existing Espresso Love dishes first to avoid duplicates

-- Delete old Espresso Love dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Espresso Love');

-- Insert complete menu (34 items)
INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
-- Breakfast
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'The Sunrise', 'breakfast sandwich', 'Breakfast', 6.25),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Mike''s Breakfast', 'breakfast sandwich', 'Breakfast', 7.25),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'The Shiretown', 'breakfast sandwich', 'Breakfast', 7.50),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Breakfast Burrito', 'breakfast sandwich', 'Breakfast', 8.25),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Church Street Bagel', 'breakfast sandwich', 'Breakfast', 8.50),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'The Islander', 'breakfast sandwich', 'Breakfast', 7.50),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'The New Yorker', 'breakfast sandwich', 'Breakfast', 11.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Healthy Wrap', 'breakfast sandwich', 'Breakfast', 6.99),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Vegan Breakfast Burrito', 'breakfast sandwich', 'Breakfast', 8.99),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Avocado Toast', 'breakfast', 'Breakfast', 9.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Loaded Avocado Toast', 'breakfast', 'Breakfast', 14.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Breakfast Bowl', 'breakfast', 'Breakfast', 13.99),
-- Sandwiches
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Chicken Avo BLT', 'sandwich', 'Sandwiches', 16.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Katama Chicken', 'sandwich', 'Sandwiches', 16.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Turkey Club', 'sandwich', 'Sandwiches', 16.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Black Angus Burger', 'burger', 'Sandwiches', 18.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Capri Chicken', 'sandwich', 'Sandwiches', 15.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Chilmark', 'sandwich', 'Sandwiches', 16.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Chappy', 'sandwich', 'Sandwiches', 14.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Menemsha', 'sandwich', 'Sandwiches', 14.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Sweet Potato', 'sandwich', 'Sandwiches', 14.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'ATM', 'sandwich', 'Sandwiches', 14.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Black Bean Sweet Potato Burger', 'burger', 'Sandwiches', 16.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Powerhouse', 'sandwich', 'Sandwiches', 13.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Greek Hummus Wrap', 'sandwich', 'Sandwiches', 14.00),
-- Bowls & Salads
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Greek Salad', 'salad', 'Bowls & Salads', 11.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Chicken Cobb Salad', 'salad', 'Bowls & Salads', 16.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Caesar Salad', 'salad', 'Bowls & Salads', 10.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Kale Salad', 'salad', 'Bowls & Salads', 10.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Green Goddess Bowl', 'salad', 'Bowls & Salads', 13.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Buddha Bowl', 'salad', 'Bowls & Salads', 13.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Summer Bowl', 'salad', 'Bowls & Salads', 13.00),
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Chicken & Rice Bowl', 'salad', 'Bowls & Salads', 16.00),
-- Soups
((SELECT id FROM restaurants WHERE name = 'Espresso Love'), 'Soup', 'soup', 'Soups', 8.00);

-- Update menu_section_order
UPDATE restaurants
SET menu_section_order = ARRAY['Breakfast', 'Sandwiches', 'Bowls & Salads', 'Soups']
WHERE name = 'Espresso Love';

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Espresso Love');

-- Should show 34 dishes
