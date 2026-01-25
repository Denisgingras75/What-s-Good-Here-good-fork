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

## Architecture Principles
- **Categories are shortcuts, NOT containers** - Browse shows 14 curated shortcuts, not all categories
- **Search is the universal access layer** - Any dish is searchable even without a Browse shortcut
- **No direct Supabase calls** - All data access goes through `src/api/`

## Design Tokens
Primary: `#F47A1F` (orange) | Rating: `#E6B84C` (gold)
Text: `#1F1F1F` / `#6B6B6B` / `#9A9A9A`
Defined in `src/index.css`

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

### What NOT to Commit
- Unused components or hooks
- Duplicate constants
- Console.logs (except in catch blocks for genuine errors)
- ES2023+ syntax without polyfills
- Direct localStorage calls (use `src/lib/storage.js`)
