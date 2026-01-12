import { getCategoryImage, DEFAULT_DISH_IMAGE } from '../constants/categoryImages'

const CATEGORIES = [
  { id: null, label: 'All Dishes' },
  { id: 'burger', label: 'Burgers' },
  { id: 'sandwich', label: 'Sandwiches' },
  { id: 'breakfast sandwich', label: 'Breakfast Sandwiches' },
  { id: 'pizza', label: 'Pizza' },
  { id: 'pasta', label: 'Pasta' },
  { id: 'sushi', label: 'Sushi' },
  { id: 'pokebowl', label: 'Poke Bowls' },
  { id: 'taco', label: 'Tacos' },
  { id: 'wings', label: 'Wings' },
  { id: 'tendys', label: 'Tendys' },
  { id: 'lobster roll', label: 'Lobster Rolls' },
  { id: 'seafood', label: 'Seafood' },
  { id: 'chowder', label: 'Chowder' },
  { id: 'soup', label: 'Soups' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'salad', label: 'Salads' },
  { id: 'fries', label: 'Fries' },
  { id: 'apps', label: 'Apps' },
  { id: 'fried chicken', label: 'Fried Chicken' },
  { id: 'entree', label: 'Entrees' },
]

export function CategoryFilter({ selectedCategory, onSelectCategory }) {
  return (
    <div className="sticky top-0 z-20 glass-header border-b border-neutral-200/60">
      <div className="relative">
        {/* Fade edges for scroll indication */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/90 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/90 to-transparent pointer-events-none z-10" />

        {/* Scrollable category chips */}
        <div className="overflow-x-auto scrollbar-hide smooth-scroll">
          <div className="flex gap-2 px-4 py-4 min-w-max">
            {CATEGORIES.map((category, index) => (
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
                style={{
                  animationDelay: `${index * 0.03}s`,
                }}
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
          </div>
        </div>
      </div>

      {/* Active category indicator text (optional) */}
      {selectedCategory && (
        <div className="px-4 pb-3 pt-1">
          <p className="text-xs text-neutral-500 font-medium">
            Showing {CATEGORIES.find(c => c.id === selectedCategory)?.label.toLowerCase() || 'all dishes'}
          </p>
        </div>
      )}
    </div>
  )
}
