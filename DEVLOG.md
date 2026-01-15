# Dev Log

A shared log of what each contributor worked on. Add your entries at the top.

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
