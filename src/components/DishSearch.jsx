import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategoryImage } from '../constants/categoryImages'

const MIN_VOTES_FOR_RANKING = 5
const MIN_SEARCH_LENGTH = 2
const MAX_DISH_RESULTS = 5
const MAX_CATEGORY_RESULTS = 2

// All known categories for matching
const ALL_CATEGORIES = [
  { id: 'pizza', label: 'Pizza' },
  { id: 'burger', label: 'Burgers' },
  { id: 'taco', label: 'Tacos' },
  { id: 'wings', label: 'Wings' },
  { id: 'sushi', label: 'Sushi' },
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
  { id: 'quesadilla', label: 'Quesadillas' },
  { id: 'steak', label: 'Steak' },
]

export function DishSearch({ dishes = [], loading = false }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current.contains(e.target)
      ) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search and rank results
  const results = useMemo(() => {
    if (query.length < MIN_SEARCH_LENGTH || !dishes.length) {
      return { dishes: [], categories: [] }
    }

    const searchTerm = query.toLowerCase().trim()

    // 1. Find matching dishes
    const matchingDishes = dishes.filter(dish => {
      const dishName = (dish.dish_name || '').toLowerCase()
      const category = (dish.category || '').toLowerCase()
      return dishName.includes(searchTerm) || category.includes(searchTerm)
    })

    // 2. Rank dishes: ranked first (5+ votes), then by avg_rating
    const rankedDishes = [...matchingDishes].sort((a, b) => {
      const aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
      const bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING

      // Ranked dishes come first
      if (aRanked && !bRanked) return -1
      if (!aRanked && bRanked) return 1

      // Then sort by avg_rating
      const aRating = a.avg_rating || 0
      const bRating = b.avg_rating || 0
      if (bRating !== aRating) return bRating - aRating

      // Then by vote count
      return (b.total_votes || 0) - (a.total_votes || 0)
    }).slice(0, MAX_DISH_RESULTS)

    // 3. Find matching categories
    const matchingCategories = ALL_CATEGORIES.filter(cat => {
      const catId = cat.id.toLowerCase()
      const catLabel = cat.label.toLowerCase()
      return catId.includes(searchTerm) || catLabel.includes(searchTerm)
    }).slice(0, MAX_CATEGORY_RESULTS)

    return {
      dishes: rankedDishes,
      categories: matchingCategories,
    }
  }, [query, dishes])

  const hasResults = results.dishes.length > 0 || results.categories.length > 0
  const showDropdown = isFocused && query.length >= MIN_SEARCH_LENGTH

  // Handle dish selection
  const handleDishSelect = (dish) => {
    setQuery('')
    setIsFocused(false)
    // Navigate to dedicated dish page
    navigate(`/dish/${dish.dish_id}`)
  }

  // Handle category selection
  const handleCategorySelect = (category) => {
    setQuery('')
    setIsFocused(false)
    navigate(`/browse?category=${encodeURIComponent(category.id)}`)
  }

  // Handle Enter key - go to full search results page
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim().length >= MIN_SEARCH_LENGTH) {
      setQuery('')
      setIsFocused(false)
      navigate(`/browse?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div
        className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
        style={{
          background: 'var(--color-bg)',
          border: `1px solid ${isFocused ? 'var(--color-primary)' : 'var(--color-divider)'}`,
          boxShadow: isFocused ? '0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent)' : 'none',
        }}
      >
        <svg
          className="w-5 h-5 flex-shrink-0"
          style={{ color: 'var(--color-text-tertiary)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Find the best ___ near you"
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--color-text-primary)' }}
        />

        {query && (
          <button
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="p-1 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <svg
              className="w-4 h-4"
              style={{ color: 'var(--color-text-tertiary)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-divider)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          }}
        >
          {loading ? (
            <div className="px-4 py-6 text-center">
              <div className="animate-spin w-5 h-5 border-2 border-neutral-300 border-t-neutral-600 rounded-full mx-auto" />
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                Searching...
              </p>
            </div>
          ) : !hasResults ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                No dishes found for "{query}"
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {/* Dish Results */}
              {results.dishes.length > 0 && (
                <div>
                  <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--color-divider)' }}>
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                      Best Matches
                    </span>
                  </div>
                  {results.dishes.map((dish, index) => (
                    <DishResult
                      key={dish.dish_id}
                      dish={dish}
                      rank={index + 1}
                      onClick={() => handleDishSelect(dish)}
                    />
                  ))}
                </div>
              )}

              {/* Category Results */}
              {results.categories.length > 0 && (
                <div>
                  <div
                    className="px-4 py-2 border-b"
                    style={{
                      borderColor: 'var(--color-divider)',
                      background: results.dishes.length > 0 ? 'var(--color-surface)' : 'transparent',
                    }}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                      Categories
                    </span>
                  </div>
                  {results.categories.map((category) => (
                    <CategoryResult
                      key={category.id}
                      category={category}
                      onClick={() => handleCategorySelect(category)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Individual dish result row
function DishResult({ dish, rank, onClick }) {
  const {
    dish_name,
    restaurant_name,
    category,
    photo_url,
    avg_rating,
    total_votes,
  } = dish

  const imgSrc = photo_url || getCategoryImage(category)
  const isRanked = (total_votes || 0) >= MIN_VOTES_FOR_RANKING

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
    >
      {/* Rank badge */}
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          background: rank === 1 ? 'var(--color-primary)' : 'var(--color-surface)',
          color: rank === 1 ? 'white' : 'var(--color-text-tertiary)',
        }}
      >
        {rank}
      </div>

      {/* Photo */}
      <div
        className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
        style={{ background: 'var(--color-surface)' }}
      >
        <img
          src={imgSrc}
          alt={dish_name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
          {dish_name}
        </h4>
        <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
          {restaurant_name}
        </p>
      </div>

      {/* Rating */}
      <div className="flex-shrink-0 text-right">
        {isRanked ? (
          <div className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
            {avg_rating ? `${avg_rating}/10` : '—'}
          </div>
        ) : (
          <div
            className="text-[10px] font-medium px-2 py-1 rounded-full"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-text-tertiary)',
            }}
          >
            {total_votes || 0}/{MIN_VOTES_FOR_RANKING} votes
          </div>
        )}
      </div>
    </button>
  )
}

// Category result row
function CategoryResult({ category, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
    >
      {/* Category image */}
      <div
        className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
        style={{ background: 'var(--color-surface)' }}
      >
        <img
          src={getCategoryImage(category.id)}
          alt={category.label}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
          {category.label}
        </h4>
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          View all ranked dishes
        </p>
      </div>

      {/* Arrow */}
      <svg
        className="w-4 h-4 flex-shrink-0"
        style={{ color: 'var(--color-text-tertiary)' }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}
