# Color Ring Palette Redesign — Session Context

> READ THIS FIRST if context was compacted. This captures the full state of the color experiment.

## Status

- **Branch:** `experiment/color-ring-palette-v2` (off `main`)
- **Revert:** `git checkout main` instantly goes back to original look
- **Project:** `/Users/danielwalsh/.local/bin/whats-good-here`
- **Build:** Passes as of last check

## What We're Doing

Redesigning the color palette inspired by a book called "The Concept of Colour Concepts." The user saw a concentric ring diagram: blue (outer) → red → yellow → white (center). They want the app to feel like that progression:

- **Blue (outer ring):** Background/surfaces = trust, MV/water, structural frame
- **Red (action ring):** CTAs, vote buttons, active tabs = appetite, engagement
- **Yellow (highlight ring):** Value badges, links, accents = highlights, notable
- **Green (unchanged):** Rating numbers = universal "good score" signal
- **White (center):** Text = clean readability

## Key Decisions Made

1. **Rating numbers STAY GREEN** — people recognize green = good score
2. **Blue is NOT added to anything that wasn't already blue** — the user was very clear. No replacing gold links/icons with blue. Blue only shifts the SHADE of already-blue backgrounds.
3. **Gold accents shift to yellow** — same elements, warmer/brighter shade
4. **Red shifts shade** — same elements, slightly brighter/truer red
5. **Backgrounds shift from teal (hue ~195) to cleaner blue (hue ~210)** — removes green tint so backgrounds match the new brighter accent colors

## V1 Attempt (FAILED — reverted)

On branch `experiment/color-ring-palette` (can be deleted). Replaced ALL gold rgba values across 30+ files with blue. User hated it — "you made it MORE blue!" and "everything yellow or red should have stayed but just a different shade." The mistake: bulk-replacing warm accents with cold blue.

## V2 Approach (CURRENT)

Only changed **2 files** + background surface shifts:
- `src/index.css` — CSS variable values only (no component changes needed since components use vars)
- `src/components/browse/ValueBadge.jsx` — green → yellow for "GREAT VALUE" badges

## Exact CSS Variable Changes (V2)

### Red (shifted shade)
| Variable | Old | New |
|----------|-----|-----|
| `--color-primary` | `#C85A54` | `#D94B4B` |
| `--color-primary-muted` | `rgba(200, 90, 84, 0.15)` | `rgba(217, 75, 75, 0.15)` |
| `--color-primary-glow` | `rgba(200, 90, 84, 0.3)` | `rgba(217, 75, 75, 0.3)` |
| `--color-danger` | `#C85A54` | `#D94B4B` |
| `--glow-primary` | rust rgba | `rgba(217, 75, 75, ...)` |
| `--focus-ring` | rust rgba | `rgba(217, 75, 75, 0.25)` |

### Yellow (gold shifted to yellow)
| Variable | Old | New |
|----------|-----|-----|
| `--color-accent-gold` | `#D9A765` | `#F2C94C` |
| `--color-accent-gold-muted` | `rgba(217, 167, 101, 0.15)` | `rgba(242, 201, 76, 0.15)` |
| `--color-link-secondary` | `#D9A765` | `#F2C94C` |
| `--glow-gold` | `rgba(217, 167, 101, 0.2)` | `rgba(242, 201, 76, 0.2)` |
| `--color-divider` | `rgba(217, 167, 101, 0.12)` | `rgba(242, 201, 76, 0.12)` |

### Blue backgrounds (teal → cleaner blue)
| Variable | Old | New |
|----------|-----|-----|
| `--color-bg` | `#0D1B22` | `#0E1621` |
| `--color-surface` | `#0F1F2B` | `#101C28` |
| `--color-surface-elevated` | `#162B35` | `#162636` |
| `--color-card` | `#1A3A42` | `#1A2F42` |
| `--color-card-hover` | `#243A43` | `#223646` |

### Unchanged
- `--color-rating: #6BB384` (green stays)
- `--color-success: #6BB384`
- `--color-text-primary: #F5F1E8`
- `--color-text-secondary: #B8A99A`
- `--color-text-tertiary: #7D7168`
- `--color-accent-orange: #E07856`
- All semantic status colors

## Original Palette (for full revert reference)
```css
--color-primary: #C85A54;
--color-accent-gold: #D9A765;
--color-bg: #0D1B22;
--color-surface: #0F1F2B;
--color-surface-elevated: #162B35;
--color-card: #1A3A42;
--color-card-hover: #243A43;
--color-divider: rgba(217, 167, 101, 0.12);
```

## What's Left

- User needs to visually evaluate the V2 changes
- May need tweaks to specific shades
- The `--color-accent-orange: #E07856` hover color wasn't changed — may need adjustment to match new yellow
- Hardcoded rgba values in ~30 component files still reference old rust `rgba(200, 90, 84, ...)` — these are low-opacity decorative effects and may need updating for full congruence, but user explicitly said NOT to bulk-change component files
- If user approves, merge to main or keep as experiment
