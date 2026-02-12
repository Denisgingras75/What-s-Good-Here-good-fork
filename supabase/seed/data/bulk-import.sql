-- Bulk Import Script
-- Generated from all-dishes.csv
-- Total dishes: 614

-- Found 28 restaurants

-- TigerHawk Sandwich Company (33 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Biggie Smalls', 'breakfast sandwich', 10.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Early Bird', 'breakfast sandwich', 11.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Rise and Shine', 'breakfast sandwich', 13.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'B.E.A.C.H. Please', 'breakfast sandwich', 14.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'K-Pop in the Morning', 'breakfast sandwich', 13.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Egg Banh Mi', 'breakfast sandwich', 13.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Avocado Toast', 'breakfast', 13.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Seared Tofu K-Pop Star Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Seared Tofu & Shiitake Shroom Banh Mi Sandwich', 'sandwich', 15.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Crispy Parmesan Grilled Cheese', 'sandwich', 12.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Hawk Style Fried Chicken Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Chad''s Style Fried Chicken Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Tiger Style Fried Chicken Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Krispy K-Pop Fried Chicken Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Teriyaki Beef Banh Mi', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Teriyaki Chicken Banh Mi', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Fried Chicken Banh Mi', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Pork Belly Banh Mi', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'In Da Club', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Pac''s Pollo', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'K-Pop Star', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Notorious P.B.L.T.', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Cheesesteak Bomb', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Fried Chicken Caesar Wrap', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Biscuit Fried Chicken', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Banh Mi Style Salad', 'salad', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Caesar Salad', 'salad', 13.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Chicken Tenders & Fries', 'tendys', 15.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Teriyaki Beef Poke Bowl', 'pokebowl', 18.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Teriyaki Chicken Poke Bowl', 'pokebowl', 18.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Fried Chicken Poke Bowl', 'pokebowl', 17.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Pork Belly Poke Bowl', 'pokebowl', 18.00),
((SELECT id FROM restaurants WHERE name = 'TigerHawk Sandwich Company'), 'Tuna Poke Bowl', 'pokebowl', 26.00);


-- Mo's Lunch (26 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Mo''s Lunch');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Roast Pork Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Italian Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Cauliflower Melt', 'sandwich', 15.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Chickpea Salad Sandwich', 'sandwich', 14.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Turkey Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Beef Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Cold Tuna Sub', 'sandwich', 14.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Tuna Melt', 'sandwich', 14.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Banh Mi', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Filet o'' Fish', 'sandwich', 12.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Leo Burger', 'burger', 11.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Waffle Fries', 'fries', 16.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Chopped Salad', 'salad', 15.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Kale Caesar Salad', 'salad', 15.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Nicoise Salad', 'salad', 18.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Side Salad', 'salad', 8.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Country Pate', 'apps', 20.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Tinned Fish', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Today''s Cheese', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Smoked Bluefish Pate', 'apps', 21.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Mortadella', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Meat + Cheese', 'apps', 22.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Broccoli Rabe', 'apps', 9.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Polenta Frys', 'apps', 9.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Onion Rings', 'apps', 9.00),
((SELECT id FROM restaurants WHERE name = 'Mo''s Lunch'), 'Pickles', 'apps', 7.00);


-- Coop de Ville (34 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Coop de Ville');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'New England Clam Chowder Cup', 'chowder', 8.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'New England Clam Chowder Bowl', 'chowder', 10.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Stuffed Quahogs', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Peel n Eat Shrimp Half Pound', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Peel n Eat Shrimp One Pound', 'apps', 30.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'LJ''s Famous Fried Pickles', 'apps', 12.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Popcorn Chicken', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Popcorn Shrimp', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Local Hand-dug Steamers', 'apps', 32.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Coconut Shrimp', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Maryland Style Crab Cakes', 'apps', 20.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Clam Strip Basket', 'fish', 19.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Beer Battered Shrimp Basket', 'fish', 18.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Whole Belly Clam Basket', 'fish', 29.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Fresh Sea Scallop Basket', 'fish', 26.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Popcorn Shrimp Basket', 'fish', 17.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Blackened Mahi Mahi', 'fish', 30.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Popcorn Chicken Basket', 'fried chicken', 17.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'BBQ Ribs Half Rack', 'entree', 23.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'BBQ Ribs Full Rack', 'entree', 44.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Marinated Steak Tip', 'entree', 33.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Pulled Pork BBQ Sandwich', 'sandwich', 15.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Cod Fish Sandwich', 'sandwich', 18.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Grilled Marinated Chicken Sandwich', 'sandwich', 15.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Fried Whole Belly Clam Roll', 'sandwich', 29.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Fried Scallop Roll', 'sandwich', 24.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Pearl Beef Dog', 'sandwich', 13.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Grilled Steak Tip Sub', 'sandwich', 19.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Blackened Mahi Mahi Sandwich', 'sandwich', 20.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Tuna Melt', 'sandwich', 15.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Coop Cheese Burger', 'burger', 16.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Beyond Burger', 'burger', 16.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Lobster Salad Roll', 'lobster roll', 35.00),
((SELECT id FROM restaurants WHERE name = 'Coop de Ville'), 'Wings', 'wings', 19.00);


-- Martha's Vineyard Chowder Company (47 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Martha''s Vineyard Clam Chowder (Cup)', 'chowder', 11.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Martha''s Vineyard Clam Chowder (Bowl)', 'chowder', 15.00),
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
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Blackened Tuna Sashimi', 'sushi', 22.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Chowdah House Wings', 'wings', 17.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Portobello Fries', 'fries', 17.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Popcorn Chicken', 'fried chicken', 16.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Sea Smoke BBQ Chicken Skewers', 'fried chicken', 18.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Tempura Chicken Breast Tenders', 'fried chicken', 16.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'The Classic Caesar', 'salad', 15.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Watermelon Mint Arugula', 'salad', 16.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Summa Power Salad', 'salad', 17.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Crispy Tofu Salad', 'salad', 19.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Crispy Atlantic Cod Sandwich', 'fish', 19.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Atlantic Cod Fish & Chips', 'fish', 29.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Fried Shrimp Platter', 'fish', 34.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Grilled Swordfish Piccata', 'fish', 29.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Sesame Crusted Ahi Tuna', 'fish', 33.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Grilled Chicken Sandwich', 'sandwich', 19.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Grilled Sirloin Steak Sandwich', 'sandwich', 25.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Hot Honey Chicken Sandwich', 'sandwich', 19.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Truffled Portobello Sandwich', 'sandwich', 19.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'The Mix Up Burger', 'burger', 25.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'The Rangoon Burger', 'burger', 25.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'The Big Poppa Burger', 'burger', 25.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Half Pound Grilled Burger', 'burger', 19.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Classic Alfredo Linguine', 'pasta', 28.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Linguine Bolognese', 'pasta', 29.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Vegetarian Rasta Pasta', 'pasta', 28.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Roasted Truffle Plum Chicken', 'entree', 29.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'The Chowder Co. Ratatouille', 'entree', 29.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Steak Au Poivre', 'entree', 37.00),
((SELECT id FROM restaurants WHERE name = 'Martha''s Vineyard Chowder Company'), 'Surf n'' Turf Ribeye', 'entree', 56.00);


-- Lookout Tavern (69 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Lookout Tavern');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Hummus Plate', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Bruschetta', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Ahi Tuna Poke', 'apps', 22.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Chips & Salsa', 'apps', 12.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Chips & Guacamole', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Chips & Queso', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Quesadilla', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Fried Calamari', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Chicken Wings', 'wings', 17.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Nachos', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Mozzarella Sticks', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Onion Rings', 'apps', 12.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'New England Clam Chowder', 'chowder', 14.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Stuffed Quahogs', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Steamed Clams', 'apps', 22.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Oysters Half Dozen', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Oysters Dozen', 'apps', 32.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Shrimp Cocktail', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Raw Bar Combo', 'apps', 45.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Peel & Eat Shrimp', 'apps', 20.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Ceviche', 'apps', 19.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Caesar Salad', 'salad', 14.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'House Salad', 'salad', 12.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Greek Salad', 'salad', 16.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Caprese Salad', 'salad', 16.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Cobb Salad', 'salad', 18.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Taco Salad', 'salad', 17.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Baja Fish Taco', 'taco', 18.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Grilled Fish Taco', 'taco', 18.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Shrimp Taco', 'taco', 19.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Steak Taco', 'taco', 19.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Chicken Taco', 'taco', 17.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Carnitas Taco', 'taco', 17.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Veggie Taco', 'taco', 15.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Blackened Tuna Taco', 'taco', 20.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Cheese Pizza', 'pizza', 16.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Pepperoni Pizza', 'pizza', 18.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Veggie Pizza', 'pizza', 19.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Margherita Pizza', 'pizza', 18.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'BBQ Chicken Pizza', 'pizza', 20.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Meat Lovers Pizza', 'pizza', 22.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'White Pizza', 'pizza', 19.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Buffalo Chicken Pizza', 'pizza', 20.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Lookout Burger', 'burger', 17.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Bacon Cheeseburger', 'burger', 19.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Mushroom Swiss Burger', 'burger', 18.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Veggie Burger', 'burger', 16.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Turkey Burger', 'burger', 17.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Fried Chicken Sandwich', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Grilled Chicken Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Fish Sandwich', 'sandwich', 18.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Lobster Roll', 'lobster roll', 38.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Pulled Pork Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Steak & Cheese', 'sandwich', 18.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Philly Cheesesteak', 'sandwich', 18.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Italian Sub', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Club Sandwich', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Tuna Melt', 'sandwich', 15.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'BLT', 'sandwich', 14.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Fish & Chips', 'fish', 24.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Fried Shrimp', 'fish', 26.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Fried Scallops', 'fish', 28.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Seafood Platter', 'fish', 38.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Grilled Salmon', 'fish', 28.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Fish Tacos', 'taco', 18.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Lobster Mac & Cheese', 'pasta', 32.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Chicken Tenders', 'tendys', 16.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Steak Tips', 'entree', 32.00),
((SELECT id FROM restaurants WHERE name = 'Lookout Tavern'), 'Baby Back Ribs', 'entree', 28.00);


-- Nancy's Restaurant (47 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'New England Clam Chowder', 'chowder', 9.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Shrimp Nancy''s', 'apps', 21.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Fried Calamari', 'apps', 21.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Scallops Wrapped in Bacon', 'apps', 18.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'PEI Mussels', 'apps', 25.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Hummus or Baba Ganoush', 'apps', 15.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Mediterranean Sampler', 'apps', 25.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Chowder Fries', 'fries', 16.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Nancy''s Wings', 'wings', 19.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Smash Burger', 'burger', 19.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Salmon BLT', 'fish', 26.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Fried Fish Sandwich', 'fish', 19.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Joe''s Chicken Sandwich', 'sandwich', 22.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Buffalo Chicken Wrap', 'fried chicken', 19.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Greek Wrap', 'sandwich', 18.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Fish or Shrimp Tacos', 'taco', 22.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Fish & Chips', 'fish', 29.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Jumbo Shrimp', 'fish', 30.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Sea Scallops', 'fish', 31.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Clam Strips', 'fish', 32.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Clam Bellies', 'fish', 44.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Seafood Plate', 'fish', 48.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Lobster Mac & Cheese', 'lobster', 39.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Cold Lobster Roll', 'lobster roll', 30.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Hot Lobster Roll', 'lobster roll', 32.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Steamed Lobster', 'lobster', 39.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Baked Cod', 'fish', 34.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Baked Scallops', 'fish', 37.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Broiled Seafood Plate', 'fish', 39.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Shrimp Scampi', 'fish', 28.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Salmon', 'fish', 35.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Mediterranean Chicken Plate', 'entree', 29.95),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Shumai', 'sushi', 12.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Gyoza', 'sushi', 12.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Tuna Avo Salad', 'sushi', 18.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Seared Peppered Tuna', 'sushi', 19.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Ceviche', 'sushi', 19.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Sushi Sandwich', 'sushi', 18.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Nancy''s Roll', 'sushi', 26.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Volcano Roll', 'sushi', 26.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Dragon Roll', 'sushi', 20.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Sneaky Steve Roll', 'sushi', 26.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Amazing Roll', 'sushi', 25.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Rainbow Roll', 'sushi', 22.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'MV Roll', 'sushi', 26.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Katama Roll', 'sushi', 26.00),
((SELECT id FROM restaurants WHERE name = 'Nancy''s Restaurant'), 'Coconut Shrimp Roll', 'sushi', 23.00);


-- Offshore Ale Company (36 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Offshore Ale Company');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'New England Clam Chowder', 'chowder', 12.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Offshore Chili', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'French Onion Soup', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Tomato Soup', 'apps', 9.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Guacamole and Chips', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Grilled Brie', 'apps', 19.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Buffalo Cauliflower', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Bavarian Pretzel Sticks', 'apps', 10.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Steamed PEI Mussels', 'apps', 25.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Hand-Cut Fries', 'fries', 13.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Truffle Fries', 'fries', 17.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Wings', 'wings', 20.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Chicken Tenders', 'tendys', 20.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Knife and Fork Fried Chicken Sandwich', 'fried chicken', 24.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Power Bowl', 'salad', 20.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Caesar Salad', 'salad', 17.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Pub Salad', 'salad', 17.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Fish and Chips', 'fish', 30.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Fish Sandwich', 'fish', 24.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Salmon BLT', 'fish', 25.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Tuna Poke', 'fish', 34.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Grilled Cheese and Tomato Soup', 'sandwich', 18.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Tavern Burger', 'burger', 20.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Turkey Burger', 'burger', 23.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Classic Cheese Pizza', 'pizza', 21.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'BBQ Chicken Pizza', 'pizza', 26.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Meat Lovers Pizza', 'pizza', 26.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Veggie Pizza', 'pizza', 24.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Hawaiian Pizza', 'pizza', 25.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Margherita Pizza', 'pizza', 23.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Chicken Pesto Pizza', 'pizza', 25.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Potato Pizza', 'pizza', 26.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Chicken Quesadilla', 'taco', 23.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Steak Quesadilla', 'taco', 25.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Veggie Quesadilla', 'taco', 22.00),
((SELECT id FROM restaurants WHERE name = 'Offshore Ale Company'), 'Baby Back Ribs', 'entree', 30.00);


-- MV Salads (8 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'MV Salads');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Campground Smok''n Vegan', 'salad', 17.00),
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Campground Smok''n Chicken', 'salad', 25.00),
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Menemsha Lobster Cobb', 'salad', 35.00),
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Mermaid Meadow Summer', 'salad', 19.00),
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'MV BLT', 'salad', 22.00),
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Tivoli Cauliflower', 'salad', 18.00),
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Jaws Special', 'salad', 10.95),
((SELECT id FROM restaurants WHERE name = 'MV Salads'), 'Fireworks Salad', 'salad', 10.95);


-- Black Dog (23 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Black Dog');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Classic Chowder', 'chowder', 12.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Onion Rings', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Jalapeno Popper Puffs', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Spinach Artichoke Dip', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Chicken Wings', 'wings', 17.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Chicken Tenders', 'tendys', 18.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Drunken Sailor Shrimp', 'fish', 18.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Fish and Chips', 'fish', 30.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Garlic and Herb Panko Cod', 'fish', 34.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Roasted Salmon', 'fish', 35.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Harvest Salad', 'salad', 18.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Caesar Salad', 'salad', 17.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Vineyard Cobb', 'salad', 18.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'House Salad', 'salad', 15.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Beef and Mushroom Pot Pie', 'entree', 30.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Steak Tips', 'entree', 34.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Rosemary and Apple Cider Braised Chicken', 'entree', 33.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Steak Frites', 'entree', 33.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Butternut Squash Ravioli', 'pasta', 23.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Sausage Broccoli Cavatelli', 'pasta', 25.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Cipolla Carmalizzata', 'pasta', 24.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'Smash Burger', 'burger', 28.00),
((SELECT id FROM restaurants WHERE name = 'Black Dog'), 'French Fries', 'fries', 7.00);


-- 9 Craft Kitchen and Bar (36 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Filet Mignon Deviled Eggs', 'apps', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Fried Chicken Bao Bun', 'fried chicken', 15.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Herbed Ricotta Cheese', 'apps', 13.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Mussels Puttanesca', 'apps', 22.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Spicy Tuna Lettuce Wraps', 'apps', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Lobster Tostadas', 'apps', 22.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Sesame Chicken Bites', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Corn & Cheddar Fritters', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Oak Smoked Pork Belly', 'apps', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Foie Gras Sausage', 'apps', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Bacon Lollipop Bouquet', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'House Caesar', 'salad', 16.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Olive Oil Poached Niçoise Salad', 'salad', 24.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Strawberry Fields', 'salad', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Arcadia Green Salad', 'salad', 15.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Warm Spinach Salad', 'salad', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Roasted Cauliflower Salad', 'salad', 19.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Chowder', 'chowder', 14.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Smoked Tomato Bisque', 'chowder', 14.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'French Fries', 'fries', 12.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Lamb Ragout Rigatoni', 'pasta', 37.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Pappardelle Bourguignon', 'pasta', 37.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Lobster Crawfish Risotto', 'pasta', 42.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Parmesan Koginut Squash Risotto', 'pasta', 34.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Cast-Iron Baked Gnocchi', 'pasta', 29.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Scottish Salmon', 'fish', 36.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Miso Cod', 'fish', 36.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Swordfish Steak', 'fish', 39.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Filet Mignon', 'entree', 49.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Chicken Tagine (Serves 2)', 'entree', 49.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Dry-Aged Pork Chop', 'entree', 42.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Wagyu Skirt Steak', 'entree', 56.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Slow Braised Short Rib', 'entree', 42.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Chicken Thigh Schnitzel', 'entree', 27.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'Boneless Prime Ribeye', 'entree', 69.00),
((SELECT id FROM restaurants WHERE name = '9 Craft Kitchen and Bar'), 'The Burger', 'burger', 26.00);


-- Beach Road (18 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Beach Road');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'New England Clam Chowder', 'chowder', 17.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Daily Bread', 'apps', 12.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Cast Iron Cornbread', 'apps', 12.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Fig Toast', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Blistered Shishitos', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Beet Roulade', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Charred Savoy Cabbage', 'apps', 19.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Autumn Salad', 'salad', 21.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Caesar Salad', 'salad', 19.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Tempura Shrimp', 'fish', 20.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Bouillabaisse', 'fish', 50.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Atlantic Halibut', 'fish', 48.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Sugar Pumpkin & Mushroom Mafaldine', 'pasta', 42.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Lamb Chops', 'entree', 26.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Berkshire Pork Chop', 'entree', 48.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Braised Short Rib', 'entree', 47.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Hot Dog', 'sandwich', 24.00),
((SELECT id FROM restaurants WHERE name = 'Beach Road'), 'Fried Chicken', 'fried chicken', 38.00);


-- The Attic (34 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Attic');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Short Rib Poutine', 'apps', 23.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Crispy Sweet Chili Brussel Sprouts', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Fried Cheese Curds', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Waterside''s House Potato Chips', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Beer Battered Onion Rings', 'apps', 17.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'French Onion Soup', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Soup of the Day', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Attic Wings', 'wings', 12.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Tuna Tartar', 'fish', 26.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Portuguese Mussels', 'fish', 25.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'House-made Crab Cakes', 'fish', 22.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Fried Codfish Sandwich', 'fish', 25.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Hoisin Glazed Salmon Rice Bowl', 'fish', 38.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Fish & Chips', 'fish', 30.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Attic Salad', 'salad', 22.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Butternut Squash & Spinach Salad', 'salad', 22.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Caesar Salad', 'salad', 20.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Side Salad', 'salad', 12.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Classic Burger', 'burger', 24.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Attic Smash Burger', 'burger', 24.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Veggie Burger', 'burger', 23.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Turkey Burger', 'burger', 24.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Mr. Bowen', 'burger', 27.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Black & Bleu Burger', 'burger', 27.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Firehouse Burger', 'burger', 27.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Attic Fried Chicken Sandwich', 'sandwich', 24.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Pulled Pork Sandwich', 'sandwich', 25.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'American Wagyu Hot Dog', 'sandwich', 23.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Lobster Roll', 'lobster roll', 38.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), '12 oz Prime N.Y. Strip', 'entree', 57.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Herb Roasted 1/2 Chicken', 'entree', 35.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Harissa Roasted Cauliflower', 'entree', 30.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Classic Mac & Cheese', 'pasta', 20.00),
((SELECT id FROM restaurants WHERE name = 'The Attic'), 'Hand-cut Fries', 'fries', 10.00);


-- Waterside Market (25 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Waterside Market');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Breakfast Sandwich', 'breakfast sandwich', 8.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Breakfast Burrito', 'breakfast sandwich', 13.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Skinny Wrap', 'breakfast sandwich', 13.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Traditional Breakfast', 'breakfast', 14.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Flapjacks', 'breakfast', 14.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Tex-Mex', 'breakfast', 20.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Eggs Benedict', 'breakfast', 19.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Lobster Benedict', 'breakfast', 36.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Cinnamon French Toast', 'breakfast', 14.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Avocado Toast', 'breakfast', 16.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Smoked Salmon & Tomato Caper Salsa', 'breakfast', 20.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Farmhouse', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'John Alden', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Red White & Green', 'sandwich', 15.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'C.A.B.', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Italian', 'sandwich', 17.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'French Quarter', 'sandwich', 18.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'B.L.T. "The Best!"', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Lucy Vincent', 'sandwich', 16.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Lobster Roll', 'lobster roll', 36.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Hand-Cut French Fries', 'fries', 9.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Cobb Salad', 'salad', 18.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Kale Chicken Caesar', 'salad', 16.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Strawberry Quinoa', 'salad', 20.00),
((SELECT id FROM restaurants WHERE name = 'Waterside Market'), 'Greek Salad', 'salad', 18.00);


-- Porto Pizza (8 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Porto Pizza');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Veggie Pizza', 'pizza', 20.00),
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'White Pizza', 'pizza', 20.00),
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Bacon Jalapeño Pizza', 'pizza', 20.00),
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Linguica Peppers Pizza', 'pizza', 20.00),
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Deep Dish Pepperoni', 'pizza', 20.00),
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Deep Dish BBQ Pizza', 'pizza', 20.00),
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Cheese Pizza', 'pizza', 20.00),
((SELECT id FROM restaurants WHERE name = 'Porto Pizza'), 'Pepperoni Pizza', 'pizza', 20.00);


-- Town Bar (27 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Town Bar');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Clam Chowder', 'chowder', 12.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Popcorn Chicken', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Coconut Shrimp', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Mac Fritters', 'apps', 13.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Fried Pickles', 'apps', 11.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Seasonal Soup', 'apps', 12.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Pretzel Bites', 'apps', 10.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Big Mac Sliders', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Truffle Street Corn Nachos', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Town Triple Sampler', 'apps', 20.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Chicken Wings', 'wings', 13.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Sesame Ginger Crunch', 'salad', 16.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Harvest Bowl', 'salad', 18.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Nashville Hot Chicken Salad', 'salad', 20.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Town Burger', 'burger', 20.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Smash Burger', 'burger', 19.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Southern Bird', 'fried chicken', 17.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Bulgogi Steak N Cheese', 'sandwich', 20.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Green Goddess', 'sandwich', 19.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Spicy Baja Fish Sandwich', 'fish', 19.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Spicy Baja Fish & Chips', 'fish', 29.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Pistachio Salmon', 'fish', 38.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Brazilian Steak Tips', 'entree', 32.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Cider-Glazed Pork Chop', 'entree', 28.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Cilantro Lime Chicken', 'entree', 26.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Adults Kids Meal', 'entree', 30.00),
((SELECT id FROM restaurants WHERE name = 'Town Bar'), 'Gnocchi Cacio e Pepe', 'pasta', 28.00);


-- Alchemy Bistro & Bar (7 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Alchemy Bistro & Bar');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Alchemy Bistro & Bar'), 'Duck Confit', 'entree', 32.00),
((SELECT id FROM restaurants WHERE name = 'Alchemy Bistro & Bar'), 'Truffle Fries', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Alchemy Bistro & Bar'), 'Lobster Tacos', 'taco', 28.00),
((SELECT id FROM restaurants WHERE name = 'Alchemy Bistro & Bar'), 'Pan Seared Scallops', 'fish', 38.00),
((SELECT id FROM restaurants WHERE name = 'Alchemy Bistro & Bar'), 'Steak Frites', 'entree', 42.00),
((SELECT id FROM restaurants WHERE name = 'Alchemy Bistro & Bar'), 'Roasted Boneless Half-Chicken', 'fried chicken', 48.00),
((SELECT id FROM restaurants WHERE name = 'Alchemy Bistro & Bar'), 'Blackened Lobster Tail', 'entree', 74.00);


-- ArtCliff Diner (5 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'ArtCliff Diner');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Clam Chowder', 'chowder', 9.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Blueberry Pancakes', 'breakfast', 12.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Classic Burger', 'burger', 14.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Fish & Chips', 'fish', 18.00),
((SELECT id FROM restaurants WHERE name = 'ArtCliff Diner'), 'Lobster Benedict', 'breakfast', 24.00);


-- Atria (5 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Atria');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Atria'), 'Seared Tuna', 'fish', 38.00),
((SELECT id FROM restaurants WHERE name = 'Atria'), 'Wagyu Burger', 'burger', 28.00),
((SELECT id FROM restaurants WHERE name = 'Atria'), 'Lobster Risotto', 'entree', 42.00),
((SELECT id FROM restaurants WHERE name = 'Atria'), 'Beet Salad', 'salad', 16.00),
((SELECT id FROM restaurants WHERE name = 'Atria'), 'Pan-Seared Scallops', 'fish', 44.00);


-- Back Door Donuts (5 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Back Door Donuts');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Back Door Donuts'), 'Apple Cider Donut', 'breakfast', 4.00),
((SELECT id FROM restaurants WHERE name = 'Back Door Donuts'), 'Apple Fritter', 'breakfast', 9.00),
((SELECT id FROM restaurants WHERE name = 'Back Door Donuts'), 'Boston Cream Donut', 'breakfast', 3.50),
((SELECT id FROM restaurants WHERE name = 'Back Door Donuts'), 'Maple Bacon Donut', 'breakfast', 4.00),
((SELECT id FROM restaurants WHERE name = 'Back Door Donuts'), 'Cinnamon Roll', 'breakfast', 6.50);


-- Bettini Restaurant (6 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Bettini Restaurant');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Clam Chowder', 'chowder', 14.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Grilled Swordfish', 'fish', 44.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Pan Roasted Chicken', 'fried chicken', 32.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Lobster Ravioli', 'pasta', 38.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'Caesar Salad', 'salad', 12.00),
((SELECT id FROM restaurants WHERE name = 'Bettini Restaurant'), 'New England Crab Cake', 'apps', 29.00);


-- Biscuits (5 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Biscuits');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Biscuits'), 'Chicken & Biscuits', 'fried chicken', 16.00),
((SELECT id FROM restaurants WHERE name = 'Biscuits'), 'Shrimp & Grits', 'fish', 18.00),
((SELECT id FROM restaurants WHERE name = 'Biscuits'), 'Fried Chicken & Waffle', 'fried chicken', 17.00),
((SELECT id FROM restaurants WHERE name = 'Biscuits'), 'Biscuits Benedict', 'breakfast', 15.00),
((SELECT id FROM restaurants WHERE name = 'Biscuits'), 'Buttermilk Pancakes', 'breakfast', 12.00);


-- Garde East (8 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Garde East');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Garde East'), 'New England Clam Chowder', 'chowder', 14.00),
((SELECT id FROM restaurants WHERE name = 'Garde East'), 'Garde Burger', 'burger', 18.00),
((SELECT id FROM restaurants WHERE name = 'Garde East'), 'Pan Roasted Cod', 'fish', 28.00),
((SELECT id FROM restaurants WHERE name = 'Garde East'), 'Crispy Calamari', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'Garde East'), 'Lobster Roll', 'lobster roll', 36.00),
((SELECT id FROM restaurants WHERE name = 'Garde East'), 'Citrus Salad', 'salad', 22.00),
((SELECT id FROM restaurants WHERE name = 'Garde East'), 'Striped Bass', 'fish', 60.00),
((SELECT id FROM restaurants WHERE name = 'Garde East'), 'Lobster Cavatelli', 'pasta', 42.00);


-- L'etoile Restaurant (5 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'L''etoile Restaurant');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'L''etoile Restaurant'), 'Seared Scallops', 'fish', 42.00),
((SELECT id FROM restaurants WHERE name = 'L''etoile Restaurant'), 'Beef Bourguignon', 'entree', 48.00),
((SELECT id FROM restaurants WHERE name = 'L''etoile Restaurant'), 'Lobster Bisque', 'chowder', 16.00),
((SELECT id FROM restaurants WHERE name = 'L''etoile Restaurant'), 'Duck Breast', 'entree', 44.00),
((SELECT id FROM restaurants WHERE name = 'L''etoile Restaurant'), 'Foie Gras', 'apps', 28.00);


-- Red Cat Kitchen (11 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Red Cat Kitchen');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Red Cat Kitchen'), 'Faroe Island Salmon Tartare', 'apps', 22.00),
((SELECT id FROM restaurants WHERE name = 'Red Cat Kitchen'), 'Caesar Salad', 'salad', 16.00),
((SELECT id FROM restaurants WHERE name = 'Red Cat Kitchen'), 'Brussels Sprouts', 'apps', 14.00),
((SELECT id FROM restaurants WHERE name = 'Red Cat Kitchen'), 'Codfish Cake', 'apps', 18.00),
((SELECT id FROM restaurants WHERE name = 'Red Cat Kitchen'), 'Braised Short Rib', 'entree', 36.00),
((SELECT id FROM restaurants WHERE name = 'Red Cat Kitchen'), 'Miso Glazed Pork Loin', 'entree', 32.00),
((SELECT id FROM restaurants WHERE name = 'Red Cat Kitchen'), 'Faroe Island Salmon', 'fish', 34.00),
((SELECT id FROM restaurants WHERE name = 'Red Cat Kitchen'), 'Linguini and Clams', 'pasta', 28.00),
((SELECT id FROM restaurants WHERE name = 'Red Cat Kitchen'), 'Buttermilk Fried Chicken', 'fried chicken', 28.00),
((SELECT id FROM restaurants WHERE name = 'Red Cat Kitchen'), 'Blackened Swordfish', 'fish', 36.00),
((SELECT id FROM restaurants WHERE name = 'Red Cat Kitchen'), 'Broiled Chatham Codfish', 'fish', 32.00);


-- State Road (5 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'State Road');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'State Road'), 'Clam Chowder', 'chowder', 15.00),
((SELECT id FROM restaurants WHERE name = 'State Road'), 'State Road Burger', 'burger', 24.00),
((SELECT id FROM restaurants WHERE name = 'State Road'), 'Pan Roasted Halibut', 'fish', 42.00),
((SELECT id FROM restaurants WHERE name = 'State Road'), 'Fried Chicken', 'fried chicken', 32.00),
((SELECT id FROM restaurants WHERE name = 'State Road'), 'Brussels Sprouts', 'apps', 14.00);


-- The Covington (21 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Covington');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Our Bread Service', 'apps', 2.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'House Giardiniera', 'apps', 12.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Sweet & Spicy Cucumbers', 'apps', 15.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Smoked Eggplant Dip', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Baked Cheese', 'apps', 20.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Toast', 'apps', 22.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Caesar Salad', 'salad', 20.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Farmstand Salad', 'salad', 20.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Smoked Beets', 'salad', 22.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Three Sisters', 'apps', 26.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Clams & Sausage', 'apps', 30.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Sweet Potato Gnocchi', 'pasta', 40.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Mushroom Ragu', 'pasta', 40.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Bolognese', 'pasta', 42.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Shrimp Piperade', 'entree', 42.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Nova Scotia Halibut', 'fish', 52.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Pork Chop', 'entree', 60.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'NY Striploin', 'entree', 76.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Honey Pie', 'apps', 16.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Strawberry-Basil Sorbet', 'apps', 12.00),
((SELECT id FROM restaurants WHERE name = 'The Covington'), 'Chocolate Cake', 'apps', 16.00);


-- The Sweet Life Café (5 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Sweet Life Café');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'The Sweet Life Café'), 'Pan Roasted Halibut', 'fish', 42.00),
((SELECT id FROM restaurants WHERE name = 'The Sweet Life Café'), 'Duck Confit', 'entree', 38.00),
((SELECT id FROM restaurants WHERE name = 'The Sweet Life Café'), 'Beef Tenderloin', 'entree', 48.00),
((SELECT id FROM restaurants WHERE name = 'The Sweet Life Café'), 'Lobster Risotto', 'entree', 44.00),
((SELECT id FROM restaurants WHERE name = 'The Sweet Life Café'), 'Roasted Chicken', 'fried chicken', 32.00);


-- Rockfish (55 dishes)
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Rockfish');

INSERT INTO dishes (restaurant_id, name, category, price) VALUES
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Clam Chowder', 'chowder', 15.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Tomato Soup', 'apps', 11.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Buffalo Fried Cauliflower', 'apps', 20.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Truffle Risotto Balls', 'apps', 21.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Fried Calamari', 'apps', 21.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Burrata', 'apps', 23.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'PEI Mussels', 'apps', 23.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Crab Cakes', 'apps', 25.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Tuna Poke Nachos', 'apps', 26.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Tuscan Style Jumbo Wings', 'wings', 26.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Hand Cut Fries', 'fries', 15.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Truffle Fries w/ Shaved Cheese', 'fries', 19.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Caesar Salad', 'salad', 20.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Cobb Salad', 'salad', 23.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Roasted Golden Beet', 'salad', 22.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Greens', 'salad', 16.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Classic Pizza', 'pizza', 23.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Italian Pizza', 'pizza', 26.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'BBQ Chicken Pizza', 'pizza', 26.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Margherita Pizza', 'pizza', 23.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Prosciutto & Arugula', 'pizza', 26.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Veggie Pizza', 'pizza', 25.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'White Pizza', 'pizza', 26.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Chicken Bacon Ranch', 'pizza', 26.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Oven Roasted Cod', 'fish', 40.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Asparagus Risotto', 'pasta', 33.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Mac-n-Cheese', 'pasta', 31.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Chicken Pot Pie', 'entree', 32.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Lobster Pot Pie', 'entree', 48.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Fish & Chips', 'fish', 32.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Whole Belly Clam Plate', 'fish', 35.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Cheeseburger & Fries', 'burger', 25.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Surf-n-Turf Burger', 'burger', 40.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Chef''s Special Burger', 'burger', 25.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Jumbo Lobster Roll', 'lobster roll', 39.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Sautéed Lobster Roll', 'lobster roll', 40.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Fish Sandwich', 'fish', 20.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Hot Dog', 'sandwich', 19.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Chicken Bahn Mi', 'sandwich', 22.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Short Rib Grilled Cheese', 'sandwich', 26.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Plain Cheese', 'sandwich', 20.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Lobster Grilled Cheese', 'lobster roll', 35.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Crispy Chicken Pesto Cutlet', 'sandwich', 23.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Seared Cod Taco', 'taco', 23.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Short Rib Taco', 'taco', 26.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Sautéed Lobster Taco', 'taco', 33.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Veggie Taco', 'taco', 21.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Blackened Shrimp Taco', 'taco', 20.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Crab Cake Sandwich', 'sandwich', 26.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), '12 oz Kobe Style Flat Iron', 'entree', 66.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Guinness Braised Short Rib', 'entree', 40.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Pan Seared Filet Mignon', 'entree', 58.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Chicken Pesto', 'pasta', 39.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Bolognese', 'pasta', 38.00),
((SELECT id FROM restaurants WHERE name = 'Rockfish'), 'Halibut', 'fish', 49.00);


