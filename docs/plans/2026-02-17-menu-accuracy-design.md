# Menu Accuracy & Seasonality Design
_2026-02-17_

## Problem

WGH has 118 restaurants and 2,863 dishes but the data has four reliability problems:

1. **Seasonal closure** — Many MV restaurants close Nov–Apr. `is_open = true` doesn't capture this.
2. **Phantom dishes** — Fallback stubs added to meet the 5-dish minimum are not real menu items.
3. **Seasonal dishes** — Summer specials disappear in fall. A lobster special in July is gone by October.
4. **Stale menus** — Dishes exist in the DB but price/description/availability has drifted.

Core towns in scope: **Edgartown (19), Oak Bluffs (28), Vineyard Haven (11)** — 58 restaurants total.
23 of these have stub menus (≤9 dishes) but **all have real menu URLs** — that's the unlock.

## Approach: Phase A + B, Sequenced

### Phase 1 — Schema + Source Tracking (Now)

**Goal:** Encode what we know. Stop treating all dishes as equally reliable.

**Schema changes:**

```sql
-- On restaurants table
ALTER TABLE restaurants ADD COLUMN seasonal_status TEXT
  DEFAULT 'unknown'
  CHECK (seasonal_status IN ('year_round', 'summer_only', 'shoulder_season', 'unknown'));

ALTER TABLE restaurants ADD COLUMN open_months INTEGER[] DEFAULT NULL;
-- e.g. {5,6,7,8,9} = May through September
-- NULL = unknown, {} = open all year

-- On dishes table
ALTER TABLE dishes ADD COLUMN source TEXT
  DEFAULT 'seed'
  CHECK (source IN ('seed', 'stub', 'scrape', 'community', 'owner'));

ALTER TABLE dishes ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
-- TRUE = human-confirmed accurate
-- FALSE = needs verification
```

**Data we apply immediately:**
- Mark our 25 fallback stub dishes as `source = 'stub'`
- Mark seed-file dishes as `source = 'seed'`
- Manually populate `seasonal_status` + `open_months` for MV restaurants (we know this)
- Known year-round: Art Cliff Diner, Among the Flowers, Black Dog Tavern, Espresso Love, etc.
- Known summer-only: L'etoile, Atria, Garde East, Ocean Club, Nancy's, Back Door Donuts, etc.

**User flagging:**
- Add a small "not available?" link on dish cards (shown subtly, not prominently)
- Stores a flag count in a new `dish_flags` table: `(dish_id, user_id, created_at)`
- Admin panel shows dishes by flag count, descending
- No automatic action — you review manually

### Phase 2 — Menu Re-Crawler (Background, Next Few Weeks)

**Goal:** Replace stub dishes with real ones from actual restaurant menus.

**Approach:**
- Weekly GitHub Action (free tier) crawls each stub restaurant's menu URL
- Priority order: Toast and Square menus first (structured JSON APIs, easiest to parse)
- HTML menus second (Beautiful Soup / readability extraction)
- Output: a JSON diff file per restaurant — "added items", "removed items"
- You review and apply diffs manually (or via a simple admin script)

**Known Toast restaurants (structured API available):**
- Net Result, The Attic, and others using toasttab.com links

**Known Square menus:**
- Katama General Store (square.site link)

**No auto-apply** — diffs are proposed, you approve. Prevents bad data from entering automatically.

**Seasonal close detection:**
- Before Memorial Day (early May): re-check `is_open` via Google Places for all restaurants
- Before Labor Day (late Aug): same sweep
- Script outputs a report — you flip `is_open` and `seasonal_status` manually

### What We're NOT Building Yet

- Trust tier UI (showing "unverified" badges) — needs user volume first
- Automatic dish removal on 3 flags — too risky without volume
- Restaurant self-service menu editing — Phase 3

## MV Seasonality Reference

| Pattern | Typical months | Example restaurants |
|---|---|---|
| Year-round | All 12 | Art Cliff, Black Dog, Among the Flowers, Espresso Love, TigerHawk |
| Summer-only | May/Jun – Sep/Oct | Nancy's, Back Door Donuts, Catboat, Ocean Club, Garde East |
| Shoulder+summer | Apr – Oct/Nov | Most mid-range spots |
| Unknown | — | Any restaurant without firsthand knowledge |

## Success Criteria

- `seasonal_status` set for all 58 core town restaurants
- `open_months` set for all restaurants where we have confident data
- All 25 stub dishes marked `source = 'stub'`
- At least 10 stub restaurants replaced with real menu data from Phase 2 crawl
- Zero phantom dishes in top search results (high-vote dishes are real)

## Files Touched

- `supabase/schema.sql` — source of truth, update first
- `supabase/migrations/YYYYMMDD-menu-accuracy.sql` — migration to run in SQL Editor
- `src/api/dishesApi.js` — pass `source` field through
- `src/components/` — small "not available?" flag UI on dish cards
- `.github/workflows/menu-crawl.yml` — Phase 2 cron (future)
- `supabase/seed/data/seasonality.sql` — one-time data population
