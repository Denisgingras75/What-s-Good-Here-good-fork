-- Populate menu_section on all dishes based on category
-- Run this in Supabase SQL Editor
-- Safe to re-run: only updates rows where menu_section IS NULL

-- =============================================================
-- Step A: Lunch/Dinner categories → menu_section
-- =============================================================
UPDATE dishes SET menu_section = 'Soups & Apps'  WHERE menu_section IS NULL AND category IN ('chowder', 'soup', 'apps', 'wings', 'tendys', 'fried chicken');
UPDATE dishes SET menu_section = 'Salads'        WHERE menu_section IS NULL AND category = 'salad';
UPDATE dishes SET menu_section = 'Sandwiches'    WHERE menu_section IS NULL AND category IN ('sandwich', 'burger', 'lobster roll', 'lobster', 'taco', 'quesadilla');
UPDATE dishes SET menu_section = 'Pizza'         WHERE menu_section IS NULL AND category = 'pizza';
UPDATE dishes SET menu_section = 'Sushi'         WHERE menu_section IS NULL AND category = 'sushi';
UPDATE dishes SET menu_section = 'Entrees'       WHERE menu_section IS NULL AND category IN ('entree', 'pasta', 'seafood', 'fish', 'steak', 'chicken', 'asian', 'pokebowl');
UPDATE dishes SET menu_section = 'Sides'         WHERE menu_section IS NULL AND category = 'fries';
UPDATE dishes SET menu_section = 'Desserts'      WHERE menu_section IS NULL AND category IN ('dessert', 'donuts');

-- =============================================================
-- Step B: Breakfast categories → menu_section (name-based matching)
-- Order matters: specific matches first, fallback last
-- =============================================================

-- Breakfast sandwiches & burritos
UPDATE dishes SET menu_section = 'Sandwiches & Burritos'
WHERE menu_section IS NULL
  AND category IN ('breakfast', 'breakfast sandwich')
  AND (
    category = 'breakfast sandwich'
    OR name ~* '(sandwich|burrito|wrap|bagel|croissant sandwich)'
  );

-- Waffles & Pancakes
UPDATE dishes SET menu_section = 'Waffles & Pancakes'
WHERE menu_section IS NULL
  AND category = 'breakfast'
  AND name ~* '(waffle|pancake|french toast|crepe)';

-- Eggs
UPDATE dishes SET menu_section = 'Eggs'
WHERE menu_section IS NULL
  AND category = 'breakfast'
  AND name ~* '(egg|omelet|omelette|scramble|frittata|benedict)';

-- Pastries
UPDATE dishes SET menu_section = 'Pastries'
WHERE menu_section IS NULL
  AND category = 'breakfast'
  AND name ~* '(muffin|croissant|scone|pastry|danish|donut|doughnut)';

-- Fallback: everything else in breakfast → Breakfast Plates
UPDATE dishes SET menu_section = 'Breakfast Plates'
WHERE menu_section IS NULL
  AND category = 'breakfast';

-- =============================================================
-- Verify: check for any dishes still missing menu_section
-- =============================================================
-- SELECT category, COUNT(*) FROM dishes WHERE menu_section IS NULL AND parent_dish_id IS NULL GROUP BY category;

-- =============================================================
-- Step C: Auto-generate menu_section_order per restaurant
-- Breakfast sections at top if present, then lunch/dinner order
-- =============================================================
DO $$
DECLARE
  r RECORD;
  section_order TEXT[] := ARRAY[
    'Breakfast Plates', 'Sandwiches & Burritos', 'Waffles & Pancakes', 'Eggs', 'Pastries',
    'Soups & Apps', 'Salads', 'Sandwiches', 'Pizza', 'Sushi',
    'Entrees', 'Sides', 'Desserts'
  ];
  restaurant_sections TEXT[];
  ordered_sections TEXT[];
  s TEXT;
BEGIN
  FOR r IN SELECT DISTINCT restaurant_id FROM dishes WHERE menu_section IS NOT NULL AND parent_dish_id IS NULL
  LOOP
    -- Get distinct sections for this restaurant
    SELECT ARRAY_AGG(DISTINCT menu_section) INTO restaurant_sections
    FROM dishes
    WHERE restaurant_id = r.restaurant_id
      AND menu_section IS NOT NULL
      AND parent_dish_id IS NULL;

    -- Order them by the canonical order
    ordered_sections := '{}';
    FOREACH s IN ARRAY section_order
    LOOP
      IF s = ANY(restaurant_sections) THEN
        ordered_sections := ordered_sections || s;
      END IF;
    END LOOP;

    -- Add any sections not in canonical order (alphabetically)
    FOREACH s IN ARRAY restaurant_sections
    LOOP
      IF NOT (s = ANY(ordered_sections)) THEN
        ordered_sections := ordered_sections || s;
      END IF;
    END LOOP;

    -- Update the restaurant
    UPDATE restaurants SET menu_section_order = ordered_sections WHERE id = r.restaurant_id;
  END LOOP;
END $$;

-- Verify results
-- SELECT r.name, r.menu_section_order
-- FROM restaurants r
-- WHERE array_length(r.menu_section_order, 1) > 0
-- ORDER BY r.name;
