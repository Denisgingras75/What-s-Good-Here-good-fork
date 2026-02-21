# Partner Setup Guide

## Quick Start

```bash
git clone <repo-url>
cp .env.example .env.local
npm install
npm run dev        # http://localhost:5173
```

## Environment Variables

### Required (app won't start without these)

| Variable | Where to find it |
|----------|-----------------|
| `VITE_SUPABASE_URL` | Supabase Dashboard > Settings > API > Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard > Settings > API > anon/public key |

### Optional (production features)

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_SENTRY_DSN` | Error tracking (Sentry) | Disabled |
| `VITE_PUBLIC_POSTHOG_KEY` | Analytics (PostHog) | Disabled |
| `VITE_ADMIN_EMAILS` | Comma-separated admin email addresses | None |
| `VITE_RATING_IDENTITY_ENABLED` | Enable rating identity analysis | `false` |

## Supabase Secrets (Edge Functions)

These are set in **Supabase Dashboard > Edge Functions > Secrets**, NOT in `.env`:

| Secret | Used by | Required for |
|--------|---------|-------------|
| `GOOGLE_PLACES_API_KEY` | `discover-restaurants`, `backfill-restaurants`, `places-autocomplete`, `places-details`, `places-nearby-search`, `seed-reviews` | Restaurant discovery, autocomplete, review seeding |
| `ANTHROPIC_API_KEY` | `menu-refresh`, `restaurant-scraper`, `seed-reviews` | AI review generation, menu scraping |

Without these, the Edge Functions will fail but the core app still works.

## Edge Functions

9 Edge Functions need to be deployed to Supabase:

```
backfill-restaurants
discover-restaurants
menu-refresh
places-autocomplete
places-details
places-nearby-search
restaurant-scraper
scraper-dispatcher
seed-reviews
```

Deploy with: `npx supabase functions deploy <function-name>`

## Database

`supabase/schema.sql` is the source of truth. Run it in Supabase SQL Editor to set up all tables, RPCs, triggers, and RLS policies.

## Vercel Deployment

- `vercel.json` handles SPA routing, OG card rewrites, and CSP headers
- `api/share.ts` and `api/og-image.ts` are Vercel serverless functions for social sharing previews
- Vercel needs `SUPABASE_URL` and `SUPABASE_ANON_KEY` as environment variables (without `VITE_` prefix) for the serverless functions

## External Services (no API keys needed client-side)

- **OpenStreetMap / Nominatim** — free geocoding, no key required
- **Google Places** — all calls go through Supabase Edge Functions, never from browser

## Key Commands

```bash
npm run dev          # Dev server
npm run build        # Production build (must pass before deploy)
npm run test         # Run tests
npm run lint         # Lint check
```

## Architecture Quick Reference

- All data access through `src/api/` — never call Supabase directly from components
- All colors via CSS variables (`var(--color-*)`) — no Tailwind color classes
- React Query for server state — no raw useEffect + fetch
- `src/constants/` for all shared constants
- `src/lib/storage.js` for all localStorage access

See `CLAUDE.md` for full coding standards.
