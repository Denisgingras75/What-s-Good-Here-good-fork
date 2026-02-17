-- Populate intent-driven tags on all dishes
-- Replaces old cuisine-type tags with searchable intent descriptors
-- Run in Supabase SQL Editor after review
--
-- Tag definitions: docs/plans/2026-02-17-search-engine-v2-design.md

BEGIN;

-- Clear existing tags (old cuisine-type tags are redundant with restaurants.cuisine)
UPDATE dishes SET tags = '{}';

-- === FORMAT TAGS (based on category + menu_section) ===

-- Handheld items
UPDATE dishes SET tags = array_cat(tags, ARRAY['handheld'])
WHERE category IN ('sandwich', 'burger', 'taco', 'lobster roll', 'breakfast sandwich', 'quesadilla')
   OR name ILIKE '%wrap%' OR name ILIKE '%roll%' OR name ILIKE '%burrito%';

-- Big plates / entrees
UPDATE dishes SET tags = array_cat(tags, ARRAY['big-plate'])
WHERE category IN ('steak', 'pasta', 'entree', 'ribs', 'duck', 'lamb')
   OR menu_section ILIKE '%entree%' OR menu_section ILIKE '%dinner%';

-- Snacks / sides / apps
UPDATE dishes SET tags = array_cat(tags, ARRAY['snack'])
WHERE category IN ('apps', 'fries', 'sides')
   OR menu_section ILIKE '%appetizer%' OR menu_section ILIKE '%starter%' OR menu_section ILIKE '%side%';

UPDATE dishes SET tags = array_cat(tags, ARRAY['side-dish'])
WHERE category IN ('fries', 'sides')
   OR menu_section ILIKE '%side%';

-- Shareable
UPDATE dishes SET tags = array_cat(tags, ARRAY['shareable'])
WHERE category IN ('apps', 'wings')
   OR name ILIKE '%platter%' OR name ILIKE '%board%' OR name ILIKE '%sampler%'
   OR name ILIKE '%for two%' OR name ILIKE '%nachos%';

-- === TEXTURE/PREPARATION TAGS ===

-- Fried + Crispy
UPDATE dishes SET tags = array_cat(tags, ARRAY['fried', 'crispy'])
WHERE name ILIKE '%fried%' OR name ILIKE '%fritter%'
   OR name ILIKE '%tempura%' OR name ILIKE '%panko%'
   OR category = 'fried chicken';

UPDATE dishes SET tags = array_cat(tags, ARRAY['crispy'])
WHERE name ILIKE '%crispy%' OR name ILIKE '%crunchy%'
   OR name ILIKE '%breaded%' OR name ILIKE '%crusted%'
   OR category = 'tendys' OR category = 'wings';

-- Grilled + Smoky
UPDATE dishes SET tags = array_cat(tags, ARRAY['grilled'])
WHERE name ILIKE '%grilled%' OR name ILIKE '%char%'
   OR name ILIKE '%flame%';

UPDATE dishes SET tags = array_cat(tags, ARRAY['smoky'])
WHERE name ILIKE '%smoked%' OR name ILIKE '%bbq%'
   OR name ILIKE '%barbecue%' OR name ILIKE '%hickory%'
   OR category = 'ribs';

-- Tender
UPDATE dishes SET tags = array_cat(tags, ARRAY['tender'])
WHERE name ILIKE '%braised%' OR name ILIKE '%slow%'
   OR name ILIKE '%pulled%' OR name ILIKE '%confit%'
   OR name ILIKE '%tender%';

-- Raw
UPDATE dishes SET tags = array_cat(tags, ARRAY['raw'])
WHERE name ILIKE '%sashimi%' OR name ILIKE '%tartare%'
   OR name ILIKE '%crudo%' OR name ILIKE '%ceviche%'
   OR name ILIKE '%poke%' OR category = 'pokebowl';

-- === FLAVOR TAGS ===

-- Spicy
UPDATE dishes SET tags = array_cat(tags, ARRAY['spicy'])
WHERE name ILIKE '%spicy%' OR name ILIKE '%hot%buffalo%'
   OR name ILIKE '%jalapen%' OR name ILIKE '%habanero%'
   OR name ILIKE '%nashville%' OR name ILIKE '%sriracha%'
   OR name ILIKE '%cajun%' OR name ILIKE '%buffalo%';

-- Sweet
UPDATE dishes SET tags = array_cat(tags, ARRAY['sweet'])
WHERE category = 'dessert'
   OR name ILIKE '%honey%' OR name ILIKE '%maple%'
   OR name ILIKE '%caramel%' OR name ILIKE '%chocolate%'
   OR name ILIKE '%cake%' OR name ILIKE '%pie%'
   OR name ILIKE '%sundae%' OR name ILIKE '%donut%';

-- Tangy
UPDATE dishes SET tags = array_cat(tags, ARRAY['tangy'])
WHERE name ILIKE '%vinaigrette%' OR name ILIKE '%citrus%'
   OR name ILIKE '%lemon%' OR name ILIKE '%lime%'
   OR name ILIKE '%pickle%' OR name ILIKE '%kimchi%';

-- Savory
UPDATE dishes SET tags = array_cat(tags, ARRAY['savory'])
WHERE name ILIKE '%cheese%' OR name ILIKE '%bacon%'
   OR name ILIKE '%mushroom%' OR name ILIKE '%truffle%'
   OR name ILIKE '%parmesan%' OR name ILIKE '%garlic%';

-- Rich
UPDATE dishes SET tags = array_cat(tags, ARRAY['rich'])
WHERE name ILIKE '%cream%' OR name ILIKE '%butter%'
   OR name ILIKE '%alfredo%' OR name ILIKE '%bisque%'
   OR name ILIKE '%mac%cheese%' OR name ILIKE '%lobster%'
   OR category = 'chowder';

-- === OCCASION TAGS ===

-- Brunch
UPDATE dishes SET tags = array_cat(tags, ARRAY['brunch'])
WHERE category IN ('breakfast', 'breakfast sandwich')
   OR name ILIKE '%benedict%' OR name ILIKE '%pancake%'
   OR name ILIKE '%waffle%' OR name ILIKE '%french toast%'
   OR name ILIKE '%mimosa%' OR name ILIKE '%omelette%'
   OR name ILIKE '%omelet%' OR name ILIKE '%egg%';

-- Comfort food
UPDATE dishes SET tags = array_cat(tags, ARRAY['comfort'])
WHERE category IN ('burger', 'wings', 'tendys', 'chowder', 'fries')
   OR name ILIKE '%mac%cheese%' OR name ILIKE '%grilled cheese%'
   OR name ILIKE '%meatball%' OR name ILIKE '%pot pie%'
   OR name ILIKE '%mashed%' OR name ILIKE '%gravy%';

-- Quick bite
UPDATE dishes SET tags = array_cat(tags, ARRAY['quick-bite'])
WHERE category IN ('sandwich', 'taco', 'burger', 'breakfast sandwich', 'fries', 'tendys')
   OR name ILIKE '%slider%';

-- === LOCAL TAGS ===

-- Local catch (MV seafood)
UPDATE dishes SET tags = array_cat(tags, ARRAY['local-catch'])
WHERE category IN ('seafood', 'lobster roll', 'clams', 'fish', 'chowder')
   OR name ILIKE '%lobster%' OR name ILIKE '%clam%'
   OR name ILIKE '%oyster%' OR name ILIKE '%scallop%'
   OR name ILIKE '%striped bass%' OR name ILIKE '%bluefish%'
   OR name ILIKE '%swordfish%' OR name ILIKE '%cod%';

-- Tourist classic
UPDATE dishes SET tags = array_cat(tags, ARRAY['tourist-classic'])
WHERE category IN ('lobster roll', 'chowder', 'clams')
   OR name ILIKE '%lobster roll%'
   OR name ILIKE '%clam chowder%'
   OR name ILIKE '%fried clams%';

-- === DIETARY TAGS (conservative — only obvious matches) ===

UPDATE dishes SET tags = array_cat(tags, ARRAY['vegetarian'])
WHERE name ILIKE '%vegetable%' OR name ILIKE '%veggie%'
   OR name ILIKE '%tofu%' OR name ILIKE '%garden%'
   OR category = 'salad';

UPDATE dishes SET tags = array_cat(tags, ARRAY['gluten-free'])
WHERE category IN ('salad', 'pokebowl')
   OR name ILIKE '%gluten%free%';

-- === META TAGS ===

-- Light
UPDATE dishes SET tags = array_cat(tags, ARRAY['light'])
WHERE category IN ('salad', 'pokebowl')
   OR name ILIKE '%light%' OR name ILIKE '%garden%';

-- Fresh
UPDATE dishes SET tags = array_cat(tags, ARRAY['fresh'])
WHERE category IN ('salad', 'pokebowl', 'sushi')
   OR name ILIKE '%fresh%' OR name ILIKE '%raw%'
   OR name ILIKE '%sashimi%' OR name ILIKE '%poke%';

-- Healthy
UPDATE dishes SET tags = array_cat(tags, ARRAY['healthy'])
WHERE category IN ('salad', 'pokebowl')
   OR name ILIKE '%grain%bowl%' OR name ILIKE '%quinoa%';

-- === PRICE TAGS (based on actual price) ===

UPDATE dishes SET tags = array_cat(tags, ARRAY['budget-friendly'])
WHERE price IS NOT NULL AND price < 15;

UPDATE dishes SET tags = array_cat(tags, ARRAY['splurge'])
WHERE price IS NOT NULL AND price >= 30;

-- === DEDUPLICATE TAGS ===
-- Remove any duplicate tags that got added by multiple rules
UPDATE dishes
SET tags = (
  SELECT ARRAY(SELECT DISTINCT unnest(tags) ORDER BY 1)
);

COMMIT;

-- === VERIFICATION QUERIES (run after commit) ===

-- Tag distribution
SELECT
  unnest(tags) AS tag,
  COUNT(*) AS dish_count
FROM dishes
GROUP BY 1
ORDER BY 2 DESC;

-- Dishes with fewer than 3 tags (may need manual attention)
SELECT id, name, category, tags, array_length(tags, 1) as tag_count
FROM dishes
WHERE array_length(tags, 1) < 3 OR tags = '{}'
ORDER BY name;

-- Total coverage
SELECT
  COUNT(*) FILTER (WHERE array_length(tags, 1) >= 3) AS well_tagged,
  COUNT(*) FILTER (WHERE array_length(tags, 1) < 3 OR tags = '{}') AS under_tagged,
  COUNT(*) AS total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE array_length(tags, 1) >= 3) / COUNT(*), 1) AS pct_covered
FROM dishes;
