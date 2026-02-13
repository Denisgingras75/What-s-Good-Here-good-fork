-- Catboat - Full Menu
-- Run this in Supabase SQL Editor
-- IMPORTANT: Delete existing Catboat dishes first to avoid duplicates

-- Delete old Catboat dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Catboat');

-- Insert complete menu (17 items)
INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
-- Breakfast Sandwiches
((SELECT id FROM restaurants WHERE name = 'Catboat'), 'Egg & Cheese', 'breakfast sandwich', 'Breakfast Sandwiches', 7.00),
((SELECT id FROM restaurants WHERE name = 'Catboat'), 'Sausage, Egg & Cheese', 'breakfast sandwich', 'Breakfast Sandwiches', 9.00),
((SELECT id FROM restaurants WHERE name = 'Catboat'), 'Lebanese', 'breakfast sandwich', 'Breakfast Sandwiches', 14.00),
-- Flatbreads
((SELECT id FROM restaurants WHERE name = 'Catboat'), 'Zaatar Manousheh', 'apps', 'Flatbreads', 8.00),
((SELECT id FROM restaurants WHERE name = 'Catboat'), 'Cheese Manousheh', 'apps', 'Flatbreads', 14.00),
((SELECT id FROM restaurants WHERE name = 'Catboat'), 'Zaatar + Cheese', 'apps', 'Flatbreads', 12.00),
((SELECT id FROM restaurants WHERE name = 'Catboat'), 'Lahm B''agine (Sfiha)', 'apps', 'Flatbreads', 15.00),
((SELECT id FROM restaurants WHERE name = 'Catboat'), 'Fatayer (Spinach Pie)', 'apps', 'Flatbreads', 14.00),
-- Sandwiches or Bowls
((SELECT id FROM restaurants WHERE name = 'Catboat'), 'Labneh', 'sandwich', 'Sandwiches or Bowls', 12.00),
((SELECT id FROM restaurants WHERE name = 'Catboat'), 'Falafel', 'sandwich', 'Sandwiches or Bowls', 16.00),
((SELECT id FROM restaurants WHERE name = 'Catboat'), 'Beef Kafta', 'sandwich', 'Sandwiches or Bowls', 16.00),
((SELECT id FROM restaurants WHERE name = 'Catboat'), 'Chicken Shawarma', 'sandwich', 'Sandwiches or Bowls', 16.00),
-- Salads
((SELECT id FROM restaurants WHERE name = 'Catboat'), 'Fattoush', 'salad', 'Salads', 12.00),
((SELECT id FROM restaurants WHERE name = 'Catboat'), 'Avocado Zaatar', 'salad', 'Salads', 14.00),
((SELECT id FROM restaurants WHERE name = 'Catboat'), 'Tabbouleh', 'salad', 'Salads', 13.00),
-- Specials
((SELECT id FROM restaurants WHERE name = 'Catboat'), 'Roasted Cauliflower', 'entree', 'Specials', 16.00),
((SELECT id FROM restaurants WHERE name = 'Catboat'), 'Grilled Cheese', 'sandwich', 'Specials', 9.00);

-- Update menu_section_order
UPDATE restaurants
SET menu_section_order = ARRAY['Breakfast Sandwiches', 'Flatbreads', 'Sandwiches or Bowls', 'Salads', 'Specials']
WHERE name = 'Catboat';

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Catboat');

-- Should show 17 dishes
