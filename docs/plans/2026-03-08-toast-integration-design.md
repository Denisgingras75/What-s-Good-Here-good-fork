# Toast POS Integration — Phase 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add "Order Now" buttons on RestaurantDetail pages that link directly to Toast online ordering for 35 confirmed MV restaurants.

**Architecture:** Add `toast_slug` TEXT column to restaurants table. Seed 35 known slugs. Render an "Order Now" link in the contact row when slug exists. No API integration, no new dependencies — just a column and a link.

**Tech Stack:** Supabase (migration SQL), React (JSX), existing WGH patterns.

---

### Task 1: Schema Migration

**Files:**
- Create: `supabase/migrations/031-toast-slug.sql`
- Modify: `supabase/schema.sql:25-46`

**Step 1: Update schema.sql — add toast_slug to restaurants table**

Add after line 41 (`menu_url TEXT,`):

```sql
  toast_slug TEXT,
```

**Step 2: Create migration file**

```sql
-- Add Toast POS online ordering slug
-- Links to: https://order.toasttab.com/online/{toast_slug}
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS toast_slug TEXT;
```

**Step 3: Run migration in Supabase SQL Editor**

Copy the ALTER TABLE statement, run it, verify column exists.

**Step 4: Commit**

```bash
git add supabase/migrations/031-toast-slug.sql supabase/schema.sql
git commit -m "feat: add toast_slug column for online ordering links"
```

---

### Task 2: Seed Toast Slugs

**Files:**
- Create: `supabase/seed/toast-slugs.sql`

**Step 1: Write seed SQL**

```sql
-- Toast POS online ordering slugs for MV restaurants
-- URL pattern: https://order.toasttab.com/online/{slug}
-- Confirmed 2026-03-08

-- Oak Bluffs (11)
UPDATE restaurants SET toast_slug = 'lookout-tavern' WHERE name ILIKE '%lookout%tavern%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'sharkob' WHERE name ILIKE '%sharky%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'nancys' WHERE name ILIKE '%nancy%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'offshore-ale-co-30-kennebec-ave' WHERE name ILIKE '%offshore%ale%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'backyard-taco' WHERE name ILIKE '%dos mas%' OR name ILIKE '%backyard%taco%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'thebarn' WHERE name ILIKE '%barn%bowl%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'tigerhawk-sandwich-co' WHERE name ILIKE '%tigerhawk%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'loudkitchenexp' WHERE name ILIKE '%loud%kitchen%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'mo''s-lunch' WHERE name ILIKE '%mo''s%lunch%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'chowder' WHERE name ILIKE '%chowder%company%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'nomans' WHERE name ILIKE '%noman%' AND town = 'Oak Bluffs';

-- Edgartown (12)
UPDATE restaurants SET toast_slug = 'town-bar-and-grill-mv' WHERE name ILIKE '%town%bar%grill%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'bad-martha-farmers-brewery-edgartown-270-upper-main-street' WHERE name ILIKE '%bad%martha%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'atria-137-upper-main-street' WHERE name ILIKE '%atria%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'sharkedg' WHERE name ILIKE '%sharky%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'rockfish-11-n-water-street' WHERE name ILIKE '%rockfish%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'behind-the-bookstore' WHERE name ILIKE '%behind%bookstore%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'wharf-pub' WHERE name ILIKE '%wharf%pub%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'alchemymv' WHERE name ILIKE '%alchemy%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'wicked-burger-258-upper-main-street' WHERE name ILIKE '%wicked%burger%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'great-harbor-market-199-upper-main-street' WHERE name ILIKE '%great%harbor%market%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = '19-raw-oyster-bar-19-church-street' WHERE name ILIKE '%19%raw%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'cozycornercafemv' WHERE name ILIKE '%cozy%corner%' AND town = 'Edgartown';

-- Vineyard Haven (10)
UPDATE restaurants SET toast_slug = 'black-dog-tavern' WHERE name ILIKE '%black%dog%tavern%' AND town = 'Vineyard Haven';
UPDATE restaurants SET toast_slug = 'black-dog-bakery-cafe-vineyard-haven' WHERE name ILIKE '%black%dog%bakery%' AND town = 'Vineyard Haven';
UPDATE restaurants SET toast_slug = 'beach-road-mv-688-state-road' WHERE name ILIKE '%beach%road%' AND town = 'Vineyard Haven';
UPDATE restaurants SET toast_slug = 'ninasonbeachroad' WHERE name ILIKE '%nina%beach%' AND town = 'Vineyard Haven';
UPDATE restaurants SET toast_slug = 'la-strada-65-main-street' WHERE name ILIKE '%la%strada%' AND town = 'Vineyard Haven';
UPDATE restaurants SET toast_slug = 'artcliff-diner-39-beach-road' WHERE name ILIKE '%art%cliff%' AND town = 'Vineyard Haven';
UPDATE restaurants SET toast_slug = 'net-result-79-beach-road' WHERE name ILIKE '%net%result%' AND town = 'Vineyard Haven';
UPDATE restaurants SET toast_slug = 'garde-east-52-beach-road' WHERE name ILIKE '%garde%east%' AND town = 'Vineyard Haven';
UPDATE restaurants SET toast_slug = 'portopizza' WHERE name ILIKE '%porto%pizza%' AND town = 'Vineyard Haven';
UPDATE restaurants SET toast_slug = 'themakermv' WHERE name ILIKE '%maker%' AND town = 'Vineyard Haven';

-- West Tisbury (2)
UPDATE restaurants SET toast_slug = '7a-foods' WHERE name ILIKE '%7a%food%' AND town = 'West Tisbury';
UPDATE restaurants SET toast_slug = 'black-sheep-mercantile' WHERE name ILIKE '%black%sheep%' AND town = 'West Tisbury';
```

**Step 2: Run in Supabase SQL Editor**

Run the UPDATE statements. Check how many rows were affected — any restaurants not yet in the DB won't match (that's fine, they'll be seeded when restaurant data is added).

**Step 3: Commit**

```bash
git add supabase/seed/toast-slugs.sql
git commit -m "feat: seed toast slugs for 35 MV restaurants"
```

---

### Task 3: API Layer — Include toast_slug in getById

**Files:**
- Modify: `src/api/restaurantsApi.js:284-301` (getById uses `select('*')` so it already returns toast_slug — no change needed)

**Verify:** `getById` uses `select('*')` (line 289), so `toast_slug` is already included. No API changes required.

**Note:** `getAll()` uses an explicit select list (lines 20-29) but does NOT need toast_slug — it's only used for listing, not detail pages. The "Order Now" button only appears on RestaurantDetail which calls `getById`.

---

### Task 4: UI — "Order Now" Button on RestaurantDetail

**Files:**
- Modify: `src/pages/RestaurantDetail.jsx:272-329` (contact info row)

**Step 1: Add "Order Now" link in the contact row**

After the Instagram link block (line 327), before the closing `</div>` (line 328), add the Toast order link:

```jsx
              {restaurant.toast_slug && (
                <a
                  href={`https://order.toasttab.com/online/${restaurant.toast_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ color: 'var(--color-accent-orange)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                  </svg>
                  Order Now
                </a>
              )}
```

**Step 2: Update the contact row condition to include toast_slug**

Line 272 — add `restaurant.toast_slug` to the condition:

```jsx
{(restaurant.phone || restaurant.website_url || restaurant.facebook_url || restaurant.instagram_url || restaurant.toast_slug) && (
```

**Step 3: Build and verify**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/pages/RestaurantDetail.jsx
git commit -m "feat: add Order Now button linking to Toast online ordering"
```

---

### Task 5: Verify End-to-End

**Step 1: Run dev server, navigate to a restaurant with a known Toast slug**

```bash
npm run dev
```

Open browser → go to a restaurant detail page → verify "Order Now" appears in accent-orange.

**Step 2: Click "Order Now" → should open `order.toasttab.com/online/{slug}` in new tab**

**Step 3: Check a restaurant WITHOUT toast_slug — "Order Now" should NOT appear**

**Step 4: Run build to catch any issues**

```bash
npm run build
```

---

## Summary

| Task | Files | Effort |
|------|-------|--------|
| 1. Migration | schema.sql, 031-toast-slug.sql | 2 min |
| 2. Seed | toast-slugs.sql | 2 min |
| 3. API | None (getById uses select *) | 0 min |
| 4. UI | RestaurantDetail.jsx | 5 min |
| 5. Verify | Manual test | 3 min |

**Total: ~12 minutes of implementation.**
