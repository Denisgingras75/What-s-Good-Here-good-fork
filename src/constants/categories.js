// Centralized category definitions for the app
// Used for Browse shortcuts, category picker, fuzzy matching, and profile stats

// Browse shortcuts - curated high-frequency categories for Browse page
// Note: Categories are shortcuts, NOT containers. All dishes are searchable regardless of category.
export const BROWSE_CATEGORIES = [
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'burger', label: 'Burgers', emoji: '🍔' },
  { id: 'taco', label: 'Tacos', emoji: '🌮' },
  { id: 'wings', label: 'Wings', emoji: '🍗' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣' },
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { id: 'lobster roll', label: 'Lobster Rolls', emoji: '🦞' },
  { id: 'chowder', label: 'Chowder', emoji: '🍲' },
  { id: 'pasta', label: 'Pasta', emoji: '🍝' },
  { id: 'steak', label: 'Steak', emoji: '🥩' },
  { id: 'sandwich', label: 'Sandwiches', emoji: '🥪' },
  { id: 'salad', label: 'Salads', emoji: '🥗' },
]

// Main categories shown in category picker (singular labels)
export const MAIN_CATEGORIES = [
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'burger', label: 'Burger', emoji: '🍔' },
  { id: 'taco', label: 'Taco', emoji: '🌮' },
  { id: 'wings', label: 'Wings', emoji: '🍗' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣' },
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { id: 'lobster roll', label: 'Lobster Roll', emoji: '🦞' },
  { id: 'chowder', label: 'Chowder', emoji: '🥣' },
  { id: 'pasta', label: 'Pasta', emoji: '🍝' },
  { id: 'steak', label: 'Steak', emoji: '🥩' },
  { id: 'sandwich', label: 'Sandwich', emoji: '🥪' },
  { id: 'salad', label: 'Salad', emoji: '🥗' },
]

// All categories in the system (including sub-categories)
// Used for fuzzy matching when user types custom input
export const ALL_CATEGORIES = [
  ...MAIN_CATEGORIES,
  { id: 'seafood', label: 'Seafood', emoji: '🦐' },
  { id: 'pokebowl', label: 'Poke Bowl', emoji: '🥗' },
  { id: 'tendys', label: 'Chicken Tenders', emoji: '🍗' },
  { id: 'soup', label: 'Soup', emoji: '🍜' },
  { id: 'fries', label: 'Fries', emoji: '🍟' },
  { id: 'apps', label: 'Appetizers', emoji: '🍤' },
  { id: 'fried chicken', label: 'Fried Chicken', emoji: '🍗' },
  { id: 'entree', label: 'Entree', emoji: '🍽️' },
  { id: 'chicken', label: 'Chicken', emoji: '🐔' },
  { id: 'donuts', label: 'Donuts', emoji: '🍩' },
  { id: 'asian', label: 'Asian', emoji: '🥢' },
  { id: 'quesadilla', label: 'Quesadilla', emoji: '🫓' },
  { id: 'breakfast sandwich', label: 'Breakfast Sandwich', emoji: '🥯' },
]

// Fuzzy match a search term to existing categories
// Returns matching categories sorted by relevance
export function matchCategories(searchTerm) {
  if (!searchTerm || searchTerm.trim().length < 2) return []

  const term = searchTerm.toLowerCase().trim()

  return ALL_CATEGORIES
    .map(cat => {
      const id = cat.id.toLowerCase()
      const label = cat.label.toLowerCase()

      // Exact match scores highest
      if (id === term || label === term) {
        return { ...cat, score: 100 }
      }

      // Starts with term
      if (id.startsWith(term) || label.startsWith(term)) {
        return { ...cat, score: 80 }
      }

      // Contains term
      if (id.includes(term) || label.includes(term)) {
        return { ...cat, score: 60 }
      }

      // Check for partial word matches (e.g., "acai" -> no match, but "chicken" -> "fried chicken")
      const words = [...id.split(' '), ...label.split(' ')]
      if (words.some(word => word.startsWith(term))) {
        return { ...cat, score: 40 }
      }

      return { ...cat, score: 0 }
    })
    .filter(cat => cat.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5) // Return top 5 matches
}

// Get category by id
export function getCategoryById(id) {
  return ALL_CATEGORIES.find(cat => cat.id.toLowerCase() === id?.toLowerCase())
}

// Get emoji for a category id
export function getCategoryEmoji(id) {
  const category = getCategoryById(id)
  return category?.emoji || '🍽️'
}

// Category neon image mappings
const CATEGORY_NEON_IMAGES = {
  pizza: '/categories/pizza.png',
  burger: '/categories/burgers.png',
  taco: '/categories/tacos.png',
  wings: '/categories/wings.png',
  sushi: '/categories/sushi.png',
  breakfast: '/categories/breakfast.png',
  'lobster roll': '/categories/lobster-rolls.png',
  seafood: '/categories/seafood.webp',
  chowder: '/categories/chowder.png',
  pasta: '/categories/pasta.png',
  steak: '/categories/steak.png',
  sandwich: '/categories/sandwiches.png',
  salad: '/categories/salads.png',
  tendys: '/categories/tendys.webp',
}

// Get neon image path for a category id
export function getCategoryNeonImage(id) {
  if (!id) return null
  return CATEGORY_NEON_IMAGES[id.toLowerCase()] || null
}

// Preload category images for smooth Browse page loading
export function preloadCategoryImages() {
  Object.values(CATEGORY_NEON_IMAGES).forEach(src => {
    const img = new Image()
    img.src = src
  })
}

// Category display info - used for profile stats and tier display
// Maps category id to emoji and label
export const CATEGORY_INFO = {
  'pizza': { emoji: '🍕', label: 'Pizza' },
  'burger': { emoji: '🍔', label: 'Burgers' },
  'taco': { emoji: '🌮', label: 'Tacos' },
  'wings': { emoji: '🍗', label: 'Wings' },
  'sushi': { emoji: '🍣', label: 'Sushi' },
  'sandwich': { emoji: '🥪', label: 'Sandwiches' },
  'breakfast sandwich': { emoji: '🥯', label: 'Breakfast Sandwiches' },
  'pasta': { emoji: '🍝', label: 'Pasta' },
  'pokebowl': { emoji: '🥗', label: 'Poke' },
  'lobster roll': { emoji: '🦞', label: 'Lobster Rolls' },
  'seafood': { emoji: '🦐', label: 'Seafood' },
  'chowder': { emoji: '🍲', label: 'Chowder' },
  'soup': { emoji: '🍜', label: 'Soup' },
  'breakfast': { emoji: '🍳', label: 'Breakfast' },
  'salad': { emoji: '🥗', label: 'Salads' },
  'fries': { emoji: '🍟', label: 'Fries' },
  'tendys': { emoji: '🍗', label: 'Tendys' },
  'fried chicken': { emoji: '🍗', label: 'Fried Chicken' },
  'apps': { emoji: '🧆', label: 'Apps' },
  'entree': { emoji: '🥩', label: 'Entrees' },
  'steak': { emoji: '🥩', label: 'Steak' },
}

// Get category info with fuzzy matching
// Handles case differences and strips trailing IDs/characters
export function getCategoryInfo(category) {
  if (!category) return { emoji: '🍽️', label: 'Food' }

  // Normalize: lowercase, trim, remove trailing IDs (e.g., "_abc123")
  const normalized = category.toLowerCase().trim().replace(/_[a-z0-9]+$/i, '')

  // Direct match
  if (CATEGORY_INFO[normalized]) {
    return CATEGORY_INFO[normalized]
  }

  // Try matching just the first word for compound categories
  const firstWord = normalized.split(/[\s&,]+/)[0]
  if (CATEGORY_INFO[firstWord]) {
    return CATEGORY_INFO[firstWord]
  }

  // Fallback: capitalize the normalized category name
  const fallbackLabel = normalized
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return { emoji: '🍽️', label: fallbackLabel }
}

// Category tier thresholds for profile rank display
export const TIER_THRESHOLDS = [
  { min: 50, level: 5, title: 'Master', icon: '👑' },
  { min: 30, level: 4, title: 'Expert', icon: '⭐' },
  { min: 20, level: 3, title: 'Connoisseur', icon: '💎' },
  { min: 10, level: 2, title: 'Fan', icon: '🔥' },
  { min: 5, level: 1, title: 'Explorer', icon: '🌱' },
]

// Major categories eligible for profile rank display
// Sub-categories like fries, apps, tendys, breakfast sandwich are excluded
export const MAJOR_CATEGORIES = new Set([
  'pizza',
  'burger',
  'taco',
  'wings',
  'sushi',
  'sandwich',
  'pasta',
  'pokebowl',
  'lobster roll',
  'seafood',
  'chowder',
  'soup',
  'breakfast',
  'salad',
  'fried chicken',
  'entree',
])
