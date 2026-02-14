# TASKS.md — High-Leverage Backlog

> Atomic tasks ranked by impact on correctness, data integrity, UX clarity, or shipping velocity.
> Each task includes acceptance criteria (observable behavior) and likely files to touch.

---

## ~~T01: Remove `profiles_delete_own` RLS policy from schema.sql~~ DONE

**Why:** Users should not be able to delete their own profile row. Doing so would orphan votes, follows, and other FK-referencing data. Owner confirmed this is wrong.

**Acceptance criteria:**
- `schema.sql` no longer contains `profiles_delete_own` policy
- `DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;` has been run in Supabase SQL Editor
- Verified via: `SELECT policyname FROM pg_policies WHERE tablename = 'profiles';` shows no DELETE policy

**Files:** `supabase/schema.sql:398`

---

## ~~T02: Verify production RLS matches schema.sql — clean up duplicate policies~~ DONE

**Why:** `schema.sql:1927-1964` documents known duplicate policies in production (follows, profiles, dishes, specials, storage.objects). If not cleaned up, redundant policies increase evaluation cost on every row access and could create unexpected permission grants.

**Acceptance criteria:**
- Run in Supabase dashboard: `SELECT tablename, policyname, cmd FROM pg_policies ORDER BY tablename, policyname;`
- Compare against `schema.sql` section 3
- Drop any policy that duplicates an existing one
- Document which policies were dropped in DEVLOG.md

**Files:** `supabase/schema.sql` (section 17), `supabase/fix-profiles-rls.sql` (apply or delete)

---

## ~~T03: Fix stale design tokens in CLAUDE.md~~ DONE

**Why:** CLAUDE.md says primary is `#F47A1F` (orange) and rating is `#E6B84C` (gold), but actual CSS uses `#C85A54` (Deep Rust) and `#D9A765` (Warm Gold). This misleads anyone reading CLAUDE.md.

**Acceptance criteria:**
- CLAUDE.md design tokens section matches `src/index.css:35-79`
- Colors listed: Primary `#C85A54`, Accent Gold `#D9A765`, Rating `#6BB384`, BG `#0D1B22`
- Theme name "Island Depths" is mentioned

**Files:** `CLAUDE.md:70-73`

---

## ~~T04: Fix pending vote storage key mismatch in CLAUDE.md~~ DONE

**Why:** CLAUDE.md says key is `wgh_pending_vote` but actual code uses `whats_good_here_pending_vote`. Anyone reading CLAUDE.md would use the wrong key.

**Acceptance criteria:**
- CLAUDE.md localStorage keys section lists the correct key: `whats_good_here_pending_vote`

**Files:** `CLAUDE.md:78`

---

## ~~T05: Migrate `useFavorites` to React Query~~ DONE

**Why:** `useFavorites` uses raw `useEffect` + `useState` for data fetching, violating the stated architecture principle "React Query is the data fetching layer... Never add raw `useEffect` + `fetch` patterns." This means favorites don't benefit from React Query's caching, deduplication, or background refetching.

**Acceptance criteria:**
- `useFavorites` uses `useQuery` for fetching and `useMutation` for add/remove
- Optimistic updates preserved via React Query's `onMutate`/`onError` rollback
- No raw `useEffect` for data fetching remains in the hook
- `npm run build` passes
- `npm run test` passes

**Files:** `src/hooks/useFavorites.js`, `src/api/favoritesApi.js`

---

## ~~T06: Move `LocationContext` to use `storage.js` helpers~~ DONE

**Why:** `LocationContext.jsx` calls `localStorage.getItem/setItem` directly in 6+ places, violating the CLAUDE.md rule "Direct localStorage calls (use `src/lib/storage.js`)". This bypasses the in-memory cache and private-browsing safety wrappers in `storage.js`.

**Acceptance criteria:**
- All `localStorage.getItem`/`setItem` calls in `LocationContext.jsx` replaced with `getStorageItem`/`setStorageItem` from `src/lib/storage.js`
- Behavior unchanged (radius, town, permission state persist across reloads)
- `npm run build` passes

**Files:** `src/context/LocationContext.jsx`

---

## ~~T07: Move `AuthContext` to use `storage.js` helpers for non-Supabase storage~~ DONE

**Why:** `AuthContext.jsx:77-81` directly calls `sessionStorage.removeItem` and `localStorage.removeItem` to clear email. Should use storage helpers for consistency and private-browsing safety.

**Acceptance criteria:**
- Direct `sessionStorage`/`localStorage` calls in `AuthContext.jsx` replaced with `removeStorageItem` from `src/lib/storage.js`
- Sign-out still clears cached email
- `npm run build` passes

**Files:** `src/context/AuthContext.jsx:77-81`, `src/lib/storage.js`

---

## ~~T08: `dishesApi.search` — audit string interpolation in `.or()` for injection safety~~ DONE

**Why:** `dishesApi.search` constructs a PostgREST `.or()` filter with string interpolation: `` .or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`) ``. While `sanitizeSearchQuery` is called first, PostgREST filter syntax characters (`.`, `,`, `(`, `)`) in the search term could break the filter or produce unexpected behavior. The `.replace(/[.,()]/g, '')` only strips some characters.

**Acceptance criteria:**
- Verify `sanitizeSearchQuery` strips or escapes all PostgREST-significant characters (`.`, `,`, `(`, `)`, `%`, `*`)
- Add a test case: search for `"name.ilike.%"` and confirm it doesn't bypass the filter
- If gaps exist, tighten `sanitizeSearchQuery` or switch to PostgREST's structured filter API

**Files:** `src/api/dishesApi.js:164-170`, `src/utils/sanitize.js`

---

## ~~T09: `dishesApi.getDishById` computes `avg_rating` client-side — use pre-computed column instead~~ DONE

**Why:** `getDishById` fetches all votes for a dish and computes `avg_rating` in JS, but the `dishes` table already has a pre-computed `avg_rating` column maintained by the `update_dish_avg_rating` trigger. The client-side calculation could disagree with the pre-computed value and wastes bandwidth fetching all vote rows.

**Acceptance criteria:**
- `getDishById` returns `dish.avg_rating` directly from the dishes table
- Separate vote fetch only needed for `total_votes` and `yes_votes` counts (or use pre-computed `total_votes`/`yes_votes` columns)
- `npm run build` passes

**Files:** `src/api/dishesApi.js:352-412`

---

## ~~T10: Apply or delete `supabase/fix-profiles-rls.sql`~~ DONE

**Why:** This uncommitted file drops old RLS policies but doesn't create replacements (they already exist in `schema.sql`). It's been sitting as an untracked file. Either apply it in production and delete, or just delete if the old policies were already cleaned up.

**Acceptance criteria:**
- If old policies still exist in production: run the DROP statements in Supabase SQL Editor
- Delete `supabase/fix-profiles-rls.sql` from the repo
- Verify via `SELECT policyname FROM pg_policies WHERE tablename = 'profiles';`

**Files:** `supabase/fix-profiles-rls.sql`

---

## ~~T11: `value_score.sql` migration view lacks `SECURITY INVOKER`~~ DONE

**Why:** The standalone `value_score.sql` migration creates `category_median_prices` view without `WITH (security_invoker = true)`, but `schema.sql:264` has it. If the migration was run after the schema, it may have overwritten the SECURITY INVOKER setting, meaning the view runs as the creator's permissions instead of the caller's.

**Acceptance criteria:**
- Verify in Supabase: `SELECT schemaname, viewname, definition FROM pg_views WHERE viewname = 'category_median_prices';`
- If `security_invoker` is not set, run `CREATE OR REPLACE VIEW` with the `schema.sql:262-271` version
- Update `supabase/migrations/value_score.sql` to include `WITH (security_invoker = true)` for consistency

**Files:** `supabase/migrations/value_score.sql:10-16`, `supabase/schema.sql:262-271`

---

## ~~T12: `ALL_CATEGORIES` has duplicate `seafood` entry~~ DONE

**Why:** `categories.js` line 47 adds `{ id: 'seafood', label: 'Seafood', emoji: '🦐' }` to `ALL_CATEGORIES`, but `seafood` already exists in `MAIN_CATEGORIES` (line 38) which is spread into `ALL_CATEGORIES`. The duplicate means `getCategoryById('seafood')` may return inconsistent results and `matchCategories` returns duplicate suggestions.

**Acceptance criteria:**
- `ALL_CATEGORIES` contains exactly one entry per category ID
- No duplicate IDs in the array
- `matchCategories('seafood')` returns one result, not two

**Files:** `src/constants/categories.js:45-61`

---

## ~~T13: Consensus trigger doesn't re-score existing voters when new consensus is reached~~ DONE

**Why:** `check_consensus_after_vote` (schema.sql:1601-1677) only fires the consensus scoring loop when `consensus_ready` transitions from FALSE to TRUE. Votes cast after consensus is already reached are never scored — they don't get `scored_at` set, don't create `bias_events`, and don't update `user_rating_stats`. This means late voters never see how they compared.

**Acceptance criteria:**
- Votes cast after `consensus_ready = TRUE` are still scored against the consensus
- `bias_events` are created for late voters
- `user_rating_stats` updated for late voters
- OR: document this as intentional behavior with a comment in the trigger

**Files:** `supabase/schema.sql:1601-1677`

---

## ~~T14: `dishes.yes_votes` column exists but is never populated by triggers~~ DONE

**Why:** The `dishes` table has `yes_votes INT DEFAULT 0` (schema.sql:51), but the `update_dish_avg_rating` trigger (schema.sql:1679-1695) only updates `avg_rating` and `total_votes` — it never updates `yes_votes`. The column is always 0 in the database. The RPCs compute yes_votes on-the-fly from the votes table, so the column is effectively dead.

**Acceptance criteria:**
- Either: add `yes_votes` update to the `update_dish_avg_rating` trigger
- Or: remove the `yes_votes` column from `dishes` table if it's truly unused
- Verify no client code relies on `dishes.yes_votes` directly

**Files:** `supabase/schema.sql:51,1679-1695`

---

## ~~T15: No automated CI for `npm run build` or `npm run test`~~ DONE

**Why:** CLAUDE.md mandates "npm run build must pass" and "npm run test must pass" before calling anything done, but there's no CI config (GitHub Actions, Vercel build checks beyond deploy). Regressions can ship silently.

**Acceptance criteria:**
- A `.github/workflows/ci.yml` (or equivalent) runs `npm run build` and `npm run test` on PRs to main
- Or: Vercel build step includes `npm run test` before deploy
- Build failures block merge/deploy

**Files:** New: `.github/workflows/ci.yml` or `vercel.json` build command update

---

## ~~T16: `_archive/` directory in `src/` contains stale backup~~ DONE

**Why:** `src/_archive/BrowseCategoryGrid.jsx.bak` is dead code checked into the repo. Per CLAUDE.md: "Delete unused code immediately — Don't let dead code accumulate."

**Acceptance criteria:**
- `src/_archive/` directory is deleted
- No imports reference it
- `npm run build` passes

**Files:** `src/_archive/BrowseCategoryGrid.jsx.bak`

---

## ~~T17: `get_ranked_dishes` missing `SECURITY DEFINER` — leaks restaurant/dish data via RLS bypass~~ DONE

**Why:** `get_ranked_dishes` is `STABLE` but not `SECURITY DEFINER`. Since restaurants and dishes have public SELECT policies this is fine today, but if SELECT policies were ever tightened (e.g., hiding closed restaurants), the function would respect the caller's RLS and might return inconsistent results depending on auth state. Most other RPCs that need cross-table access use `SECURITY DEFINER`.

**Acceptance criteria:**
- Verify this is intentional: `get_ranked_dishes` only reads public-read tables
- If intentional, add a comment: `-- Intentionally NOT SECURITY DEFINER: all referenced tables have public SELECT`
- If not intentional, add `SECURITY DEFINER`

**Files:** `supabase/schema.sql:538`

---

## ~~T18: Rate limit cleanup is probabilistic — old entries may accumulate~~ DONE

**Why:** `check_and_record_rate_limit` (schema.sql:1461) only cleans up old entries with `random() < 0.01` (1% chance per call). Under low traffic, rate_limits table entries older than 1 hour can accumulate indefinitely. The pg_cron job for value percentiles exists but there's no scheduled cleanup for rate_limits.

**Acceptance criteria:**
- Either: add a pg_cron job to run `DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '1 hour'` hourly
- Or: increase the cleanup probability to 5-10%
- Or: document this as acceptable for the current scale

**Files:** `supabase/schema.sql:1461`

---

## ~~T19: `compute_value_score` trigger lacks `SECURITY DEFINER`~~ DONE

**Why:** Other trigger functions (`on_vote_insert`, `check_consensus_after_vote`, `update_dish_avg_rating`, `update_user_streak_on_vote`) all have `SECURITY DEFINER`. `compute_value_score` (schema.sql:1740) does not, which means it runs with the invoking user's permissions. Since it reads `category_median_prices` view (which has `SECURITY INVOKER`), the chain works today because dishes have public SELECT. But inconsistency with other triggers is a maintenance risk.

**Acceptance criteria:**
- Add `SECURITY DEFINER` to `compute_value_score` for consistency with other trigger functions
- Or: document why it's intentionally different

**Files:** `supabase/schema.sql:1740-1771`

---

## ~~T20: CLAUDE.md project structure section lists `seed.sql` but actual structure is `seed/` directory~~ DONE

**Why:** CLAUDE.md says `supabase/seed.sql` but actual seed data is in `supabase/seed/` with 17+ files. This misleads developers looking for seed data.

**Acceptance criteria:**
- CLAUDE.md project structure updated to show `supabase/seed/` directory
- Mention that seed files are run manually in SQL Editor

**Files:** `CLAUDE.md:36-37`

---

## ~~T21: Add Open/Closed tabs to Restaurants page~~ DONE

**Why:** People search "what's open on MV" — the restaurant list needs Open/Closed filtering.

**Acceptance criteria:**
- Open/Closed tab switcher on restaurant list (defaults to Open)
- Closed restaurants show at 0.6 opacity with "Closed for Season" badge
- Tab-aware empty states
- `npm run build` passes

**Files:** `src/pages/Restaurants.jsx`

---

## ~~T22: Populate menu_section data on all dishes~~ DONE

**Why:** Menu tab showed "Menu not set up yet" because dishes lacked `menu_section` data.

**Acceptance criteria:**
- All dishes have `menu_section` populated based on category mapping
- Each restaurant has `menu_section_order` array in canonical display order
- Migration run in Supabase SQL Editor successfully
- Menu tab shows grouped sections

**Files:** `supabase/migrations/populate-menu-sections.sql`

---

## ~~T23: Redesign Menu tab as split-pane layout~~ DONE

**Why:** Vertical scrolling through all menu sections was too long. Split-pane (section nav left, dishes right) is more intuitive and mirrors real menu navigation.

**Acceptance criteria:**
- Left panel: section names as nav (33% width), gold accent on active
- Right panel: dishes sorted by rating, typographic layout with name/price/rating
- Tapping dish navigates to detail page
- Search filters work across sections
- `npm run build` passes

**Files:** `src/components/restaurants/RestaurantMenu.jsx`, `src/components/restaurants/index.js`

---

## T24: Add dessert dishes to restaurants

**Why:** Desserts category exists in the app but no restaurants have dessert dishes seeded yet.

**Acceptance criteria:**
- Dessert dishes added to relevant restaurants with correct prices
- `category = 'dessert'`, `menu_section = 'Desserts'`
- `menu_section_order` updated to include 'Desserts' for each restaurant
- Template ready at `supabase/seed/menus/add-desserts.sql`

**Status:** Waiting on specific restaurant + dessert list from owner

**Files:** `supabase/seed/menus/add-desserts.sql`

---

## ~~T25: Convert specific restaurants to breakfast menu sections~~ REMOVED

**Reason:** No longer needed — menus are being manually curated to match each restaurant's actual menu.

---

## T26: Homepage — trust signal, emotional hook, brand signature

**Why:** After the layout simplification (Feb 13), the homepage is clean and functional but lacks magnetism. Three connected problems remain:

### 1. Trust signal too quiet
"Ranked by people who know" is a tagline, not proof. There's no specificity — no vote count, no restaurant count, nothing that makes a new user think "this data is real." Trust comes from numbers and social proof, not claims.

### 2. Emotional hook is medium
The homepage is calm-premium but not magnetic-premium. The headline restates the app name. There's no tension, no FOMO, no "you're about to discover something." Nothing makes you *want* to scroll.

### 3. Brand signature still forming
If you cover the logo, nothing identifies this as What's Good Here. No visual or verbal moment is uniquely this app. The best brands have a signature — a gesture, a phrase, a pattern that's only theirs. These three are connected: a strong brand signature *is* the trust signal *is* the emotional hook.

**Approach:** Brainstorm before coding. This is a design/copy problem, not a component problem. Explore what the signature moment could be — the one thing that makes someone instantly feel "this is the real list."

**Acceptance criteria:**
- Homepage makes a first-time visitor feel the rankings are credible (trust)
- Something on the page creates desire to explore, not just permission to browse (hook)
- A visual or verbal element is unmistakably "What's Good Here" (signature)

**Status:** Ready for brainstorming session

**Files:** `src/pages/Home.jsx`, `src/components/home/SearchHero.jsx`, `src/components/home/Top10Compact.jsx`

---

## T27: Add OG image for social sharing previews

**Why:** `index.html` references `/og-image.png` but the file doesn't exist. When someone shares the app link on Instagram, iMessage, Slack, or Twitter — no preview image shows up. This makes the app look broken or unfinished on every share.

**Acceptance criteria:**
- `public/og-image.png` exists (1200x630px)
- Image shows app branding (logo, tagline, dark background matching Island Depths theme)
- Sharing the app URL on iMessage/Instagram/Twitter shows the image in the preview card
- `index.html` og:image and twitter:image URLs resolve correctly

**Status:** Ready — needs design asset created then dropped into `public/`

**Files:** `public/og-image.png`, `index.html`

---

## T28: Add dynamic meta tags for dish/restaurant sharing

**Why:** Every shared link shows the same generic preview: "What's Good Here — Find the best dishes..." When someone shares a specific dish like `/dish/abc123`, the preview should say "Lobster Roll at Larsen's Fish Market" with the dish photo. Without this, shared links have no context and get fewer clicks.

**Acceptance criteria:**
- Install `react-helmet-async`
- Dish detail page sets og:title to `{dish_name} at {restaurant_name}`, og:description to rating/votes summary, og:image to dish photo
- Restaurant page sets og:title to restaurant name
- Fallback to default meta tags on pages without dynamic data
- `npm run build` passes

**Status:** Ready

**Files:** `src/pages/Dish.jsx`, `src/pages/Restaurants.jsx`, `src/App.jsx`, `index.html`

---

## T29: Add apple-touch-icon for iOS home screen

**Why:** When someone adds the app to their iPhone home screen, iOS looks for an `apple-touch-icon`. Without one, it takes a screenshot of the page instead of showing the app icon. Makes the home screen shortcut look unprofessional.

**Acceptance criteria:**
- `<link rel="apple-touch-icon" href="/wgh-icon.png">` added to `index.html` (or a dedicated 180x180px icon)
- Icon displays correctly when adding to iOS home screen
- Icon matches app branding

**Status:** Ready

**Files:** `index.html`, potentially `public/apple-touch-icon.png`
