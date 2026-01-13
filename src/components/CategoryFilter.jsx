import { useState } from 'react'
import { getCategoryImage, DEFAULT_DISH_IMAGE } from '../constants/categoryImages'

// Top 5 most searched food items
const PRIMARY_CATEGORIES = [
  { id: null, label: 'All Dishes' },
  { id: 'pizza', label: 'Pizza' },
  { id: 'burger', label: 'Burgers' },
  { id: 'taco', label: 'Tacos' },
  { id: 'wings', label: 'Wings' },
  { id: 'sushi', label: 'Sushi' },
]

// Rest of categories (alphabetical)
const MORE_CATEGORIES = [
  { id: 'apps', label: 'Apps' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'breakfast sandwich', label: 'Breakfast Sandwiches' },
  { id: 'chowder', label: 'Chowder' },
  { id: 'entree', label: 'Entrees' },
  { id: 'fried chicken', label: 'Fried Chicken' },
  { id: 'fries', label: 'Fries' },
  { id: 'lobster roll', label: 'Lobster Rolls' },
  { id: 'pasta', label: 'Pasta' },
  { id: 'pokebowl', label: 'Poke Bowls' },
  { id: 'salad', label: 'Salads' },
  { id: 'sandwich', label: 'Sandwiches' },
  { id: 'seafood', label: 'Seafood' },
  { id: 'soup', label: 'Soups' },
  { id: 'tendys', label: 'Tendys' },
]

const ALL_CATEGORIES = [...PRIMARY_CATEGORIES, ...MORE_CATEGORIES]

export function CategoryFilter({ selectedCategory, onSelectCategory }) {
  const [showMore, setShowMore] = useState(false)

  const visibleCategories = showMore ? ALL_CATEGORIES : PRIMARY_CATEGORIES

  // If a "more" category is selected, always show expanded
  const isMoreCategorySelected = MORE_CATEGORIES.some(c => c.id === selectedCategory)

  const categoriesToShow = isMoreCategorySelected ? ALL_CATEGORIES : visibleCategories

  return (
    <div className="sticky top-0 z-20 glass-header border-b border-neutral-200/60">
      <div className="relative">
        {/* Fade edges for scroll indication */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/90 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/90 to-transparent pointer-events-none z-10" />

        {/* Scrollable category chips */}
        <div className="overflow-x-auto scrollbar-hide smooth-scroll">
          <div className="flex gap-2 px-4 py-4 min-w-max">
            {categoriesToShow.map((category, index) => (
              <button
                key={category.id || 'all'}
                onClick={() => onSelectCategory(category.id)}
                className={`
                  flex items-center gap-2
                  px-4 py-2 rounded-full
                  font-semibold text-sm whitespace-nowrap
                  transition-all duration-200 ease-out
                  focus-ring
                  ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                      : 'bg-white text-neutral-700 border border-neutral-200 hover:border-orange-300 hover:bg-orange-50 shadow-sm'
                  }
                `}
              >
                <img
                  src={category.id ? getCategoryImage(category.id) : DEFAULT_DISH_IMAGE}
                  alt={category.label}
                  className="w-6 h-6 rounded-full object-cover"
                  loading="lazy"
                />
                {category.label}
              </button>
            ))}

            {/* More/Less toggle button */}
            {!isMoreCategorySelected && (
              <button
                onClick={() => setShowMore(!showMore)}
                className="
                  flex items-center gap-1
                  px-4 py-2 rounded-full
                  font-semibold text-sm whitespace-nowrap
                  transition-all duration-200 ease-out
                  bg-neutral-100 text-neutral-600 border border-neutral-200
                  hover:bg-neutral-200 hover:border-neutral-300
                "
              >
                {showMore ? (
                  <>
                    Less
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                    </svg>
                  </>
                ) : (
                  <>
                    More
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active category indicator text */}
      {selectedCategory && (
        <div className="px-4 pb-3 pt-1">
          <p className="text-xs text-neutral-500 font-medium">
            Showing {ALL_CATEGORIES.find(c => c.id === selectedCategory)?.label.toLowerCase() || 'all dishes'}
          </p>
        </div>
      )}
    </div>
  )
}
