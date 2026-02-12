-- What's Good Here - Seed Data
-- Sample restaurants and dishes for Mission District, San Francisco
-- Run this AFTER schema.sql

-- Clear existing data (use with caution in production!)
-- TRUNCATE restaurants CASCADE;

-- ============================================
-- RESTAURANTS
-- ============================================

INSERT INTO restaurants (name, address, lat, lng) VALUES
-- Mexican/Latin
('La Taqueria', '2889 Mission St, San Francisco, CA 94110', 37.7520, -122.4187),
('El Farolito', '2779 Mission St, San Francisco, CA 94110', 37.7531, -122.4181),
('Taqueria Cancun', '2288 Mission St, San Francisco, CA 94110', 37.7597, -122.4189),
('Papalote Mexican Grill', '3409 24th St, San Francisco, CA 94110', 37.7524, -122.4216),
('Loló', '3230 22nd St, San Francisco, CA 94110', 37.7555, -122.4199),

-- Pizza
('Pizzeria Delfina', '3611 18th St, San Francisco, CA 94110', 37.7619, -122.4251),
('Flour + Water', '2401 Harrison St, San Francisco, CA 94110', 37.7585, -122.4125),
('The Pizza Place on Noriega', '3901 Noriega St, San Francisco, CA 94122', 37.7537, -121.4978),

-- Burgers
('Causwells', '2346 Chestnut St, San Francisco, CA 94123', 37.7997, -122.4391),
('Umami Burger', '2184 Union St, San Francisco, CA 94123', 37.7977, -122.4323),
('Roam Artisan Burgers', '1785 Union St, San Francisco, CA 94123', 37.7982, -122.4272),

-- Asian
('Mission Chinese Food', '2234 Mission St, San Francisco, CA 94110', 37.7601, -122.4191),
('Ichi Sushi', '3369 Mission St, San Francisco, CA 94110', 37.7456, -122.4208),
('Saru Sushi Bar', '3856 24th St, San Francisco, CA 94114', 37.7516, -122.4278),
('Burma Superstar', '309 Clement St, San Francisco, CA 94118', 37.7826, -122.4639),

-- Breakfast/Brunch
('Tartine Bakery', '600 Guerrero St, San Francisco, CA 94110', 37.7610, -122.4237),
('Plow', '1299 18th St, San Francisco, CA 94107', 37.7630, -122.3972),
('Just For You Cafe', '732 22nd St, San Francisco, CA 94107', 37.7574, -122.3882),

-- Sandwiches
('Ike''s Love & Sandwiches', '3489 16th St, San Francisco, CA 94114', 37.7651, -122.4258),
('The Sentinel', '37 New Montgomery St, San Francisco, CA 94105', 37.7881, -122.4009),
('Bi-Rite Market', '3639 18th St, San Francisco, CA 94110', 37.7617, -122.4255),

-- Salads/Healthy
('Souvla', '517 Hayes St, San Francisco, CA 94102', 37.7767, -122.4242),
('The Plant Cafe', '3352 Steiner St, San Francisco, CA 94123', 37.7999, -122.4373),

-- BBQ/American
('4505 Burgers & BBQ', '705 Divisadero St, San Francisco, CA 94117', 37.7754, -122.4376),
('Memphis Minnie''s BBQ Joint', '576 Haight St, San Francisco, CA 94117', 37.7725, -122.4308),

-- Coffee/Bakery
('Craftsman and Wolves', '746 Valencia St, San Francisco, CA 94110', 37.7606, -122.4212),
('Arsicault Bakery', '397 Arguello Blvd, San Francisco, CA 94118', 37.7836, -122.4589),
('Mr. Holmes Bakehouse', '1042 Larkin St, San Francisco, CA 94109', 37.7850, -122.4183),

-- Seafood
('Anchor Oyster Bar', '579 Castro St, San Francisco, CA 94114', 37.7609, -122.4349),
('Swan Oyster Depot', '1517 Polk St, San Francisco, CA 94109', 37.7924, -122.4207);

-- ============================================
-- DISHES
-- ============================================

-- La Taqueria
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'La Taqueria'), 'Carne Asada Burrito', 'burrito', 12.50, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800'),
((SELECT id FROM restaurants WHERE name = 'La Taqueria'), 'Al Pastor Tacos', 'taco', 9.00, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800'),
((SELECT id FROM restaurants WHERE name = 'La Taqueria'), 'Carnitas Quesadilla', 'burrito', 11.00, 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=800'),
((SELECT id FROM restaurants WHERE name = 'La Taqueria'), 'Veggie Burrito', 'burrito', 10.50, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800');

-- El Farolito
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'El Farolito'), 'Super Burrito', 'burrito', 11.00, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800'),
((SELECT id FROM restaurants WHERE name = 'El Farolito'), 'Quesadilla Suiza', 'burrito', 10.00, 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=800'),
((SELECT id FROM restaurants WHERE name = 'El Farolito'), 'Chicken Tacos', 'taco', 8.50, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800');

-- Taqueria Cancun
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Taqueria Cancun'), 'Fish Burrito', 'burrito', 12.00, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800'),
((SELECT id FROM restaurants WHERE name = 'Taqueria Cancun'), 'Chorizo Breakfast Burrito', 'burrito', 11.50, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800'),
((SELECT id FROM restaurants WHERE name = 'Taqueria Cancun'), 'Shrimp Tacos', 'taco', 10.00, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800');

-- Papalote Mexican Grill
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Papalote Mexican Grill'), 'Carne Asada Burrito', 'burrito', 13.00, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800'),
((SELECT id FROM restaurants WHERE name = 'Papalote Mexican Grill'), 'Nachos with Chicken', 'burrito', 12.00, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800'),
((SELECT id FROM restaurants WHERE name = 'Papalote Mexican Grill'), 'Soyrizo Burrito', 'burrito', 12.50, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800');

-- Loló
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Loló'), 'Duck Carnitas Tacos', 'taco', 15.00, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800'),
((SELECT id FROM restaurants WHERE name = 'Loló'), 'Ceviche', 'salad', 14.00, 'https://images.unsplash.com/photo-1580217593608-61931cefc821?w=800'),
((SELECT id FROM restaurants WHERE name = 'Loló'), 'Elote', 'salad', 8.00, 'https://images.unsplash.com/photo-1551462147-37fed0eb86ca?w=800');

-- Pizzeria Delfina
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Pizzeria Delfina'), 'Margherita Pizza', 'pizza', 18.00, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800'),
((SELECT id FROM restaurants WHERE name = 'Pizzeria Delfina'), 'Salsiccia Pizza', 'pizza', 20.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'),
((SELECT id FROM restaurants WHERE name = 'Pizzeria Delfina'), 'Funghi Pizza', 'pizza', 19.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'),
((SELECT id FROM restaurants WHERE name = 'Pizzeria Delfina'), 'Arugula Salad', 'salad', 12.00, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800');

-- Flour + Water
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Flour + Water'), 'Margherita Pizza', 'pizza', 17.00, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800'),
((SELECT id FROM restaurants WHERE name = 'Flour + Water'), 'Tagliatelle Bolognese', 'pasta', 24.00, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800'),
((SELECT id FROM restaurants WHERE name = 'Flour + Water'), 'Burrata Salad', 'salad', 16.00, 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800'),
((SELECT id FROM restaurants WHERE name = 'Flour + Water'), 'Pappardelle al Ragu', 'pasta', 26.00, 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800');

-- Causwells
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Causwells'), 'Classic Cheeseburger', 'burger', 16.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'),
((SELECT id FROM restaurants WHERE name = 'Causwells'), 'Truffle Fries', 'burger', 10.00, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800'),
((SELECT id FROM restaurants WHERE name = 'Causwells'), 'Chicken Sandwich', 'sandwich', 15.00, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800');

-- Umami Burger
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Umami Burger'), 'Umami Burger', 'burger', 14.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'),
((SELECT id FROM restaurants WHERE name = 'Umami Burger'), 'Truffle Burger', 'burger', 17.00, 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800'),
((SELECT id FROM restaurants WHERE name = 'Umami Burger'), 'Sweet Potato Fries', 'burger', 8.00, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800');

-- Roam Artisan Burgers
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Roam Artisan Burgers'), 'Signature Roam Burger', 'burger', 13.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'),
((SELECT id FROM restaurants WHERE name = 'Roam Artisan Burgers'), 'Turkey Burger', 'burger', 12.00, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800'),
((SELECT id FROM restaurants WHERE name = 'Roam Artisan Burgers'), 'Bison Burger', 'burger', 15.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'),
((SELECT id FROM restaurants WHERE name = 'Roam Artisan Burgers'), 'Onion Rings', 'burger', 7.00, 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=800');

-- Mission Chinese Food
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Mission Chinese Food'), 'Kung Pao Pastrami', 'burger', 18.00, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800'),
((SELECT id FROM restaurants WHERE name = 'Mission Chinese Food'), 'Salt Cod Fried Rice', 'burger', 16.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800'),
((SELECT id FROM restaurants WHERE name = 'Mission Chinese Food'), 'Thrice Cooked Bacon', 'burger', 17.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800');

-- Ichi Sushi
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Ichi Sushi'), 'Omakase (Chef''s Choice)', 'sushi', 80.00, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800'),
((SELECT id FROM restaurants WHERE name = 'Ichi Sushi'), 'Spicy Tuna Roll', 'sushi', 12.00, 'https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=800'),
((SELECT id FROM restaurants WHERE name = 'Ichi Sushi'), 'Salmon Sashimi', 'sushi', 15.00, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800'),
((SELECT id FROM restaurants WHERE name = 'Ichi Sushi'), 'California Roll', 'sushi', 10.00, 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800');

-- Saru Sushi Bar
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Saru Sushi Bar'), 'Rainbow Roll', 'sushi', 14.00, 'https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=800'),
((SELECT id FROM restaurants WHERE name = 'Saru Sushi Bar'), 'Dragon Roll', 'sushi', 15.00, 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800'),
((SELECT id FROM restaurants WHERE name = 'Saru Sushi Bar'), 'Tuna Tataki', 'sushi', 16.00, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800');

-- Burma Superstar
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Burma Superstar'), 'Tea Leaf Salad', 'salad', 13.00, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'),
((SELECT id FROM restaurants WHERE name = 'Burma Superstar'), 'Rainbow Salad', 'salad', 12.00, 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800'),
((SELECT id FROM restaurants WHERE name = 'Burma Superstar'), 'Chicken Curry', 'burger', 15.00, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800'),
((SELECT id FROM restaurants WHERE name = 'Burma Superstar'), 'Garlic Noodles', 'pasta', 14.00, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800');

-- Tartine Bakery
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Tartine Bakery'), 'Morning Bun', 'sandwich', 5.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'),
((SELECT id FROM restaurants WHERE name = 'Tartine Bakery'), 'Croissant', 'sandwich', 4.50, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800'),
((SELECT id FROM restaurants WHERE name = 'Tartine Bakery'), 'Croque Monsieur', 'sandwich', 14.00, 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800'),
((SELECT id FROM restaurants WHERE name = 'Tartine Bakery'), 'Country Bread', 'sandwich', 12.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800');

-- Plow
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Plow'), 'Lemon Ricotta Pancakes', 'sandwich', 16.00, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800'),
((SELECT id FROM restaurants WHERE name = 'Plow'), 'Plow Potatoes', 'sandwich', 9.00, 'https://images.unsplash.com/photo-1573049906867-c2b18c3b9a93?w=800'),
((SELECT id FROM restaurants WHERE name = 'Plow'), 'Breakfast Sandwich', 'sandwich', 14.00, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800');

-- Just For You Cafe
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Just For You Cafe'), 'Chicken & Waffles', 'sandwich', 17.00, 'https://images.unsplash.com/photo-1562007908-17c67e878c88?w=800'),
((SELECT id FROM restaurants WHERE name = 'Just For You Cafe'), 'Beignets', 'sandwich', 8.00, 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800'),
((SELECT id FROM restaurants WHERE name = 'Just For You Cafe'), 'Eggs Benedict', 'sandwich', 15.00, 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=800');

-- Ike's Love & Sandwiches
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Ike''s Love & Sandwiches'), 'Matt Cain', 'sandwich', 11.00, 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800'),
((SELECT id FROM restaurants WHERE name = 'Ike''s Love & Sandwiches'), 'Menage a Trois', 'sandwich', 12.00, 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=800'),
((SELECT id FROM restaurants WHERE name = 'Ike''s Love & Sandwiches'), 'Going Home with Ike', 'sandwich', 11.50, 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800');

-- The Sentinel
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'The Sentinel'), 'Chicken Parm Sandwich', 'sandwich', 13.00, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800'),
((SELECT id FROM restaurants WHERE name = 'The Sentinel'), 'Meatball Sub', 'sandwich', 12.00, 'https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?w=800'),
((SELECT id FROM restaurants WHERE name = 'The Sentinel'), 'Cuban Sandwich', 'sandwich', 13.50, 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800');

-- Bi-Rite Market
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Bi-Rite Market'), 'Turkey Avocado Sandwich', 'sandwich', 10.00, 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800'),
((SELECT id FROM restaurants WHERE name = 'Bi-Rite Market'), 'Roast Beef Sandwich', 'sandwich', 11.00, 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=800'),
((SELECT id FROM restaurants WHERE name = 'Bi-Rite Market'), 'Caprese Sandwich', 'sandwich', 9.50, 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800');

-- Souvla
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Souvla'), 'Greek Salad', 'salad', 12.00, 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800'),
((SELECT id FROM restaurants WHERE name = 'Souvla'), 'Lamb Souvlaki', 'salad', 15.00, 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800'),
((SELECT id FROM restaurants WHERE name = 'Souvla'), 'Fro-Yo', 'salad', 7.00, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800'),
((SELECT id FROM restaurants WHERE name = 'Souvla'), 'Chicken Pita', 'sandwich', 13.00, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800');

-- The Plant Cafe
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'The Plant Cafe'), 'Kale Caesar Salad', 'salad', 14.00, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'),
((SELECT id FROM restaurants WHERE name = 'The Plant Cafe'), 'Quinoa Bowl', 'salad', 15.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'),
((SELECT id FROM restaurants WHERE name = 'The Plant Cafe'), 'Avocado Toast', 'sandwich', 12.00, 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=800');

-- 4505 Burgers & BBQ
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = '4505 Burgers & BBQ'), 'Classic Cheeseburger', 'burger', 12.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'),
((SELECT id FROM restaurants WHERE name = '4505 Burgers & BBQ'), 'Brisket Sandwich', 'sandwich', 14.00, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'),
((SELECT id FROM restaurants WHERE name = '4505 Burgers & BBQ'), 'Pulled Pork Sandwich', 'sandwich', 13.00, 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=800'),
((SELECT id FROM restaurants WHERE name = '4505 Burgers & BBQ'), 'Chicharrones', 'burger', 8.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800');

-- Memphis Minnie's BBQ Joint
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Memphis Minnie''s BBQ Joint'), 'BBQ Ribs Plate', 'burger', 22.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800'),
((SELECT id FROM restaurants WHERE name = 'Memphis Minnie''s BBQ Joint'), 'Pulled Pork Plate', 'burger', 18.00, 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=800'),
((SELECT id FROM restaurants WHERE name = 'Memphis Minnie''s BBQ Joint'), 'Smoked Chicken', 'burger', 16.00, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800');

-- Craftsman and Wolves
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Craftsman and Wolves'), 'The Rebel Within', 'sandwich', 7.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'),
((SELECT id FROM restaurants WHERE name = 'Craftsman and Wolves'), 'Kouign Amann', 'sandwich', 6.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800'),
((SELECT id FROM restaurants WHERE name = 'Craftsman and Wolves'), 'Chocolate Croissant', 'sandwich', 5.50, 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=800');

-- Arsicault Bakery
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Arsicault Bakery'), 'Almond Croissant', 'sandwich', 5.50, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800'),
((SELECT id FROM restaurants WHERE name = 'Arsicault Bakery'), 'Plain Croissant', 'sandwich', 4.00, 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=800'),
((SELECT id FROM restaurants WHERE name = 'Arsicault Bakery'), 'Ham & Cheese Croissant', 'sandwich', 7.00, 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800');

-- Mr. Holmes Bakehouse
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Mr. Holmes Bakehouse'), 'Cruffin', 'sandwich', 6.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'),
((SELECT id FROM restaurants WHERE name = 'Mr. Holmes Bakehouse'), 'Matcha Croissant', 'sandwich', 5.50, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800'),
((SELECT id FROM restaurants WHERE name = 'Mr. Holmes Bakehouse'), 'Chocolate Cruffin', 'sandwich', 6.50, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800');

-- Anchor Oyster Bar
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Anchor Oyster Bar'), 'Oysters on the Half Shell (6)', 'sushi', 18.00, 'https://images.unsplash.com/photo-1567608285099-bd5c800e8633?w=800'),
((SELECT id FROM restaurants WHERE name = 'Anchor Oyster Bar'), 'Clam Chowder', 'salad', 12.00, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800'),
((SELECT id FROM restaurants WHERE name = 'Anchor Oyster Bar'), 'Lobster Roll', 'sandwich', 28.00, 'https://images.unsplash.com/photo-1546960572-c8732e3df3c5?w=800');

-- Swan Oyster Depot
INSERT INTO dishes (restaurant_id, name, category, price, photo_url) VALUES
((SELECT id FROM restaurants WHERE name = 'Swan Oyster Depot'), 'Oysters (Half Dozen)', 'sushi', 16.00, 'https://images.unsplash.com/photo-1567608285099-bd5c800e8633?w=800'),
((SELECT id FROM restaurants WHERE name = 'Swan Oyster Depot'), 'Crab Salad', 'salad', 25.00, 'https://images.unsplash.com/photo-1580217593608-61931cefc821?w=800'),
((SELECT id FROM restaurants WHERE name = 'Swan Oyster Depot'), 'Smoked Salmon Plate', 'sushi', 22.00, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800'),
((SELECT id FROM restaurants WHERE name = 'Swan Oyster Depot'), 'Clam Chowder', 'salad', 11.00, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800');
