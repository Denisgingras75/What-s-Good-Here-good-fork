# Poster Redesign — Design Doc

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reskin the home page from "warm cafe" to "food zine" — bold black borders, red-orange accent, flat silhouette icons, pure white background. Structure unchanged.

**Scope:** Home page only. Browse, Dish detail, Profile untouched for now.

---

## Color Palette

Three colors. No exceptions.

| Token | Current | New | Usage |
|---|---|---|---|
| `--color-primary` | `#E45A35` (Warm Coral) | `#E4440A` (Red-Orange) | CTAs, #1 rank, rating numbers, accent |
| `--color-text-primary` | `#1A1A1A` | `#1A1A1A` (unchanged) | Headlines, borders, body text |
| `--color-bg` | `#F0ECE8` (Warm Stone) | `#FFFFFF` (Pure White) | Page background |
| `--color-surface` | `#F7F4F1` | `#FFFFFF` | Surface areas |
| `--color-surface-elevated` | `#FFFFFF` | `#FFFFFF` | Cards (border replaces elevation) |
| `--color-text-secondary` | `#6B7280` | `#555555` | Restaurant names, metadata |
| `--color-text-tertiary` | `#9CA3AF` | `#999999` | Vote counts, timestamps |
| `--color-rating` | `#16A34A` (Green) | `#E4440A` (Red-Orange) | Rating displays — stays in palette |
| `--color-accent-gold` | `#E9A115` | `#E4440A` | Links, secondary accents — collapses to primary |
| `--color-medal-gold` | `#C48A12` | `#E4440A` | #1 rank color |
| `--color-medal-silver` | `#A8B5BF` | `#1A1A1A` | #2 rank — just black |
| `--color-medal-bronze` | `#C4855C` | `#1A1A1A` | #3 rank — just black |
| `--color-divider` | light gray | `#1A1A1A` | Row dividers — bold black |
| `--color-category-strip` | `#FADCC8` | `#FFFFFF` | Category circle bg — white with border |

**Key change:** Medal hierarchy (gold/silver/bronze) collapses. #1 is red-orange, #2-3 are black. No glow, no gradient.

---

## Typography

No new fonts. `aglet-sans` already does the heavy lifting.

| Element | Font | Weight | Style |
|---|---|---|---|
| Section labels | aglet-sans | 800 | UPPERCASE, red-orange |
| Dish names (hero) | aglet-sans | 800 | Title case, black or red-orange (#1) |
| Dish names (rows) | system | 700 | Title case |
| Restaurant names | system | 500-600 | Normal case, `#555555` |
| Rating numbers | aglet-sans | 800 | Red-orange |
| Vote counts | system | 400 | `#999999` |

---

## Borders & Cards

The signature of the Poster style. Borders replace shadows.

| Element | Border | Radius | Shadow |
|---|---|---|---|
| #1 Hero card | `2px solid #1A1A1A` | 16px | None (kill current shadow) |
| Category circles | `2px solid #1A1A1A` | 50% (circle) | None (kill current shadow) |
| Top 10 container | `2px solid #1A1A1A` | 12px | None |
| Photo-left cards (1-3) | `2px solid #1A1A1A` | 12px | None |
| Finalist row dividers | `1px solid #1A1A1A` | — | — |
| Search bar | `2px solid #1A1A1A` | 12px | None |

**Killed:** All `box-shadow`, all gradient backgrounds on podium rows, gold left-border on hero.

---

## Category Icons

~19 bold flat silhouette SVGs replacing current PNG photos.

**Style:**
- Single color: `#1A1A1A` (black)
- Bold strokes, chunky proportions
- Visible at 56px circle size
- Think: linocut / newspaper food section

**Categories:** Seafood, Pizza, Burgers, Breakfast, Tacos, Sushi, Salads, Sandwiches, Pasta, Steak, Chicken, Desserts, Coffee, Cocktails, Soup, Poke, BBQ, Vegetarian, Bakery

**Implementation:**
- New SVG files in `public/categories/poster/` (or inline SVG components)
- Single set — no light/dark variants needed
- `getCategoryNeonImage()` in `categories.js` updated to return new paths

---

## Top 10 List Rows

**Podium rows (1-3) with photo:**
- Photo-left card layout (110px photo, unchanged)
- `2px solid #1A1A1A` border, 12px radius
- Rank: red-orange for #1, black for #2-3
- Kill medal glow/gradient

**Podium rows (1-3) no photo:**
- Bordered card, white background
- Kill gradient background fill
- Kill border-left accent color
- Full `2px solid #1A1A1A` border instead

**Finalist rows (4-10):**
- `1px solid #1A1A1A` dividers
- Black rank number, bold dish name, secondary restaurant
- No chevron arrow needed (optional — keep or kill)

---

## #1 Hero Card

| Property | Current | New |
|---|---|---|
| Border | `4px solid gold` left only | `2px solid #1A1A1A` all sides |
| Background | `var(--color-surface-elevated)` | `#FFFFFF` |
| Shadow | Multi-layer gold glow | None |
| Label | Red-orange uppercase | Same (unchanged) |
| Dish name | Gold (`--color-medal-gold`) | Red-orange `#E4440A` |
| Restaurant | `--color-text-secondary` | `#555555` |
| Rating | Green | Red-orange |
| Photo | Right side, 140px | Same (unchanged) |

---

## What We're NOT Changing

- Page structure / scroll depth
- Search bar position and behavior
- Category strip horizontal scroll
- Photo-left card dimensions (110px)
- Hero card photo placement (right side)
- Town picker
- Any page other than Home (for now)

---

## Implementation Order

1. CSS variables in `src/index.css` (new light theme values)
2. Home.jsx — NumberOneHero borders/colors
3. Top10Compact.jsx — podium + finalist row styles
4. CategoryNav in Home.jsx — circle borders, white bg
5. SearchHero — border treatment
6. Category icons — create 19 SVGs, update `categories.js`

Steps 1-5 are code changes (~1-2 hours). Step 6 (icons) is the production task.
