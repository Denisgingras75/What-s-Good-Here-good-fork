// Centralized category definitions for the app
// Used for Browse shortcuts, category picker, and fuzzy matching

// Main categories shown in Browse and category picker
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
