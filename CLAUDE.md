# What's Good Here

Mobile-first food discovery app for Martha's Vineyard. Ranks dishes by crowd-sourced "Would you order this again?" votes.

## Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, React Router
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Hosting:** Vercel (whats-good-here.vercel.app)
- **Analytics:** PostHog, Sentry

## Quick Commands
```bash
npm run dev      # localhost:5173
npm run build    # production build
npm run test     # run tests
npm run lint     # eslint
```

## Key Docs (read these for full context)
- `NOTES.md` - Design tokens, architecture, file locations, category system
- `BACKLOG.md` - Future feature ideas
- `DEVLOG.md` - Recent work history

## Project Structure
```
src/
├── api/           # API layer (dishesApi, votesApi, etc.)
├── components/    # Shared components
├── context/       # AuthContext, LocationContext
├── hooks/         # Custom React hooks
├── lib/           # Supabase client
├── pages/         # Page components
└── utils/         # Helpers (distance, ranking, errorHandler)
supabase/
├── schema.sql     # Database schema + RLS
└── seed.sql       # Sample data
```

## Key Hooks (check before building new ones)
- `useVote` - Vote submission with rating, review, duplicate prevention
- `useFavorites` - Optimistic favorite toggling with analytics
- `useUserVotes` - User's vote history with stats (rating style, standout picks)
- `useDishes` - Location-based ranked dishes via React Query
- `useDishPhotos` - Photo upload with quality analysis, validation, progress
- `useDishSearch` - Debounced dish search (2+ chars)
- `useLeaderboard` - Friends leaderboard with weekly reset countdown
- `useStreak` - Voting streak tracking

## Key Supabase RPCs
- `get_ranked_dishes` - Main Browse feed (ranked by votes)
- `get_restaurant_dishes` - Dishes for a specific restaurant
- `get_dish_variants` - Variants/sizes for a dish
- `check_vote_rate_limit` - Server-side vote rate limiting
- `check_photo_upload_rate_limit` - Photo upload rate limiting
- `get_taste_compatibility` - Taste match % between two users
- `get_similar_taste_users` - Users with similar taste you don't follow
- `get_friends_leaderboard` - Friends ranked by votes
- `get_user_rating_identity` - Rating style analysis (generous, tough, etc.)
- `get_friends_votes_for_dish` / `get_friends_votes_for_restaurant` - Social context

## Architecture Principles
- **Categories are shortcuts, NOT containers** - Browse shows 14 curated shortcuts, not all categories
- **Search is the universal access layer** - Any dish is searchable even without a Browse shortcut
- **No direct Supabase calls** - All data access goes through `src/api/`
- **`supabase/schema.sql` is the source of truth** - Update it first when making DB changes, then run in SQL Editor
- **React Query is the data fetching layer** - Use `useQuery`/`useMutation` for all server state. Never add raw `useEffect` + `fetch` patterns.
- **New API files that query tables follow the `dishesApi.js` pattern** - `selectFields` string, `.map()` transform. RPC-only or storage APIs won't need this structure, but all API files must use `createClassifiedError()` on errors.

## Design Tokens
Primary: `#F47A1F` (orange) | Rating: `#E6B84C` (gold)
Text: `#1F1F1F` / `#6B6B6B` / `#9A9A9A`
Defined in `src/index.css` — **supports dark mode** via `[data-theme="dark"]`. Never hardcode colors; always use `var(--color-*)`.

## localStorage Keys
- `wgh_has_seen_splash` - Welcome splash shown
- `wgh_has_onboarded` - Welcome modal shown
- `wgh_pending_vote` - Vote saved before auth

## Coding Standards (Do NOT Violate)

### Browser Compatibility
- **No `toSorted()` or ES2023+ array methods** - Crashes Safari <16, Chrome <110. Use `slice().sort()` instead
- **No `Array.at()`** - Use bracket notation `arr[arr.length - 1]` for last element

### Error Handling
- **Never render error objects directly** - Always use `{error?.message || error}`, never `{error}`
- **Errors should be user-friendly strings** - Transform API errors before displaying
- **All API errors must use `createClassifiedError()`** - Don't throw raw Supabase errors. See `dishesApi.js` for the pattern.
- **Every page needs a loading state** - Never return an empty `<div>` while fetching. Use a skeleton or spinner.
- **New fields from Supabase must be added in two places** - Both `selectFields` and the `.map()` transform in the API file

### Styling
- **Use CSS variables, not Tailwind color classes** - `style={{ color: 'var(--color-text-primary)' }}` not `className="text-gray-900"`. All colors come from `var(--color-*)` defined in `src/index.css`.

### Supabase Queries
- **Use `.maybeSingle()` for lookups that might return zero rows** - `.single()` throws on zero results, which crashes error handling when "not found" is a valid state (e.g., checking if a user already voted)
- **Optimistic updates must have rollback** - Any UI that updates before the server confirms must revert to previous state on error, never leave stale optimistic data in place
- **`.rpc()` function names must exactly match `schema.sql`** - Don't rename based on Postgres hint messages. Verify the actual function name in the schema before changing code.
- **`ROUND()` needs `::NUMERIC` cast on float expressions** - `ROUND(double precision, int)` doesn't exist in Postgres. Use `ROUND(expression::NUMERIC, 2)` with `LOG()`, `PERCENT_RANK()`, and similar.

### Auth-Gated Actions
- **Voting, favorites, and photo uploads require login** - Check `user` first, show `<LoginModal>` if null. See `Browse.jsx:234` for the pattern.

### Constants & Configuration
- **Centralize constants in `src/constants/`** - Never duplicate magic numbers across files
- **`MIN_VOTES_FOR_RANKING`** and **`MAX_REVIEW_LENGTH`** live in `src/constants/app.js`
- **Category definitions** live in `src/constants/categories.js`

### Naming Conventions
- **Use "favorites" not "saved"** - Database table is `favorites`, so use `useFavorites`, `isFavorite`, `toggleFavorite`
- **Components are PascalCase**, hooks are `useCamelCase`, utilities are `camelCase`

### File Organization
- **Storage helpers go in `src/lib/storage.js`** - Not scattered in components
- **Extract components when files exceed ~400 lines** - Keep pages focused on orchestration
- **Use barrel exports** - Import from `'../components/home'` not individual files
- **Delete unused code immediately** - Don't let dead code accumulate

### Component Structure
```
src/components/
├── home/           # Home page components
├── browse/         # Browse page components
├── restaurants/    # Restaurants page components
├── profile/        # Profile page components
├── Auth/           # Authentication components
└── foods/          # Food icon SVGs
```

### Logging
- **Use `logger` from `src/utils/logger.js`** - Never use `console.*` directly
- `logger.error()` / `logger.warn()` - Always logged (errors go to Sentry in prod)
- `logger.info()` / `logger.debug()` - Only logged in development

### Deployment
- **CSP in `vercel.json` — external resources need `connect-src` too** - The service worker fetches images via `fetch()` which uses `connect-src`, not `img-src`. Add new external domains to both.

### Verification (before calling anything done)
- **`npm run build` must pass** - Don't say "done" if it doesn't compile
- **`npm run test` must pass** - Run tests, don't assume they still pass
- **If you touched Supabase schema/RPC:** verify the function returns the new columns with a sample query
- **If you touched a sort or filter:** confirm edge cases (null values, 0 votes, missing price) don't crash or sort wrong
- **If you added a new component:** verify it's exported from the barrel index and actually imported where needed

### What NOT to Commit
- Unused components or hooks
- Duplicate constants
- Direct `console.*` calls (use `logger` utility instead)
- ES2023+ syntax without polyfills
- Direct localStorage calls (use `src/lib/storage.js`)
