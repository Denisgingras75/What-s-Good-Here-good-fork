# Search Engine v2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace naive single-word ILIKE search + raw avg_rating ranking with multi-word token search, intent-driven tags, and Bayesian confidence-adjusted ranking.

**Architecture:** Tags populated on every dish (5-12 per dish) with synonym expansion at query time. Multi-token AND search with fallback ladder (phrase → AND → cross-field → OR). Bayesian shrinkage ranking replaces raw avg_rating everywhere. All server-side via Postgres functions.

**Tech Stack:** Postgres (functions, triggers, GIN indexes), Supabase RPCs, React Query, Vitest

**Design Doc:** `docs/plans/2026-02-17-search-engine-v2-design.md`

---

## Task 1: Rewrite tag vocabulary in `src/constants/tags.js`

**Files:**
- Modify: `src/constants/tags.js`

**Step 1: Read current file**

Read `src/constants/tags.js` to understand current exports and consumers.

**Step 2: Write the new tag definitions**

Replace the entire file with the new intent-driven vocabulary. Keep existing exported function names (`getTagById`, `getTagLabel`, `matchTags`) so consumers don't break. Add synonym expansion map.

```js
// Centralized tag definitions for dish search + discovery
// Tags are intent-driven descriptors (not cuisine types — those live on restaurants)

// --- Tag Vocabulary ---
// Each tag has an operational definition for consistent tagging.
// See docs/plans/2026-02-17-search-engine-v2-design.md for full definitions.

// Texture/Preparation
export const TEXTURE_TAGS = [
  { id: 'crispy', label: 'Crispy' },
  { id: 'tender', label: 'Tender' },
  { id: 'smoky', label: 'Smoky' },
  { id: 'raw', label: 'Raw' },
  { id: 'fried', label: 'Fried' },
  { id: 'grilled', label: 'Grilled' },
]

// Flavor Profile
export const FLAVOR_TAGS = [
  { id: 'spicy', label: 'Spicy' },
  { id: 'sweet', label: 'Sweet' },
  { id: 'tangy', label: 'Tangy' },
  { id: 'savory', label: 'Savory' },
  { id: 'rich', label: 'Rich' },
]

// Occasion/Vibe
export const OCCASION_TAGS = [
  { id: 'quick-bite', label: 'Quick Bite' },
  { id: 'date-night', label: 'Date Night' },
  { id: 'late-night', label: 'Late Night' },
  { id: 'brunch', label: 'Brunch' },
  { id: 'comfort', label: 'Comfort' },
]

// Dietary
export const DIETARY_TAGS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
]

// Format
export const FORMAT_TAGS = [
  { id: 'shareable', label: 'Shareable' },
  { id: 'handheld', label: 'Handheld' },
  { id: 'big-plate', label: 'Big Plate' },
  { id: 'snack', label: 'Snack' },
  { id: 'side-dish', label: 'Side Dish' },
]

// Price Feel
export const PRICE_TAGS = [
  { id: 'budget-friendly', label: 'Budget-Friendly' },
  { id: 'splurge', label: 'Splurge' },
]

// Local Signal
export const LOCAL_TAGS = [
  { id: 'local-catch', label: 'Local Catch' },
  { id: 'island-favorite', label: 'Island Favorite' },
  { id: 'tourist-classic', label: 'Tourist Classic' },
]

// Meta (overlapping intent — resolved via synonym expansion)
export const META_TAGS = [
  { id: 'healthy', label: 'Healthy' },
  { id: 'fresh', label: 'Fresh' },
  { id: 'light', label: 'Light' },
]

// All tags combined
export const ALL_TAGS = [
  ...TEXTURE_TAGS, ...FLAVOR_TAGS, ...OCCASION_TAGS,
  ...DIETARY_TAGS, ...FORMAT_TAGS, ...PRICE_TAGS,
  ...LOCAL_TAGS, ...META_TAGS,
]

// --- Synonym Expansion (query-time) ---
// When a user types a term, expand to matching tag IDs before searching.
// This is NOT an ontology — it's a flat lookup table.
export const TAG_SYNONYMS = {
  'light':     ['light', 'fresh', 'healthy'],
  'healthy':   ['healthy', 'fresh', 'light'],
  'comfort':   ['comfort', 'rich', 'savory'],
  'hearty':    ['comfort', 'rich', 'big-plate'],
  'fresh':     ['fresh', 'light', 'raw'],
  'cheap':     ['budget-friendly'],
  'fancy':     ['date-night', 'splurge'],
  'quick':     ['quick-bite', 'handheld', 'snack'],
  'fried':     ['fried', 'crispy'],
  'bbq':       ['smoky', 'grilled'],
  'filling':   ['big-plate', 'comfort', 'rich'],
  'snack':     ['snack', 'quick-bite', 'side-dish'],
  'local':     ['local-catch', 'island-favorite'],
  'share':     ['shareable'],
  'kids':      ['handheld', 'comfort', 'budget-friendly'],
  'crispy':    ['crispy', 'fried'],
  'grilled':   ['grilled', 'smoky'],
  'spicy':     ['spicy'],
  'sweet':     ['sweet'],
  'vegetarian': ['vegetarian', 'vegan'],
  'vegan':     ['vegan'],
  'gluten-free': ['gluten-free'],
}

// Expand a search term to matching tag IDs
export function expandTagSynonyms(term) {
  if (!term) return []
  const key = term.toLowerCase().trim()
  return TAG_SYNONYMS[key] || []
}

// Get tag by id
export function getTagById(id) {
  return ALL_TAGS.find(tag => tag.id.toLowerCase() === id?.toLowerCase())
}

// Get tag label by id
export function getTagLabel(id) {
  const tag = getTagById(id)
  return tag?.label || id
}

// Match search term to tags (for autocomplete)
export function matchTags(searchTerm) {
  if (!searchTerm || searchTerm.trim().length < 2) return []
  const term = searchTerm.toLowerCase().trim()

  return ALL_TAGS
    .map(tag => {
      const id = tag.id.toLowerCase()
      const label = tag.label.toLowerCase()
      if (id === term || label === term) return { ...tag, score: 100 }
      if (id.startsWith(term) || label.startsWith(term)) return { ...tag, score: 80 }
      if (id.includes(term) || label.includes(term)) return { ...tag, score: 60 }
      return { ...tag, score: 0 }
    })
    .filter(tag => tag.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}
```

**Step 3: Verify no import breakage**

Run: `npm run build`
Expected: PASS (all existing exports preserved — `ALL_TAGS`, `getTagById`, `getTagLabel`, `matchTags`, `DIETARY_TAGS`)

Check: `CUISINE_TYPES` and `STYLE_TAGS` are removed. Grep for any imports of these and fix.

Run: `grep -r "CUISINE_TYPES\|STYLE_TAGS" src/`
If found, update those import sites to use the new tag group names or `ALL_TAGS`.

**Step 4: Run tests**

Run: `npm run test`
Expected: PASS

**Step 5: Commit**

```bash
git add src/constants/tags.js
git commit -m "Rewrite tag vocabulary: 32 intent-driven tags + synonym expansion"
```

---

## Task 2: Write tag population migration

**Files:**
- Create: `supabase/migrations/populate-intent-tags.sql`
- Modify: `supabase/schema.sql` (update tags column comment)

**Step 1: Write the migration SQL**

This migration uses category + dish name pattern matching to assign tags heuristically. It maps known patterns to tags. Every dish should end up with 5-12 tags.

```sql
-- Populate intent-driven tags on all dishes
-- Replaces old cuisine-type tags with searchable intent descriptors
-- Run in Supabase SQL Editor after review

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

-- === VERIFY ===
-- Check distribution
SELECT
  unnest(tags) AS tag,
  COUNT(*) AS dish_count
FROM dishes
GROUP BY 1
ORDER BY 2 DESC;

-- Check dishes with fewer than 3 tags (may need manual attention)
SELECT id, name, category, tags, array_length(tags, 1) as tag_count
FROM dishes
WHERE array_length(tags, 1) < 3 OR tags = '{}'
ORDER BY name;

COMMIT;
```

**Step 2: Review the migration output**

Run the migration in Supabase SQL Editor. Check the two verification queries:
- Tag distribution: every tag should appear on at least a few dishes
- Under-tagged dishes: manually add tags to any dish with <3 tags

**Step 3: Update schema.sql comment**

Add a comment in `supabase/schema.sql` on the tags column to reference the design doc.

**Step 4: Commit**

```bash
git add supabase/migrations/populate-intent-tags.sql supabase/schema.sql
git commit -m "Add tag population migration: 32 intent tags across all dishes"
```

---

## Task 3: Implement Bayesian ranking function in Postgres

**Files:**
- Modify: `supabase/schema.sql` (add `dish_search_score` function, update `get_ranked_dishes`)
- Create: `supabase/migrations/add-search-score.sql`

**Step 1: Write the `dish_search_score` function**

```sql
-- Bayesian confidence-adjusted ranking score
-- Used by get_ranked_dishes and search results. One brain everywhere.
CREATE OR REPLACE FUNCTION dish_search_score(
  p_avg_rating DECIMAL,
  p_total_votes BIGINT,
  p_distance_miles DECIMAL DEFAULT NULL,
  p_recent_votes_14d INT DEFAULT 0
)
RETURNS DECIMAL AS $$
DECLARE
  v_global_mean DECIMAL;
  v_prior_strength DECIMAL := 10;  -- m: tunable prior strength
  v_base_score DECIMAL;
  v_distance_bonus DECIMAL := 0;
  v_trend_bonus DECIMAL := 0;
  v_votes DECIMAL;
BEGIN
  -- Global mean rating across all dishes with votes
  SELECT COALESCE(AVG(avg_rating), 7.0)
  INTO v_global_mean
  FROM dishes
  WHERE total_votes > 0 AND avg_rating IS NOT NULL;

  v_votes := COALESCE(p_total_votes, 0);

  -- Bayesian shrinkage: (v/(v+m)) * R + (m/(v+m)) * C
  IF v_votes = 0 OR p_avg_rating IS NULL THEN
    v_base_score := v_global_mean;
  ELSE
    v_base_score := (v_votes / (v_votes + v_prior_strength)) * p_avg_rating
                  + (v_prior_strength / (v_votes + v_prior_strength)) * v_global_mean;
  END IF;

  -- Distance bonus (small, nearby = slight bump)
  IF p_distance_miles IS NOT NULL THEN
    IF p_distance_miles < 1 THEN
      v_distance_bonus := 0.3;
    ELSIF p_distance_miles < 3 THEN
      v_distance_bonus := 0.15;
    END IF;
  END IF;

  -- Trend bonus: log-based, capped at 0.25
  IF COALESCE(p_recent_votes_14d, 0) > 0 THEN
    v_trend_bonus := LEAST(0.05 * LN(1 + p_recent_votes_14d), 0.25);
  END IF;

  RETURN ROUND((v_base_score + v_distance_bonus + v_trend_bonus)::NUMERIC, 3);
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;
```

**Step 2: Update `get_ranked_dishes` to use the new score**

In `get_ranked_dishes`, add a CTE for recent votes and change the ORDER BY:

Add after the `best_variants` CTE:
```sql
recent_vote_counts AS (
  SELECT dish_id, COUNT(*)::INT AS recent_votes
  FROM votes
  WHERE created_at > NOW() - INTERVAL '14 days'
  GROUP BY dish_id
)
```

Add `recent_vote_counts` to the JOIN:
```sql
LEFT JOIN recent_vote_counts rvc ON rvc.dish_id = d.id
```

Add to the SELECT:
```sql
dish_search_score(
  COALESCE(ROUND(AVG(v.rating_10), 1), 0),
  COALESCE(vs.total_child_votes, COUNT(v.id)),
  fr.distance,
  COALESCE(rvc.recent_votes, 0)
) AS search_score
```

Change ORDER BY from:
```sql
ORDER BY avg_rating DESC NULLS LAST, total_votes DESC
```
To:
```sql
ORDER BY search_score DESC NULLS LAST, total_votes DESC
```

Add `rvc.recent_votes` to the GROUP BY clause.

Add `search_score DECIMAL` to the RETURNS TABLE definition.

**Step 3: Write migration file**

Create `supabase/migrations/add-search-score.sql` containing the function + updated `get_ranked_dishes`.

**Step 4: Run in Supabase SQL Editor**

Run the migration. Verify with a test call:
```sql
SELECT dish_name, avg_rating, total_votes, search_score
FROM get_ranked_dishes(41.3805, -70.6456, 50, NULL, NULL)
LIMIT 20;
```

Expected: dishes with more votes rank higher than dishes with slightly higher ratings but few votes. The `search_score` column should show values roughly in the 6.5-9.0 range.

**Step 5: Update schema.sql**

Add the `dish_search_score` function to schema.sql and update `get_ranked_dishes`.

**Step 6: Verify the app still works**

Run: `npm run build`
Expected: PASS

Check that Browse page and search results still load (the API layer already maps `avg_rating` — the new `search_score` field is additive, not breaking).

**Step 7: Update `dishesApi` to return search_score**

In `src/api/dishesApi.js`, update the `getRankedDishes` method's field mapping to include `search_score` from the RPC result. Update the `useDishes` hook if needed to expose it.

**Step 8: Commit**

```bash
git add supabase/migrations/add-search-score.sql supabase/schema.sql src/api/dishesApi.js
git commit -m "Add Bayesian ranking: dish_search_score() replaces raw avg_rating sort"
```

---

## Task 4: Fix multi-word search in `dishesApi.search()`

**Files:**
- Modify: `src/api/dishesApi.js` (rewrite `search` method)
- Test: `src/api/dishesApi.test.js` (add multi-word search tests)

**Step 1: Write failing tests for multi-word search behavior**

Add to `src/api/dishesApi.test.js`:

```js
describe('search - multi-word queries', () => {
  it('should use full phrase match for multi-word queries', async () => {
    // Setup mock that captures the query filter
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }
    supabase.from.mockReturnValue(mockQuery)

    await dishesApi.search('lobster roll')

    // Should search for full phrase, not just 'lobster'
    expect(mockQuery.or).toHaveBeenCalledWith(
      expect.stringContaining('lobster roll')
    )
  })

  it('should not use only the first word of multi-word queries', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      contains: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }
    supabase.from.mockReturnValue(mockQuery)

    await dishesApi.search('fried chicken')

    // Should NOT be searching for just 'fried'
    const orCalls = mockQuery.or.mock.calls.flat().join(' ')
    expect(orCalls).toContain('fried chicken')
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `npm run test -- src/api/dishesApi.test.js`
Expected: FAIL (current code only uses first word)

**Step 3: Rewrite `dishesApi.search()` with multi-token AND + fallback ladder**

Replace the current search method with:

```js
async search(query, limit = 5, town = null) {
  if (!query?.trim()) return []

  const sanitized = sanitizeSearchQuery(query, 50)
  if (!sanitized) return []

  // --- Tokenize ---
  const stopWords = new Set([
    'food', 'foods', 'the', 'a', 'an', 'and', 'or', 'for', 'of', 'at',
    'to', 'on', 'best', 'good', 'great', 'near', 'me', 'find', 'get',
    'want', 'looking', 'something', 'whats', "what's", 'is', 'some',
  ])
  const allWords = sanitized.toLowerCase().split(/\s+/).filter(w => w.length >= 2)
  const tokens = allWords.filter(w => !stopWords.has(w))

  // Keep the full phrase (with stopwords removed) for phrase matching
  const phrase = tokens.join(' ')

  // If no tokens after filtering, try the original sanitized query
  if (tokens.length === 0) return []

  // --- Synonym expansion for tag matching ---
  const expandedTags = []
  for (const token of tokens) {
    const synonyms = TAG_SYNONYMS[token]
    if (synonyms) {
      expandedTags.push(...synonyms)
    } else {
      expandedTags.push(token)
    }
  }
  const uniqueTags = [...new Set(expandedTags)]

  // --- Misspelling normalization ---
  const synonyms = {
    'indiana': 'indian', 'indain': 'indian',
    'italien': 'italian', 'italain': 'italian',
    'mexcian': 'mexican', 'maxican': 'mexican',
    'chineese': 'chinese', 'chinease': 'chinese',
    'japaneese': 'japanese', 'japenese': 'japanese',
    'thia': 'thai', 'tai': 'thai',
  }
  const normalizedTokens = tokens.map(t => synonyms[t] || t)
  const normalizedPhrase = normalizedTokens.join(' ')

  const selectFields = `
    id, name, category, tags, photo_url, price,
    value_score, value_percentile, total_votes, avg_rating,
    restaurants!inner ( id, name, is_open, cuisine, town )
  `

  const buildQuery = () => {
    return supabase
      .from('dishes')
      .select(selectFields)
      .eq('restaurants.is_open', true)
  }

  const applyTownFilter = (results) => {
    if (!town || !results) return results
    return results.filter(d => d.restaurants?.town === town)
  }

  const transformResults = (dishes) => {
    return dishes
      .filter(d => d.restaurants)
      .map(d => ({
        dish_id: d.id,
        dish_name: d.name,
        category: d.category,
        tags: d.tags || [],
        photo_url: d.photo_url,
        price: d.price,
        value_score: d.value_score,
        value_percentile: d.value_percentile,
        total_votes: d.total_votes || 0,
        avg_rating: d.avg_rating,
        restaurant_id: d.restaurants?.id,
        restaurant_name: d.restaurants?.name,
        restaurant_cuisine: d.restaurants?.cuisine,
        restaurant_town: d.restaurants?.town,
      }))
  }

  // --- Fallback ladder ---
  // Level 1: Exact phrase match on dish name
  // Level 2: AND tokens on dish name
  // Level 3: AND tokens across name + category + restaurant + tags
  // Level 4: OR tokens (broadest)

  let results = []
  const fetchLimit = town ? limit * 4 : limit

  try {
    // Level 1: Phrase match on name
    if (tokens.length > 1) {
      const { data, error } = await buildQuery()
        .ilike('name', `%${normalizedPhrase}%`)
        .order('avg_rating', { ascending: false, nullsFirst: false })
        .limit(fetchLimit)
      if (!error && data) {
        results = applyTownFilter(data)
      }
    }

    // Level 2: AND tokens on name (if phrase didn't get enough)
    if (results.length < limit && tokens.length > 1) {
      let q = buildQuery()
      for (const token of normalizedTokens) {
        q = q.ilike('name', `%${token}%`)
      }
      const { data, error } = await q
        .order('avg_rating', { ascending: false, nullsFirst: false })
        .limit(fetchLimit)
      if (!error && data) {
        const filtered = applyTownFilter(data)
        const existingIds = new Set(results.map(d => d.id))
        for (const d of filtered) {
          if (!existingIds.has(d.id)) {
            results.push(d)
            existingIds.add(d.id)
          }
        }
      }
    }

    // Level 3: Cross-field search (name OR category OR cuisine + tag overlap)
    if (results.length < limit) {
      // Build OR filter for name + category + cuisine
      const orFilters = normalizedTokens.map(t =>
        `name.ilike.%${t}%,category.ilike.%${t}%`
      ).join(',')

      const [fieldResult, tagResult] = await Promise.all([
        buildQuery()
          .or(orFilters)
          .order('avg_rating', { ascending: false, nullsFirst: false })
          .limit(fetchLimit),
        buildQuery()
          .overlaps('tags', uniqueTags)
          .order('avg_rating', { ascending: false, nullsFirst: false })
          .limit(fetchLimit),
      ])

      const existingIds = new Set(results.map(d => d.id))
      for (const result of [fieldResult, tagResult]) {
        if (!result.error && result.data) {
          const filtered = applyTownFilter(result.data)
          for (const d of filtered) {
            if (!existingIds.has(d.id)) {
              results.push(d)
              existingIds.add(d.id)
            }
          }
        }
      }
    }

    // Level 4: OR tokens as broadest fallback (if still under limit)
    if (results.length < 3) {
      const orFilters = normalizedTokens.map(t =>
        `name.ilike.%${t}%`
      ).join(',')

      const { data, error } = await buildQuery()
        .or(orFilters)
        .order('avg_rating', { ascending: false, nullsFirst: false })
        .limit(fetchLimit)

      if (!error && data) {
        const filtered = applyTownFilter(data)
        const existingIds = new Set(results.map(d => d.id))
        for (const d of filtered) {
          if (!existingIds.has(d.id)) {
            results.push(d)
            existingIds.add(d.id)
          }
        }
      }
    }

    // Sort by rating and limit
    results.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
    return transformResults(results.slice(0, limit))

  } catch (error) {
    logger.error('Error searching dishes:', error)
    throw error.type ? error : createClassifiedError(error)
  }
}
```

**Step 4: Add `TAG_SYNONYMS` import to dishesApi.js**

```js
import { TAG_SYNONYMS } from '../constants/tags'
```

**Step 5: Run tests to verify they pass**

Run: `npm run test -- src/api/dishesApi.test.js`
Expected: PASS

**Step 6: Run full build**

Run: `npm run build`
Expected: PASS

**Step 7: Commit**

```bash
git add src/api/dishesApi.js src/api/dishesApi.test.js
git commit -m "Multi-word search: phrase + AND tokens + tag synonym expansion"
```

---

## Task 5: Wire search_score into Browse feed and verify end-to-end

**Files:**
- Modify: `src/api/dishesApi.js` (add search_score to field mapping in getRankedDishes)
- Modify: `src/hooks/useDishes.js` (expose search_score if needed)

**Step 1: Update getRankedDishes field mapping**

In `dishesApi.js`, find the `getRankedDishes` method's `.map()` transform and add `search_score: item.search_score` to the returned object.

**Step 2: Verify Browse page loads correctly**

Run: `npm run dev`
Open Browse page. Dishes should now be ranked by the Bayesian score instead of raw avg_rating. Dishes with more votes should rank higher than high-rating-but-low-vote dishes.

**Step 3: Run full test suite**

Run: `npm run test`
Expected: PASS

Run: `npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add src/api/dishesApi.js src/hooks/useDishes.js
git commit -m "Wire search_score into Browse feed ranking"
```

---

## Task 6: Update TASKS.md and DEVLOG.md

**Files:**
- Modify: `TASKS.md`
- Modify: `DEVLOG.md`

**Step 1: Add T35 to TASKS.md**

Add a new task entry for the search engine v2 work:

```markdown
## T35: Search Engine v2 — Tags + Ranking + Multi-word Search

**Why:** Search was broken: single-word ILIKE, empty tags, raw avg_rating ranking.

**What was done (Sprint 1+2):**
- 32 intent-driven tags defined with operational definitions
- Tag population migration across all dishes (5-12 tags each)
- Synonym expansion table for query-time intent matching
- Bayesian confidence-adjusted ranking (dish_search_score) replaces raw avg_rating
- Multi-word search with fallback ladder: phrase → AND → cross-field → OR
- Tag-aware search via .overlaps() on expanded synonyms

**What's next (Sprint 3):**
- Postgres FTS with denormalized restaurant fields
- Trigram fuzzy fallback (pg_trgm)
- Server-side query parser (town, price, restaurant extraction)

**Files:** `src/constants/tags.js`, `src/api/dishesApi.js`, `supabase/schema.sql`, `supabase/migrations/`
```

**Step 2: Add DEVLOG entry**

**Step 3: Commit**

```bash
git add TASKS.md DEVLOG.md
git commit -m "Update docs: T35 search engine v2 progress"
```

---

## Verification Checklist (run before calling done)

- [ ] `npm run build` passes
- [ ] `npm run test` passes
- [ ] Search "lobster roll" → lobster rolls ranked first, not lobster bisque
- [ ] Search "fried chicken" → fried chicken dishes, not just anything with "fried"
- [ ] Search "something light" → salads, poke bowls (via tag synonym expansion)
- [ ] Search "spicy" → finds spicy dishes even if "spicy" isn't in the name
- [ ] Browse feed: 8.5/30 votes ranks above 9.0/2 votes
- [ ] Browse feed: no crashes on dishes with 0 votes or null ratings
- [ ] Tags populated: `SELECT COUNT(*) FROM dishes WHERE array_length(tags, 1) >= 3` > 90% of dishes
