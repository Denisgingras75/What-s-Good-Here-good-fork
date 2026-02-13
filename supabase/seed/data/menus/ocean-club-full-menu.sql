-- Ocean Club - Full Menu
-- Run this in Supabase SQL Editor
-- IMPORTANT: Delete existing Ocean Club dishes first to avoid duplicates

-- Delete old Ocean Club dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Ocean Club');

-- Insert complete menu (18 items)
INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
-- Mezze
((SELECT id FROM restaurants WHERE name = 'Ocean Club'), 'Za''atar Crusted Focaccia', 'apps', 'Mezze', 6.00),
((SELECT id FROM restaurants WHERE name = 'Ocean Club'), 'Little Gem Caesar', 'salad', 'Mezze', 19.00),
((SELECT id FROM restaurants WHERE name = 'Ocean Club'), 'Whipped Hummus Plate', 'apps', 'Mezze', 22.00),
((SELECT id FROM restaurants WHERE name = 'Ocean Club'), 'Spicy Chicken & Cabbage Soup', 'soup', 'Mezze', 15.00),
((SELECT id FROM restaurants WHERE name = 'Ocean Club'), 'Caprese Arancini', 'apps', 'Mezze', 16.00),
((SELECT id FROM restaurants WHERE name = 'Ocean Club'), 'Prosciutto & Burrata', 'apps', 'Mezze', 24.00),
-- Plats Principaux
((SELECT id FROM restaurants WHERE name = 'Ocean Club'), 'Sicilian Style Anchovy Pasta', 'pasta', 'Plats Principaux', 30.00),
((SELECT id FROM restaurants WHERE name = 'Ocean Club'), 'Halibut Piccata', 'seafood', 'Plats Principaux', 52.00),
((SELECT id FROM restaurants WHERE name = 'Ocean Club'), 'Baked Shells', 'pasta', 'Plats Principaux', 28.00),
((SELECT id FROM restaurants WHERE name = 'Ocean Club'), 'Half Roasted Shawarma Chicken', 'chicken', 'Plats Principaux', 38.00),
((SELECT id FROM restaurants WHERE name = 'Ocean Club'), 'Shrimp & Crab Puttanesca', 'pasta', 'Plats Principaux', 42.00),
((SELECT id FROM restaurants WHERE name = 'Ocean Club'), 'Bouillabaisse', 'seafood', 'Plats Principaux', 29.00),
((SELECT id FROM restaurants WHERE name = 'Ocean Club'), 'Braised Short Rib', 'ribs', 'Plats Principaux', 42.00),
((SELECT id FROM restaurants WHERE name = 'Ocean Club'), 'Prime Brandt Steak Frites', 'steak', 'Plats Principaux', 69.00),
-- Sides
((SELECT id FROM restaurants WHERE name = 'Ocean Club'), 'Sauteed Spinach', 'sides', 'Sides', 15.00),
((SELECT id FROM restaurants WHERE name = 'Ocean Club'), 'Mixed House Pickle Plate', 'sides', 'Sides', 9.00),
((SELECT id FROM restaurants WHERE name = 'Ocean Club'), 'French Fries', 'fries', 'Sides', 12.00),
((SELECT id FROM restaurants WHERE name = 'Ocean Club'), 'Petit Salad', 'salad', 'Sides', 15.00);

-- Update menu_section_order
UPDATE restaurants
SET menu_section_order = ARRAY['Mezze', 'Plats Principaux', 'Sides']
WHERE name = 'Ocean Club';

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Ocean Club');

-- Should show 18 dishes
