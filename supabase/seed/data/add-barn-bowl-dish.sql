-- Add Chicken Nuggets to The Barn Bowl & Bistro
INSERT INTO dishes (restaurant_id, name, category, price)
VALUES (
  (SELECT id FROM restaurants WHERE name = 'The Barn Bowl & Bistro'),
  'Chicken Nuggets',
  'tendys',
  10.00
);

-- Verify
SELECT d.name as dish, d.category, d.price, r.name as restaurant
FROM dishes d
JOIN restaurants r ON d.restaurant_id = r.id
WHERE r.name = 'The Barn Bowl & Bistro' AND d.name = 'Chicken Nuggets';
