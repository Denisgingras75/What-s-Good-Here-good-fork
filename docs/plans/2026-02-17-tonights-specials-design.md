# Tonight's Specials — Design Doc

## Goal

Add recurring day-based specials and themed menu nights to the Discover page. Restaurants on MV run themed nights (Burger Night, Wing Night) and daily deals (half-price apps). Users should open Discover and immediately see what's happening tonight, then browse the rest of the week.

## Two Types of Specials

**Themed Menu** — A recurring event with a full menu of voteable dishes. Example: Burger Night @ State Road every Thursday (14 dishes). Dishes live in the `dishes` table and can be voted on like any other dish.

**Deal** — A simple promotion with text and optional price. Example: Half-Price Wings @ Offshore every Monday. No linked dishes, no voting. Tapping navigates to the restaurant page.

## Data Model

### Extend `specials` table

Add two columns:

```sql
ALTER TABLE specials ADD COLUMN day_of_week INT;
-- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
-- NULL = one-off special (preserves existing behavior)

ALTER TABLE specials ADD COLUMN special_type TEXT DEFAULT 'deal';
-- 'deal' = promotional text only (existing behavior)
-- 'themed_menu' = links to a set of voteable dishes
```

### New `special_dishes` junction table

```sql
CREATE TABLE special_dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  special_id UUID NOT NULL REFERENCES specials(id) ON DELETE CASCADE,
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  UNIQUE(special_id, dish_id)
);
```

- Only used for `special_type = 'themed_menu'`
- `display_order` controls dish ordering within sections
- Dishes can be shared with the regular menu (e.g., Wood Grilled Burger appears on both the regular State Road menu and Burger Night)
- Deleting a special cascades to remove its dish links (not the dishes themselves)

### Example: State Road Burger Night

```
specials row:
  deal_name: "Burger Night"
  restaurant_id: <State Road>
  day_of_week: 4 (Thursday)
  special_type: 'themed_menu'
  is_active: true

special_dishes rows:
  14 rows linking to dish IDs for Mixed Greens, Caesar Salad,
  Fried Shrimp, Fries, Onion Rings, Veggie Burger, Lamb Burger,
  Wood Grilled Burger, Double Double, Cuban, Up Island Hot,
  Fish & Chips, Affogato, Olive Oil Cake
```

## Discover Page UI

### Tonight Section

Only renders if today's day_of_week matches any active specials. No empty state — if nothing tonight, this section doesn't appear.

**Themed menu cards** — large, prominent:
```
┌─────────────────────────────────┐
│  Burger Night                   │
│  State Road · Thursdays         │
│  14 dishes · West Tisbury    >  │
└─────────────────────────────────┘
```

**Deal cards** — compact, below themed menus:
```
┌─────────────────────────────────┐
│  Half-Price Wings               │
│  Offshore Ale · Mondays    $6   │
└─────────────────────────────────┘
```

### This Week Section

Below Tonight. Grouped by day name ("Friday", "Saturday", etc.). Skips today (already shown above). Only shows days that have specials — days with nothing are omitted. Same card styles as Tonight.

### No emoji in section headers or cards.

## Themed Menu Detail View

New route: `/discover/special/:specialId`

```
< Back to Discover

Burger Night
State Road · Every Thursday · West Tisbury

[Dish list grouped by menu_section]

SHARES
  Mixed Greens                    $12
  Caesar Salad                    $18
  Fried Shrimp                    $24
  Fries                           $14
  Onion Rings                     $14

BURGERS & MORE
  Veggie Burger                   $22
  Lamb Burger                     $25
  Wood Grilled Burger             $25
  Double Double                   $23
  Cuban                           $23
  Up Island Hot                   $23
  Fish & Chips                    $32

DESSERTS
  Affogato                        $14
  Olive Oil Cake                  $14
```

Each dish is tappable — navigates to the dish detail page for voting/rating. Dishes with votes show their rating inline.

Deals do NOT get a detail view. Tapping a deal card navigates to the restaurant page (current behavior preserved).

## API Changes

### specialsApi extensions

- `getSpecialsByDay(dayOfWeek)` — returns specials for a given day with restaurant info
- `getSpecialDishes(specialId)` — returns linked dishes for a themed menu with vote stats
- `getTonightSpecials()` — convenience wrapper, calls getSpecialsByDay with today's day
- `getWeekSpecials()` — returns all recurring specials grouped by day

### New hooks

- `useTonightSpecials()` — specials for today's day_of_week
- `useWeekSpecials()` — all recurring specials, grouped by day
- `useSpecialDishes(specialId)` — dishes for a themed menu detail view

## What We're NOT Building

- No Home page changes
- No push notifications
- No manager portal updates (seed via SQL for now)
- No "remind me" or calendar features
- No town filtering on Discover
- No changes to existing one-off specials behavior (day_of_week = NULL still works)

## Seed Data

State Road Burger Night (Thursday) — 14 dishes. Some dishes are new (Lamb Burger, Double Double, Cuban, Up Island Hot, Fried Shrimp, Fries, Onion Rings, Mixed Greens, Fish & Chips), some overlap with the regular menu (Wood Grilled Burger, Caesar Salad, Veggie Burger, Affogato, Olive Oil Cake).

## Files Affected

- `supabase/schema.sql` — extend specials table, add special_dishes table
- `src/api/specialsApi.js` — new query methods
- `src/hooks/useSpecials.js` — new hooks
- `src/pages/Discover.jsx` — rebuild with Tonight + This Week sections
- `src/pages/SpecialDetail.jsx` — new page for themed menu detail
- `src/components/ThemedMenuCard.jsx` — big card for themed menus
- `src/components/SpecialCard.jsx` — update existing deal card
- `src/App.jsx` — add route for /discover/special/:specialId
- `supabase/seed/` — Burger Night seed data
