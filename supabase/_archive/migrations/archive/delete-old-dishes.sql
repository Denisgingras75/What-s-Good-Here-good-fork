-- Delete all existing dishes to prepare for full menu import
-- Run this BEFORE import-full-menus.sql
-- This removes the old 5-dish samples so we can import complete menus

DELETE FROM dishes
WHERE restaurant_id IN (
  SELECT id FROM restaurants
  WHERE name NOT IN ('Bangkok Cuisine', 'Vineyard Caribbean Cuisine')
);

-- Verify deletion
SELECT COUNT(*) as remaining_dishes FROM dishes;

-- Should show 0 dishes remaining (or only Bangkok/Caribbean if those weren't deleted yet)
