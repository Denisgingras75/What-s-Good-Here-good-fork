-- Add dessert dishes to restaurants
-- Run this in Supabase SQL Editor
-- Fill in restaurants + dessert names + prices below

-- Template: uncomment and fill in per restaurant
-- INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
-- ((SELECT id FROM restaurants WHERE name = 'RESTAURANT_NAME'), 'Dessert Name', 'dessert', 'Desserts', 9.99);

-- After inserting desserts, add 'Desserts' to each restaurant's menu_section_order
-- (guard against duplicates)
-- UPDATE restaurants
-- SET menu_section_order = array_append(menu_section_order, 'Desserts')
-- WHERE name = 'RESTAURANT_NAME'
--   AND NOT ('Desserts' = ANY(menu_section_order));

-- ============================================================
-- DESSERTS — fill in below
-- ============================================================

-- Example:
-- INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
-- ((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Key Lime Pie', 'dessert', 'Desserts', 12.95),
-- ((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Brownie Sundae', 'dessert', 'Desserts', 11.95);
--
-- UPDATE restaurants
-- SET menu_section_order = array_append(menu_section_order, 'Desserts')
-- WHERE name = 'Lookout Tavern'
--   AND NOT ('Desserts' = ANY(menu_section_order));

-- Verify:
-- SELECT d.name, d.category, d.menu_section, r.name AS restaurant
-- FROM dishes d JOIN restaurants r ON d.restaurant_id = r.id
-- WHERE d.category = 'dessert'
-- ORDER BY r.name, d.name;
