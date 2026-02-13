-- Indigo - Full Menu
-- Run this in Supabase SQL Editor
-- IMPORTANT: Delete existing Indigo dishes first to avoid duplicates

-- Delete old Indigo dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Indigo');

-- Insert complete menu (79 items)
INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
-- Soups
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Sweet Corn Soup', 'soup', 'Soups', 12.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Manchow Soup', 'soup', 'Soups', 12.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Mulligatawny Soup', 'soup', 'Soups', 12.00),
-- Salads
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Watermelon Mango Salad', 'salad', 'Salads', 18.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Mango Avocado Salad', 'salad', 'Salads', 18.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'OG Caesar Salad', 'salad', 'Salads', 15.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Simple Green Salad', 'salad', 'Salads', 15.00),
-- Kebabs
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Beetroot Kebab', 'apps', 'Kebabs', 20.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Paneer Tikka', 'apps', 'Kebabs', 25.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Tandoori Chicken', 'chicken', 'Kebabs', 30.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Chipotle Chicken Tikka', 'chicken', 'Kebabs', 28.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Chicken Seekh Kebab', 'chicken', 'Kebabs', 26.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Lamb Chops', 'lamb', 'Kebabs', 35.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Lamb Seekh Kebab', 'lamb', 'Kebabs', 30.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Beef Seekh Kebab', 'entree', 'Kebabs', 30.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Tandoori Salmon', 'seafood', 'Kebabs', 32.00),
-- Appetizers
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Samosa', 'apps', 'Appetizers', 16.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Samosa Chaat', 'apps', 'Appetizers', 20.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Palak Pakora', 'apps', 'Appetizers', 19.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Pakora Chaat', 'apps', 'Appetizers', 20.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Bhel Puri Chaat', 'apps', 'Appetizers', 18.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Crispy Gobi', 'apps', 'Appetizers', 20.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Chicken Pakora', 'apps', 'Appetizers', 22.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Chilli Chicken (Dry)', 'apps', 'Appetizers', 22.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Chicken Tenders', 'tendys', 'Appetizers', 18.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Indigo''s Special Wings', 'wings', 'Appetizers', 18.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Tawa Shrimp', 'apps', 'Appetizers', 22.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Tawa Fish', 'apps', 'Appetizers', 22.00),
-- Veg Curries
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Dal Tadka', 'entree', 'Veg Curries', 27.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Dal Fry', 'entree', 'Veg Curries', 27.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Aloo Matar', 'entree', 'Veg Curries', 29.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Channa Masala', 'entree', 'Veg Curries', 29.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Channa Tikka Masala', 'entree', 'Veg Curries', 29.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Channa Paneer Masala', 'entree', 'Veg Curries', 29.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Saag Channa', 'entree', 'Veg Curries', 29.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Paneer Butter Masala', 'entree', 'Veg Curries', 30.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Saag Paneer', 'entree', 'Veg Curries', 30.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Malai Kofta', 'entree', 'Veg Curries', 29.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Indigo''s Veg Korma', 'entree', 'Veg Curries', 30.00),
-- Non-Veg Curries
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'OG Butter Chicken', 'chicken', 'Non-Veg Curries', 32.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Chicken Tikka Masala', 'chicken', 'Non-Veg Curries', 32.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Madrasi Chicken', 'chicken', 'Non-Veg Curries', 32.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Chicken Korma', 'chicken', 'Non-Veg Curries', 32.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Chilli Chicken (Gravy)', 'chicken', 'Non-Veg Curries', 32.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Saag Chicken', 'chicken', 'Non-Veg Curries', 32.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Chicken Vindaloo', 'chicken', 'Non-Veg Curries', 32.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Lamb Vindaloo', 'lamb', 'Non-Veg Curries', 35.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Saag Lamb', 'lamb', 'Non-Veg Curries', 35.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Lamb Tikka Masala', 'lamb', 'Non-Veg Curries', 35.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Malabar Fish Curry', 'seafood', 'Non-Veg Curries', 32.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Goan Shrimp Curry', 'seafood', 'Non-Veg Curries', 32.00),
-- Rice & Noodles
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Mixed Veg Biryani', 'entree', 'Rice & Noodles', 26.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Nawabi Style Chicken Biryani', 'chicken', 'Rice & Noodles', 30.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Lamb Biryani', 'lamb', 'Rice & Noodles', 32.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Street Style Noodles', 'entree', 'Rice & Noodles', 28.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Street Style Fried Rice', 'entree', 'Rice & Noodles', 28.00),
-- Lil' Bites
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Garlic Hummus', 'apps', 'Lil'' Bites', 18.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Kashmiri Devilled Eggs', 'apps', 'Lil'' Bites', 18.00),
-- Big Bites
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Bacon Cheeseburger', 'burger', 'Big Bites', 25.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Kerala Fried Chicken Sandwich', 'sandwich', 'Big Bites', 25.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Grilled Cheese with Tomato Rasam', 'sandwich', 'Big Bites', 23.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Lamb Burger', 'burger', 'Big Bites', 29.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Spaghetti with Cherry Tomato Sauce', 'pasta', 'Big Bites', 25.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Creamy Penne', 'pasta', 'Big Bites', 25.00),
-- Breads
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Plain Naan', 'sides', 'Breads', 8.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Garlic Naan', 'sides', 'Breads', 10.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Butter Naan', 'sides', 'Breads', 9.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Onion Chilli Naan', 'sides', 'Breads', 9.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Cheese Naan', 'sides', 'Breads', 9.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Chilli Cheese Naan', 'sides', 'Breads', 9.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Kashmiri Naan', 'sides', 'Breads', 9.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Malabar Paratha', 'sides', 'Breads', 9.00),
-- Sides
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Papad', 'sides', 'Sides', 8.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'French Fries', 'fries', 'Sides', 10.00),
-- Desserts
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Mango Lassi Parfait', 'dessert', 'Desserts', 16.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Rice Pudding', 'dessert', 'Desserts', 16.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Gulab Jamun', 'dessert', 'Desserts', 16.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Gulab Jamun Sundae', 'dessert', 'Desserts', 18.00),
((SELECT id FROM restaurants WHERE name = 'Indigo'), 'Gajar ka Halwa', 'dessert', 'Desserts', 18.00);

-- Update menu_section_order
UPDATE restaurants
SET menu_section_order = ARRAY['Soups', 'Salads', 'Kebabs', 'Appetizers', 'Veg Curries', 'Non-Veg Curries', 'Rice & Noodles', 'Lil'' Bites', 'Big Bites', 'Breads', 'Sides', 'Desserts']
WHERE name = 'Indigo';

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Indigo');

-- Should show 79 dishes
