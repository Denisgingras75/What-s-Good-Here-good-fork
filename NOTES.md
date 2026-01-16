# Project Notes

A living reference document. Updated as the project evolves.

---

## Design Tokens

Current design system values defined in `src/index.css`:

### Brand Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#F47A1F` | CTAs, active nav, links, brand accents |
| `--color-rating` | `#E6B84C` | Star ratings, score badges |

### Text Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-text-primary` | `#1F1F1F` | Headings, main text, dish names |
| `--color-text-secondary` | `#6B6B6B` | Descriptions, restaurant names, labels |
| `--color-text-tertiary` | `#9A9A9A` | Hints, metadata, vote counts, timestamps |

### Surface Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#FFFFFF` | Page background |
| `--color-surface` | `#FAFAFA` | Cards, elevated elements, input backgrounds |
| `--color-divider` | `#EDEDED` | Borders, separators, card outlines |

### Feedback Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-danger` | `#D64545` | Errors, destructive actions, warnings |

### Utility
| Token | Value | Usage |
|-------|-------|-------|
| `--focus-ring` | `0 0 0 3px color-mix(...)` | Focus states for accessibility |

---

## Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Body | DM Sans | 400 | 14-16px |
| Headings | DM Sans | 600-700 | 18-24px |
| Labels | DM Sans | 500 | 12-14px |
| Hints | DM Sans | 400 | 12px |

---

## Spacing Scale

Using Tailwind defaults:
- `1` = 4px
- `2` = 8px
- `3` = 12px
- `4` = 16px
- `6` = 24px
- `8` = 32px

---

## Key File Locations

| What | Where |
|------|-------|
| Design tokens | `src/index.css` (lines 1-30) |
| API layer | `src/api/*.js` |
| React hooks | `src/hooks/*.js` |
| Auth context | `src/context/AuthContext.jsx` |
| Location context | `src/context/LocationContext.jsx` |
| Page components | `src/pages/*.jsx` |
| Shared components | `src/components/*.jsx` |
| Supabase client | `src/lib/supabase.js` |
| Database schema | `supabase/schema.sql` |

---

## Food Categories

Current categories in the app:

| Category | Emoji | Image Source |
|----------|-------|--------------|
| Burger | 🍔 | `categoryImages.js` |
| Pizza | 🍕 | `categoryImages.js` |
| Sushi | 🍣 | `categoryImages.js` |
| Taco | 🌮 | `categoryImages.js` |
| Sandwich | 🥪 | `categoryImages.js` |
| Salad | 🥗 | `categoryImages.js` |
| Pasta | 🍝 | `categoryImages.js` |
| Fries | 🍟 | `categoryImages.js` |
| Wings | 🍗 | `categoryImages.js` |
| Lobster Roll | 🦞 | `categoryImages.js` |
| Breakfast | 🍳 | `categoryImages.js` |
| Breakfast Sandwich | 🥓 | `categoryImages.js` |
| Poke Bowl | 🥙 | `categoryImages.js` |
| Tendys | 🐔 | `categoryImages.js` |
| Seafood | 🦐 | `categoryImages.js` |
| Chowder | 🥣 | `categoryImages.js` |
| Soup | 🍜 | `categoryImages.js` |
| Entree | 🍽️ | `categoryImages.js` |
| Apps | 🧆 | `categoryImages.js` |

---

## Photo Quality Tiers

Defined in `src/constants/photoQuality.js`:

| Tier | Score Range | Placement |
|------|-------------|-----------|
| Featured | 90-100 | Hero image, top of gallery |
| Community | 70-89 | Standard gallery |
| Hidden | 0-69 | Only visible in "See all" |
| Rejected | N/A | Not uploaded (fails hard gates) |

### Hard Gates (instant reject)
- File size > 10MB
- Resolution < 800px (shortest side)
- Not JPEG/PNG/WebP
- Too dark (avg brightness < 30)
- Too bright (avg brightness > 240)

---

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `whats-good-here-auth` | Supabase auth session |
| `wgh_has_seen_splash` | Welcome splash shown flag |
| `wgh_has_onboarded` | Welcome modal (name entry) shown |
| `wgh_pending_vote` | Vote data saved before auth |
| `wgh_remembered_email` | Email for magic link convenience |

---

*Last updated: Jan 16, 2026*
