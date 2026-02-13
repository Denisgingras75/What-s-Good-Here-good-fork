-- Cozy Corner - Full Menu (Spring/Summer)
-- Run this in Supabase SQL Editor
-- IMPORTANT: Delete existing Cozy Corner dishes first to avoid duplicates

-- Delete old Cozy Corner dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Cozy Corner');

-- Insert complete menu (25 items)
INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
-- Paninis
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Pizza Panini', 'sandwich', 'Paninis', 15.50),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Balkan Panini', 'sandwich', 'Paninis', 16.50),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Prosciutto Paradise', 'sandwich', 'Paninis', 16.50),
-- Breakfast Sandwiches
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Angelica''s Croissant', 'breakfast sandwich', 'Breakfast Sandwiches', 15.50),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Egg Muffin', 'breakfast sandwich', 'Breakfast Sandwiches', 11.00),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Ham or Turkey Cheese', 'breakfast sandwich', 'Breakfast Sandwiches', 7.50),
-- Burritos
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Bean & Cheese Burrito', 'breakfast sandwich', 'Burritos', 8.00),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Egg & Cheese Burrito', 'breakfast sandwich', 'Burritos', 9.50),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Egg, Cheese & Spinach Burrito', 'breakfast sandwich', 'Burritos', 10.00),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Egg, Cheese & Mushroom Burrito', 'breakfast sandwich', 'Burritos', 10.00),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Turkey or Ham, Egg & Cheese Burrito', 'breakfast sandwich', 'Burritos', 10.50),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Bacon or Sausage, Egg & Cheese Burrito', 'breakfast sandwich', 'Burritos', 11.00),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Southern Style Burrito', 'breakfast sandwich', 'Burritos', 13.00),
-- Toasts
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Avocado Toast', 'breakfast', 'Toasts', 14.00),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Smoked Salmon Toast', 'breakfast', 'Toasts', 17.00),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Iggy''s Salmon Toast', 'breakfast', 'Toasts', 13.00),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Steak and Cheese Toast', 'breakfast', 'Toasts', 17.00),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Sweet Toast', 'breakfast', 'Toasts', 13.00),
-- Wraps
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Breakfast Wrap', 'breakfast sandwich', 'Wraps', 15.00),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Walnut Cran Chicken Wrap', 'sandwich', 'Wraps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Vegan Wrap', 'sandwich', 'Wraps', 13.50),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Turkey Tomato Wrap', 'sandwich', 'Wraps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Pork Wrap', 'sandwich', 'Wraps', 15.50),
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'BLT Wrap', 'sandwich', 'Wraps', 15.00),
-- Acai
((SELECT id FROM restaurants WHERE name = 'Cozy Corner'), 'Acai Bowl', 'breakfast', 'Acai', 17.00);

-- Update menu_section_order
UPDATE restaurants
SET menu_section_order = ARRAY['Paninis', 'Breakfast Sandwiches', 'Burritos', 'Toasts', 'Wraps', 'Acai']
WHERE name = 'Cozy Corner';

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Cozy Corner');

-- Should show 25 dishes
