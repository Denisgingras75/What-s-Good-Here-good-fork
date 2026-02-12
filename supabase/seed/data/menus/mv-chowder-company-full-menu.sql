-- Martha's Vineyard Chowder Company - Full Menu
-- Run this in Supabase SQL Editor
-- NOTE: 3 items excluded due to missing prices

-- Delete old Martha's Vineyard Chowder Company dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company');

-- Insert complete menu (47 items)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
-- Chowder (Cup/Bowl sizes)
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Martha''s Vineyard Clam Chowder (Cup)', 'chowder', 11.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Martha''s Vineyard Clam Chowder (Bowl)', 'chowder', 15.00),

-- Apps
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'MV Lobster Bisque (Cup)', 'apps', 12.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'MV Lobster Bisque (Bowl)', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'French Onion Soup (Cup)', 'apps', 11.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'French Onion Soup (Bowl)', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Our Famous Crab Rangoons', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Lobster Guacamole', 'apps', 19.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Crispy Calamari', 'apps', 19.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Lobster Dumplings', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Clam Stuffers', 'apps', 19.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Mini Crab Cakes', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Seafood Medley Cakes', 'apps', 19.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Skillet Beef Queso Dip', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Blistered Shishito Peppers', 'apps', 17.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Chimichurri Steak Skewers', 'apps', 19.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'House Crispy Mozzarella Wedges', 'apps', 17.00),

-- Sushi
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Blackened Tuna Sashimi', 'sushi', 22.00),

-- Wings
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Chowdah House Wings', 'wings', 17.00),

-- Fries
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Portobello Fries', 'fries', 17.00),

-- Fried Chicken
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Popcorn Chicken', 'fried chicken', 16.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Sea Smoke BBQ Chicken Skewers', 'fried chicken', 18.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Tempura Chicken Breast Tenders', 'fried chicken', 16.00),

-- Salads
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'The Classic Caesar', 'salad', 15.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Watermelon Mint Arugula', 'salad', 16.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Summa Power Salad', 'salad', 17.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Crispy Tofu Salad', 'salad', 19.00),

-- Fish
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Crispy Atlantic Cod Sandwich', 'fish', 19.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Atlantic Cod Fish & Chips', 'fish', 29.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Fried Shrimp Platter', 'fish', 34.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Grilled Swordfish Piccata', 'fish', 29.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Sesame Crusted Ahi Tuna', 'fish', 33.00),

-- Sandwiches
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Grilled Chicken Sandwich', 'sandwich', 19.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Grilled Sirloin Steak Sandwich', 'sandwich', 25.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Hot Honey Chicken Sandwich', 'sandwich', 19.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Truffled Portobello Sandwich', 'sandwich', 19.00),

-- Burgers
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'The Mix Up Burger', 'burger', 25.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'The Rangoon Burger', 'burger', 25.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'The Big Poppa Burger', 'burger', 25.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Half Pound Grilled Burger', 'burger', 19.00),

-- Pasta
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Classic Alfredo Linguine', 'pasta', 28.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Linguine Bolognese', 'pasta', 29.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Vegetarian Rasta Pasta', 'pasta', 28.00),

-- Entrees
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Roasted Truffle Plum Chicken', 'entree', 29.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'The Chowder Co. Ratatouille', 'entree', 29.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Steak Au Poivre', 'entree', 37.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Surf n'' Turf Ribeye', 'entree', 56.00);

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company');

-- Should show 47 dishes
