# Menu Accuracy & Seasonality Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Track menu data quality and MV restaurant seasonality so stale, phantom, and closed-season data is identifiable and manageable.

**Architecture:** Phase 1 adds four schema fields and a `dish_flags` table, seeds seasonality data for 58 core-town restaurants, marks placeholder dishes as `stub`, and adds a subtle "not available?" flag on dish cards feeding an admin queue. Phase 2 (separate, future) adds a GitHub Actions menu crawler.

**Tech Stack:** Supabase PostgreSQL (REST + SQL Editor), React 19, existing `src/api/` pattern, existing Admin page.

---

## Task 1: Schema Migration

**Files:**
- Modify: `supabase/schema.sql` (restaurants table ~line 25, dishes table ~line 48)
- Create: `supabase/migrations/20260217-menu-accuracy.sql`

**Step 1: Create the migration file**

```sql
-- supabase/migrations/20260217-menu-accuracy.sql

-- Restaurants: seasonality
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS seasonal_status TEXT
    DEFAULT 'unknown'
    CHECK (seasonal_status IN ('year_round', 'summer_only', 'shoulder_season', 'unknown'));

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS open_months INTEGER[] DEFAULT NULL;
-- {5,6,7,8,9,10} = May–Oct. NULL = unknown. '{}'::integer[] = open all 12 months.

-- Dishes: data provenance
ALTER TABLE dishes
  ADD COLUMN IF NOT EXISTS source TEXT
    DEFAULT 'seed'
    CHECK (source IN ('seed', 'stub', 'scrape', 'community', 'owner'));

ALTER TABLE dishes
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Dish flags: users reporting unavailable dishes
CREATE TABLE IF NOT EXISTS dish_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dish_id, user_id)   -- one flag per user per dish
);

-- RLS: users can insert their own flags, read none (admin only via service role)
ALTER TABLE dish_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can flag dishes" ON dish_flags
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Index for admin query: flagged dishes by count
CREATE INDEX IF NOT EXISTS dish_flags_dish_id_idx ON dish_flags(dish_id);
```

**Step 2: Run in Supabase SQL Editor**

Go to https://supabase.com/dashboard/project/vpioftosgdkyiwvhxewy/sql/new and paste + run the migration. Verify no errors.

**Step 3: Update schema.sql to match**

In `supabase/schema.sql`, add after `menu_last_checked` line (~line 42):
```sql
  seasonal_status TEXT DEFAULT 'unknown' CHECK (seasonal_status IN ('year_round', 'summer_only', 'shoulder_season', 'unknown')),
  open_months INTEGER[] DEFAULT NULL,
```

In `supabase/schema.sql`, add after `created_at` in dishes table (~line 70):
```sql
  source TEXT DEFAULT 'seed' CHECK (source IN ('seed', 'stub', 'scrape', 'community', 'owner')),
  is_verified BOOLEAN DEFAULT FALSE,
```

Add the full `dish_flags` table definition to schema.sql after the `votes` table block.

**Step 4: Verify**

```bash
curl -s "https://vpioftosgdkyiwvhxewy.supabase.co/rest/v1/restaurants?select=id,seasonal_status,open_months&limit=1" \
  -H "apikey: $SERVICE_ROLE_KEY" | python3 -m json.tool
```

Expected: returns a record with `seasonal_status: "unknown"` and `open_months: null`.

**Step 5: Commit**
```bash
git add supabase/schema.sql supabase/migrations/20260217-menu-accuracy.sql
git commit -m "feat: add seasonal_status, open_months, dish source tracking, dish_flags table"
```

---

## Task 2: Seed Seasonality Data

**Files:**
- Create: `supabase/seed/data/seasonality.sql`

**Step 1: Create the seasonality seed file**

```sql
-- supabase/seed/data/seasonality.sql
-- MV restaurant seasonality — run once in SQL Editor
-- open_months uses PostgreSQL integer arrays: {1,2,...12}
-- NULL open_months = unknown. Empty array would mean always open (use '{1,2,3,4,5,6,7,8,9,10,11,12}')

-- YEAR-ROUND (open all 12 months or close to it)
UPDATE restaurants SET seasonal_status = 'year_round', open_months = '{1,2,3,4,5,6,7,8,9,10,11,12}'
WHERE name IN (
  'Art Cliff Diner',
  'Among The Flowers Cafe',
  'Black Dog Tavern',
  'Espresso Love',
  'TigerHawk Sandwich Company',
  'Waterside Market',
  'Net Result',
  'Le Grenier French Restaurant',
  'Rocco''s Pizzeria',
  '9 Craft Kitchen and Bar',
  'Black Sheep',
  'Linda Jean''s Restaurant',
  'Morning Glory Farm',
  'The Newes From America',
  'Bangkok Cuisine',
  'Wolf''s Den Pizzeria',
  'Wolf''s Den Pizzeria|Edgartown'
);

-- SUMMER-ONLY (typically Memorial Day through mid-October)
UPDATE restaurants SET seasonal_status = 'summer_only', open_months = '{5,6,7,8,9,10}'
WHERE name IN (
  'Nancy''s Restaurant',
  'Back Door Donuts',
  'Catboat',
  'Ocean Club',
  'Garde East',
  'L''etoile Restaurant',
  'Atria',
  'Nat''s Nook',
  'Dock Street',
  'The Seafood Shanty',
  'The Wharf',
  'Square Rigger',
  'SANDBAR',
  'The Sweet Life Cafe',
  'Coop de Ville',
  'Lookout Tavern',
  'MV Salads',
  'Porto Pizza',
  'Rockfish',
  'Winston''s Kitchen',
  'Town Bar',
  'Vineyard Caribbean Cuisine',
  'Biscuits',
  'Offshore Ale Company',
  'Alchemy Bistro & Bar',
  'Katama General Store',
  'Dip 02539 INC',
  'The Food Truck',
  'The Attic',
  'The Covington',
  'Beach Road',
  'Cozy Corner'
);

-- SHOULDER + SUMMER (April through November)
UPDATE restaurants SET seasonal_status = 'shoulder_season', open_months = '{4,5,6,7,8,9,10,11}'
WHERE name IN (
  'Bettini Restaurant',
  'Edgartown Pizza',
  'Edgartown Meat & Fish Market',
  'Indigo',
  'Red Cat Kitchen',
  'Sharky''s Cantina',
  'Martha''s Vineyard Chowder Company',
  'The Barn Bowl & Bistro',
  'The Ritz • Martha''s Vineyard',
  'Tony''s Market',
  'Cozy Corner',
  '9 Craft Kitchen and Bar'
);
```

**Step 2: Run in Supabase SQL Editor**

Paste and run. Note the row counts returned — should be ~17 year-round, ~30+ summer-only.

**Step 3: Verify**

```bash
curl -s "https://vpioftosgdkyiwvhxewy.supabase.co/rest/v1/restaurants?select=name,seasonal_status&town=in.(Oak%20Bluffs,Edgartown,Vineyard%20Haven)&seasonal_status=eq.unknown" \
  -H "apikey: $SERVICE_ROLE_KEY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{len(d)} restaurants still unknown'); [print(f'  {r[\"name\"]}') for r in d]"
```

Expected: zero or very few unknowns in the 3 core towns. Any remaining unknowns are fine — leave them.

**Step 4: Commit**
```bash
git add supabase/seed/data/seasonality.sql
git commit -m "data: seed seasonality status for MV core town restaurants"
```

---

## Task 3: Mark Stub Dishes

**Goal:** The 25 dishes we added as fallback placeholders should be tagged `source = 'stub'` so they're distinguishable from real seed data.

The stub dishes were added for these restaurants:
- Square Rigger (5 dishes)
- The Barn Bowl & Bistro (5 dishes)
- The Black Dog Bakery Café (State St.) (5 dishes)
- The Ritz • Martha's Vineyard (5 dishes)
- The Newes From America (5 dishes added — already had 1 real dish)

**Step 1: Run in Supabase SQL Editor**

```sql
-- Mark stub dishes by restaurant name
-- These are the placeholder dishes added 2026-02-17 to meet the 5-dish minimum

UPDATE dishes SET source = 'stub'
WHERE restaurant_id IN (
  SELECT id FROM restaurants WHERE name IN (
    'Square Rigger',
    'The Barn Bowl & Bistro',
    'The Black Dog Bakery Café (State St.)',
    'The Ritz • Martha''s Vineyard'
  )
);

-- For The Newes From America, only the 5 we added are stubs (the 1 original is real)
-- The original dish was added before our migration — mark only the 5 added 2026-02-17
UPDATE dishes SET source = 'stub'
WHERE restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Newes From America')
  AND name IN ('Shepherd''s Pie', 'Fish & Chips', 'Onion Soup', 'Newes Burger', 'Clam Chowder');

-- Verify
SELECT r.name, COUNT(*) as stub_count
FROM dishes d
JOIN restaurants r ON r.id = d.restaurant_id
WHERE d.source = 'stub'
GROUP BY r.name
ORDER BY r.name;
```

Expected output: 5 rows, each with 5 stubs (The Ritz and others), plus Newes with 5.

**Step 2: Commit**
```bash
git commit -m "data: mark placeholder fallback dishes as source=stub"
```
(No code files changed — SQL-only step, schema.sql already updated in Task 1.)

---

## Task 4: Dish Flag API

**Files:**
- Modify: `src/api/dishesApi.js`

**Step 1: Add `flagAsUnavailable` to dishesApi**

Add this method to the `dishesApi` object in `src/api/dishesApi.js`:

```js
/**
 * Flag a dish as unavailable (not on the menu)
 * One flag per user per dish — duplicate flags are silently ignored.
 * @param {string} dishId
 * @returns {Promise<void>}
 */
async flagAsUnavailable(dishId) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('dish_flags')
      .insert({ dish_id: dishId, user_id: user.id })

    // 23505 = unique_violation (already flagged) — treat as success
    if (error && error.code !== '23505') {
      throw createClassifiedError(error)
    }
  } catch (error) {
    logger.error('Error flagging dish:', error)
    throw error.type ? error : createClassifiedError(error)
  }
},

/**
 * Get flagged dishes for admin review, sorted by flag count descending
 * @param {number} limit
 * @returns {Promise<Array>} dishes with flag_count, name, restaurant_name
 */
async getFlaggedDishes(limit = 50) {
  try {
    const { data, error } = await supabase
      .from('dish_flags')
      .select('dish_id, dishes(id, name, source, restaurant_id, restaurants(name))')
      .limit(limit)

    if (error) throw createClassifiedError(error)

    // Aggregate by dish_id
    const counts = {}
    for (const row of (data || [])) {
      const id = row.dish_id
      if (!counts[id]) {
        counts[id] = {
          dish_id: id,
          dish_name: row.dishes?.name,
          source: row.dishes?.source,
          restaurant_name: row.dishes?.restaurants?.name,
          flag_count: 0,
        }
      }
      counts[id].flag_count++
    }

    return Object.values(counts).sort((a, b) => b.flag_count - a.flag_count)
  } catch (error) {
    logger.error('Error fetching flagged dishes:', error)
    throw error.type ? error : createClassifiedError(error)
  }
},
```

**Step 2: Verify build passes**
```bash
npm run build 2>&1 | tail -5
```
Expected: no errors.

**Step 3: Commit**
```bash
git add src/api/dishesApi.js
git commit -m "feat: add flagAsUnavailable and getFlaggedDishes to dishesApi"
```

---

## Task 5: "Not Available?" UI on Dish Cards

**Files:**
- Modify: `src/components/DishCard.jsx`

**Context:** `DishCard` receives a `dish` prop shaped by the `get_ranked_dishes` RPC. It already has `onLoginRequired` prop. The flag button should appear subtly — small, muted, below the main dish content. Logged-in users tap it once; it confirms with a brief "Thanks" state. Guests see the login modal.

**Step 1: Add flag state and handler to DishCard**

Near the top of the component, after existing state declarations:

```jsx
const [flagState, setFlagState] = useState('idle') // 'idle' | 'loading' | 'done'

async function handleFlag(e) {
  e.stopPropagation()
  const { data: { user } } = await import('../lib/supabase').then(m => m.supabase.auth.getUser())
  // Note: import supabase at top of file instead if not already there
  if (!user) {
    onLoginRequired?.()
    return
  }
  if (flagState !== 'idle') return
  setFlagState('loading')
  try {
    await import('../api/dishesApi').then(m => m.dishesApi.flagAsUnavailable(dish_id))
    setFlagState('done')
  } catch {
    setFlagState('idle')
  }
}
```

**Note on imports:** `supabase` and `dishesApi` should be imported at the top of the file, not dynamically. Add to the import block:
```jsx
import { supabase } from '../lib/supabase'
import { dishesApi } from '../api/dishesApi'
```

**Step 2: Add the flag button to the JSX**

Find the closing area of the card (just before the closing `</div>` of the card container), add:

```jsx
{flagState !== 'done' ? (
  <button
    onClick={handleFlag}
    disabled={flagState === 'loading'}
    style={{
      fontSize: '11px',
      color: 'var(--color-text-tertiary)',
      background: 'none',
      border: 'none',
      padding: '4px 0 0',
      cursor: 'pointer',
      opacity: flagState === 'loading' ? 0.5 : 0.7,
      textDecoration: 'underline',
      display: 'block',
    }}
  >
    not available?
  </button>
) : (
  <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', opacity: 0.7 }}>
    thanks, noted
  </span>
)}
```

**Step 3: Verify build passes**
```bash
npm run build 2>&1 | tail -5
```

**Step 4: Spot check in dev**
```bash
npm run dev
```
Open http://localhost:5173 → Browse → confirm "not available?" appears on dish cards, clicking as a guest triggers login modal, clicking as a logged-in user shows "thanks, noted".

**Step 5: Commit**
```bash
git add src/components/DishCard.jsx
git commit -m "feat: add 'not available?' flag button to dish cards"
```

---

## Task 6: Admin Queue for Flagged Dishes

**Files:**
- Modify: `src/pages/Admin.jsx`

**Context:** Admin.jsx already exists and is gated to admin users. Add a "Flagged Dishes" section at the bottom showing dish name, restaurant, flag count, and source. Simple table, no pagination needed yet.

**Step 1: Add flagged dishes section to Admin.jsx**

At the top of Admin.jsx, import the API:
```jsx
import { dishesApi } from '../api/dishesApi'
```

Add state and effect inside the component:
```jsx
const [flaggedDishes, setFlaggedDishes] = useState([])

useEffect(() => {
  dishesApi.getFlaggedDishes(50).then(setFlaggedDishes).catch(() => {})
}, [])
```

Add the section in the JSX (after existing admin content):
```jsx
<section style={{ marginTop: '2rem' }}>
  <h2 style={{ color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
    Flagged Dishes ({flaggedDishes.length})
  </h2>
  {flaggedDishes.length === 0 ? (
    <p style={{ color: 'var(--color-text-secondary)' }}>No flagged dishes.</p>
  ) : (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
      <thead>
        <tr style={{ color: 'var(--color-text-secondary)', textAlign: 'left' }}>
          <th style={{ padding: '6px 12px' }}>Flags</th>
          <th style={{ padding: '6px 12px' }}>Dish</th>
          <th style={{ padding: '6px 12px' }}>Restaurant</th>
          <th style={{ padding: '6px 12px' }}>Source</th>
        </tr>
      </thead>
      <tbody>
        {flaggedDishes.map(d => (
          <tr key={d.dish_id} style={{ borderTop: '1px solid var(--color-card)' }}>
            <td style={{ padding: '6px 12px', color: 'var(--color-primary)', fontWeight: 600 }}>{d.flag_count}</td>
            <td style={{ padding: '6px 12px', color: 'var(--color-text-primary)' }}>{d.dish_name}</td>
            <td style={{ padding: '6px 12px', color: 'var(--color-text-secondary)' }}>{d.restaurant_name}</td>
            <td style={{ padding: '6px 12px', color: 'var(--color-text-tertiary)' }}>{d.source}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</section>
```

**Step 2: Verify build passes**
```bash
npm run build 2>&1 | tail -5
```

**Step 3: Commit**
```bash
git add src/pages/Admin.jsx
git commit -m "feat: add flagged dishes queue to admin panel"
```

---

## Task 7: Final Verification & Deploy

**Step 1: Full build check**
```bash
npm run build && echo "BUILD OK"
```

**Step 2: Check for regressions**
```bash
npm run test 2>&1 | tail -10
```

**Step 3: Push to deploy**
```bash
git push origin phase2-redesign
```

**Step 4: Verify in production**

Open https://whats-good-here.vercel.app → Browse → confirm "not available?" appears. Check Admin panel at /admin → confirm Flagged Dishes section renders (empty is fine).

---

## Phase 2 Preview (Future — Do Not Implement Now)

When you're ready to fill the 23 stub-menu restaurants with real data:

1. **Toast restaurants** — fetch `https://ws-api.toasttab.com/v1/restaurants/{guid}/menu` — returns structured JSON. Parse items directly.
2. **Square menus** — fetch `https://squareup.com/store/{slug}/menu` — inspect network tab for the underlying JSON API call.
3. **HTML menus** — use Python `requests` + `BeautifulSoup` — less reliable but workable for simple pages.
4. **GitHub Action** — `.github/workflows/menu-crawl.yml` runs weekly, outputs a `menu-diffs/` folder of JSON diffs. You review and apply.

Priority order for crawling based on current stub restaurants:
1. The Attic (Toast) — toasttab.com link
2. Net Result (Toast) — toasttab.com link
3. Katama General Store (Square) — square.site link
4. Wolf's Den, SANDBAR, Alchemy — likely plain HTML menus

---

## Reference: SERVICE_ROLE_KEY

For any curl verification steps:
```bash
export SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaW9mdG9zZ2RreWl3dmh4ZXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg3NTE3MiwiZXhwIjoyMDg1NDUxMTcyfQ.2OFP4H0Unaly7Sr9teWBeRmgE2-YILWeiWetEUGl2Fk"
```
