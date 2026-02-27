# T36: Client-Side Search Migration

## Problem

Search makes up to 5 sequential Supabase API calls (4-level fallback ladder). On spotty MV cell service, each round-trip adds 100-300ms. Worst case: 400ms-1.2s before results appear. We already shipped a bug where tag results leaked through without filtering (db9a703) due to the complexity.

The dataset is ~300 dishes. Caching them all is ~50KB — smaller than one food photo.

## Approach

**Approach A: Single "all dishes" query + pure JS filter.**

Load all dishes once on app start via React Query. Search becomes zero-latency JavaScript filtering. One cache, one filter function, zero network calls on search. Works offline after first load.

## Design

### Data Layer

**New: `dishesApi.getAllSearchable()`**

Fetches all dishes with search-relevant fields:
- `id, name, category, tags, photo_url, price, avg_rating, total_votes, value_score, value_percentile`
- Joined: `restaurants(id, name, is_open, cuisine, town, lat, lng)`

No filters. ~300 rows, ~50KB. React Query caches with 5-minute staleTime, refetches on window focus.

**Delete: `dishesApi.search()`** — the entire 4-level fallback ladder (lines 81-303).

### Search Logic

**New: `searchDishes(dishes, query, options)` in `src/utils/dishSearch.js`**

Pure function. Takes cached dish array + query string, returns filtered + ranked results.

Logic ported from current `dishesApi.search()`:

1. Sanitize + tokenize — strip stop words, normalize misspellings (same maps)
2. Expand tag synonyms — "light" -> [light, fresh, healthy] (same TAG_SYNONYMS)
3. Score each dish in one pass:
   - Exact phrase match on name: 100
   - All tokens match in name: 80
   - Tokens match across name + category: 60
   - Tag overlap: 40
   - Single token partial match on name: 20
   - Tiebreaker: avg_rating descending
4. Filter out score-0 dishes
5. Optional town filter
6. Sort by score then rating, return top N

Same matching behavior as current ladder, expressed as single scoring pass. ~1ms execution.

### Hook Layer

**Rewrite: `useDishSearch(query, limit, town)`**

Same API signature. Internally:
1. Calls `useAllDishes()` for cached dish array
2. Runs `searchDishes()` via `useMemo`
3. Returns `{ results, loading, error }` — same shape

**New: `useAllDishes()`**

Thin React Query wrapper:
- queryKey: ['allDishes']
- staleTime: 5 minutes
- gcTime: 30 minutes

**DishSearch.jsx:** Replace direct `dishesApi.search()` useEffect with `useDishSearch` hook. Same hook all consumers use.

### What Gets Deleted

- `dishesApi.search()` — lines 81-303
- `dishesApi.test.js` — search-specific mocks for old network calls
- `DishSearch.jsx` lines 77-107 — useEffect calling dishesApi.search() directly
- `useDishSearch.js` — rewritten (no more queryFn: dishesApi.search())

### What Gets Created

- `src/utils/dishSearch.js` — pure searchDishes() function
- `src/utils/dishSearch.test.js` — unit tests with mock dish arrays
- `src/hooks/useAllDishes.js` — React Query wrapper
- `dishesApi.getAllSearchable()` method in existing file

### What Stays Untouched

- DishSearch.jsx UI rendering
- Map.jsx and Browse.jsx (call useDishSearch, same signature)
- sanitize.js, tags.js
- All RPCs, schema, Edge Functions

### Search result display

Name + restaurant name + rating. No changes to current display.

## Acceptance Criteria

- Search results appear in <50ms (no network dependency)
- "fried chicken sandwich" returns only fried chicken sandwiches
- "healthy" returns dishes tagged fresh/light via synonym expansion
- Single-word searches ("lobster", "pizza") return relevant results
- Town filter still works
- npm run build passes
- npm run test passes

## Risks

- **Data staleness:** New dishes won't appear until React Query refetches (on window focus or 5-min timer). Acceptable — dishes are added weekly, not per-minute.
- **Scale:** At 5,000 dishes (~750KB), still fine. Would revisit at tens of thousands.
- **First-load window:** ~1s before cache is ready. Users don't search within 1s of opening. Show spinner if needed.
