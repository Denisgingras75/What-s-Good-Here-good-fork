-- Round 2: Fill gaps the regex missed
-- Run after populate-intent-tags.sql

BEGIN;

-- === PIZZA: all pizza is handheld, comfort, shareable, savory ===
UPDATE dishes SET tags = array_cat(tags, ARRAY['handheld', 'comfort', 'shareable', 'savory'])
WHERE category = 'pizza';

-- === TACOS: all tacos are comfort, savory ===
UPDATE dishes SET tags = array_cat(tags, ARRAY['comfort', 'savory'])
WHERE category = 'taco';

-- === SUSHI: all sushi is light, raw, fresh ===
UPDATE dishes SET tags = array_cat(tags, ARRAY['light', 'raw', 'fresh'])
WHERE category = 'sushi';

-- === SANDWICHES: all sandwiches are comfort, savory ===
UPDATE dishes SET tags = array_cat(tags, ARRAY['comfort', 'savory'])
WHERE category IN ('sandwich', 'breakfast sandwich');

-- === APPS: all apps are shareable, savory (unless sweet) ===
UPDATE dishes SET tags = array_cat(tags, ARRAY['savory'])
WHERE category = 'apps'
  AND NOT (name ILIKE '%cake%' OR name ILIKE '%chocolate%' OR name ILIKE '%dessert%');

-- === SOUP: comfort, savory, hot ===
UPDATE dishes SET tags = array_cat(tags, ARRAY['comfort', 'savory'])
WHERE category = 'soup';

-- === ENTREE: savory (unless dessert) ===
UPDATE dishes SET tags = array_cat(tags, ARRAY['savory'])
WHERE category = 'entree';

-- === STEAK: savory, grilled, rich, date-night ===
UPDATE dishes SET tags = array_cat(tags, ARRAY['savory', 'grilled', 'rich', 'date-night'])
WHERE category = 'steak';

-- === CHICKEN: savory, comfort ===
UPDATE dishes SET tags = array_cat(tags, ARRAY['savory', 'comfort'])
WHERE category = 'chicken';

-- === PORK: savory, comfort ===
UPDATE dishes SET tags = array_cat(tags, ARRAY['savory', 'comfort'])
WHERE category = 'pork';

-- === BREAKFAST: quick-bite (most breakfast is fast) ===
UPDATE dishes SET tags = array_cat(tags, ARRAY['quick-bite'])
WHERE category = 'breakfast';

-- === SEAFOOD that's not already local-catch: add it ===
UPDATE dishes SET tags = array_cat(tags, ARRAY['local-catch'])
WHERE category IN ('seafood', 'fish', 'clams', 'sushi')
  AND NOT ('local-catch' = ANY(tags));

-- === Name-based catches the regex missed ===

-- Shrimp = local-catch
UPDATE dishes SET tags = array_cat(tags, ARRAY['local-catch'])
WHERE name ILIKE '%shrimp%' AND NOT ('local-catch' = ANY(tags));

-- Dip = shareable
UPDATE dishes SET tags = array_cat(tags, ARRAY['shareable'])
WHERE name ILIKE '%dip%' AND NOT ('shareable' = ANY(tags));

-- Po Boy = fried, crispy
UPDATE dishes SET tags = array_cat(tags, ARRAY['fried', 'crispy'])
WHERE name ILIKE '%po boy%' OR name ILIKE '%po''boy%';

-- Fish & Chips = fried, crispy, comfort
UPDATE dishes SET tags = array_cat(tags, ARRAY['fried', 'crispy', 'comfort'])
WHERE name ILIKE '%fish%chip%';

-- Toast (as appetizer) = quick-bite
UPDATE dishes SET tags = array_cat(tags, ARRAY['quick-bite'])
WHERE name ILIKE '%toast%' AND category = 'apps';

-- Avocado anything = fresh, healthy, light
UPDATE dishes SET tags = array_cat(tags, ARRAY['fresh', 'healthy', 'light'])
WHERE name ILIKE '%avocado%';

-- Sub/Club = comfort
UPDATE dishes SET tags = array_cat(tags, ARRAY['comfort'])
WHERE name ILIKE '%sub%' OR name ILIKE '%club%';

-- BLT = savory, comfort
UPDATE dishes SET tags = array_cat(tags, ARRAY['savory'])
WHERE name ILIKE '%blt%';

-- Chili = spicy, comfort
UPDATE dishes SET tags = array_cat(tags, ARRAY['spicy', 'comfort'])
WHERE name ILIKE '%chili%';

-- Sampler/Platter = shareable (belt and suspenders)
UPDATE dishes SET tags = array_cat(tags, ARRAY['shareable'])
WHERE (name ILIKE '%sampler%' OR name ILIKE '%platter%') AND NOT ('shareable' = ANY(tags));

-- Foie gras / sausage / burrata = rich, date-night
UPDATE dishes SET tags = array_cat(tags, ARRAY['rich', 'date-night'])
WHERE name ILIKE '%foie gras%' OR name ILIKE '%burrata%';

-- === DEDUPLICATE ===
UPDATE dishes
SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(tags) ORDER BY 1)
);

COMMIT;

-- Verify improvement
SELECT
  COUNT(*) FILTER (WHERE array_length(tags, 1) >= 3) AS well_tagged,
  COUNT(*) FILTER (WHERE array_length(tags, 1) < 3 OR tags = '{}') AS under_tagged,
  COUNT(*) AS total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE array_length(tags, 1) >= 3) / COUNT(*), 1) AS pct_covered
FROM dishes;
