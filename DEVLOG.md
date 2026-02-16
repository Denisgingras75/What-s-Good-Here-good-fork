# Dev Log

A shared log of what each contributor worked on. Add your entries at the top.


---

## 2026-02-15 - Daniel + Claude

### Bug Fixes
- **T32:** Fixed DishSearch inputRef null check — added optional chaining to `inputRef.current?.contains()` in click-outside handler
- **T31:** Added error handling to Profile/Browse async operations — `handleSaveName` try-catch with user error message, `handleVote` refetch try-catch, `adminApi.isAdmin()` catch handler, `handleToggleFavorite` try-catch in Browse.jsx

### Resend Email Setup (In Progress)
- Resend account created, domain `wghapp.com` purchased and verified
- SMTP credentials configured in Supabase Auth settings (host: smtp.resend.com, port: 465, username: resend)
- **Blocked:** Resend had a service outage during testing, and API key was accidentally deleted
- **Next:** Once Resend is back up, create new API key, update Supabase SMTP password, test magic link delivery
- Note: Earlier test failures were due to using `user_repeated_signup` (existing account) which Supabase silently no-ops — need to test with magic link login or fresh email

### T28 Rescoped
- `react-helmet-async` doesn't support React 19 (peer dep conflict)
- Client-side meta tags don't help anyway — social crawlers (Facebook, iMessage, Twitter) don't execute JS
- Rescoped T28 to Vercel edge middleware approach, deferred to pre-launch
- Middleware will detect crawler user agents, fetch data from Supabase, return HTML with correct og tags

### Next Up
- Resend API key recreation + email delivery verification
- T26 (homepage polish), T27 (OG image), T29 (apple-touch-icon)

---

## 2026-02-13 - Daniel + Claude

### Homepage Simplification
- Removed emoji medals (🥇🥈🥉🏆) from Top 10 — replaced with typography-only rank numbers (red for top 3)
- Removed bordered card wrapper around Top 10 list (border, box-shadow, inner glow)
- Removed decorative radial gradients from SearchHero
- Removed uppercase tracked "BROWSE BY CATEGORY" section header
- Simplified expand/collapse to plain text (no chevron icon, no border-top)
- Moved category scroll from separate section to inside SearchHero, under town picker
- Category pills: removed borders, use subtle elevated background with category photos

### Color Palette
- Explored color ring palette redesign (branch `experiment/color-ring-palette-v2`)
- Vivid Red + Bright Yellow palette tested and reverted — too primary-colored, read as cheap
- Reverted to original Island Depths palette (Deep Rust + Warm Gold)
- Fixed `--color-divider` from gold tint to rust tint — gold at low opacity on dark navy produced a green appearance

### New Categories
- Added fish, clams, chicken, pork to `BROWSE_CATEGORIES` (now 18 shortcuts)

---

## 2026-01-22 - Daniel + Claude

### Social Features - Major Overhaul
Complete social system replacing global leaderboards with friend-based discovery:

#### Follows System
- Created `follows` table with one-way Twitter-style following
- Denormalized `follower_count` and `following_count` on profiles for performance
- Database trigger auto-updates counts on follow/unfollow
- Created `followsApi.js` with follow/unfollow/isFollowing methods

#### Public User Profiles (`/user/:id`)
- New `UserProfile.jsx` page showing any user's public profile
- Stats: dishes rated, Worth It count, Avoid count, avg rating
- Rating personality based on avg rating (Loves Everything, Generous Rater, Fair Judge, Tough Critic)
- Recent ratings with dish photos and community comparison
- Follow/unfollow button with real-time count updates

#### User Search
- `UserSearch.jsx` component with debounced search
- Search users by display name
- Shows follower count, follow status, quick follow button
- Expandable "Find Friends" section on Profile page

#### Followers/Following Modal
- `FollowListModal.jsx` shows full lists when tapping follower/following counts
- Click any user to visit their profile

#### In-App Notifications
- `notifications` table with trigger on new follows
- `NotificationBell.jsx` with unread count badge (polls every 30s)
- Dropdown showing recent notifications
- Auto-marks as read when viewed

#### Rating Comparisons on Friend Profiles
- When viewing a friend's recent ratings, shows your rating of the same dish
- Shows community average with delta (how friend rated vs community)
- "You: 8/10 (+2)" style comparison

#### Bug Fixes
- Fixed floating point display errors (was showing "-0.6000000000000005")
- Added `Math.round((value) * 10) / 10` for clean decimal display
- Share button now only shows on your OWN profile, not others'
- Fixed `badge_key` → `key` mapping for badges on friend profiles

#### Database Migrations
- `add-follows-table.sql` - follows table, triggers, RPC functions
- `add-notifications.sql` - notifications table and follow trigger

#### Known Issues Being Fixed
- Badges showing on friend profiles (data is there, rendering issue)
- Historical follow counts need manual sync (trigger added after some follows existed)
- Historical badges need evaluation for existing users

---

## 2025-01-20 - Daniel

### Dark Mode Overhaul
- New color system: #121212 background, warm orange accent (#F4A261)
- Updated design tokens in index.css for dark theme
- Migrated all pages (Home, Browse, Restaurants, Profile) to dark mode
- Updated all components (BottomNav, BrowseCard, DishSearch, LocationPicker)
- Food photos now pop as visual hero against dark backgrounds

### Premium Category Tiles
- Created new `CategoryIconTile` component with custom line icons
- Horizontal scrollable row replaces emoji grid
- 14 hand-drawn SVG icons matching Dribbble inspiration:
  - Pizza, Burgers, Tacos, Wings, Sushi, Breakfast
  - Lobster Rolls, Seafood, Chowder, Pasta
  - Steak, Sandwiches, Salads, Tendys
- Single-select with warm orange highlight
- Toggle behavior: tap again to deselect
- Design philosophy: "emoji = cheap signal, designed icons = intentional signal"

### Design Philosophy
- "Sleek earns trust. Simplicity earns participation."
- Dark mode = premium feel, but UX stays casual and low-friction
- Voting remains the loudest action on screen

---

## 2025-01-19 - Daniel

### Profile Page Polish
- Limited "Your Rated Dishes" to top 5 with expand/collapse
- Prevents messy long lists for power users

### PostHog Analytics for Restaurant Pitch
- Added detailed `vote_cast` event with properties:
  - dish_id, dish_name, restaurant_id, restaurant_name
  - vote_type (worth_it/not_worth_it), rating_1_to_10
  - is_first_vote, resulting_avg_rating, resulting_total_votes
- Data ready for restaurant sales pitch dashboard

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
