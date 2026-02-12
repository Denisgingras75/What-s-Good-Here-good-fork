-- MV Salads - Full Menu
-- Run this in Supabase SQL Editor

-- Delete old MV Salads dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'MV Salads');

-- Insert complete menu (8 items)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
-- Salads
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Campground Smok''n Vegan', 'salad', 17.00),
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Campground Smok''n Chicken', 'salad', 25.00),
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Menemsha Lobster Cobb', 'salad', 35.00),
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Mermaid Meadow Summer', 'salad', 19.00),
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'MV BLT', 'salad', 22.00),
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Tivoli Cauliflower', 'salad', 18.00),
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Jaws Special', 'salad', 10.95),
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Fireworks Salad', 'salad', 10.95);

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'MV Salads');

-- Should show 8 dishes
