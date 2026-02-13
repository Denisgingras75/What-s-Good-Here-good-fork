-- Edgartown Pizza - Full Menu
-- Run this in Supabase SQL Editor
-- IMPORTANT: Delete existing Edgartown Pizza dishes first to avoid duplicates

-- Delete old Edgartown Pizza dishes
DELETE FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Edgartown Pizza');

-- Insert complete menu (86 items)
INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES
-- Pizza
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Cheese Pizza', 'pizza', 'Pizza', 9.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'White Pizza', 'pizza', 'Pizza', 13.95),
-- Gourmet Pizza
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'BBQ Chicken Pizza', 'pizza', 'Gourmet Pizza', 15.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'BBQ Sauce Pizza', 'pizza', 'Gourmet Pizza', 13.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Pesto Pizza', 'pizza', 'Gourmet Pizza', 13.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Chicken Pesto Pizza', 'pizza', 'Gourmet Pizza', 15.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Chicken Pizza', 'pizza', 'Gourmet Pizza', 15.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Sour Cream Pizza', 'pizza', 'Gourmet Pizza', 13.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Ricotta Pizza', 'pizza', 'Gourmet Pizza', 13.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Sour Cream with Chicken Pizza', 'pizza', 'Gourmet Pizza', 15.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Ricotta with Chicken Pizza', 'pizza', 'Gourmet Pizza', 15.95),
-- Combo Pizza
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Edgartown Veggie Pizza', 'pizza', 'Combo Pizza', 14.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Vineyard Veggie Pizza', 'pizza', 'Combo Pizza', 14.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Meat Lover''s Pizza', 'pizza', 'Combo Pizza', 15.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Greek Pizza', 'pizza', 'Combo Pizza', 15.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Island Combo Pizza', 'pizza', 'Combo Pizza', 15.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Brazilian Pizza', 'pizza', 'Combo Pizza', 15.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Buffalo Chicken Pizza', 'pizza', 'Combo Pizza', 15.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Loaded Pizza', 'pizza', 'Combo Pizza', 16.95),
-- Combos (Signature Pizzas)
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Simone''s Choice Pizza', 'pizza', 'Combos', 15.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Classic Brazilian Pizza', 'pizza', 'Combos', 15.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Portuguese Pizza', 'pizza', 'Combos', 15.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Four Cheese Pizza', 'pizza', 'Combos', 9.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Noa''s Choice Pizza', 'pizza', 'Combos', 15.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Talia''s Choice Pizza', 'pizza', 'Combos', 22.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Maya''s Choice Pizza', 'pizza', 'Combos', 25.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Chicken Alfredo Pizza', 'pizza', 'Combos', 15.95),
-- Specials
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Mozzarella Sticks Burger Special', 'burger', 'Specials', 16.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Hawaiian Burger Special', 'burger', 'Specials', 15.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Crispy Chicken Caesar Sandwich Special', 'sandwich', 'Specials', 13.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Grilled Chicken & Avocado Sandwich Special', 'sandwich', 'Specials', 14.95),
-- Appetizers
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'French Fries', 'fries', 'Appetizers', 3.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Chicken Fingers', 'tendys', 'Appetizers', 12.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Fried Chicken Wings', 'wings', 'Appetizers', 15.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Boneless Buffalo Chicken Tenders', 'tendys', 'Appetizers', 13.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Mozzarella Sticks', 'apps', 'Appetizers', 6.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Garlic Bread', 'apps', 'Appetizers', 5.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'House Garlic Bread', 'apps', 'Appetizers', 11.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Onion Rings', 'fries', 'Appetizers', 5.95),
-- Salads
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Tossed Salad', 'salad', 'Salads', 6.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Greek Salad', 'salad', 'Salads', 7.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Caesar Salad', 'salad', 'Salads', 9.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Chicken Caesar Salad', 'salad', 'Salads', 15.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Steak Caesar Salad', 'salad', 'Salads', 16.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Chef''s Salad', 'salad', 'Salads', 9.95),
-- Burgers
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Big Burger', 'burger', 'Burgers', 13.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Double Cheeseburger', 'burger', 'Burgers', 18.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Blue Cheeseburger with Bacon', 'burger', 'Burgers', 16.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'BLT Cheeseburger', 'burger', 'Burgers', 16.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Cheddar Burger', 'burger', 'Burgers', 16.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'BBQ Bacon Cheeseburger', 'burger', 'Burgers', 16.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Brazilian Burger', 'burger', 'Burgers', 15.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Brazilian Chicken Burger', 'burger', 'Burgers', 15.95),
-- Sandwiches
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Grilled Chicken Sandwich', 'sandwich', 'Sandwiches', 14.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Fried Fish Sandwich', 'fish', 'Sandwiches', 17.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'BLT Sandwich', 'sandwich', 'Sandwiches', 13.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Club Sandwich', 'sandwich', 'Sandwiches', 14.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Chicken Pesto Sandwich', 'sandwich', 'Sandwiches', 14.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Hot Pastrami Sandwich', 'sandwich', 'Sandwiches', 14.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Reuben Sandwich', 'sandwich', 'Sandwiches', 14.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Turkey Cheddar Melt', 'sandwich', 'Sandwiches', 13.00),
-- Wraps & Subs
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Italian Sub', 'sandwich', 'Wraps & Subs', 10.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Eggplant Parmesan Sub', 'sandwich', 'Wraps & Subs', 10.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Meatball Sub', 'sandwich', 'Wraps & Subs', 10.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Tuna Melt Sub', 'sandwich', 'Wraps & Subs', 10.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Roast Beef Sub', 'sandwich', 'Wraps & Subs', 10.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Grilled Chicken Parmesan Sub', 'sandwich', 'Wraps & Subs', 15.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Steak & Cheese Sub', 'sandwich', 'Wraps & Subs', 16.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Chicken Caesar Salad Wrap', 'sandwich', 'Wraps & Subs', 14.00),
-- From The Grill
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Teriyaki Steak Tips', 'steak', 'From The Grill', 21.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Steak Tips with Gravy', 'steak', 'From The Grill', 20.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Grilled Chicken Breast', 'chicken', 'From The Grill', 21.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Steak Tip Sub', 'sandwich', 'From The Grill', 17.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'EP''s Gyro', 'sandwich', 'From The Grill', 16.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Brazilian Style Beef', 'entree', 'From The Grill', 21.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Brazilian Style Chicken', 'chicken', 'From The Grill', 21.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Brazilian Style Fried Fish', 'fish', 'From The Grill', 20.95),
-- Pasta
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Pasta with Marinara Sauce', 'pasta', 'Pasta', 10.95),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Eggplant Parmesan Pasta', 'pasta', 'Pasta', 14.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Pasta with Meatballs', 'pasta', 'Pasta', 14.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Pasta with Sausage', 'pasta', 'Pasta', 14.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Grilled Chicken Parmesan Pasta', 'pasta', 'Pasta', 15.95),
-- Brazilian Lunch
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Chicken Brazilian Lunch', 'chicken', 'Brazilian Lunch', 15.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Pork Brazilian Lunch', 'pork', 'Brazilian Lunch', 15.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Beef Brazilian Lunch', 'entree', 'Brazilian Lunch', 17.00),
((SELECT id FROM restaurants WHERE name = 'Edgartown Pizza'), 'Brazilian Fish Lunch', 'fish', 'Brazilian Lunch', 21.00);

-- Update menu_section_order
UPDATE restaurants
SET menu_section_order = ARRAY['Pizza', 'Gourmet Pizza', 'Combo Pizza', 'Combos', 'Specials', 'Appetizers', 'Salads', 'Burgers', 'Sandwiches', 'Wraps & Subs', 'From The Grill', 'Pasta', 'Brazilian Lunch']
WHERE name = 'Edgartown Pizza';

-- Verify import
SELECT COUNT(*) as dish_count
FROM dishes
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'Edgartown Pizza');

-- Should show 86 dishes
