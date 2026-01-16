# Dev Log

A shared log of what each contributor worked on. Add your entries at the top.

---

## 2025-01-16 - Daniel

### Header & Brand Polish
- Added `TopBar` component with subtle brand-tinted background (5% primary color)
- Centered fork-checkmark logo mark in safe-area region
- Centered logo on Home page (was left-aligned with "Browse All" button)
- Removed redundant "Browse All" button (bottom nav has Browse)

### Visual Hierarchy Tightening
- Reduced TopBar height (28px → 20px) and icon size (20px → 18px)
- Standardized logo height to h-12 across all pages
- Reduced header padding to py-2 for tighter vertical rhythm
- Removed border between header and LocationPicker filters
- Header and filters now read as one contextual block

### Responsive Logo Scaling
- Mobile (<768px): h-12 (48px) - unchanged
- Tablet (≥768px): h-14 (56px) - +17%
- Desktop (≥1024px): h-16 (64px) - +33%

### Copy Fix
- Changed "Ranked by % who would order again" → "Ranked by average score"
- Now matches what users see in the UI (1-10 score display)

### Auth & Photo Fixes (from earlier session)
- Improved auth session persistence using `getSession()` instead of `getUser()`
- Added explicit auth event handling (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
- Fixed duplicate PostHog analytics event in photo upload
- Fixed delete photo using wrong file extension
- Consolidated photo tier config into single source of truth

### Welcome Splash for First-Time Users
- Created `WelcomeSplash.jsx` component for one-time welcome screen
- Shows logo, "Welcome." header, mission statement, and tap hint
- Warm brand-tinted background (3% primary color mix)
- Subtle entrance animations: logo fade-up, staggered text fade-ins
- Tap anywhere to dismiss (no auto-dismiss — lets users read at their pace)
- Respects `prefers-reduced-motion` by disabling animations
- Uses localStorage to track seen state — never shows again after first visit

---

## 2025-01-15 - Daniel (Session 2)

### Gamification Phase 1 - Impact Visibility
- Created `ImpactFeedback.jsx` component (toast notification after voting)
- Added impact calculation to Home.jsx and Browse.jsx:
  - Tracks dish state before/after vote
  - Shows messages like "This dish is now ranked!", "Moved up 3 spots!", "2 more votes to qualify"
- Updated `BrowseCard.jsx` with "X votes to rank" progress indicators
- Updated `Profile.jsx` with contribution language ("You've rated X dishes", "MV Contributor" badge)
- Updated `ReviewFlow.jsx` copy to contribution language:
  - "Help rank this dish — be first to vote!"
  - "Add Your Vote" instead of "Submit Review"

---

## 2025-01-15 - Daniel

### API Layer Abstraction
- Created `src/api/` folder with modular services
- Added `dishesApi`, `restaurantsApi`, `votesApi`, `favoritesApi`, `adminApi`, `authApi`, `profileApi`
- Central `index.js` exporter for clean imports

### Error Handling
- Added `src/utils/errorHandler.js` with error classification
- User-friendly error messages for network, auth, timeout errors
- Exponential backoff retry logic with `withRetry()`

### Hook Migration
- Migrated `useProfile`, `useUserVotes`, `useFavorites` to use API layer
- No more direct Supabase calls outside of `src/api/` and `AuthContext`

### Testing
- Added `authApi.test.js` for auth API coverage
- Upgraded `@testing-library/react` to v16 for React 19 support

### UX Improvements
- Profile tabs now sort dishes by rating (highest first), unrated dishes at end

### Bug Fixes
- Fixed memory leak in `LocationContext` - geolocation permission listener now properly cleaned up
- Fixed unreliable search filtering in Browse - wrapped `filteredDishes` in `useMemo` with proper dependencies
- Fixed modal not reopening after magic link login - removed unreliable `setTimeout(100)`, opens immediately
- Fixed slow initial load - app no longer blocks on geolocation, dishes load instantly with default MV location

---

## 2025-01-14 - Daniel (Session 2)

### UX Improvements
- Added 300ms debounce to search input (smoother typing experience)
- Created skeleton loading components for Home and Browse pages
- Created `LocationContext` for centralized location state management

---

## 2025-01-14 - Daniel

### Code Structure Improvements
- Created `AuthContext` for global auth state management
- Extracted shared `DishModal` component (removed ~200 lines of duplicate code)
- Updated 6 components to use centralized auth

### Bug Fixes
- Fixed magic link redirect - now returns to the dish you were rating after login
- Fixed auth session persistence - no longer logs out after voting

### Database
- Added Chicken Nuggets to The Barn Bowl & Bistro
- Removed duplicate dishes (Winston's Kitchen Chicken Fingers)

---

## How to Add Entries

When you finish working on something, add a new section at the top:

```markdown
## YYYY-MM-DD - Your Name

### What You Worked On
- Brief description of changes
- Another change
```

Keep it short and scannable!
