// Category to image URL mapping
// Uses consistent, cartoon-style illustrations for each food category
// All dishes in the same category will show the SAME image
export const CATEGORY_IMAGES = {
  'burger': 'https://em-content.zobj.net/source/apple/391/hamburger_1f354.png',
  'sandwich': 'https://em-content.zobj.net/source/apple/391/sandwich_1f96a.png',
  'breakfast sandwich': 'https://em-content.zobj.net/source/apple/391/bacon_1f953.png',
  'pizza': 'https://em-content.zobj.net/source/apple/391/pizza_1f355.png',
  'pasta': 'https://em-content.zobj.net/source/apple/391/spaghetti_1f35d.png',
  'sushi': 'https://em-content.zobj.net/source/apple/391/sushi_1f363.png',
  'pokebowl': 'https://em-content.zobj.net/source/apple/391/pot-of-food_1f372.png',
  'taco': 'https://em-content.zobj.net/source/apple/391/taco_1f32e.png',
  'wings': 'https://em-content.zobj.net/source/apple/391/poultry-leg_1f357.png',
  'tendys': 'https://em-content.zobj.net/source/apple/391/fried-shrimp_1f364.png',
  'lobster roll': 'https://em-content.zobj.net/source/apple/391/hot-dog_1f32d.png',
  'lobster': 'https://em-content.zobj.net/source/apple/391/lobster_1f99e.png',
  'fish': 'https://em-content.zobj.net/source/apple/391/fish_1f41f.png',
  'chowder': 'https://em-content.zobj.net/source/apple/391/bowl-with-spoon_1f963.png',
  'breakfast': 'https://em-content.zobj.net/source/apple/391/pancakes_1f95e.png',
  'salad': 'https://em-content.zobj.net/source/apple/391/green-salad_1f957.png',
  'fries': 'https://em-content.zobj.net/source/apple/391/french-fries_1f35f.png',
  'apps': 'https://em-content.zobj.net/source/apple/391/shallow-pan-of-food_1f958.png',
  'fried chicken': 'https://em-content.zobj.net/source/apple/391/poultry-leg_1f357.png',
  'entree': 'https://em-content.zobj.net/source/apple/391/cut-of-meat_1f969.png',
}

// Fallback image if category not found
export const DEFAULT_DISH_IMAGE = 'https://em-content.zobj.net/source/apple/391/pot-of-food_1f372.png'

// Get image URL for a category
export function getCategoryImage(category) {
  return CATEGORY_IMAGES[category?.toLowerCase()] || DEFAULT_DISH_IMAGE
}
