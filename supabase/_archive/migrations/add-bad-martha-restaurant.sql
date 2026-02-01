-- Add Bad Martha Farmer's Brewery to restaurants table
-- Run this in Supabase SQL Editor
-- Safe to re-run: cleans up duplicates first

-- Remove any existing Bad Martha entries (dishes cascade-delete)
DELETE FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery';

-- Insert restaurant
INSERT INTO restaurants (name, address, lat, lng, cuisine, is_open)
VALUES ('Bad Martha Farmer''s Brewery', '270 Upper Main St, Edgartown, MA 02539', 41.3940, -70.5270, 'american', true);

-- Add dishes (18" pizzas + wings)
WITH bm AS (
  SELECT id FROM restaurants WHERE name = 'Bad Martha Farmer''s Brewery'
)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM bm), 'Cal''s Classic Cheese', 'pizza', 23.99),
((SELECT id FROM bm), 'Poppin'' Pepperoni', 'pizza', 24.99),
((SELECT id FROM bm), 'Beer Bacon', 'pizza', 27.99),
((SELECT id FROM bm), 'Mellow Mushroom', 'pizza', 25.99),
((SELECT id FROM bm), 'Chicken Pesto', 'pizza', 27.99),
((SELECT id FROM bm), 'Veggie Vibes', 'pizza', 27.99),
((SELECT id FROM bm), 'Martharita', 'pizza', 24.99),
((SELECT id FROM bm), 'Sausage Special', 'pizza', 27.99),
((SELECT id FROM bm), 'Wicked Wings (6)', 'wings', null);

-- Verify
SELECT d.name, d.category, d.price
FROM dishes d
JOIN restaurants r ON d.restaurant_id = r.id
WHERE r.name = 'Bad Martha Farmer''s Brewery'
ORDER BY d.category, d.name;
