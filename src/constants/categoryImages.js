// Category to image URL mapping
// ONE consistent, high-quality photo per category
// ALL dishes in the same category show the EXACT SAME image
export const CATEGORY_IMAGES = {
  'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
  'sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80',
  'breakfast sandwich': 'https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=800&q=80',
  'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  'pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
  'sushi': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80',
  'pokebowl': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  'taco': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80',
  'wings': 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80',
  'tendys': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80',
  'lobster roll': 'https://images.unsplash.com/photo-1625595117865-037d82c7cac3?w=800&q=80',
  'lobster': 'https://images.unsplash.com/photo-1559737558-2f5a767d75e2?w=800&q=80',
  'fish': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
  'chowder': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
  'breakfast': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80',
  'salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  'fries': 'https://images.unsplash.com/photo-1630431341973-02e1d0c417ee?w=800&q=80',
  'apps': 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&q=80',
  'fried chicken': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80',
  'entree': 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&q=80',
}

// Fallback image if category not found
export const DEFAULT_DISH_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'

// Get image URL for a category
export function getCategoryImage(category) {
  return CATEGORY_IMAGES[category?.toLowerCase()] || DEFAULT_DISH_IMAGE
}
