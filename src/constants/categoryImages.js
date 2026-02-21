// Category to image URL mapping - v4.0 SUPABASE STORAGE
// All images hosted on Supabase storage for reliable loading on all devices/networks
const SUPABASE_STORAGE = 'https://fzgbxwonitnqmeguqixn.supabase.co/storage/v1/object/public/dish-photos'

export const CATEGORY_IMAGES = {
  'burger': `${SUPABASE_STORAGE}/burger.jpg`,
  'sandwich': `${SUPABASE_STORAGE}/sandwich.jpg`,
  'breakfast sandwich': `${SUPABASE_STORAGE}/breakfast-sandwich.jpg`,
  'pizza': `${SUPABASE_STORAGE}/pizza.jpg`,
  'pasta': `${SUPABASE_STORAGE}/pasta.jpg`,
  'sushi': `${SUPABASE_STORAGE}/sushi.jpg`,
  'pokebowl': `${SUPABASE_STORAGE}/pokebowl.jpg`,
  'taco': `${SUPABASE_STORAGE}/taco.jpg`,
  'wings': `${SUPABASE_STORAGE}/wings.jpg`,
  'tendys': `${SUPABASE_STORAGE}/tendys.jpg`,
  'lobster roll': `${SUPABASE_STORAGE}/lobster-roll.jpg`,
  'seafood': `${SUPABASE_STORAGE}/seafood.jpg`,
  'chowder': `${SUPABASE_STORAGE}/chowder.jpg`,
  'soup': `${SUPABASE_STORAGE}/soup.jpg`,
  'breakfast': `${SUPABASE_STORAGE}/breakfast.jpg`,
  'salad': `${SUPABASE_STORAGE}/salad.jpg`,
  'fries': `${SUPABASE_STORAGE}/fries.jpg`,
  'apps': `${SUPABASE_STORAGE}/apps.jpg`,
  'fried chicken': `${SUPABASE_STORAGE}/fried-chicken.jpg`,
  'entree': `${SUPABASE_STORAGE}/entree.jpg`,
  'steak': `${SUPABASE_STORAGE}/steak.jpg`,
  'chicken': `${SUPABASE_STORAGE}/chicken.jpg`,
  'donuts': `${SUPABASE_STORAGE}/donuts.jpg`,
  'asian': `${SUPABASE_STORAGE}/asian.jpg`,
  'quesadilla': `${SUPABASE_STORAGE}/quesadilla.jpg`,
  'dessert': `${SUPABASE_STORAGE}/dessert.jpg`,
  'fish': `${SUPABASE_STORAGE}/fish.jpg`,
  'clams': `${SUPABASE_STORAGE}/clams.jpg`,
  'pork': `${SUPABASE_STORAGE}/pork.jpg`,
  'oysters': `${SUPABASE_STORAGE}/oysters.jpg`,
  'coffee': `${SUPABASE_STORAGE}/coffee.jpg`,
  'cocktails': `${SUPABASE_STORAGE}/cocktails.jpg`,
  'ice cream': `${SUPABASE_STORAGE}/ice-cream.jpg`,
  'lamb': `${SUPABASE_STORAGE}/lamb.jpg`,
  'ribs': `${SUPABASE_STORAGE}/ribs.jpg`,
  'duck': `${SUPABASE_STORAGE}/duck.jpg`,
  'sides': `${SUPABASE_STORAGE}/sides.jpg`,
}

// Fallback image - pizza from Supabase storage
export const DEFAULT_DISH_IMAGE = `${SUPABASE_STORAGE}/pizza.jpg`

// Get image URL for a category (silently falls back to default)
export function getCategoryImage(category) {
  if (!category) {
    return DEFAULT_DISH_IMAGE
  }

  const lowerCategory = category.toLowerCase().trim()
  return CATEGORY_IMAGES[lowerCategory] || DEFAULT_DISH_IMAGE
}
