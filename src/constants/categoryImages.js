// Category to image URL mapping - v3.0 CACHE BUST
// ONE consistent, high-quality photo per category
// ALL dishes in the same category show the EXACT SAME image
const CACHE_BUST = 'v20260111'
export const CATEGORY_IMAGES = {
  'burger': `https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&${CACHE_BUST}`,
  'sandwich': `https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80&${CACHE_BUST}`,
  'breakfast sandwich': `https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=800&q=80&${CACHE_BUST}`,
  'pizza': `https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&${CACHE_BUST}`,
  'pasta': `https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80&${CACHE_BUST}`,
  'sushi': `https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80&${CACHE_BUST}`,
  'pokebowl': `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&${CACHE_BUST}`,
  'taco': `https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80&${CACHE_BUST}`,
  'wings': `https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80&${CACHE_BUST}`,
  'tendys': `https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80&${CACHE_BUST}`,
  'lobster roll': `https://images.unsplash.com/photo-1603103750903-518e8bf57bf0?w=800&q=80&${CACHE_BUST}`,
  'seafood': `https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80&${CACHE_BUST}`,
  'chowder': `https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80&${CACHE_BUST}`,
  'soup': `https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=800&q=80&${CACHE_BUST}`,
  'breakfast': `https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80&${CACHE_BUST}`,
  'salad': `https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&${CACHE_BUST}`,
  'fries': `https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=800&q=80&${CACHE_BUST}`,
  'apps': `https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&q=80&${CACHE_BUST}`,
  'fried chicken': `https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80&${CACHE_BUST}`,
  'entree': `https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&q=80&${CACHE_BUST}`,
}

// Fallback image - PIZZA for testing
export const DEFAULT_DISH_IMAGE = `https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&${CACHE_BUST}`

// Get image URL for a category
export function getCategoryImage(category) {
  if (!category) {
    console.warn('getCategoryImage: category is null/undefined, using default')
    return DEFAULT_DISH_IMAGE
  }

  const lowerCategory = category.toLowerCase().trim()
  const imageUrl = CATEGORY_IMAGES[lowerCategory]

  if (!imageUrl) {
    console.warn(`getCategoryImage: No image found for category="${category}", using default`)
    return DEFAULT_DISH_IMAGE
  }

  console.log(`getCategoryImage: category="${category}" -> ${imageUrl}`)
  return imageUrl
}
