-- Migration: Clean up the "apps" catch-all category
-- Date: Jan 16, 2026
-- Moves misclassified items to correct categories

-- ============================================
-- SALADS → Move to existing 'salad' category
-- ============================================
UPDATE dishes SET category = 'salad'
WHERE category = 'apps'
AND (LOWER(name) LIKE '%salad%'
  OR LOWER(name) LIKE '%beet roulade%');

-- ============================================
-- BREAKFAST → Move to existing 'breakfast' category
-- ============================================
UPDATE dishes SET category = 'breakfast'
WHERE category = 'apps'
AND (LOWER(name) LIKE '%pancake%'
  OR LOWER(name) LIKE '%benedict%'
  OR LOWER(name) LIKE '%avocado toast%'
  OR LOWER(name) LIKE '%breakfast burrito%');

-- ============================================
-- DONUTS → New category
-- ============================================
UPDATE dishes SET category = 'donuts'
WHERE category = 'apps'
AND (LOWER(name) LIKE '%donut%'
  OR LOWER(name) LIKE '%fritter%'
  OR LOWER(name) LIKE '%cinnamon roll%');

-- ============================================
-- ASIAN → New category (Thai dishes miscategorized)
-- ============================================
UPDATE dishes SET category = 'asian'
WHERE category = 'apps'
AND (LOWER(name) LIKE '%pad thai%'
  OR LOWER(name) LIKE '%fried rice%'
  OR LOWER(name) LIKE '%curry%'
  OR LOWER(name) LIKE '%ginger mix%'
  OR LOWER(name) LIKE '%crispy rolls%');

-- ============================================
-- SOUP → Move to existing 'soup' category
-- ============================================
UPDATE dishes SET category = 'soup'
WHERE category = 'apps'
AND (LOWER(name) LIKE '%soup%'
  OR LOWER(name) LIKE '%bisque%'
  OR LOWER(name) LIKE '%chili%');

-- ============================================
-- STEAK → Move beef items to steak category
-- ============================================
UPDATE dishes SET category = 'steak'
WHERE category = 'apps'
AND (LOWER(name) LIKE '%steak%'
  OR LOWER(name) LIKE '%beef%'
  OR LOWER(name) LIKE '%bourguignon%');

-- ============================================
-- SEAFOOD → Move to existing 'seafood' category
-- ============================================
UPDATE dishes SET category = 'seafood'
WHERE category = 'apps'
AND (LOWER(name) LIKE '%calamari%'
  OR LOWER(name) LIKE '%crab cake%'
  OR LOWER(name) LIKE '%shrimp%'
  OR LOWER(name) LIKE '%mussel%'
  OR LOWER(name) LIKE '%oyster%'
  OR LOWER(name) LIKE '%steamer%'
  OR LOWER(name) LIKE '%clam%'
  OR LOWER(name) LIKE '%littleneck%'
  OR LOWER(name) LIKE '%raw bar%'
  OR LOWER(name) LIKE '%quahog%'
  OR LOWER(name) LIKE '%lobster dumplings%'
  OR LOWER(name) LIKE '%lobster guacamole%'
  OR LOWER(name) LIKE '%fish bites%'
  OR LOWER(name) LIKE '%seafood medley%');

-- ============================================
-- ENTREE → Move fine dining proteins
-- ============================================
UPDATE dishes SET category = 'entree'
WHERE category = 'apps'
AND (LOWER(name) LIKE '%duck%'
  OR LOWER(name) LIKE '%foie gras%'
  OR LOWER(name) LIKE '%oxtail%'
  OR LOWER(name) LIKE '%lobster risotto%'
  OR LOWER(name) LIKE '%lobster ravioli%');

-- ============================================
-- CARIBBEAN → New category (or leave as entree)
-- ============================================
-- Note: Curry Chicken and Oxtail already moved above
-- Rice & Peas is a side, leave as apps or create 'sides'

-- ============================================
-- VERIFICATION
-- ============================================
-- SELECT category, COUNT(*) as count FROM dishes GROUP BY category ORDER BY count DESC;
-- SELECT name, category FROM dishes WHERE category = 'apps' ORDER BY name;
