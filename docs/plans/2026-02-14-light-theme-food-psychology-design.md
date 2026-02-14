# Design: Light Theme with Food Psychology Colors

## Context

The app's dark "Island Depths" theme uses blue/teal backgrounds that suppress appetite (blue is the rarest color in natural food). Food psychology research shows red, orange, and yellow are proven appetite stimulators. We're flipping to a light theme with orange-red + yellow accents on warm stone backgrounds — matching the visual language of successful food apps like DoorDash, Uber Eats, and the Moulinex app reference.

## Color Palette

### Backgrounds
| Token | Value | Description |
|---|---|---|
| `--color-bg` | `#F0ECE8` | Warm stone — main page background |
| `--color-surface` | `#F7F4F1` | Slightly lighter surface layer |
| `--color-surface-elevated` | `#FFFFFF` | White — elevated elements |

### Cards
| Token | Value | Description |
|---|---|---|
| `--color-card` | `#FFFFFF` | Pure white cards — pop against warm stone |
| `--color-card-hover` | `#FFF8F4` | Warm tint on hover |

### Text
| Token | Value | Description |
|---|---|---|
| `--color-text-primary` | `#1A1A1A` | Near-black headings |
| `--color-text-secondary` | `#6B7280` | Medium gray body text |
| `--color-text-tertiary` | `#9CA3AF` | Light gray hints |
| `--color-text-on-primary` | `#FFFFFF` | White text on colored buttons |

### Primary Accent (Appetite Red-Orange)
| Token | Value | Description |
|---|---|---|
| `--color-primary` | `#E8663C` | Orange-red — CTAs, buttons, active states |
| `--color-primary-muted` | `rgba(232, 102, 60, 0.10)` | Subtle tint backgrounds |
| `--color-primary-glow` | `rgba(232, 102, 60, 0.20)` | Glow effects |

### Yellow Accents (Warmth + Happiness)
| Token | Value | Description |
|---|---|---|
| `--color-accent-gold` | `#E9A115` | Warm yellow — micro-headlines, links |
| `--color-accent-yellow` | `#F5B731` | Bright yellow — badges, stars, highlights |
| `--color-accent-gold-muted` | `rgba(233, 161, 21, 0.12)` | Subtle yellow tint |

### Orange Accent
| Token | Value | Description |
|---|---|---|
| `--color-accent-orange` | `#E07856` | Hover states, warm accents |

### Medals (Darkened for Light BG Readability)
| Token | Value | Description |
|---|---|---|
| `--color-medal-gold` | `#B8860B` | Dark gold — readable on white |
| `--color-medal-silver` | `#6B7280` | Gray-silver |
| `--color-medal-bronze` | `#A0522D` | Sienna bronze |

### Rating
| Token | Value | Description |
|---|---|---|
| `--color-rating` | `#16A34A` | Brighter green for light backgrounds |

### Dividers
| Token | Value | Description |
|---|---|---|
| `--color-divider` | `rgba(0, 0, 0, 0.08)` | Subtle dark line |

### Feedback
| Token | Value | Description |
|---|---|---|
| `--color-danger` | `#DC2626` | Red error state |
| `--color-success` | `#16A34A` | Green success state |

### Glows
| Token | Value | Description |
|---|---|---|
| `--glow-primary` | `0 0 20px rgba(232, 102, 60, 0.15), 0 0 40px rgba(232, 102, 60, 0.05)` | Orange-red glow |
| `--glow-gold` | `0 0 15px rgba(233, 161, 21, 0.15)` | Yellow glow |

## Component-Level Changes

### Glass Header
- Background: `rgba(247, 244, 241, 0.95)` (frosted light, not dark)
- Backdrop blur stays

### Welcome Splash
- Gradient: light warm stone tones instead of dark navy
- `linear-gradient(145deg, #FFFFFF 0%, #F7F4F1 50%, #F0ECE8 100%)`

### Top Bar
- Background: `color-mix(in srgb, var(--color-primary) 6%, #FFFFFF)` — subtle orange tint on white

### Podium Rows (Top10Compact)
- Medal colors use darkened variants for readability on white
- Glow/textShadow effects need to use warm light glows instead of dark glows
- Border-left colors use medal colors directly

### Cards (card-elevated class)
- Background: white
- Border: `rgba(0, 0, 0, 0.06)`
- Shadow: lighter, softer shadows
- Hover: slight warm tint + lifted shadow

### Buttons
- Primary: `#E8663C` background, white text
- Active category pills: `#E8663C` background, white text
- Secondary: white background, dark text, subtle border

### Focus Ring
- `0 0 0 3px rgba(232, 102, 60, 0.25)` — orange-red ring

## Food Psychology Rationale

- **Red-orange** primary: triggers appetite, increases heart rate, encourages action
- **Yellow** accents: signals happiness and warmth — associated with a full stomach
- **White** cards: food photos pop maximally, clean modern feel
- **Warm stone** background: avoids clinical white-on-white, adds warmth like a restaurant table
- **No blue**: blue suppresses appetite — completely removed from the palette

## Scope

Full theme flip. All CSS variables in `index.css`, plus component-level fixes for any hardcoded dark-theme assumptions (rgba values, inline styles, glass-header, welcome-splash, podium glows).
