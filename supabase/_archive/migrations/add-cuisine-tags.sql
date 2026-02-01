-- Migration: Add cuisine to restaurants and tags to dishes
-- Enables searching/filtering by cuisine type, dish style, and dietary preferences

-- ============================================
-- STEP 1: Add cuisine column to restaurants
-- ============================================
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS cuisine TEXT;
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine);

-- ============================================
-- STEP 2: Add tags array to dishes
-- ============================================
ALTER TABLE dishes ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_dishes_tags ON dishes USING GIN(tags);

-- ============================================
-- STEP 3: Auto-populate restaurant cuisines
-- Based on restaurant name patterns
-- ============================================

-- Seafood restaurants
UPDATE restaurants SET cuisine = 'seafood'
WHERE cuisine IS NULL AND (
  name ILIKE '%seafood%' OR
  name ILIKE '%oyster%' OR
  name ILIKE '%lobster%' OR
  name ILIKE '%clam%' OR
  name ILIKE '%crab%'
);

-- Mexican restaurants
UPDATE restaurants SET cuisine = 'mexican'
WHERE cuisine IS NULL AND (
  name ILIKE '%taco%' OR
  name ILIKE '%mexican%' OR
  name ILIKE '%burrito%' OR
  name ILIKE '%cantina%'
);

-- Italian restaurants
UPDATE restaurants SET cuisine = 'italian'
WHERE cuisine IS NULL AND (
  name ILIKE '%pizza%' OR
  name ILIKE '%italian%' OR
  name ILIKE '%trattoria%' OR
  name ILIKE '%ristorante%' OR
  name ILIKE '%pasta%'
);

-- Asian restaurants
UPDATE restaurants SET cuisine = 'asian'
WHERE cuisine IS NULL AND (
  name ILIKE '%thai%' OR
  name ILIKE '%chinese%' OR
  name ILIKE '%asian%' OR
  name ILIKE '%wok%' OR
  name ILIKE '%sushi%' OR
  name ILIKE '%ramen%' OR
  name ILIKE '%pho%'
);

-- American (default for taverns, grills, etc.)
UPDATE restaurants SET cuisine = 'american'
WHERE cuisine IS NULL AND (
  name ILIKE '%tavern%' OR
  name ILIKE '%grill%' OR
  name ILIKE '%bar & grill%' OR
  name ILIKE '%diner%' OR
  name ILIKE '%pub%'
);

-- ============================================
-- STEP 4: Auto-populate dish tags
-- Based on dish name patterns
-- ============================================

-- Dietary: Vegetarian
UPDATE dishes SET tags = array_append(tags, 'vegetarian')
WHERE NOT ('vegetarian' = ANY(tags)) AND (
  name ILIKE '%veggie%' OR
  name ILIKE '%vegetarian%' OR
  name ILIKE '%garden%burger%' OR
  name ILIKE '%impossible%' OR
  name ILIKE '%beyond%'
);

-- Dietary: Vegan
UPDATE dishes SET tags = array_append(tags, 'vegan')
WHERE NOT ('vegan' = ANY(tags)) AND (
  name ILIKE '%vegan%'
);

-- Dietary: Gluten-free
UPDATE dishes SET tags = array_append(tags, 'gluten-free')
WHERE NOT ('gluten-free' = ANY(tags)) AND (
  name ILIKE '%gluten%free%' OR
  name ILIKE '%gf %' OR
  name ILIKE '%(gf)%'
);

-- Style: Smash burger
UPDATE dishes SET tags = array_append(tags, 'smash')
WHERE NOT ('smash' = ANY(tags)) AND (
  name ILIKE '%smash%' AND category = 'burger'
);

-- Style: Caesar
UPDATE dishes SET tags = array_append(tags, 'caesar')
WHERE NOT ('caesar' = ANY(tags)) AND (
  name ILIKE '%caesar%'
);

-- Style: Buffalo
UPDATE dishes SET tags = array_append(tags, 'buffalo')
WHERE NOT ('buffalo' = ANY(tags)) AND (
  name ILIKE '%buffalo%'
);

-- Style: BBQ
UPDATE dishes SET tags = array_append(tags, 'bbq')
WHERE NOT ('bbq' = ANY(tags)) AND (
  name ILIKE '%bbq%' OR name ILIKE '%barbecue%'
);

-- Style: Spicy
UPDATE dishes SET tags = array_append(tags, 'spicy')
WHERE NOT ('spicy' = ANY(tags)) AND (
  name ILIKE '%spicy%' OR
  name ILIKE '%hot %' OR
  name ILIKE '%jalapeno%' OR
  name ILIKE '%sriracha%'
);
