# Project Notes

A living reference document. Updated as the project evolves.

---

## Build Order Tracker

What we actually did (left) vs. ideal order (right). Left side updated as work continues.

```
WHAT WE DID                             IDEAL ORDER (for next time)
────────────────────────────────────    ────────────────────────────────────
Jan 6-7 (Week 1)                        Week 1: Foundation
├─ Schema + Auth + UI + Data            ├─ Discovery & spec document
│  (all in one commit)                  ├─ Define MVP scope + metrics
├─ Category additions (14 commits)      ├─ Architecture decisions
└─ No design system                     └─ Design tokens & patterns

Jan 11-14 (Week 2)                      Week 2: Data & Core
├─ Image debugging (10+ commits)        ├─ Schema (with room to grow)
├─ Pizza animations (premature)         ├─ API layer structure
├─ Navigation structure (late)          ├─ Auth flow (properly tested)
├─ 20+ redesign commits                 └─ Seed data strategy
└─ Design tokens (finally)

Jan 14-15 (Week 3)                      Week 3: Core Flow
├─ Auth bug fixes (6+ commits)          ├─ Core screens (Home, Browse)
├─ Refactor: AuthContext, API layer     ├─ Primary user flow
├─ Analytics added (late)               ├─ Analytics instrumentation
└─ Testing setup                        └─ Error handling

Jan 15-16 (Week 4)                      Week 4: Polish
├─ Gamification & impact feedback       ├─ Secondary features
├─ Photo quality system                 ├─ Polish & animations
├─ TopBar brand anchor                  ├─ Onboarding flows
├─ Welcome splash for first-timers      └─ Testing & QA
└─ Build retrospective

Jan 19-20 (Week 5)                      Week 5: Social & Identity
├─ Dark mode overhaul → Island Depths   ├─ Social system (follows, profiles)
├─ Custom SVG category icons            ├─ Gamification (streaks, badges)
├─ Profile polish, analytics            └─ Theme/identity finalization
└─ PostHog vote events for pitching

Jan 22 (Week 6)                         Week 6: Hardening
├─ Full social system (follows,         ├─ Security audit & RLS cleanup
│  public profiles, notifications)      ├─ Schema hardening (search_path,
├─ User search & follow lists           │  FK indexes, auth caching)
├─ Taste compatibility                  ├─ Error handling audit
└─ Rating comparisons on profiles       └─ CI / automated testing

Jan 23-27 (Week 7)                      Week 7: Congruence
├─ Security: rate limits, CSP,          ├─ Spec & task documentation
│  schema hardening (search_path)       ├─ Codebase-wide consistency pass
├─ Share mechanic (post-vote)           ├─ Migration cleanup
├─ HEIC photo support                   └─ Pre-launch QA
└─ Back button fix in vote flow

Jan 28+ (Week 8)                        Week 8: Stability
├─ SDD: SPEC.md, TASKS.md, CLAUDE.md   ├─ Performance optimization
├─ Congruence pass (32 files:           ├─ Edge case testing
│  CSS vars, classified errors,         └─ Launch prep
│  storage helpers, React Query)
├─ Completed 13/20 audit tasks
├─ Restaurant menu view
├─ Consensus trigger fix (late voters)
└─ RLS policy cleanup (16 duplicates)
────────────────────────────────────    ────────────────────────────────────
```

### Ideal Build Order — Explained

Why each item belongs in its week. Reference for next project.

#### Week 1: Foundation

| Item | What It Means | Why It Goes First |
|------|--------------|-------------------|
| **Discovery & spec document** | Write down what you're building before writing code. Who's the user? What's the core loop? What does "done" look like? | Everything downstream depends on knowing what you're building. Without this, you end up with 14 category commits because you're figuring it out as you go. |
| **Define MVP scope + metrics** | Draw a hard line around what ships v1. Pick 2-3 numbers that tell you if it's working (e.g., votes per user, return visits). | Prevents scope creep. Gamification landed Week 4, social features Week 6 — some of that might not have been needed for launch. A scope doc forces the "not yet" conversation early. |
| **Architecture decisions** | Choose your stack, decide on data access patterns (API layer vs direct calls), pick your state management approach, settle auth strategy. | These are expensive to change later. AuthContext was refactored in Week 3, the API layer in Week 3 — because these weren't decided upfront. Every refactor is rework. |
| **Design tokens & patterns** | Define your color palette, typography, spacing scale, and component patterns before building any UI. | Design tokens didn't land until end of Week 2, then the entire theme was overhauled in Week 5 (Island Depths). That's two full visual rewrites. Tokens-first means you paint once. |

#### Week 2: Data & Core

| Item | What It Means | Why Week 2 |
|------|--------------|------------|
| **Schema with room to grow** | Design your database tables thoughtfully — think about relationships, constraints, and fields you'll need for features on your roadmap. Add nullable columns for future use. | Schema changes after you have data are painful. The `yes_votes` column (T14) is dead because the trigger was never updated. A deliberate schema design phase catches these gaps. |
| **API layer structure** | Build the `src/api/` abstraction layer before any UI touches the database. Define the pattern: how errors are handled, how RPCs are called, how results are transformed. | UI was built first, then the API layer was extracted in Week 3. That meant every component had direct Supabase calls that all had to be migrated. API-first means UI only ever knows one pattern. |
| **Auth flow (properly tested)** | Implement login, session persistence, redirects, and edge cases (expired tokens, magic link return) with test coverage. | There were 6+ auth bug fix commits in Week 3. Auth is foundational — if it's flaky, users can't vote, can't save favorites, can't do anything. Get it rock-solid before building on top. |
| **Seed data strategy** | Plan how you'll populate the database for development and demos. Script it so it's repeatable. | Ended up with 17+ seed files in `supabase/seed/`. Having a strategy early means every developer (and every demo) starts from the same known state. Ad-hoc seeding leads to inconsistent test data. |

#### Week 3: Core Flow

| Item | What It Means | Why Week 3 |
|------|--------------|------------|
| **Core screens (Home, Browse)** | Build the 2-3 screens that represent the primary user journey. No bells and whistles — just the skeleton with real data flowing through. | With foundation (Week 1) and data layer (Week 2) done, you can now build screens that actually work end-to-end. You're not guessing at the data shape or fighting auth bugs. |
| **Primary user flow** | The one path that matters most: Browse dishes → Vote → See result. Make this feel complete and tight before anything else. | This is your product. If this flow is broken or clunky, nothing else matters. Gamification, photos, social features — none of it helps if the core vote loop doesn't feel good. |
| **Analytics instrumentation** | Add event tracking (PostHog, etc.) to the core flow from the start. Track votes, page views, search queries. | Analytics were added "late" in Week 3. The problem: you miss all the early user behavior data. If you instrument from the start, you have data to inform every decision that follows. |
| **Error handling** | Build your `createClassifiedError` pattern, user-friendly messages, loading states, and failure recovery. | Errors are inevitable. Without a pattern, each component handles errors differently (or not at all). The error handling audit much later had to retrofit 32 files. Doing it in Week 3 means every screen built after this has errors handled correctly from day one. |

#### Week 4: Polish

| Item | What It Means | Why Week 4 |
|------|--------------|------------|
| **Secondary features** | Features that enhance but aren't core: favorites, photo uploads, restaurant detail pages, search refinements. | The core flow is solid. Now layer on features that make users stay longer or come back. These are additive — if any one of them breaks, the app still works. |
| **Polish & animations** | Micro-interactions, transitions, loading skeletons, hover states. The things that make it feel "premium." | Polish on a broken foundation is wasted effort. Pizza animations were built in Week 2 before the nav structure existed — that work was thrown away. Polish after function. |
| **Onboarding flows** | Welcome splash, first-time user guidance, tooltip explanations. | You need a working app to onboard someone into. Building onboarding before the app works means you're onboarding people into something that might change. Week 4 is when the app is stable enough to guide someone through. |
| **Testing & QA** | Write tests for the core flow, run through edge cases (no votes, null prices, missing photos), cross-browser testing. | You have a working, polished app. Now stress-test it. This is where you'd catch the `toSorted()` Safari crash, the ES2023+ issues, the edge cases with 0 votes. Finding these before users do is the whole point. |

#### Week 5: Social & Identity

| Item | What It Means | Why Week 5 |
|------|--------------|------------|
| **Social system (follows, profiles)** | The follows table, public profiles, user search, follow lists, notifications — the whole social graph. | Social features touch many tables and create complex relationships (follows, notifications, taste compatibility). You need a stable core app first because social features multiply the surface area for bugs. |
| **Gamification (streaks, badges)** | Streak tracking, badge evaluation, leaderboards — the retention mechanics. | Gamification only works if users are already doing the core action (voting). Build it after the vote flow is polished so the rewards feel earned, not forced. Also, badge criteria depend on vote data patterns you can only understand after the core flow exists. |
| **Theme/identity finalization** | Lock in the final visual identity. No more color palette changes after this. | There were two theme overhauls (initial → dark mode → Island Depths). Ideally you'd explore visual identity in Week 1 (tokens), build with it through Weeks 2-4, and finalize in Week 5 after seeing it with real content. One final pass, then it's locked. |

#### Week 6: Hardening

| Item | What It Means | Why Week 6 |
|------|--------------|------------|
| **Security audit & RLS cleanup** | Review every RLS policy, verify they match your schema, remove duplicates, ensure no unintended access. | With all features built, you can now audit the full attack surface. 16 duplicate RLS policies were found and a DELETE policy that could orphan data. These audits only make sense when the schema is stable. |
| **Schema hardening** | Pin `search_path` on functions, add FK indexes for join performance, fix `auth.uid()` caching, add `SECURITY DEFINER` where needed. | These are the "you won't notice until production" issues. FK indexes prevent slow cascading queries at scale. `search_path` pinning prevents schema injection. Do this after features are done because schema changes during active development create noise. |
| **Error handling audit** | Grep every API file for unclassified errors, verify every page has loading states, ensure no raw error objects render. | Classified errors were retrofitted across 32 files. If the error pattern existed from Week 3, this audit is a quick verification pass instead of a massive refactor. |
| **CI / automated testing** | GitHub Actions running `npm run build` and `npm run test` on every PR. | T15 is still open. CI is Week 6 because you need tests to exist first (Week 4) and a stable codebase to avoid noisy false failures. Once it's set up, it catches regressions automatically. |

#### Week 7: Congruence

| Item | What It Means | Why Week 7 |
|------|--------------|------------|
| **Spec & task documentation** | Write SPEC.md (what exists today), TASKS.md (what's left), keep CLAUDE.md accurate. | After all features are built and hardened, document the system as-is. This is your handoff document — for future you, for collaborators, for AI assistants. Doing it earlier means constant rewrites as things change. |
| **Codebase-wide consistency pass** | Ensure every file follows the same patterns: CSS variables not Tailwind colors, storage helpers not raw localStorage, logger not console.log, React Query not raw useEffect. | The congruence pass touched 32 files. In the ideal world, this is smaller because patterns were established early. But a final sweep always finds stragglers. |
| **Migration cleanup** | Reconcile `schema.sql` with what's actually in production. Archive old migrations. Verify every RPC name matches. | There were stale migration files, a `fix-profiles-rls.sql` sitting untracked, and `_archive/` backup files. Clean house before launch so the repo reflects reality. |
| **Pre-launch QA** | Full end-to-end testing on real devices. Safari, Chrome, slow connections, first-time users, power users. | The last gate before real users. Everything should be working — this is about finding the 5% of issues that only show up in real conditions. |

#### Week 8: Stability

| Item | What It Means | Why Week 8 |
|------|--------------|------------|
| **Performance optimization** | Lazy loading, bundle splitting, query optimization, image compression. Measure first, then fix. | Premature optimization wastes time. By Week 8, you have real usage patterns and can measure what's actually slow. The `lazyWithRetry()` pattern is a good example — but you'd also profile RPC query times, bundle size, and initial load. |
| **Edge case testing** | What happens with 0 votes? Null prices? Missing photos? A dish with no restaurant? A user who follows nobody? | These are the bugs that embarrass you in demos. Systematic edge case testing after everything is built catches the long tail of issues that unit tests miss. |
| **Launch prep** | DNS, monitoring alerts, error tracking thresholds, rollback plan, seed production data, invite beta testers. | The app is done. Now make sure the infrastructure is ready for real traffic. Sentry alerts, PostHog dashboards, a plan for if something breaks at 2am. |

---

### Recent Work (update this as you go)
| Date | What Changed | Category |
|------|--------------|----------|
| Jan 17 | Category architecture: shortcuts not containers | Architecture |
| Feb 13 | Homepage simplification: removed emoji medals, card wrapper, gradients, uppercase labels | Design |
| Feb 13 | Categories moved to horizontal scroll under town picker | UX |
| Feb 13 | Added fish, clams, chicken, pork to browse shortcuts (19 total) | Data |
| Feb 13 | Divider color fix: gold→rust tint to prevent green on dark navy | Design |
| Jan 17 | Browse reduced to 14 curated shortcuts | UX |
| Jan 17 | Search now returns results sorted by rating | Feature |
| Jan 16 | Added quesadilla category, fixed steak items | Data |
| Jan 16 | Category cleanup: steak, chicken, seafood split | Data |
| Jan 16 | Welcome splash (tap to dismiss) | Onboarding |
| Jan 16 | TopBar with brand tint | Polish |
| Jan 16 | Responsive logo scaling | Polish |
| Jan 16 | Photo quality + tiers | Feature |
| Jan 15 | Gamification phase 1 | Feature |
| Jan 15 | Sentry + PostHog | Infrastructure |
| Jan 15 | API layer refactor | Architecture |

---

## Design Tokens (Appetite Theme — Light)

Current design system values defined in `src/index.css`:

### Brand Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#E8663C` (Orange-Red) | CTAs, primary actions |
| `--color-accent-gold` | `#E9A115` (Warm Yellow) | Links, secondary accents |
| `--color-accent-orange` | `#E07856` (Warm Orange) | Hover states |
| `--color-accent-yellow` | `#F5B731` (Bright Yellow) | Badges, stars, highlights |
| `--color-rating` | `#16A34A` (Bright Green) | Rating displays, success |

### Text Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-text-primary` | `#1A1A1A` (Near-Black) | Main text |
| `--color-text-secondary` | `#6B7280` (Medium Gray) | Secondary text |
| `--color-text-tertiary` | `#9CA3AF` (Light Gray) | Tertiary text |
| `--color-text-on-primary` | `#FFFFFF` (White) | Text on primary-colored backgrounds |

### Surface Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#F0ECE8` (Warm Stone) | Page background |
| `--color-surface` | `#F7F4F1` (Light Stone) | Slightly lighter surface |
| `--color-surface-elevated` | `#FFFFFF` (White) | Elevated elements |
| `--color-card` | `#FFFFFF` (White) | Card backgrounds |
| `--color-card-hover` | `#FFF8F4` (Warm Tint) | Card hover state |

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

## Category Architecture (LOCKED)

**Core principle:**
```
If it exists, it's searchable.
If it's popular, it gets a shortcut.
If it's good, it rises.
```

**Categories are shortcuts, NOT containers.**

- Browse shows ~19 curated, high-frequency categories only
- These are shortcuts to common decisions ("best X near me")
- Browse is NOT meant to be exhaustive

**Dishes without Browse shortcuts:**
- Still fully searchable by name
- Appear on restaurant pages
- Votable and rankable
- Live in search + rankings, not Browse

**Data model:**
- A dish can have 0, 1, or many categories
- Categories do NOT own dishes
- Search is the universal access layer

**UX implications:**
- No "See all categories" - Browse is intentionally curated
- Search must find ANY dish by name
- Category absence ≠ dish absence

---

## Browse Shortcuts (19 curated)

These appear on the Browse page and Home page category scroll:

| Shortcut | Why Included |
|----------|--------------|
| Pizza | High frequency |
| Burgers | High frequency |
| Tacos | High frequency |
| Wings | High frequency |
| Sushi | Clear decision |
| Breakfast | Clear decision |
| Lobster Roll | MV signature |
| Seafood | MV signature |
| Chowder | MV signature |
| Pasta | Common decision |
| Steak | Common decision |
| Sandwiches | Common decision |
| Salads | Common decision |
| Tenders | Common decision |
| Desserts | Common decision |
| Fish | MV signature |
| Clams | MV signature |
| Chicken | Common decision |
| Pork | Common decision |

---

## Searchable-Only Dishes

These categories/dishes exist and are searchable but don't have Browse shortcuts:

- Apps, Appetizers, Calamari
- Breakfast Sandwiches
- Clams (strips, bellies, steamers)
- Entrees, Main courses
- Fries, Sides
- Poke Bowls
- Soups (non-chowder)
- Quesadillas
- Fried Chicken
- Specific wing flavors
- Any niche or one-off dishes

**Remember:** These dishes still rank, still appear on restaurant pages, still get votes. They just don't clutter Browse.

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
| `whats_good_here_pending_vote` | Vote data saved before auth (5-min TTL) |
| `wgh_remembered_email` | Email for magic link convenience |

---

## Dish Variants System

Parent-child relationship for dishes with multiple flavors/styles (e.g., Wings → Buffalo, BBQ, Garlic Parm).

### How It Works

| Dish Type | `parent_dish_id` | Behavior |
|-----------|------------------|----------|
| Standalone | NULL | Shows normally with its own votes |
| Parent | NULL (has children) | Shows aggregated stats from children |
| Child variant | UUID (points to parent) | Hidden from main lists, shown when expanding parent |

### Database Columns

```sql
dishes.parent_dish_id  -- NULL = parent/standalone, UUID = child variant
dishes.display_order   -- Sort order within variant list (lower = first)
```

### Linking Variants

```sql
-- Find dishes to link
SELECT id, name, restaurant_id FROM dishes WHERE name ILIKE '%wings%';

-- Link children to parent
UPDATE dishes SET parent_dish_id = 'PARENT_ID', display_order = 1 WHERE id = 'CHILD_ID';
UPDATE dishes SET parent_dish_id = 'PARENT_ID', display_order = 2 WHERE id = 'ANOTHER_CHILD_ID';
```

### Key Functions

| Function | Purpose |
|----------|---------|
| `get_restaurant_dishes(uuid)` | Returns parent dishes with aggregated variant stats |
| `get_dish_variants(uuid)` | Returns all variants for a parent dish |
| `get_ranked_dishes(...)` | Excludes child variants, shows parents only |

### UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `VariantPicker` | `src/components/VariantPicker.jsx` | Expandable variant list |
| `VariantBadge` | `src/components/VariantPicker.jsx` | "X flavors" badge |
| `VariantSelector` | `src/components/VariantPicker.jsx` | Horizontal pill selector |

### API Methods

```js
dishesApi.getVariants(parentDishId)     // Get variants for a parent
dishesApi.hasVariants(dishId)           // Check if dish has variants
dishesApi.getParentDish(dishId)         // Get parent info for a variant
dishesApi.getSiblingVariants(dishId)    // Get other variants of same parent
```

---

*Last updated: Jan 24, 2026*
