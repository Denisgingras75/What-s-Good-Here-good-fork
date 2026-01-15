# Dev Log

A shared log of what each contributor worked on. Add your entries at the top.

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
