# What's Good Here

Mobile-first food discovery app for Martha's Vineyard. Ranks dishes by crowd-sourced "Would you order this again?" votes.

## Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, React Router v7
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Hosting:** Vercel (whats-good-here.vercel.app)
- **Analytics:** PostHog, Sentry

## Session Startup
Always read `SPEC.md` and `TASKS.md` before beginning any work.

## Quick Commands
```bash
npm run dev      # localhost:5173
npm run build    # production build
npm run test     # run tests (vitest)
npm run lint     # eslint
```

## Key Docs
- `SPEC.md` - Full system specification (data model, features, RPCs, RLS)
- `TASKS.md` - Prioritized backlog of high-leverage tasks
- `NOTES.md` - Design tokens, architecture, file locations, category system
- `BACKLOG.md` - Future feature ideas
- `DEVLOG.md` - Recent work history

---

## 1. Non-Negotiables (Hard Rules)

These rules are absolute. Violating any of them is a bug.

### 1.1 Browser Compatibility
- **No `toSorted()` or ES2023+ array methods.** Use `slice().sort()`. Crashes Safari <16, Chrome <110.
- **No `Array.at()`.** Use `arr[arr.length - 1]` for last element.
- **Test:** `npm run build` must succeed with no ES2023+ in output.

### 1.2 Error Handling
- **Never render error objects directly.** Always `{error?.message || error}`, never `{error}`.
- **All API errors must use `createClassifiedError()`.** No raw Supabase errors thrown to callers. See `src/api/dishesApi.js` for the canonical pattern.
- **Every page must have a loading state.** No empty `<div>` while fetching. Use skeleton or spinner.
- **New Supabase fields must be added in two places:** `selectFields` string AND `.map()` transform.
- **Test:** Grep for `throw error` in API files — each must be wrapped in `createClassifiedError()`.

### 1.3 Styling
- **All colors via CSS variables.** `style={{ color: 'var(--color-text-primary)' }}` not `className="text-gray-900"`.
- **Never hardcode hex colors in components.** All colors defined in `src/index.css`.
- **Tailwind is for layout/spacing only.** `className` for flexbox, padding, margin, grid. `style` for colors, backgrounds, borders.
- **Test:** Grep for `text-gray`, `text-white`, `bg-gray`, `bg-blue`, etc. in JSX — should return zero results.

### 1.4 Data Access
- **No direct Supabase calls from components or hooks.** All data access goes through `src/api/`.
- **React Query is the data fetching layer.** Use `useQuery`/`useMutation` for all server state. No raw `useEffect` + `fetch` patterns for data fetching.
- **`supabase/schema.sql` is the source of truth.** Update it first when making DB changes, then run in SQL Editor.
- **`.rpc()` function names must exactly match `schema.sql`.** Don't rename based on Postgres hint messages.
- **Test:** Grep for `supabase.` in `src/pages/` and `src/components/` — should return zero results.

### 1.5 Supabase Query Safety
- **Use `.maybeSingle()` for lookups that might return zero rows.** `.single()` throws on zero results.
- **Optimistic updates must have rollback.** Revert to previous state on error, never leave stale data.
- **`ROUND()` needs `::NUMERIC` cast on float expressions.** `ROUND(expression::NUMERIC, 2)`.
- **New RPC functions must be run in Supabase SQL Editor.** Adding to `schema.sql` does NOT deploy. Run the CREATE FUNCTION, then verify with a test call.

### 1.6 Auth Gates
- **Voting, favorites, and photo uploads require login.** Check `user` from `useAuth()` first, show `<LoginModal>` if null. Pattern: `Browse.jsx`.

### 1.7 Logging
- **Use `logger` from `src/utils/logger.js`.** Never use `console.*` directly.
- `logger.error()` / `logger.warn()` — always logged (errors go to Sentry in prod).
- `logger.info()` / `logger.debug()` — only in development.
- **Test:** Grep for `console\.log|console\.error|console\.warn` in `src/` excluding `utils/logger.js` — should return zero results.

### 1.8 Storage
- **All localStorage access via `src/lib/storage.js`.** Use `getStorageItem`/`setStorageItem`/`removeStorageItem`. No direct `localStorage.*` calls in components, hooks, or context.
- **Exception:** `src/lib/supabase.js` passes `window.localStorage` to Supabase Auth config (required by SDK).
- **Test:** Grep for `localStorage\.` in `src/` excluding `lib/storage.js` and `lib/supabase.js` — should return zero results.

---

## 2. Standard Workflow

For any non-trivial change, follow this sequence:

1. **Read `SPEC.md`** — understand the current system state
2. **Check `TASKS.md`** — see if the work is already scoped
3. **Update `schema.sql` first** — if touching database (schema is source of truth)
4. **Make small, focused diffs** — one concern per change
5. **Run in SQL Editor** — if you added/changed RPCs or schema
6. **Verify:**
   - `npm run build` passes
   - `npm run test` passes
   - If you touched schema/RPC: test call returns expected result
   - If you touched sort/filter: edge cases (null, 0 votes, missing price) don't crash
   - If you added a component: exported from barrel index, imported where needed
7. **Update `SPEC.md`** — if the change adds/modifies features, tables, or RPCs
8. **Update `TASKS.md`** — mark task done or add follow-ups

---

## 3. Forbidden Actions

Never do these. If tempted, stop and reconsider.

- **Don't commit unused components, hooks, or dead code.** Delete immediately.
- **Don't duplicate constants.** Everything in `src/constants/`.
- **Don't commit direct `console.*` calls.** Use `logger`.
- **Don't commit ES2023+ syntax without polyfills.**
- **Don't commit direct `localStorage` calls.** Use `src/lib/storage.js`.
- **Don't add features not in `TASKS.md` or explicitly requested.** No speculative work.
- **Don't modify `schema.sql` without running the change in SQL Editor.**
- **Don't guess RPC function names.** Look them up in `schema.sql`.
- **Don't skip `npm run build` before saying "done".**

---

## 4. Project Conventions (inferred from code)

### 4.1 Project Structure
```
src/
├── api/           # API layer — one file per domain (dishesApi, votesApi, etc.)
│   └── index.js   # Barrel export for all API modules
├── components/    # Shared + feature-grouped components
│   ├── Auth/      # Authentication (LoginModal, WelcomeModal)
│   ├── browse/    # Browse page components
│   ├── home/      # Home page components (SearchHero, Top10Compact)
│   ├── profile/   # Profile page components
│   ├── restaurants/ # Restaurant page components
│   ├── restaurant-admin/ # Manager portal components
│   └── foods/     # Food icon SVGs
├── constants/     # App-wide constants (app.js, categories.js, towns.js, tags.js)
├── context/       # React Context providers (AuthContext, LocationContext)
├── hooks/         # Custom React hooks (useDishes, useVote, etc.)
├── lib/           # Infrastructure (supabase.js, analytics.js, storage.js, sounds.js)
├── pages/         # Page components (one per route)
├── utils/         # Pure utility functions (errorHandler, ranking, distance, sanitize)
└── test/          # Test setup (setup.js)
supabase/
├── schema.sql     # Single source of truth — complete database schema
├── migrations/    # Standalone migration scripts (run manually in SQL Editor)
├── seed/
│   ├── data/      # Real restaurant/dish seed data + menus/
│   └── test/      # Test votes, demo data, cleanup scripts
└── tests/         # RLS validation tests
```

### 4.2 API Layer Pattern
Every API file follows this structure:
```js
import { supabase } from '../lib/supabase'
import { createClassifiedError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

export const fooApi = {
  async getSomething(params) {
    try {
      const { data, error } = await supabase.rpc('rpc_name', { ... })
      if (error) throw createClassifiedError(error)
      return data || []
    } catch (error) {
      logger.error('Context:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },
}
```
For table queries (not RPCs), use `selectFields` string + `.map()` transform. See `dishesApi.search()`.

### 4.3 Hook Pattern
```js
import { useQuery } from '@tanstack/react-query'
import { fooApi } from '../api/fooApi'
import { getUserMessage } from '../utils/errorHandler'

export function useFoo(params) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['foo', params],
    queryFn: () => fooApi.getSomething(params),
    enabled: !!params,
  })
  return {
    foos: data || [],
    loading: isLoading,
    error: error ? { message: getUserMessage(error, 'loading foos') } : null,
    refetch,
  }
}
```

### 4.4 Naming Conventions
| Type | Convention | Example |
|---|---|---|
| Components | PascalCase named exports | `export function DishCard()` |
| Hooks | `use` prefix, camelCase | `useDishes`, `useVote` |
| API files | camelCase + `Api` suffix | `dishesApi`, `votesApi` |
| Constants | UPPER_SNAKE_CASE | `MIN_VOTES_FOR_RANKING` |
| Utility functions | camelCase | `createClassifiedError` |
| CSS variables | `--color-*` prefix | `var(--color-primary)` |
| Use "favorites" not "saved" | Database table is `favorites` | `useFavorites`, `isFavorite` |

### 4.5 Design Tokens (Appetite Theme — Light)
Defined in `src/index.css`. Always use `var(--color-*)` — never hardcode.

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#E8663C` (Orange-Red) | CTAs, primary actions |
| `--color-accent-gold` | `#E9A115` (Warm Yellow) | Links, secondary accents |
| `--color-accent-orange` | `#E07856` (Warm Orange) | Hover states |
| `--color-accent-yellow` | `#F5B731` (Bright Yellow) | Badges, stars, highlights |
| `--color-rating` | `#16A34A` (Bright Green) | Rating displays, success |
| `--color-text-primary` | `#1A1A1A` (Near-Black) | Main text |
| `--color-text-secondary` | `#6B7280` (Medium Gray) | Secondary text |
| `--color-text-tertiary` | `#9CA3AF` (Light Gray) | Tertiary text |
| `--color-text-on-primary` | `#FFFFFF` (White) | Text on primary-colored backgrounds |
| `--color-bg` | `#F0ECE8` (Warm Stone) | Page background |
| `--color-surface` | `#F7F4F1` (Light Stone) | Slightly lighter surface |
| `--color-surface-elevated` | `#FFFFFF` (White) | Elevated elements |
| `--color-card` | `#FFFFFF` (White) | Card backgrounds |
| `--color-card-hover` | `#FFF8F4` (Warm Tint) | Card hover state |

### 4.6 Constants & Configuration
- **`MIN_VOTES_FOR_RANKING` = 5** — `src/constants/app.js` — dishes below this show as "Early"
- **`MAX_REVIEW_LENGTH` = 200** — `src/constants/app.js` — enforced client + DB constraint
- **`MIN_VOTES_FOR_VALUE` = 8** — `src/constants/app.js` — value score eligibility
- **Category definitions** — `src/constants/categories.js` — `BROWSE_CATEGORIES` (19 shortcuts), `MAIN_CATEGORIES`, `ALL_CATEGORIES`
- **Categories are shortcuts, NOT containers** — Browse shows 15 curated shortcuts. Search covers all dishes regardless of category.

### 4.7 localStorage Keys
| Key | Purpose | Location |
|---|---|---|
| `wgh_has_seen_splash` | Welcome splash shown | `WelcomeSplash.jsx` |
| `wgh_has_onboarded` | Welcome modal shown | `WelcomeModal.jsx` |
| `whats_good_here_pending_vote` | Vote saved before auth redirect | `src/lib/storage.js` |
| `wgh_has_seen_ear_tooltip` | Ear icon tooltip shown | `src/lib/storage.js` |
| `wgh_radius` | Radius filter preference | `LocationContext.jsx` |
| `wgh_town` | Town filter preference | `LocationContext.jsx` |
| `whats-good-here-auth` | Supabase auth session | `src/lib/supabase.js` |
| `whats-good-here-location-permission` | Geolocation permission state | `LocationContext.jsx` |

### 4.8 Key Hooks (check before building new ones)
- `useVote` — Vote submission with rating, review, duplicate prevention
- `useFavorites` — Optimistic favorite toggling with analytics
- `useUserVotes` — User's vote history with stats (rating style, standout picks)
- `useDishes` — Location-based ranked dishes via React Query
- `useDishPhotos` — Photo upload with quality analysis, validation, progress
- `useDishSearch` — Debounced dish search (2+ chars)
- `useProfile` — User profile data
- `useRestaurantManager` — Manager portal data
- `useSpecials` — Restaurant specials management
- `useUnratedDishes` — Dishes user hasn't voted on yet
- `useFocusTrap` — Keyboard focus trap for modals
- `useDish` — Single dish by ID

### 4.9 Key Supabase RPCs
- `get_ranked_dishes` — Main Browse feed (ranked by votes, distance, variants, value score)
- `get_restaurant_dishes` — Dishes for a specific restaurant
- `get_dish_variants` — Variants/sizes for a dish
- `get_smart_snippet` — Best review snippet for a dish
- `check_vote_rate_limit` — Server-side vote rate limiting (10/min)
- `check_photo_upload_rate_limit` — Photo upload rate limiting (5/min)
- `get_taste_compatibility` — Taste match % between two users
- `get_similar_taste_users` — Users with similar taste you don't follow
- `get_user_rating_identity` — Rating style analysis (MAD-based bias)
- `get_friends_votes_for_dish` / `get_friends_votes_for_restaurant` — Social context
- `evaluate_user_badges` — Award badges based on stats
- `get_invite_details` / `accept_restaurant_invite` — Manager invite flow

### 4.10 File Organization
- **Storage helpers go in `src/lib/storage.js`** — not scattered in components
- **Extract components when files exceed ~400 lines** — keep pages focused on orchestration
- **Use barrel exports** — import from `'../components/home'` not individual files
- **Delete unused code immediately** — don't let dead code accumulate
- **Component subdirectories match pages** — `components/browse/` for Browse page components

### 4.11 Deployment
- **CSP in `vercel.json`** — external resources need `connect-src` too. Add new external domains to both `img-src` and `connect-src`.

---

## 5. Architecture Principles

- **Categories are shortcuts, NOT containers.** Browse shows 15 curated shortcuts, not all categories. Search is the universal access layer — any dish is searchable.
- **No direct Supabase calls from UI.** All data access through `src/api/`.
- **`supabase/schema.sql` is the source of truth.** Update it first, then run in SQL Editor.
- **React Query for server state.** `useQuery`/`useMutation` — never raw `useEffect` + `fetch`.
- **Optimistic updates with rollback.** UI updates before server confirms, reverts on error.
- **All errors classified.** `createClassifiedError()` on every API boundary.
- **Lazy-loaded pages.** All pages use `lazyWithRetry()` for code splitting with chunk failure recovery.
- **Light theme with food psychology colors.** "Appetite" — warm stone backgrounds, white cards, orange-red + yellow accents. No dark mode toggle.
