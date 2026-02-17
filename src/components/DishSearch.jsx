import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { capture } from '../lib/analytics'
import { dishesApi } from '../api/dishesApi'
import { getCategoryNeonImage } from '../constants/categories'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { getRatingColor } from '../utils/ranking'
import { logger } from '../utils/logger'
const MIN_SEARCH_LENGTH = 2
const MAX_DISH_RESULTS = 5
const MAX_CATEGORY_RESULTS = 2

// Browse shortcuts - curated high-frequency categories only
// Categories are shortcuts, NOT containers. All dishes are searchable regardless of category.
const BROWSE_CATEGORIES = [
  { id: 'pizza', label: 'Pizza' },
  { id: 'burger', label: 'Burgers' },
  { id: 'taco', label: 'Tacos' },
  { id: 'wings', label: 'Wings' },
  { id: 'sushi', label: 'Sushi' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lobster roll', label: 'Lobster Rolls' },
  { id: 'seafood', label: 'Seafood' },
  { id: 'chowder', label: 'Chowder' },
  { id: 'pasta', label: 'Pasta' },
  { id: 'steak', label: 'Steak' },
  { id: 'sandwich', label: 'Sandwiches' },
  { id: 'salad', label: 'Salads' },
  { id: 'tendys', label: 'Tenders' },
]

export function DishSearch({ loading = false, placeholder = "Find What's Good near you", town = null, onSearchChange = null }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const mountedRef = useRef(true)

  // Track mounted state for async operations
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current?.contains(e.target)
      ) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Pass query to parent for inline results (homepage mode)
  useEffect(() => {
    if (onSearchChange) {
      const trimmed = query.trim()
      const timer = setTimeout(() => {
        onSearchChange(trimmed.length >= MIN_SEARCH_LENGTH ? trimmed : '')
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [query, onSearchChange])

  // Fetch search results from API (dropdown mode only)
  useEffect(() => {
    if (onSearchChange) return // Skip dropdown fetch in inline mode
    if (query.length < MIN_SEARCH_LENGTH) {
      setSearchResults([])
      return
    }

    const fetchResults = async () => {
      setSearching(true)
      try {
        const results = await dishesApi.search(query, MAX_DISH_RESULTS, town)
        // Only update state if still mounted
        if (mountedRef.current) {
          setSearchResults(results)
        }
      } catch (error) {
        logger.error('Search error:', error)
        if (mountedRef.current) {
          setSearchResults([])
        }
      } finally {
        if (mountedRef.current) {
          setSearching(false)
        }
      }
    }

    // Debounce the search
    const timer = setTimeout(fetchResults, 150)
    return () => clearTimeout(timer)
  }, [query, town, onSearchChange])

  // Find matching categories (client-side since it's a small constant array)
  const matchingCategories = useMemo(() => {
    if (query.length < MIN_SEARCH_LENGTH) return []
    const searchTerm = query.toLowerCase().trim()
    return BROWSE_CATEGORIES.filter(cat => {
      const catId = cat.id.toLowerCase()
      const catLabel = cat.label.toLowerCase()
      return catId.includes(searchTerm) || catLabel.includes(searchTerm)
    }).slice(0, MAX_CATEGORY_RESULTS)
  }, [query])

  const results = {
    dishes: searchResults,
    categories: matchingCategories,
  }

  const hasResults = results.dishes.length > 0 || results.categories.length > 0
  const showDropdown = !onSearchChange && isFocused && query.length >= MIN_SEARCH_LENGTH
  const isLoading = loading || searching

  // Handle dish selection
  const handleDishSelect = (dish) => {
    // Track search -> dish selection
    capture('search_performed', {
      query: query,
      result_type: 'dish',
      selected_dish_id: dish.dish_id,
      selected_dish_name: dish.dish_name,
      selected_restaurant: dish.restaurant_name,
      results_count: results.dishes.length,
    })
    setQuery('')
    setIsFocused(false)
    // Navigate to dedicated dish page
    navigate(`/dish/${dish.dish_id}`)
  }

  // Handle category selection
  const handleCategorySelect = (category) => {
    // Track search -> category selection
    capture('search_performed', {
      query: query,
      result_type: 'category',
      selected_category: category.id,
      results_count: results.categories.length,
    })
    setQuery('')
    setIsFocused(false)
    navigate(`/browse?category=${encodeURIComponent(category.id)}`)
  }

  // Handle Enter key - go to full search results page (dropdown mode only)
  const handleKeyDown = (e) => {
    if (onSearchChange) return // Inline mode handles results in parent
    if (e.key === 'Enter' && query.trim().length >= MIN_SEARCH_LENGTH) {
      // Track search submission
      capture('search_performed', {
        query: query.trim(),
        result_type: 'full_search',
        dish_results_count: results.dishes.length,
        category_results_count: results.categories.length,
      })
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
          background: '#FFFFFF',
          border: `2px solid ${isFocused ? '#E4440A' : '#1A1A1A'}`,
          boxShadow: 'none',
          minHeight: '48px',
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
          id="dish-search"
          name="dish-search"
          type="text"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search dishes by name"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="dish-search-dropdown"
          className="flex-1 bg-transparent outline-none border-none text-sm"
          style={{ color: 'var(--color-text-primary)', outline: 'none', border: 'none', boxShadow: 'none' }}
        />

        {query && (
          <button
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            aria-label="Clear search"
            className="p-1 rounded-full transition-colors"
            style={{ ':hover': { background: 'var(--color-surface-elevated)' } }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
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
          id="dish-search-dropdown"
          role="listbox"
          aria-label="Search results"
          className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
          style={{
            background: 'var(--color-surface)',
            border: '1.5px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          {isLoading ? (
            <div className="px-4 py-6 text-center">
              <div className="animate-spin w-5 h-5 border-2 rounded-full mx-auto" style={{ borderColor: 'var(--color-divider)', borderTopColor: 'var(--color-primary)' }} />
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
                      {town ? `Best in ${town}` : 'Best Matches'}
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

// Individual dish result row — matches Top 10 compact style
function DishResult({ dish, rank, onClick }) {
  const {
    dish_name,
    restaurant_name,
    avg_rating,
    total_votes,
  } = dish

  const isRanked = (total_votes || 0) >= MIN_VOTES_FOR_RANKING

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-2.5 px-4 transition-colors text-left"
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <span
        className="w-6 text-center text-sm font-bold flex-shrink-0"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        {rank}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>{restaurant_name}</span>
          {' · '}
          {dish_name}
        </p>
      </div>

      <div className="flex-shrink-0 text-right">
        {isRanked ? (
          <span className="text-sm font-bold" style={{ color: getRatingColor(avg_rating) }}>
            {avg_rating || '—'}
          </span>
        ) : (
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'New'}
          </span>
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
      className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {/* Category icon */}
      <div
        className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{ background: 'var(--color-surface)' }}
      >
        {getCategoryNeonImage(category.id) ? (
          <img
            src={getCategoryNeonImage(category.id)}
            alt={category.label}
            loading="lazy"
            className="w-8 h-8 object-contain"
          />
        ) : (
          <span className="text-lg">{category.label.charAt(0)}</span>
        )}
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
