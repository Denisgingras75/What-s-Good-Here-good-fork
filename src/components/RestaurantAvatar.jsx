import { memo } from 'react'

/**
 * Town colors - each reflects the town's unique vibe
 * Colors complement the dark Island Depths theme
 */
const TOWN_COLORS = {
  'Oak Bluffs': { bg: '#3D5A80', text: '#F5E6D3' },      // Blue collar denim blue
  'Edgartown': { bg: '#8B2942', text: '#F5E6D3' },       // Fancy lobster red
  'Vineyard Haven': { bg: '#8E7F6D', text: '#F5E6D3' },  // Quiet, warm sand/driftwood
  'West Tisbury': { bg: '#4A5D4A', text: '#F5E6D3' },    // Rural forest green
  'Chilmark': { bg: '#6B5344', text: '#F5E6D3' },        // Rustic pastoral brown
  // Aquinnah uses gradient - handled separately
}

// Gay Head Cliffs gradient for Aquinnah (deep reds, oranges, mustard, white, brown, purple)
const AQUINNAH_GRADIENT = 'linear-gradient(135deg, #8B1E3F 0%, #D4573B 20%, #E8923B 40%, #D4A849 55%, #F5F0E6 70%, #6B4423 85%, #4A2040 100%)'

// Default color for unknown towns
const DEFAULT_COLOR = { bg: '#5C6B73', text: '#F5E6D3' } // Slate

/**
 * Generate initials from restaurant name
 * "Cozy Corner" → "CC"
 * "The Black Dog" → "BD" (skip "The")
 * "Nancy's" → "N"
 */
function getInitials(name) {
  if (!name) return '?'

  // Words to skip
  const skipWords = new Set(['the', 'a', 'an', '&', 'and', 'of'])

  const words = name
    .split(/[\s-]+/)
    .filter(word => !skipWords.has(word.toLowerCase()))

  if (words.length === 0) return name.charAt(0).toUpperCase()
  if (words.length === 1) return words[0].charAt(0).toUpperCase()

  // Take first letter of first two meaningful words
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
}

/**
 * Get color/style based on restaurant's town
 */
function getTownStyle(town) {
  if (!town) return { bg: DEFAULT_COLOR.bg, text: DEFAULT_COLOR.text, isGradient: false }

  // Special handling for Aquinnah - use cliff gradient
  if (town === 'Aquinnah') {
    return { bg: AQUINNAH_GRADIENT, text: '#2C2416', isGradient: true }
  }

  const colors = TOWN_COLORS[town] || DEFAULT_COLOR
  return { bg: colors.bg, text: colors.text, isGradient: false }
}

/**
 * RestaurantAvatar - Auto-generated initial avatar for restaurants
 * Color is based on the restaurant's town vibe
 */
export const RestaurantAvatar = memo(function RestaurantAvatar({
  name,
  town,
  size = 48,
  className = ''
}) {
  const initials = getInitials(name)
  const townStyle = getTownStyle(town)

  const fontSize = size < 40 ? size * 0.4 : size * 0.35

  return (
    <div
      className={`rounded-lg flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: townStyle.bg,
        color: townStyle.text,
        fontSize: `${fontSize}px`,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        // Add subtle text shadow for gradient backgrounds to ensure readability
        textShadow: townStyle.isGradient ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
      }}
      aria-label={`${name} logo`}
      title={town || 'Restaurant'}
    >
      {initials}
    </div>
  )
})
