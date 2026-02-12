-- Add Menu Items for 19 Martha's Vineyard Restaurants
-- Run this in Supabase SQL Editor

-- Coop de Ville (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'New England Clam Chowder', 'chowder', 8.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Coop Cheese Burger', 'burger', 16.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Blackened Mahi Mahi', 'fish', 30.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Lobster Salad Roll', 'lobster roll', 35.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Maryland Style Crab Cakes', 'apps', 20.00);

-- Mo's Lunch (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Roast Pork Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Italian Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Leo Burger', 'burger', 11.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Filet o'' Fish Sandwich', 'sandwich', 12.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Turkey Sandwich', 'sandwich', 16.00);

-- Biscuits (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Biscuits'), 'Chicken & Biscuits', 'fried chicken', 16.00),
((SELECT id FROM restaurants WHERE name = 'Biscuits'), 'Shrimp & Grits', 'fish', 18.00),
((SELECT id FROM restaurants WHERE name = 'Biscuits'), 'Fried Chicken & Waffle', 'fried chicken', 17.00),
((SELECT id FROM restaurants WHERE name = 'Biscuits'), 'Biscuits Benedict', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = 'Biscuits'), 'Buttermilk Pancakes', 'apps', 12.00);

-- Back Door Donuts (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Back Door Donuts'), 'Apple Cider Donut', 'apps', 4.00),
((SELECT id FROM restaurants WHERE name = 'Back Door Donuts'), 'Apple Fritter', 'apps', 9.00),
((SELECT id FROM restaurants WHERE name = 'Back Door Donuts'), 'Boston Cream Donut', 'apps', 3.50),
((SELECT id FROM restaurants WHERE name = 'Back Door Donuts'), 'Maple Bacon Donut', 'apps', 4.00),
((SELECT id FROM restaurants WHERE name = 'Back Door Donuts'), 'Cinnamon Roll', 'apps', 6.50);

-- Bangkok Cuisine (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Pad Thai', 'apps', 19.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Bangkok Fried Rice', 'apps', 18.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Green Curry', 'apps', 20.95),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Crispy Rolls', 'apps', 13.27),
((SELECT id FROM restaurants WHERE name = 'Bangkok Cuisine'), 'Ginger Mix', 'apps', 18.95);

-- TigerHawk Sandwich Company (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Peruvian Chicken Sandwich', 'sandwich', 14.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Steak & Cheese', 'sandwich', 15.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Tuna Melt', 'sandwich', 13.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Turkey Club', 'sandwich', 14.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Veggie Bowl', 'apps', 12.00);

-- Vineyard Caribbean Cuisine (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Vineyard Caribbean Cuisine'), 'Jerk Chicken', 'fried chicken', 16.00),
((SELECT id FROM restaurants WHERE name = 'Vineyard Caribbean Cuisine'), 'Curry Chicken', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = 'Vineyard Caribbean Cuisine'), 'Oxtail', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Vineyard Caribbean Cuisine'), 'Red Snapper', 'fish', 20.00),
((SELECT id FROM restaurants WHERE name = 'Vineyard Caribbean Cuisine'), 'Rice & Peas', 'apps', 8.00);

-- The Sweet Life Café (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'The Sweet Life Café'), 'Pan Roasted Halibut', 'fish', 42.00),
((SELECT id FROM restaurants WHERE name = 'The Sweet Life Café'), 'Duck Confit', 'apps', 38.00),
((SELECT id FROM restaurants WHERE name = 'The Sweet Life Café'), 'Beef Tenderloin', 'apps', 48.00),
((SELECT id FROM restaurants WHERE name = 'The Sweet Life Café'), 'Lobster Risotto', 'apps', 44.00),
((SELECT id FROM restaurants WHERE name = 'The Sweet Life Café'), 'Roasted Chicken', 'fried chicken', 32.00);

-- MV Salads (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Greek Salad', 'apps', 12.00),
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Caesar Salad', 'apps', 11.00),
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Cobb Salad', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Asian Sesame Salad', 'apps', 13.00),
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Southwest Salad', 'apps', 13.00);

-- Waterside Market (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Lobster Roll', 'lobster roll', 32.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Breakfast Burrito', 'apps', 12.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Avocado Toast', 'apps', 11.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Turkey Club', 'sandwich', 13.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Fish Tacos', 'taco', 14.00);

-- ArtCliff Diner (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Clam Chowder', 'chowder', 9.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Blueberry Pancakes', 'apps', 12.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Classic Burger', 'burger', 14.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Fish & Chips', 'fish', 18.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Lobster Benedict', 'apps', 24.00);

-- Garde East (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Garde East'), 'New England Clam Chowder', 'chowder', 14.00),
((SELECT id FROM restaurants WHERE name = 'Garde East'), 'Garde Burger', 'burger', 18.00),
((SELECT id FROM restaurants WHERE name = 'Garde East'), 'Pan Roasted Cod', 'fish', 28.00),
((SELECT id FROM restaurants WHERE name = 'Garde East'), 'Crispy Calamari', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Garde East'), 'Lobster Roll', 'lobster roll', 36.00);

-- Porto Pizza (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Margherita Pizza', 'pizza', 16.00),
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Pepperoni Pizza', 'pizza', 18.00),
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Buffalo Chicken Pizza', 'pizza', 20.00),
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Greek Salad', 'apps', 10.00),
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Garlic Knots', 'apps', 8.00);

-- Alchemy Bistro & Bar (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Alchemy Bistro & Bar'), 'Duck Confit', 'apps', 32.00),
((SELECT id FROM restaurants WHERE name = 'Alchemy Bistro & Bar'), 'Truffle Fries', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Alchemy Bistro & Bar'), 'Lobster Tacos', 'taco', 28.00),
((SELECT id FROM restaurants WHERE name = 'Alchemy Bistro & Bar'), 'Pan Seared Scallops', 'fish', 38.00),
((SELECT id FROM restaurants WHERE name = 'Alchemy Bistro & Bar'), 'Steak Frites', 'apps', 42.00);

-- The Covington (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Clam Chowder', 'chowder', 12.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Covington Burger', 'burger', 22.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Fish & Chips', 'fish', 26.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Crispy Brussels Sprouts', 'apps', 12.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Lobster Roll', 'lobster roll', 38.00);

-- Bettini Restaurant (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Clam Chowder', 'chowder', 14.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Grilled Swordfish', 'fish', 44.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Pan Roasted Chicken', 'fried chicken', 32.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Lobster Ravioli', 'apps', 38.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Caesar Salad', 'apps', 12.00);

-- Atria (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Atria'), 'Seared Tuna', 'fish', 38.00),
((SELECT id FROM restaurants WHERE name = 'Atria'), 'Wagyu Burger', 'burger', 28.00),
((SELECT id FROM restaurants WHERE name = 'Atria'), 'Lobster Risotto', 'apps', 42.00),
((SELECT id FROM restaurants WHERE name = 'Atria'), 'Beet Salad', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Atria'), 'Pan-Seared Scallops', 'fish', 44.00);

-- L'etoile Restaurant (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'L''etoile Restaurant'), 'Seared Scallops', 'fish', 42.00),
((SELECT id FROM restaurants WHERE name = 'L''etoile Restaurant'), 'Beef Bourguignon', 'apps', 48.00),
((SELECT id FROM restaurants WHERE name = 'L''etoile Restaurant'), 'Lobster Bisque', 'chowder', 16.00),
((SELECT id FROM restaurants WHERE name = 'L''etoile Restaurant'), 'Duck Breast', 'apps', 44.00),
((SELECT id FROM restaurants WHERE name = 'L''etoile Restaurant'), 'Foie Gras', 'apps', 28.00);

-- State Road (5 dishes)
INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'State Road'), 'Clam Chowder', 'chowder', 15.00),
((SELECT id FROM restaurants WHERE name = 'State Road'), 'State Road Burger', 'burger', 24.00),
((SELECT id FROM restaurants WHERE name = 'State Road'), 'Pan Roasted Halibut', 'fish', 42.00),
((SELECT id FROM restaurants WHERE name = 'State Road'), 'Fried Chicken', 'fried chicken', 32.00),
((SELECT id FROM restaurants WHERE name = 'State Road'), 'Brussels Sprouts', 'apps', 14.00);

-- Verify all dishes were added
SELECT
  r.name as restaurant,
  COUNT(d.id) as dish_count
FROM restaurants r
LEFT JOIN dishes d ON r.id = d.restaurant_id
WHERE r.name IN (
  'Coop de Ville', 'Mo''s Lunch', 'Biscuits', 'Back Door Donuts', 'Bangkok Cuisine',
  'TigerHawk Sandwich Company', 'Vineyard Caribbean Cuisine', 'The Sweet Life Café', 'MV Salads',
  'Waterside Market', 'ArtCliff Diner', 'Garde East', 'Porto Pizza',
  'Alchemy Bistro & Bar', 'The Covington', 'Bettini Restaurant', 'Atria', 'L''etoile Restaurant', 'State Road'
)
GROUP BY r.name
ORDER BY r.name;
