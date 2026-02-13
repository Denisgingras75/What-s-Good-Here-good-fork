-- Nat's Nook - Full Menu
-- Run this in Supabase SQL Editor
-- IMPORTANT: Delete existing Nat's Nook dishes first to avoid duplicates

-- Delete old Nat's Nook dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Nat''s Nook');

-- Insert complete menu (28 items)
INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
-- Breakfast (Crepe or Bagel)
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Eggs & Cheese', 'breakfast sandwich', 'Breakfast', 10.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Eggs & Cheese with Meat', 'breakfast sandwich', 'Breakfast', 12.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Yogurt & Honey', 'breakfast', 'Breakfast', 13.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Eggs, Goat Cheese & Spinach', 'breakfast', 'Breakfast', 13.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Eggs & Swiss with Mushroom and Spinach', 'breakfast', 'Breakfast', 13.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Eggs & Feta with Avocado', 'breakfast', 'Breakfast', 13.00),
-- Sweet Crepes
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Nutella Crepe', 'breakfast', 'Sweet', 13.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Yogurt & Fruit Crepe', 'breakfast', 'Sweet', 13.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Lemon Blossom Crepe', 'breakfast', 'Sweet', 14.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Apple Butter Crepe', 'breakfast', 'Sweet', 13.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'S''mores Crepe', 'breakfast', 'Sweet', 13.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Butter Cinnamon Sugar Crepe', 'breakfast', 'Sweet', 13.00),
-- Savory Crepes
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Ham & Swiss Crepe', 'sandwich', 'Savory', 15.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Turkey Cheddar Crepe', 'sandwich', 'Savory', 15.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Chicken Breast & Havarti Crepe', 'sandwich', 'Savory', 16.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Southwest Chicken Crepe', 'sandwich', 'Savory', 16.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Greek Crepe', 'sandwich', 'Savory', 16.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Avocado Tomato & Goat Cheese Crepe', 'sandwich', 'Savory', 16.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Club Crepe', 'sandwich', 'Savory', 16.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'BLT Crepe', 'sandwich', 'Savory', 12.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Salmon Crepe', 'sandwich', 'Savory', 16.00),
-- Bagels
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Veggie Cream Cheese Bacon Bagel', 'breakfast sandwich', 'Bagels', 10.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Cream Cheese Tomato Avocado Bagel', 'breakfast sandwich', 'Bagels', 10.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Veggie Cream Cheese Tomato Arugula Bagel', 'breakfast sandwich', 'Bagels', 10.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Ham and Swiss Honey Mustard Bagel', 'breakfast sandwich', 'Bagels', 10.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Hummus Cucumber Avocado Bagel', 'breakfast sandwich', 'Bagels', 10.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Sausage Cheddar Mushroom Bagel', 'breakfast sandwich', 'Bagels', 10.00),
((SELECT id FROM restaurants WHERE name = 'Nat''s Nook'), 'Salmon Bagel', 'breakfast sandwich', 'Bagels', 13.00);

-- Update menu_section_order
UPDATE restaurants
SET menu_section_order = ARRAY['Breakfast', 'Sweet', 'Savory', 'Bagels']
WHERE name = 'Nat''s Nook';

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Nat''s Nook');

-- Should show 28 dishes
