# Homepage Photo Redesign

## Goal

Add dish photos to the top 3 ranked dishes on the homepage. Photos use a gradient-fade blend into the card background — no hard borders, editorial feel. Falls back to category illustrations when no photo exists. Zero additional page load jank.

## Layout (top to bottom)

1. **Brand header** — unchanged
2. **Category chips** — unchanged
3. **Category headline** — unchanged (appears when filtering: "Best Wings in Oak Bluffs")
4. **#1 Hero card**
   - Gold metallic banner: "#1 on the Vineyard" / "#1 in [Town]"
   - Left: dish name (large), restaurant (uppercase), 3-stat grid (rating | % reorder | votes)
   - Right: dish photo with gradient fade — right-aligned, left edge dissolves into card background
   - Fallback: category illustration icon at 96px
5. **#2-3 Podium cards**
   - Silver/bronze metallic banners (existing)
   - Same gradient-fade photo style as #1, smaller
   - 3-stat grid stays
   - Fallback: category illustration icon at 60-72px
6. **#4-10 Clean rows**
   - Unchanged: rank, name, restaurant, rating + votes
   - Category food icons (no photos)

## Gradient fade technique

Photo sits absolutely positioned on the right side of the card. A CSS mask fades the left edge to transparent so the card background shows through. Text content sits on the left with no overlay concerns.

```css
.dish-photo-fade {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 55%;
  object-fit: cover;
  object-position: center;
  mask-image: linear-gradient(to right, transparent 0%, black 40%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 40%);
}
```

Card container needs `position: relative; overflow: hidden;` and text content needs `position: relative; z-index: 1;` to sit above the photo.

## Photo data: denormalized for zero extra queries

**Approach:** Add `featured_photo_url` to the `get_ranked_dishes` RPC return. The RPC already joins multiple tables — adding a LEFT JOIN to `dish_photos` (WHERE status = 'featured' or highest quality_score) costs near-zero at query time and eliminates 3 separate API calls on every homepage load.

**Migration:**
- Update `get_ranked_dishes` RPC to LEFT JOIN `dish_photos` and return `featured_photo_url`
- Pick the photo with: `status = 'featured'` first, else highest `quality_score` where status = 'community'
- Returns NULL when no photo exists (fallback to illustration)

**Why not separate fetches:** The homepage is the most-hit page. 3 extra round-trips on every load (one per dish) adds latency and waterfall risk, especially on slow island cell service. One query that returns everything is always smoother.

## Image loading: no jank

**Fixed-size container:** The photo area has a fixed width/height regardless of whether the image has loaded. The card never reflows.

**Shimmer placeholder:** Before the photo loads, show a subtle warm-toned shimmer animation in the photo area. Same background as the card with a gentle pulse — feels intentional, not broken.

**Fade-in on load:** When the image finishes loading, fade it in over 200ms. The shimmer disappears, the photo appears. Smooth.

**Implementation:**
```jsx
const [loaded, setLoaded] = useState(false)

<div className="photo-container"> {/* fixed size, shimmer bg */}
  {photoUrl && (
    <img
      src={photoUrl}
      onLoad={() => setLoaded(true)}
      style={{ opacity: loaded ? 1 : 0, transition: 'opacity 200ms ease' }}
      className="dish-photo-fade"
    />
  )}
</div>
```

If no photo URL exists, the container shows the CategoryIcon instead — no shimmer, no loading state, instant render.

## Fallback logic

```
if (dish.featured_photo_url)
  → show photo with gradient fade + shimmer-then-fadein
else
  → show CategoryIcon at current size (96px #1, 60-72px #2-3)
```

The page works identically to today when no photos exist. Photos are a progressive enhancement.

## What doesn't change

- Search results behavior
- Category filtering
- Town picker
- Stagger animations
- Show more/less on category lists
- Colors/theme
- #4-10 row layout and food icons
- Existing photo upload infrastructure

## Files to touch

- `supabase/schema.sql` — update `get_ranked_dishes` RPC to return `featured_photo_url`
- `src/api/dishesApi.js` — add `featured_photo_url` to selectFields/transform
- `src/pages/Home.jsx` — NumberOneHero gets photo support
- `src/components/home/Top10Compact.jsx` — podium cards (#2-3) get photo support
- `src/index.css` — shimmer animation, photo-fade utility classes

## Success criteria

- #1 hero card shows a gradient-fade photo when one exists
- #2-3 podium cards show gradient-fade photos when they exist
- No photo = category illustration (current behavior, no regression)
- No layout shift when photos load (fixed containers + fade-in)
- No additional API calls beyond the existing `get_ranked_dishes`
- `npm run build` passes
- Works on Safari 15+
