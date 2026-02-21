// Centralized category definitions for the app
// Used for Browse shortcuts, category picker, fuzzy matching, and profile stats

// Browse shortcuts - curated high-frequency categories for Browse page
// Note: Categories are shortcuts, NOT containers. All dishes are searchable regardless of category.
export const BROWSE_CATEGORIES = [
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'burger', label: 'Burgers', emoji: '🍔' },
  { id: 'seafood', label: 'Seafood', emoji: '🦐' },
  { id: 'wings', label: 'Wings', emoji: '🍗' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣' },
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { id: 'lobster roll', label: 'Lobster Rolls', emoji: '🦞' },
  { id: 'chowder', label: 'Chowder', emoji: '🍲' },
  { id: 'pasta', label: 'Pasta', emoji: '🍝' },
  { id: 'steak', label: 'Steak', emoji: '🥩' },
  { id: 'sandwich', label: 'Sandwiches', emoji: '🥪' },
  { id: 'salad', label: 'Salads', emoji: '🥗' },
  { id: 'taco', label: 'Tacos', emoji: '🌮' },
  { id: 'tendys', label: 'Tenders', emoji: '🍗' },
  { id: 'dessert', label: 'Desserts', emoji: '🍰' },
  { id: 'fish', label: 'Fish', emoji: '🐟' },
  { id: 'clams', label: 'Clams', emoji: '🐚' },
  { id: 'chicken', label: 'Chicken', emoji: '🐔' },
  { id: 'pork', label: 'Pork', emoji: '🐷' },
  { id: 'oysters', label: 'Oysters', emoji: '🦪' },
  { id: 'coffee', label: 'Coffee', emoji: '☕' },
  { id: 'cocktails', label: 'Cocktails', emoji: '🍸' },
  { id: 'ice cream', label: 'Ice Cream', emoji: '🍦' },
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
  { id: 'seafood', label: 'Seafood', emoji: '🦐' },
  { id: 'tendys', label: 'Tenders', emoji: '🍗' },
  { id: 'dessert', label: 'Dessert', emoji: '🍰' },
  { id: 'fish', label: 'Fish', emoji: '🐟' },
  { id: 'clams', label: 'Clams', emoji: '🐚' },
  { id: 'chicken', label: 'Chicken', emoji: '🐔' },
  { id: 'pork', label: 'Pork', emoji: '🐷' },
  { id: 'oysters', label: 'Oysters', emoji: '🦪' },
  { id: 'coffee', label: 'Coffee', emoji: '☕' },
  { id: 'cocktails', label: 'Cocktails', emoji: '🍸' },
  { id: 'ice cream', label: 'Ice Cream', emoji: '🍦' },
]

// All categories in the system (including sub-categories)
// Used for fuzzy matching when user types custom input
export const ALL_CATEGORIES = [
  ...MAIN_CATEGORIES,
  { id: 'pokebowl', label: 'Poke Bowl', emoji: '🥗' },
  { id: 'soup', label: 'Soup', emoji: '🍜' },
  { id: 'fries', label: 'Fries', emoji: '🍟' },
  { id: 'apps', label: 'Appetizers', emoji: '🍤' },
  { id: 'fried chicken', label: 'Fried Chicken', emoji: '🍗' },
  { id: 'entree', label: 'Entree', emoji: '🍽️' },
  { id: 'donuts', label: 'Donuts', emoji: '🍩' },
  { id: 'asian', label: 'Asian', emoji: '🥢' },
  { id: 'quesadilla', label: 'Quesadilla', emoji: '🫓' },
  { id: 'breakfast sandwich', label: 'Breakfast Sandwich', emoji: '🥯' },
  { id: 'ribs', label: 'Ribs', emoji: '🍖' },
  { id: 'sides', label: 'Sides', emoji: '🥦' },
  { id: 'duck', label: 'Duck', emoji: '🦆' },
  { id: 'lamb', label: 'Lamb', emoji: '🍖' },
  { id: 'clams', label: 'Clams', emoji: '🐚' },
  { id: 'oysters', label: 'Oysters', emoji: '🦪' },
  { id: 'coffee', label: 'Coffee', emoji: '☕' },
  { id: 'cocktails', label: 'Cocktails', emoji: '🍸' },
  { id: 'ice cream', label: 'Ice Cream', emoji: '🍦' },
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

// Category image mappings — dark mode (Island Depths)
const CATEGORY_IMAGES_DARK = {
  pizza: '/categories/pizza.png',
  burger: '/categories/burgers.png',
  taco: '/categories/tacos.png',
  wings: '/categories/wings.png',
  sushi: '/categories/sushi.png',
  breakfast: '/categories/breakfast.png',
  'lobster roll': '/categories/lobster-rolls.png',
  seafood: '/categories/seafood.png',
  chowder: '/categories/chowder.png',
  pasta: '/categories/pasta.png',
  steak: '/categories/steak.png',
  sandwich: '/categories/sandwiches.png',
  salad: '/categories/salads.png',
  tendys: '/categories/tendys.png',
  dessert: '/categories/desserts.png',
  fish: '/categories/fish.png',
  clams: '/categories/clams.png',
  chicken: '/categories/chicken.png',
  pork: '/categories/pork.png',
}

// Category image mappings — light mode (Appetite)
// As light icons are generated, add them here. Falls back to dark if missing.
const CATEGORY_IMAGES_LIGHT = {
  pizza: '/categories/pizza-light.png',
  burger: '/categories/burgers-light.png',
  seafood: '/categories/seafood-light.png',
  wings: '/categories/wings-light.png',
  sushi: '/categories/sushi-light.png',
  breakfast: '/categories/breakfast-light.png',
  'lobster roll': '/categories/lobster-rolls-light.png',
  chowder: '/categories/chowder-light.png',
  pasta: '/categories/pasta-light.png',
  steak: '/categories/steak-light.png',
  sandwich: '/categories/sandwiches-light.png',
  salad: '/categories/salads-light.png',
  taco: '/categories/tacos-light.png',
  tendys: '/categories/tendys-light.png',
  dessert: '/categories/desserts-light.png',
  fish: '/categories/fish-light.png',
  clams: '/categories/clams-light.png',
  chicken: '/categories/chicken-light.png',
  pork: '/categories/pork-light.png',
}

// Get category image path for current theme
// Checks document theme attribute, falls back to dark images
export function getCategoryNeonImage(id) {
  if (!id) return null
  const key = id.toLowerCase()
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  if (isDark && CATEGORY_IMAGES_DARK[key]) {
    return CATEGORY_IMAGES_DARK[key]
  }
  return CATEGORY_IMAGES_LIGHT[key] || CATEGORY_IMAGES_DARK[key] || null
}

// Preload category images for smooth Browse page loading
export function preloadCategoryImages() {
  const images = { ...CATEGORY_IMAGES_DARK, ...CATEGORY_IMAGES_LIGHT }
  Object.values(images).forEach(src => {
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
  'tendys': { emoji: '🍗', label: 'Tenders' },
  'fried chicken': { emoji: '🍗', label: 'Fried Chicken' },
  'apps': { emoji: '🧆', label: 'Apps' },
  'entree': { emoji: '🥩', label: 'Entrees' },
  'steak': { emoji: '🥩', label: 'Steak' },
  'dessert': { emoji: '🍰', label: 'Desserts' },
  'ribs': { emoji: '🍖', label: 'Ribs' },
  'sides': { emoji: '🥦', label: 'Sides' },
  'duck': { emoji: '🦆', label: 'Duck' },
  'lamb': { emoji: '🍖', label: 'Lamb' },
  'pork': { emoji: '🐷', label: 'Pork' },
  'fish': { emoji: '🐟', label: 'Fish' },
  'chicken': { emoji: '🐔', label: 'Chicken' },
  'clams': { emoji: '🐚', label: 'Clams' },
  'oysters': { emoji: '🦪', label: 'Oysters' },
  'coffee': { emoji: '☕', label: 'Coffee' },
  'cocktails': { emoji: '🍸', label: 'Cocktails' },
  'ice cream': { emoji: '🍦', label: 'Ice Cream' },
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

