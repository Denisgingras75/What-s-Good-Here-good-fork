-- Migration: Create steak and chicken categories from entree
-- Date: Jan 16, 2026

-- ============================================
-- STEAK CATEGORY (from entree)
-- ============================================

UPDATE dishes SET category = 'steak'
WHERE LOWER(name) LIKE '%filet mignon%'
   OR LOWER(name) LIKE '%steak%'
   OR LOWER(name) LIKE '%ribeye%'
   OR LOWER(name) LIKE '%short rib%'
   OR LOWER(name) LIKE '%sirloin%'
   OR LOWER(name) LIKE '%wagyu%'
   OR LOWER(name) LIKE '%pot pie%';

-- ============================================
-- CHICKEN CATEGORY (from entree)
-- Note: Keep "fried chicken" separate - it's already its own category
-- ============================================

UPDATE dishes SET category = 'chicken'
WHERE (LOWER(name) LIKE '%chicken%'
   AND LOWER(name) NOT LIKE '%fried chicken%')
   AND category = 'entree';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check steak dishes
-- SELECT name, category FROM dishes WHERE category = 'steak' ORDER BY name;

-- Check chicken dishes
-- SELECT name, category FROM dishes WHERE category = 'chicken' ORDER BY name;

-- Check remaining entrees
-- SELECT name, category FROM dishes WHERE category = 'entree' ORDER BY name;

-- Count by category
-- SELECT category, COUNT(*) FROM dishes GROUP BY category ORDER BY COUNT(*) DESC;
