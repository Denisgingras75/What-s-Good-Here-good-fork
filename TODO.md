# What's Good Here - Remaining Issues

**Current Rating: 7.5/10** (Launchable)

## High Priority (Fix in Week 1)

### 1. N+1 Queries in User Profile
- **Location:** `src/api/followsApi.js` (getUserProfile)
- **Issue:** Makes 7 separate API calls per profile load
- **Impact:** Slow profile pages, excessive API usage
- **Fix:** Consolidate into 2-3 RPC calls, add caching

### 2. No Pagination on Followers/Following
- **Location:** `src/api/followsApi.js` (getFollowers, getFollowing)
- **Issue:** Fetches up to 50 at once, no "load more"
- **Impact:** Memory issues with popular users, browser hangs
- **Fix:** Implement cursor-based pagination (limit 20, hasMore flag)

### 3. Client-Side Only Rate Limiting
- **Location:** `src/lib/rateLimiter.js`
- **Issue:** Rate limits only enforced in browser memory
- **Impact:** Easily bypassed via DevTools or multiple tabs
- **Fix:** Add server-side rate limiting in Supabase RLS or Edge Functions

### 4. Inconsistent Error Handling
- **Location:** Throughout `src/api/*`
- **Issue:** Some APIs throw, some return null, some return empty arrays
- **Impact:** Unpredictable UX (shows "0 followers" when API failed)
- **Fix:** Standardize: always throw on error, handle in UI layer

### 5. Console Logs in Production (147 instances)
- **Location:** Throughout codebase
- **Issue:** console.error/warn/log statements in production
- **Impact:** Exposes internals, slows DevTools, pollutes error tracking
- **Fix:** Remove or gate behind `import.meta.env.DEV`

## Medium Priority (Fix in Month 1)

### 6. Ranking Algorithm Improvements
- **Issue:** Raw % doesn't account for vote count confidence
- **Fix:** Implement Bayesian scoring or Wilson score interval

### 7. No Recency Weighting
- **Issue:** Old votes weighted same as new votes
- **Fix:** Add time decay to ranking formula

### 8. Email in sessionStorage
- **Location:** `src/pages/Profile.jsx`
- **Issue:** PII stored client-side
- **Fix:** Remove or encrypt

### 9. Inconsistent Loading States
- **Issue:** Some pages show skeletons, some spinners, some nothing
- **Fix:** Standardize on skeleton loaders everywhere

### 10. Photo Quality Scoring
- **Issue:** No blur/contrast detection
- **Fix:** Add perceptual quality checks

## Low Priority (Backlog)

- Add comprehensive test coverage (currently 2/10)
- Badge system fraud detection
- Cache friend votes data
- TypeScript migration

---

## Completed Fixes ✓

- [x] Double-vote prevention (useVote.js)
- [x] Auth session handling (AuthContext.jsx)
- [x] Spatial index for distance queries (add-spatial-index.sql)
- [x] RLS policies validated
- [x] SQL injection prevention (sanitize.js)
- [x] Path traversal fix (dishPhotosApi.js)
