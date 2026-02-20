# Homepage Photo Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add gradient-fade dish photos to the top 3 homepage cards (#1 hero, #2-3 podium), with zero extra API calls, no layout jank, and graceful fallback to category illustrations.

**Architecture:** Denormalize `featured_photo_url` into the `get_ranked_dishes` RPC via a lateral join on `dish_photos`. Frontend renders photos with CSS `mask-image` gradient fade, fixed-size containers, and 200ms fade-in on load. No new hooks or API calls needed.

**Tech Stack:** PostgreSQL (RPC update), React 19, CSS mask-image, Supabase Storage URLs

**Design doc:** `docs/plans/2026-02-20-homepage-photos-design.md`

---

### Task 1: Add CSS utility classes for photo fade and shimmer

**Files:**
- Modify: `src/index.css`

**Step 1: Add the shimmer keyframe animation**

Add after the existing `@keyframes stagger-fade-in` block in `src/index.css`:

```css
/* Photo shimmer placeholder — warm pulse while image loads */
@keyframes shimmer {
  0% { opacity: 0.4; }
  50% { opacity: 0.7; }
  100% { opacity: 0.4; }
}

.photo-shimmer {
  background: var(--color-bg);
  animation: shimmer 1.5s ease-in-out infinite;
}
```

**Step 2: Add the gradient-fade photo class**

```css
/* Dish photo — gradient fade from transparent (left) to visible (right) */
.dish-photo-fade {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 55%;
  object-fit: cover;
  object-position: center;
  mask-image: linear-gradient(to right, transparent 0%, black 40%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 40%);
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 4: Commit**

```bash
git add src/index.css
git commit -m "Add photo-fade and shimmer CSS utilities for homepage photos"
```

---

### Task 2: Update `get_ranked_dishes` RPC to return `featured_photo_url`

**Files:**
- Modify: `supabase/schema.sql` (lines 540-682)

**Step 1: Add `featured_photo_url` to RETURNS TABLE**

In the `get_ranked_dishes` function signature (line 547-569), add after `search_score DECIMAL`:

```sql
  featured_photo_url TEXT
```

**Step 2: Add a CTE to pick the best photo per dish**

Add a new CTE `best_photos` after the `recent_vote_counts` CTE (before the final SELECT, around line 633):

```sql
  best_photos AS (
    SELECT DISTINCT ON (dp.dish_id)
      dp.dish_id,
      dp.photo_url
    FROM dish_photos dp
    WHERE dp.status IN ('featured', 'community')
    ORDER BY dp.dish_id,
      CASE dp.source_type WHEN 'restaurant' THEN 0 ELSE 1 END,
      CASE dp.status WHEN 'featured' THEN 0 ELSE 1 END,
      dp.quality_score DESC NULLS LAST
  )
```

This picks the best photo per dish with priority: restaurant source > featured status > highest quality score.

**Step 3: LEFT JOIN best_photos and add to SELECT**

In the final SELECT (line 634), add after `search_score`:

```sql
    bp.photo_url AS featured_photo_url
```

Add to the FROM clause (after the `recent_vote_counts` LEFT JOIN, line 671):

```sql
  LEFT JOIN best_photos bp ON bp.dish_id = d.id
```

Add `bp.photo_url` to the GROUP BY clause (line 674).

**Step 4: Run the updated function in Supabase SQL Editor**

Copy the entire updated `CREATE OR REPLACE FUNCTION get_ranked_dishes(...)` and run it in the SQL Editor. Verify it succeeds.

**Step 5: Test the RPC returns the new field**

Run in SQL Editor:

```sql
SELECT dish_id, dish_name, featured_photo_url
FROM get_ranked_dishes(41.3805, -70.6456, 50, NULL, NULL)
LIMIT 5;
```

Expected: Results include `featured_photo_url` column (NULL for dishes without photos, a URL for dishes with photos).

**Step 6: Commit**

```bash
git add supabase/schema.sql
git commit -m "Add featured_photo_url to get_ranked_dishes RPC"
```

---

### Task 3: Wire `featured_photo_url` through the API layer

**Files:**
- Modify: `src/api/dishesApi.js`

**Step 1: Confirm the field passes through**

The `getRankedDishes` method (line 23-44) calls the RPC and returns `data || []` directly — it does NOT have a `.map()` transform. The new `featured_photo_url` field will pass through automatically with no code change needed.

Verify by reading the function: it returns `data || []` on line 39. No transform to update.

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit (skip if no changes needed)**

If no code changes were required, skip this commit.

---

### Task 4: Add photo support to NumberOneHero (#1 card)

**Files:**
- Modify: `src/pages/Home.jsx` — `NumberOneHero` component (line ~247)

**Step 1: Add `useState` import if needed**

Check if `useState` is already imported at the top of `Home.jsx`. It is (line 1: `import { useMemo, useState, useCallback } from 'react'`). No change needed.

**Step 2: Update NumberOneHero to accept and render photos**

In the `NumberOneHero` component (line ~247), destructure `featured_photo_url` from `dish`:

```jsx
const { dish_name, restaurant_name, avg_rating, total_votes, category, featured_photo_url } = dish
```

**Step 3: Add photo state and rendering**

Inside `NumberOneHero`, add photo loaded state:

```jsx
const [photoLoaded, setPhotoLoaded] = useState(false)
```

**Step 4: Update the card content area**

The current layout is `<div className="flex items-center gap-3 py-5 px-4">` with text on the left and `<CategoryIcon>` on the right.

Replace the card structure to support absolute-positioned photo. The card container (`<button>`) already has `overflow-hidden` and `rounded-2xl`. Add `position: relative` to its style.

For the content area, change the structure to:

```jsx
{/* Photo (absolute, fades from right) */}
{featured_photo_url ? (
  <>
    {!photoLoaded && (
      <div
        className="photo-shimmer"
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '55%',
        }}
      />
    )}
    <img
      src={featured_photo_url}
      alt={dish_name}
      loading="eager"
      onLoad={() => setPhotoLoaded(true)}
      className="dish-photo-fade"
      style={{
        opacity: photoLoaded ? 1 : 0,
        transition: 'opacity 200ms ease',
      }}
    />
  </>
) : null}

{/* Main content — text left, icon right (only when no photo) */}
<div className="flex items-center gap-3 py-5 px-4" style={{ position: 'relative', zIndex: 1 }}>
  <div className="flex-1 min-w-0">
    {/* ... existing dish_name, restaurant_name, stats ... */}
  </div>
  {!featured_photo_url && (
    <CategoryIcon categoryId={category} dishName={dish_name} size={96} color="var(--color-primary)" />
  )}
</div>
```

Key points:
- Photo is absolute-positioned with the `.dish-photo-fade` class
- Shimmer shows while photo loads, then fades in
- `CategoryIcon` only renders when there's no photo
- Text content gets `position: relative; z-index: 1` to sit above photo
- Card needs `position: 'relative'` in its style

**Step 5: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 6: Visual check**

Run: `npm run dev`
Verify: Homepage loads. If no dishes have photos, cards look identical to before (category icons). The layout should not shift or break.

**Step 7: Commit**

```bash
git add src/pages/Home.jsx
git commit -m "Add gradient-fade photo support to #1 hero card"
```

---

### Task 5: Add photo support to podium cards (#2-3)

**Files:**
- Modify: `src/components/home/Top10Compact.jsx` — `Top10Row` component (line ~97)

**Step 1: Add `useState` import**

Check if `useState` is already imported. It is (line 1: `import { useState, memo } from 'react'`). No change needed.

**Step 2: Destructure `featured_photo_url` in Top10Row**

In the `Top10Row` component (line ~98), add `featured_photo_url` to the destructured fields:

```jsx
const { dish_name, restaurant_name, avg_rating, total_votes, category, featured_photo_url } = dish
```

**Step 3: Add photo state inside Top10Row**

Since `Top10Row` is wrapped in `memo`, state works fine. Add:

```jsx
const [photoLoaded, setPhotoLoaded] = useState(false)
```

**Step 4: Update the podium card rendering (the `if (podium)` branch)**

Same pattern as NumberOneHero but smaller:
- Card `<button>` gets `style={{ position: 'relative' }}` (already has `overflow-hidden`)
- Add photo + shimmer inside the card, before the content div
- Content div gets `style={{ position: 'relative', zIndex: 1 }}`
- `CategoryIcon` only shows when `!featured_photo_url`
- Photo uses same `.dish-photo-fade` class

The photo width for #2-3 should be `50%` instead of `55%` (slightly smaller than #1). Override via inline style:

```jsx
<img
  src={featured_photo_url}
  alt={dish_name}
  loading="lazy"
  onLoad={() => setPhotoLoaded(true)}
  className="dish-photo-fade"
  style={{
    opacity: photoLoaded ? 1 : 0,
    transition: 'opacity 200ms ease',
    width: '50%',
  }}
/>
```

**Step 5: Do NOT change the rank 4+ rows**

The `else` branch (ranks 4+) keeps the existing `CategoryIcon`. No photo support needed.

**Step 6: Verify build**

Run: `npm run build`
Expected: Build succeeds.

**Step 7: Visual check**

Run: `npm run dev`
Verify: Podium cards (#2-3) look identical to before when no photos exist. Icons still render. No layout shifts.

**Step 8: Commit**

```bash
git add src/components/home/Top10Compact.jsx
git commit -m "Add gradient-fade photo support to #2-3 podium cards"
```

---

### Task 6: Final verification and build

**Files:** None (verification only)

**Step 1: Full build check**

Run: `npm run build`
Expected: Build succeeds with no warnings.

**Step 2: Grep for Safari compatibility**

Run: `grep -r 'toSorted\|\.at(' src/`
Expected: No results (no ES2023+ methods).

**Step 3: Grep for hardcoded colors in new code**

Verify no new hardcoded hex colors were introduced in the photo-related changes.

**Step 4: Test with no photos**

Open homepage in browser. Verify all cards look identical to before — category illustrations, no broken images, no layout shifts, no shimmer (shimmer only appears when a photo URL exists).

**Step 5: Test with a photo (if available)**

If any dish has a photo in `dish_photos`, verify:
- Photo appears with gradient fade on the right
- Left edge dissolves smoothly into card background
- Text is readable over the faded area
- Photo fades in smoothly (no pop-in)

**Step 6: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "Homepage photo redesign — complete"
```

---

## Summary of changes

| File | Change |
|------|--------|
| `src/index.css` | Add `.photo-shimmer` and `.dish-photo-fade` CSS utilities |
| `supabase/schema.sql` | Add `best_photos` CTE + `featured_photo_url` to `get_ranked_dishes` |
| `src/pages/Home.jsx` | NumberOneHero renders gradient-fade photo or falls back to icon |
| `src/components/home/Top10Compact.jsx` | Podium cards (#2-3) render gradient-fade photo or fall back to icon |
| `src/api/dishesApi.js` | No change needed (field passes through automatically) |
