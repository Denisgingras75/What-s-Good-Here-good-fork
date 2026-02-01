-- Migration: Fix steak category miscategorizations
-- Date: Jan 16, 2026

-- ============================================
-- STEAK & CHEESE → back to sandwich
-- ============================================
UPDATE dishes SET category = 'sandwich'
WHERE category = 'steak'
AND (LOWER(name) LIKE '%steak and cheese%'
  OR LOWER(name) LIKE '%steak & cheese%'
  OR LOWER(name) LIKE '%cheesesteak%'
  OR LOWER(name) LIKE '%cheese steak%');

-- ============================================
-- CHICKEN POT PIE → chicken
-- ============================================
UPDATE dishes SET category = 'chicken'
WHERE LOWER(name) LIKE '%chicken pot pie%'
  OR LOWER(name) LIKE '%pot pie%';

-- ============================================
-- STEAK BOMB PIZZA → pizza
-- ============================================
UPDATE dishes SET category = 'pizza'
WHERE LOWER(name) LIKE '%steak bomb pizza%'
  OR LOWER(name) LIKE '%steak pizza%';

-- ============================================
-- QUESADILLAS → new category
-- ============================================
UPDATE dishes SET category = 'quesadilla'
WHERE LOWER(name) LIKE '%quesadilla%';

-- ============================================
-- SWORDFISH STEAK → seafood
-- ============================================
UPDATE dishes SET category = 'seafood'
WHERE LOWER(name) LIKE '%swordfish%'
  OR LOWER(name) LIKE '%sword fish%';

-- ============================================
-- VERIFICATION
-- ============================================
-- SELECT name, category FROM dishes WHERE category = 'steak' ORDER BY name;
-- SELECT name, category FROM dishes WHERE LOWER(name) LIKE '%steak%' ORDER BY category, name;
