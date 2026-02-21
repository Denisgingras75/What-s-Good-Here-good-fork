-- Nantucket Restaurants + Signature Dishes Seed
-- 40 restaurants with 3-6 signature dishes each
-- Run this in Supabase SQL Editor
-- Safe to re-run: uses ON CONFLICT for restaurants, ON CONFLICT DO NOTHING for dishes

-- ============================================
-- NANTUCKET RESTAURANTS
-- ============================================

INSERT INTO restaurants (name, address, lat, lng, town, cuisine) VALUES
-- FINE DINING
('The Chanticleer', '9 New St, Siasconset, MA 02564', 41.2608, -69.9610, 'Siasconset', 'French'),
('Company of the Cauldron', '5 India St, Nantucket, MA 02554', 41.2835, -70.0990, 'Nantucket', 'Fine Dining'),
('Straight Wharf Restaurant', '6 Harbor Square, Nantucket, MA 02554', 41.2833, -70.0961, 'Nantucket', 'Seafood'),
('Galley Beach', '54 Jefferson Ave, Nantucket, MA 02554', 41.2870, -70.1070, 'Nantucket', 'Fine Dining'),
('Topper''s at The Wauwinet', '120 Wauwinet Rd, Nantucket, MA 02584', 41.3180, -70.0220, 'Wauwinet', 'Fine Dining'),
('Le Languedoc', '24 Broad St, Nantucket, MA 02554', 41.2828, -70.0985, 'Nantucket', 'French'),
('Ventuno', '21 Federal St, Nantucket, MA 02554', 41.2840, -70.0990, 'Nantucket', 'Italian'),

-- CONTEMPORARY / MID-RANGE
('The Nautilus', '12 Cambridge St, Nantucket, MA 02554', 41.2842, -70.0975, 'Nantucket', 'Asian Fusion'),
('The Pearl', '12 Federal St, Nantucket, MA 02554', 41.2838, -70.0985, 'Nantucket', 'Asian Fusion'),
('Boarding House', '12 Federal St, Nantucket, MA 02554', 41.2837, -70.0984, 'Nantucket', 'American'),
('Queequeg''s', '6 Oak St, Nantucket, MA 02554', 41.2850, -70.0995, 'Nantucket', 'American'),
('Dune', '20 Broad St, Nantucket, MA 02554', 41.2829, -70.0983, 'Nantucket', 'American'),
('Lola 41', '15 S Beach St, Nantucket, MA 02554', 41.2825, -70.0975, 'Nantucket', 'Sushi'),
('Proprietors Bar & Table', '9 India St, Nantucket, MA 02554', 41.2836, -70.0992, 'Nantucket', 'American'),
('Greydon House', '17 Broad St, Nantucket, MA 02554', 41.2830, -70.0980, 'Nantucket', 'American'),
('Pi Pizzeria', '11 W Creek Rd, Nantucket, MA 02554', 41.2855, -70.1010, 'Nantucket', 'Pizza'),
('Or, The Whale', '3 Union St, Nantucket, MA 02554', 41.2843, -70.0978, 'Nantucket', 'American'),

-- SEAFOOD / RAW BAR
('CRU Nantucket', '1 Straight Wharf, Nantucket, MA 02554', 41.2832, -70.0958, 'Nantucket', 'Seafood'),
('167 Raw', '167 Lower Orange St, Nantucket, MA 02554', 41.2820, -70.0940, 'Nantucket', 'Raw Bar'),
('Sayle''s Seafood', '99 Washington St Extension, Nantucket, MA 02554', 41.2790, -70.1050, 'Nantucket', 'Seafood'),
('The Lobster Trap', '23 Washington St, Nantucket, MA 02554', 41.2843, -70.1000, 'Nantucket', 'Seafood'),
('SeaGrille', '45 Sparks Ave, Nantucket, MA 02554', 41.2800, -70.1020, 'Nantucket', 'Seafood'),
('Millie''s', '326 Madaket Rd, Nantucket, MA 02554', 41.2710, -70.1660, 'Madaket', 'Mexican/Seafood'),

-- CASUAL / POPULAR
('Something Natural', '50 Cliff Rd, Nantucket, MA 02554', 41.2870, -70.1060, 'Nantucket', 'Bakery/Deli'),
('The Juice Bar', '12 Broad St, Nantucket, MA 02554', 41.2831, -70.0978, 'Nantucket', 'Ice Cream'),
('Stubbys', '8 Broad St, Nantucket, MA 02554', 41.2830, -70.0976, 'Nantucket', 'American'),
('Easy Street Cantina', '2 Broad St, Nantucket, MA 02554', 41.2829, -70.0972, 'Nantucket', 'Mexican'),
('Brotherhood of Thieves', '23 Broad St, Nantucket, MA 02554', 41.2827, -70.0988, 'Nantucket', 'American'),
('Fog Island Cafe', '7 S Water St, Nantucket, MA 02554', 41.2835, -70.0968, 'Nantucket', 'Cafe'),
('Black-Eyed Susan''s', '10 India St, Nantucket, MA 02554', 41.2837, -70.0993, 'Nantucket', 'American'),
('Centre Street Bistro', '29 Centre St, Nantucket, MA 02554', 41.2845, -70.0998, 'Nantucket', 'Cafe'),
('Provisions', '3 Harbor Square, Nantucket, MA 02554', 41.2833, -70.0962, 'Nantucket', 'Deli'),
('Wicked Island Bakery', '14 Old South Rd, Nantucket, MA 02554', 41.2740, -70.1000, 'Nantucket', 'Bakery'),

-- PUB / BAR FOOD
('The Chicken Box', '16 Dave St, Nantucket, MA 02554', 41.2780, -70.1005, 'Nantucket', 'Bar/American'),
('Cisco Brewers', '5 Bartlett Farm Rd, Nantucket, MA 02554', 41.2560, -70.1120, 'Nantucket', 'Brewery'),
('The Rose & Crown', '23 S Water St, Nantucket, MA 02554', 41.2833, -70.0965, 'Nantucket', 'Pub'),

-- SIASCONSET / OTHER
('The Summer House', '17 Ocean Ave, Siasconset, MA 02564', 41.2610, -69.9620, 'Siasconset', 'American'),
('Sconset Cafe', '8 Main St, Siasconset, MA 02564', 41.2605, -69.9605, 'Siasconset', 'Cafe'),
('Sandbar at Jetties Beach', '4 Bathing Beach Rd, Nantucket, MA 02554', 41.2880, -70.1050, 'Nantucket', 'American'),
('Faregrounds', '27 Fairgrounds Rd, Nantucket, MA 02554', 41.2720, -70.1030, 'Nantucket', 'American')
ON CONFLICT (name) DO UPDATE SET
  address = EXCLUDED.address,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  town = EXCLUDED.town,
  cuisine = EXCLUDED.cuisine;

-- ============================================
-- SIGNATURE DISHES
-- ============================================

-- The Chanticleer
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'The Chanticleer'), 'Lobster Soufflé', 'apps', 38.00),
((SELECT id FROM restaurants WHERE name = 'The Chanticleer'), 'Seared Foie Gras', 'apps', 42.00),
((SELECT id FROM restaurants WHERE name = 'The Chanticleer'), 'Rack of Lamb', 'entree', 58.00),
((SELECT id FROM restaurants WHERE name = 'The Chanticleer'), 'Dover Sole Meunière', 'fish', 62.00),
((SELECT id FROM restaurants WHERE name = 'The Chanticleer'), 'Crème Brûlée', 'dessert', 16.00)
ON CONFLICT DO NOTHING;

-- Company of the Cauldron
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Company of the Cauldron'), 'Prix Fixe Appetizer Trio', 'apps', 28.00),
((SELECT id FROM restaurants WHERE name = 'Company of the Cauldron'), 'Beef Wellington', 'entree', 52.00),
((SELECT id FROM restaurants WHERE name = 'Company of the Cauldron'), 'Pan-Seared Halibut', 'fish', 48.00),
((SELECT id FROM restaurants WHERE name = 'Company of the Cauldron'), 'Chocolate Lava Cake', 'dessert', 16.00)
ON CONFLICT DO NOTHING;

-- Straight Wharf Restaurant
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Straight Wharf Restaurant'), 'Nantucket Bay Scallops', 'fish', 44.00),
((SELECT id FROM restaurants WHERE name = 'Straight Wharf Restaurant'), 'Lobster Risotto', 'entree', 48.00),
((SELECT id FROM restaurants WHERE name = 'Straight Wharf Restaurant'), 'Grilled Swordfish', 'fish', 46.00),
((SELECT id FROM restaurants WHERE name = 'Straight Wharf Restaurant'), 'Oysters on the Half Shell', 'apps', 24.00),
((SELECT id FROM restaurants WHERE name = 'Straight Wharf Restaurant'), 'Blueberry Tart', 'dessert', 14.00)
ON CONFLICT DO NOTHING;

-- Galley Beach
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Galley Beach'), 'Lobster Thermidor', 'fish', 58.00),
((SELECT id FROM restaurants WHERE name = 'Galley Beach'), 'Tuna Tartare', 'apps', 28.00),
((SELECT id FROM restaurants WHERE name = 'Galley Beach'), 'Wagyu Beef', 'entree', 68.00),
((SELECT id FROM restaurants WHERE name = 'Galley Beach'), 'Sunset Cocktail & Raw Bar Platter', 'apps', 65.00)
ON CONFLICT DO NOTHING;

-- Topper's at The Wauwinet
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Topper''s at The Wauwinet'), 'Lobster Tasting Menu', 'fish', 72.00),
((SELECT id FROM restaurants WHERE name = 'Topper''s at The Wauwinet'), 'Pan-Seared Scallops', 'fish', 48.00),
((SELECT id FROM restaurants WHERE name = 'Topper''s at The Wauwinet'), 'Wagyu Tartare', 'apps', 32.00),
((SELECT id FROM restaurants WHERE name = 'Topper''s at The Wauwinet'), 'Truffle Risotto', 'entree', 42.00)
ON CONFLICT DO NOTHING;

-- Le Languedoc
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Le Languedoc'), 'Duck Confit', 'entree', 38.00),
((SELECT id FROM restaurants WHERE name = 'Le Languedoc'), 'Steak Frites', 'entree', 44.00),
((SELECT id FROM restaurants WHERE name = 'Le Languedoc'), 'Escargots', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Le Languedoc'), 'Onion Soup Gratinée', 'apps', 14.00)
ON CONFLICT DO NOTHING;

-- Ventuno
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Ventuno'), 'Handmade Pappardelle', 'pasta', 36.00),
((SELECT id FROM restaurants WHERE name = 'Ventuno'), 'Branzino', 'fish', 44.00),
((SELECT id FROM restaurants WHERE name = 'Ventuno'), 'Burrata & Prosciutto', 'apps', 22.00),
((SELECT id FROM restaurants WHERE name = 'Ventuno'), 'Tiramisu', 'dessert', 14.00)
ON CONFLICT DO NOTHING;

-- The Nautilus
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'The Nautilus'), 'Crispy Whole Fish', 'fish', 42.00),
((SELECT id FROM restaurants WHERE name = 'The Nautilus'), 'Short Rib Bao Buns', 'apps', 22.00),
((SELECT id FROM restaurants WHERE name = 'The Nautilus'), 'Tuna Crudo', 'sushi', 24.00),
((SELECT id FROM restaurants WHERE name = 'The Nautilus'), 'Coconut Curry Mussels', 'apps', 26.00),
((SELECT id FROM restaurants WHERE name = 'The Nautilus'), 'Crispy Duck Salad', 'salad', 28.00)
ON CONFLICT DO NOTHING;

-- The Pearl
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'The Pearl'), 'Wok-Charred Lobster', 'fish', 52.00),
((SELECT id FROM restaurants WHERE name = 'The Pearl'), 'Tuna Tartare Tacos', 'taco', 26.00),
((SELECT id FROM restaurants WHERE name = 'The Pearl'), 'Asian Pear Salad', 'salad', 18.00),
((SELECT id FROM restaurants WHERE name = 'The Pearl'), 'Miso-Glazed Chilean Sea Bass', 'fish', 48.00)
ON CONFLICT DO NOTHING;

-- Boarding House
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Boarding House'), 'Lobster & Truffle Mac', 'pasta', 38.00),
((SELECT id FROM restaurants WHERE name = 'Boarding House'), 'Fried Oysters', 'apps', 22.00),
((SELECT id FROM restaurants WHERE name = 'Boarding House'), 'Grilled Pork Chop', 'entree', 42.00),
((SELECT id FROM restaurants WHERE name = 'Boarding House'), 'Raw Bar Tower', 'apps', 55.00)
ON CONFLICT DO NOTHING;

-- Queequeg's
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Queequeg''s'), 'Lobster Roll', 'lobster roll', 32.00),
((SELECT id FROM restaurants WHERE name = 'Queequeg''s'), 'Pan-Roasted Cod', 'fish', 34.00),
((SELECT id FROM restaurants WHERE name = 'Queequeg''s'), 'Mushroom Risotto', 'entree', 28.00),
((SELECT id FROM restaurants WHERE name = 'Queequeg''s'), 'Clam Chowder', 'chowder', 14.00)
ON CONFLICT DO NOTHING;

-- Dune
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Dune'), 'Fried Chicken Sandwich', 'sandwich', 22.00),
((SELECT id FROM restaurants WHERE name = 'Dune'), 'Lobster BLT', 'lobster roll', 34.00),
((SELECT id FROM restaurants WHERE name = 'Dune'), 'Seared Tuna Bowl', 'sushi', 28.00),
((SELECT id FROM restaurants WHERE name = 'Dune'), 'Fish Tacos', 'taco', 20.00)
ON CONFLICT DO NOTHING;

-- Lola 41
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Lola 41'), 'Spicy Tuna Roll', 'sushi', 22.00),
((SELECT id FROM restaurants WHERE name = 'Lola 41'), 'Lobster Pad Thai', 'entree', 38.00),
((SELECT id FROM restaurants WHERE name = 'Lola 41'), 'Wagyu Sliders', 'burger', 28.00),
((SELECT id FROM restaurants WHERE name = 'Lola 41'), 'Crispy Rice & Tuna', 'sushi', 24.00)
ON CONFLICT DO NOTHING;

-- Proprietors Bar & Table
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Proprietors Bar & Table'), 'Smoked Fish Dip', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Proprietors Bar & Table'), 'Braised Short Rib', 'entree', 42.00),
((SELECT id FROM restaurants WHERE name = 'Proprietors Bar & Table'), 'Lobster Arancini', 'apps', 24.00),
((SELECT id FROM restaurants WHERE name = 'Proprietors Bar & Table'), 'Wood-Fired Mushroom Pizza', 'pizza', 22.00)
ON CONFLICT DO NOTHING;

-- Greydon House
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Greydon House'), 'Tuna Crudo', 'sushi', 22.00),
((SELECT id FROM restaurants WHERE name = 'Greydon House'), 'Roasted Chicken', 'entree', 36.00),
((SELECT id FROM restaurants WHERE name = 'Greydon House'), 'Greydon Burger', 'burger', 24.00),
((SELECT id FROM restaurants WHERE name = 'Greydon House'), 'Seasonal Risotto', 'entree', 32.00)
ON CONFLICT DO NOTHING;

-- Pi Pizzeria
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Pi Pizzeria'), 'Margherita Pizza', 'pizza', 18.00),
((SELECT id FROM restaurants WHERE name = 'Pi Pizzeria'), 'White Clam Pizza', 'pizza', 24.00),
((SELECT id FROM restaurants WHERE name = 'Pi Pizzeria'), 'Meatball Sub', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Pi Pizzeria'), 'Caesar Salad', 'salad', 14.00)
ON CONFLICT DO NOTHING;

-- Or, The Whale
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Or, The Whale'), 'Cheeseburger', 'burger', 22.00),
((SELECT id FROM restaurants WHERE name = 'Or, The Whale'), 'Fish & Chips', 'fish', 26.00),
((SELECT id FROM restaurants WHERE name = 'Or, The Whale'), 'Crispy Brussels Sprouts', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Or, The Whale'), 'Lobster Roll', 'lobster roll', 34.00)
ON CONFLICT DO NOTHING;

-- CRU Nantucket
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'CRU Nantucket'), 'Oyster Plateau', 'apps', 48.00),
((SELECT id FROM restaurants WHERE name = 'CRU Nantucket'), 'Grilled Whole Fish', 'fish', 52.00),
((SELECT id FROM restaurants WHERE name = 'CRU Nantucket'), 'Lobster Roll', 'lobster roll', 36.00),
((SELECT id FROM restaurants WHERE name = 'CRU Nantucket'), 'Rosé All Day Frosé', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'CRU Nantucket'), 'Tuna Tartare', 'sushi', 26.00)
ON CONFLICT DO NOTHING;

-- 167 Raw
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = '167 Raw'), 'Lobster Roll', 'lobster roll', 34.00),
((SELECT id FROM restaurants WHERE name = '167 Raw'), 'Oysters on the Half Shell', 'apps', 22.00),
((SELECT id FROM restaurants WHERE name = '167 Raw'), 'Poke Bowl', 'sushi', 24.00),
((SELECT id FROM restaurants WHERE name = '167 Raw'), 'Fish Tacos', 'taco', 20.00),
((SELECT id FROM restaurants WHERE name = '167 Raw'), 'Shrimp Ceviche', 'apps', 18.00)
ON CONFLICT DO NOTHING;

-- Sayle's Seafood
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Sayle''s Seafood'), 'Lobster Roll', 'lobster roll', 28.00),
((SELECT id FROM restaurants WHERE name = 'Sayle''s Seafood'), 'Fried Clam Plate', 'clams', 26.00),
((SELECT id FROM restaurants WHERE name = 'Sayle''s Seafood'), 'Fish & Chips', 'fish', 22.00),
((SELECT id FROM restaurants WHERE name = 'Sayle''s Seafood'), 'Clam Chowder', 'chowder', 12.00)
ON CONFLICT DO NOTHING;

-- The Lobster Trap
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'The Lobster Trap'), '1.5 lb Steamed Lobster', 'fish', 42.00),
((SELECT id FROM restaurants WHERE name = 'The Lobster Trap'), 'Lobster Roll', 'lobster roll', 30.00),
((SELECT id FROM restaurants WHERE name = 'The Lobster Trap'), 'New England Clam Chowder', 'chowder', 12.00),
((SELECT id FROM restaurants WHERE name = 'The Lobster Trap'), 'Baked Stuffed Lobster', 'fish', 48.00),
((SELECT id FROM restaurants WHERE name = 'The Lobster Trap'), 'Fried Calamari', 'apps', 16.00)
ON CONFLICT DO NOTHING;

-- SeaGrille
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'SeaGrille'), 'Grilled Swordfish', 'fish', 38.00),
((SELECT id FROM restaurants WHERE name = 'SeaGrille'), 'Baked Stuffed Shrimp', 'fish', 36.00),
((SELECT id FROM restaurants WHERE name = 'SeaGrille'), 'Raw Bar Sampler', 'apps', 42.00),
((SELECT id FROM restaurants WHERE name = 'SeaGrille'), 'Nantucket Bay Scallops', 'fish', 40.00)
ON CONFLICT DO NOTHING;

-- Millie's
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Millie''s'), 'Fish Tacos', 'taco', 18.00),
((SELECT id FROM restaurants WHERE name = 'Millie''s'), 'Lobster Quesadilla', 'apps', 28.00),
((SELECT id FROM restaurants WHERE name = 'Millie''s'), 'Madaket Sunset Margarita', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Millie''s'), 'Baja Burrito', 'burrito', 20.00)
ON CONFLICT DO NOTHING;

-- Something Natural
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Something Natural'), 'Herb Chicken Sandwich', 'sandwich', 14.00),
((SELECT id FROM restaurants WHERE name = 'Something Natural'), 'Turkey & Avocado', 'sandwich', 15.00),
((SELECT id FROM restaurants WHERE name = 'Something Natural'), 'Chocolate Chip Cookie', 'dessert', 4.00),
((SELECT id FROM restaurants WHERE name = 'Something Natural'), 'Portuguese Bread Sandwich', 'sandwich', 13.00)
ON CONFLICT DO NOTHING;

-- The Juice Bar
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'The Juice Bar'), 'Homemade Ice Cream Cone', 'dessert', 8.00),
((SELECT id FROM restaurants WHERE name = 'The Juice Bar'), 'Hot Fudge Sundae', 'dessert', 12.00),
((SELECT id FROM restaurants WHERE name = 'The Juice Bar'), 'Frappe', 'dessert', 10.00),
((SELECT id FROM restaurants WHERE name = 'The Juice Bar'), 'Frozen Lemonade', 'dessert', 7.00)
ON CONFLICT DO NOTHING;

-- Stubbys
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Stubbys'), 'Smash Burger', 'burger', 14.00),
((SELECT id FROM restaurants WHERE name = 'Stubbys'), 'Chicken Fingers', 'apps', 12.00),
((SELECT id FROM restaurants WHERE name = 'Stubbys'), 'Loaded Fries', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Stubbys'), 'Milkshake', 'dessert', 10.00)
ON CONFLICT DO NOTHING;

-- Easy Street Cantina
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Easy Street Cantina'), 'Fish Tacos', 'taco', 16.00),
((SELECT id FROM restaurants WHERE name = 'Easy Street Cantina'), 'Nachos Grande', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Easy Street Cantina'), 'Lobster Burrito', 'burrito', 26.00),
((SELECT id FROM restaurants WHERE name = 'Easy Street Cantina'), 'Quesadilla', 'apps', 14.00)
ON CONFLICT DO NOTHING;

-- Brotherhood of Thieves
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Brotherhood of Thieves'), 'Pub Burger', 'burger', 18.00),
((SELECT id FROM restaurants WHERE name = 'Brotherhood of Thieves'), 'Fish & Chips', 'fish', 22.00),
((SELECT id FROM restaurants WHERE name = 'Brotherhood of Thieves'), 'New England Clam Chowder', 'chowder', 12.00),
((SELECT id FROM restaurants WHERE name = 'Brotherhood of Thieves'), 'Curly Fries', 'apps', 10.00),
((SELECT id FROM restaurants WHERE name = 'Brotherhood of Thieves'), 'Wings', 'wings', 16.00)
ON CONFLICT DO NOTHING;

-- Fog Island Cafe
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Fog Island Cafe'), 'Lobster Quiche', 'apps', 22.00),
((SELECT id FROM restaurants WHERE name = 'Fog Island Cafe'), 'Breakfast Burrito', 'burrito', 16.00),
((SELECT id FROM restaurants WHERE name = 'Fog Island Cafe'), 'Cranberry Scone', 'dessert', 6.00),
((SELECT id FROM restaurants WHERE name = 'Fog Island Cafe'), 'Eggs Benedict', 'apps', 18.00)
ON CONFLICT DO NOTHING;

-- Black-Eyed Susan's
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Black-Eyed Susan''s'), 'Corn Cakes with Salsa', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Black-Eyed Susan''s'), 'Sourdough French Toast', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Black-Eyed Susan''s'), 'Thai Curry Mussels', 'fish', 24.00),
((SELECT id FROM restaurants WHERE name = 'Black-Eyed Susan''s'), 'Pan-Seared Halibut', 'fish', 36.00)
ON CONFLICT DO NOTHING;

-- Centre Street Bistro
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Centre Street Bistro'), 'Eggs Benedict', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Centre Street Bistro'), 'Lobster Omelet', 'apps', 26.00),
((SELECT id FROM restaurants WHERE name = 'Centre Street Bistro'), 'Blueberry Pancakes', 'apps', 16.00)
ON CONFLICT DO NOTHING;

-- Provisions
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Provisions'), 'Turkey Cranberry Sandwich', 'sandwich', 14.00),
((SELECT id FROM restaurants WHERE name = 'Provisions'), 'Lobster Roll', 'lobster roll', 28.00),
((SELECT id FROM restaurants WHERE name = 'Provisions'), 'Fresh Baked Cookie', 'dessert', 4.00)
ON CONFLICT DO NOTHING;

-- Wicked Island Bakery
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Wicked Island Bakery'), 'Morning Glory Muffin', 'dessert', 5.00),
((SELECT id FROM restaurants WHERE name = 'Wicked Island Bakery'), 'Cinnamon Roll', 'dessert', 6.00),
((SELECT id FROM restaurants WHERE name = 'Wicked Island Bakery'), 'Breakfast Sandwich', 'sandwich', 12.00)
ON CONFLICT DO NOTHING;

-- The Chicken Box
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'The Chicken Box'), 'Fried Chicken Bucket', 'fried chicken', 22.00),
((SELECT id FROM restaurants WHERE name = 'The Chicken Box'), 'Wings', 'wings', 16.00),
((SELECT id FROM restaurants WHERE name = 'The Chicken Box'), 'Chicken Tenders', 'apps', 14.00)
ON CONFLICT DO NOTHING;

-- Cisco Brewers
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Cisco Brewers'), 'Whale''s Tale Pale Ale', 'apps', 9.00),
((SELECT id FROM restaurants WHERE name = 'Cisco Brewers'), 'Grey Lady', 'apps', 9.00),
((SELECT id FROM restaurants WHERE name = 'Cisco Brewers'), 'Pizza', 'pizza', 18.00),
((SELECT id FROM restaurants WHERE name = 'Cisco Brewers'), 'Pretzel & Beer Cheese', 'apps', 14.00)
ON CONFLICT DO NOTHING;

-- The Rose & Crown
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'The Rose & Crown'), 'Fish & Chips', 'fish', 20.00),
((SELECT id FROM restaurants WHERE name = 'The Rose & Crown'), 'Pub Burger', 'burger', 18.00),
((SELECT id FROM restaurants WHERE name = 'The Rose & Crown'), 'Nachos', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'The Rose & Crown'), 'Wings', 'wings', 16.00)
ON CONFLICT DO NOTHING;

-- The Summer House
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'The Summer House'), 'Lobster Bisque', 'chowder', 18.00),
((SELECT id FROM restaurants WHERE name = 'The Summer House'), 'Pan-Seared Halibut', 'fish', 44.00),
((SELECT id FROM restaurants WHERE name = 'The Summer House'), 'Filet Mignon', 'entree', 52.00),
((SELECT id FROM restaurants WHERE name = 'The Summer House'), 'Sconset Sunset Cocktail', 'apps', 18.00)
ON CONFLICT DO NOTHING;

-- Sconset Cafe
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Sconset Cafe'), 'Blueberry Pancakes', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Sconset Cafe'), 'Lobster Roll', 'lobster roll', 30.00),
((SELECT id FROM restaurants WHERE name = 'Sconset Cafe'), 'Clam Chowder', 'chowder', 12.00)
ON CONFLICT DO NOTHING;

-- Sandbar at Jetties Beach
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Sandbar at Jetties Beach'), 'Fish Tacos', 'taco', 18.00),
((SELECT id FROM restaurants WHERE name = 'Sandbar at Jetties Beach'), 'Lobster Roll', 'lobster roll', 32.00),
((SELECT id FROM restaurants WHERE name = 'Sandbar at Jetties Beach'), 'Frozen Margarita', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Sandbar at Jetties Beach'), 'Fried Calamari', 'apps', 16.00)
ON CONFLICT DO NOTHING;

-- Faregrounds
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Faregrounds'), 'Smash Burger', 'burger', 16.00),
((SELECT id FROM restaurants WHERE name = 'Faregrounds'), 'Lobster Roll', 'lobster roll', 30.00),
((SELECT id FROM restaurants WHERE name = 'Faregrounds'), 'Fried Chicken Sandwich', 'sandwich', 18.00),
((SELECT id FROM restaurants WHERE name = 'Faregrounds'), 'Milkshake', 'dessert', 10.00)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFY
-- ============================================
SELECT town, COUNT(*) as restaurant_count
FROM restaurants
WHERE town IN ('Nantucket', 'Siasconset', 'Madaket', 'Wauwinet')
GROUP BY town
ORDER BY restaurant_count DESC;

SELECT COUNT(*) as total_nantucket_dishes
FROM dishes d
JOIN restaurants r ON d.restaurant_id = r.id
WHERE r.town IN ('Nantucket', 'Siasconset', 'Madaket', 'Wauwinet');
