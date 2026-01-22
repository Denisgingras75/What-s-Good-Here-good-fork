import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useSavedDishes } from '../hooks/useSavedDishes'
import { restaurantsApi, dishesApi } from '../api'
import { BrowseCard } from '../components/BrowseCard'
import { DishModal } from '../components/DishModal'
import { getPendingVoteFromStorage } from '../components/ReviewFlow'
import { LoginModal } from '../components/Auth/LoginModal'
import { DishCardSkeleton } from '../components/Skeleton'
import { ImpactFeedback, getImpactMessage } from '../components/ImpactFeedback'
import { CategoryImageCard } from '../components/CategoryImageCard'

const MIN_VOTES_FOR_RANKING = 5

const SORT_OPTIONS = [
  { id: 'top_rated', label: 'Top Rated', icon: '⭐' },
  { id: 'most_voted', label: 'Most Voted', icon: '🔥' },
  { id: 'closest', label: 'Closest', icon: '📍' },
]

// Browse shortcuts - curated high-frequency categories only
// Categories are shortcuts, NOT containers. All dishes are searchable regardless of category.
const CATEGORIES = [
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'burger', label: 'Burgers', emoji: '🍔' },
  { id: 'taco', label: 'Tacos', emoji: '🌮' },
  { id: 'wings', label: 'Wings', emoji: '🍗' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣' },
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { id: 'lobster roll', label: 'Lobster Rolls', emoji: '🦞' },
  { id: 'chowder', label: 'Chowder', emoji: '🍲' },
  { id: 'pasta', label: 'Pasta', emoji: '🍝' },
  { id: 'steak', label: 'Steak', emoji: '🥩' },
  { id: 'sandwich', label: 'Sandwiches', emoji: '🥪' },
  { id: 'salad', label: 'Salads', emoji: '🥗' },
]

export function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState(null)
  const [impactFeedback, setImpactFeedback] = useState(null)
  const [pendingVoteData, setPendingVoteData] = useState(null)
  const [sortBy, setSortBy] = useState(() => {
    try {
      return localStorage.getItem('browse_sort') || 'top_rated'
    } catch {
      return 'top_rated'
    }
  })
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)

  // Autocomplete state
  const [autocompleteOpen, setAutocompleteOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [autocompleteIndex, setAutocompleteIndex] = useState(-1)
  const [dishSuggestions, setDishSuggestions] = useState([])
  const [restaurantSuggestions, setRestaurantSuggestions] = useState([])

  const beforeVoteRef = useRef(null)
  const sortDropdownRef = useRef(null)
  const searchInputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const votingDishId = new URLSearchParams(window.location.search).get('votingDish')

  // Handle category and search query from URL params (when coming from home page)
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    const queryFromUrl = searchParams.get('q')

    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
      setSearchQuery('')
      setDebouncedSearchQuery('')
    } else if (queryFromUrl) {
      setSearchQuery(queryFromUrl)
      setDebouncedSearchQuery(queryFromUrl)
      setSelectedCategory(null)
    }
  }, [searchParams])

  // Debounce search query by 300ms - only when already showing dishes
  // On categories page, search only triggers on Enter key
  useEffect(() => {
    // Skip auto-debounce if we're on the category grid (not showing dishes yet)
    if (!selectedCategory && !debouncedSearchQuery) {
      return
    }
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedCategory, debouncedSearchQuery])

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle sort change
  const handleSortChange = (sortId) => {
    setSortBy(sortId)
    try {
      localStorage.setItem('browse_sort', sortId)
    } catch {
      // localStorage may be unavailable in private browsing or restricted contexts
    }
    setSortDropdownOpen(false)
  }

  // Fetch autocomplete suggestions (dishes and restaurants)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setDishSuggestions([])
      setRestaurantSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      try {
        const [dishResults, restaurantResults] = await Promise.all([
          dishesApi.search(searchQuery, 5),
          restaurantsApi.search(searchQuery, 3),
        ])
        setDishSuggestions(dishResults)
        setRestaurantSuggestions(restaurantResults)
      } catch (error) {
        // Gracefully degrade - show no suggestions on error
        console.error('Search suggestions failed:', error)
        setDishSuggestions([])
        setRestaurantSuggestions([])
      }
    }

    const timer = setTimeout(fetchSuggestions, 150)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(e.target) &&
        !searchInputRef.current?.contains(e.target)
      ) {
        setAutocompleteOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const { location, radius } = useLocationContext()

  // Only fetch dishes when we have a category selected OR when searching
  const shouldFetchDishes = selectedCategory || debouncedSearchQuery.trim()

  // When text searching, use island-wide radius (30 miles covers all of MV)
  // so users can find dishes regardless of their location
  const searchRadius = debouncedSearchQuery.trim() ? 30 : radius

  const { dishes, loading, error, refetch } = useDishes(
    shouldFetchDishes ? location : null, // Pass null location to skip fetch
    searchRadius,
    debouncedSearchQuery.trim() ? null : selectedCategory, // Search across all categories
    null
  )
  const { isSaved, toggleSave } = useSavedDishes(user?.id)

  // Helper to find dish rank in current list
  const getDishRank = useCallback((dishId, dishList) => {
    const ranked = dishList?.filter(d => (d.total_votes || 0) >= MIN_VOTES_FOR_RANKING) || []
    const index = ranked.findIndex(d => d.dish_id === dishId)
    return index === -1 ? 999 : index + 1
  }, [])

  // Open dish modal and capture before state for impact calculation
  const openDishModal = useCallback((dish) => {
    beforeVoteRef.current = {
      dish_id: dish.dish_id,
      total_votes: dish.total_votes || 0,
      percent_worth_it: dish.percent_worth_it || 0,
      rank: getDishRank(dish.dish_id, dishes)
    }
    setSelectedDish(dish)
  }, [dishes, getDishRank])

  // Auto-reopen modal after OAuth/magic link login if there's a pending vote
  useEffect(() => {
    if (!user || !dishes?.length || selectedDish) return

    // Check URL for votingDish param (from magic link redirect)

    // Also check localStorage as fallback
    const pending = getPendingVoteFromStorage()
    const dishIdToOpen = votingDishId || pending?.dishId

    if (!dishIdToOpen) return

    // Find the dish in current list
    const dish = dishes.find(d => d.dish_id === dishIdToOpen)
    if (!dish) return

    // Clean up the URL param first
    if (votingDishId) {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('votingDish')
      window.history.replaceState({}, '', newUrl.pathname + newUrl.search)
    }

    // Open modal immediately - dishes are guaranteed ready now
    openDishModal(dish)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dishes, openDishModal, selectedDish])

  // Calculate impact when dishes update after voting
  useEffect(() => {
    if (!pendingVoteData || !dishes?.length) return

    const after = dishes.find(d => d.dish_id === pendingVoteData.dish_id)
    if (!after) return

    // Check if votes actually increased (data refreshed)
    if (after.total_votes > pendingVoteData.total_votes) {
      const afterRank = getDishRank(pendingVoteData.dish_id, dishes)
      const impact = getImpactMessage(pendingVoteData, after, pendingVoteData.rank, afterRank)
      setImpactFeedback(impact)
      setPendingVoteData(null)
    }
  }, [dishes, pendingVoteData, setImpactFeedback, getDishRank])

  const handleVote = () => {
    // Store before data and mark as pending
    if (beforeVoteRef.current) {
      setPendingVoteData(beforeVoteRef.current)
      beforeVoteRef.current = null
    }
    // Close the modal first, then refetch so toast appears on clean screen
    setSelectedDish(null)
    refetch()
  }

  const handleLoginRequired = () => {
    setLoginModalOpen(true)
  }

  const handleToggleSave = async (dishId) => {
    if (!user) {
      setLoginModalOpen(true)
      return
    }
    await toggleSave(dishId)
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    setSearchQuery('') // Clear search when selecting category
    setDebouncedSearchQuery('')
    // Update URL params
    if (categoryId) {
      setSearchParams({ category: categoryId })
    } else {
      setSearchParams({})
    }
  }

  // Go back to category grid
  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setSearchParams({})
  }

  // Filter and sort dishes
  const filteredDishes = useMemo(() => {
    // First filter by search query
    let result = dishes.filter(dish => {
      if (!debouncedSearchQuery.trim()) return true
      const query = debouncedSearchQuery.toLowerCase()
      return (
        dish.dish_name?.toLowerCase().includes(query) ||
        dish.restaurant_name?.toLowerCase().includes(query) ||
        dish.category?.toLowerCase().includes(query)
      )
    })

    // Then sort based on selected option
    switch (sortBy) {
      case 'most_voted':
        result = [...result].sort((a, b) => (b.total_votes || 0) - (a.total_votes || 0))
        break
      case 'closest':
        result = [...result].sort((a, b) => (a.distance_miles || 999) - (b.distance_miles || 999))
        break
      case 'top_rated':
      default:
        // Sort by avg_rating (1-10 scale) for Discovery view
        result = [...result].sort((a, b) => {
          const aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
          const bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
          // Ranked dishes first
          if (aRanked && !bRanked) return -1
          if (!aRanked && bRanked) return 1
          // Then by avg_rating (quality score)
          return (b.avg_rating || 0) - (a.avg_rating || 0)
        })
        break
    }

    return result
  }, [dishes, debouncedSearchQuery, sortBy])

  // Clear search
  const clearSearch = () => {
    setSearchQuery('')
    setAutocompleteOpen(false)
  }

  // Autocomplete suggestions (dishes and restaurants from API search)
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return []

    // Use dish suggestions from API
    const dishMatches = dishSuggestions.map(d => ({
      type: 'dish',
      id: d.dish_id,
      name: d.dish_name,
      subtitle: d.restaurant_name,
      data: d,
    }))

    // Use restaurant suggestions from API
    const restaurantMatches = restaurantSuggestions.map(r => ({
      type: 'restaurant',
      id: r.id,
      name: r.name,
      subtitle: r.address,
      data: r,
    }))

    return [...dishMatches, ...restaurantMatches]
  }, [searchQuery, dishSuggestions, restaurantSuggestions])

  // Handle autocomplete selection
  const handleAutocompleteSelect = useCallback((suggestion) => {
    setAutocompleteOpen(false)
    setAutocompleteIndex(-1)

    if (suggestion.type === 'dish') {
      // Open the dish modal
      openDishModal(suggestion.data)
      setSearchQuery('')
    } else if (suggestion.type === 'restaurant') {
      // Navigate to restaurant page
      navigate(`/restaurants/${suggestion.id}`)
    }
  }, [navigate, openDishModal])

  // Handle keyboard navigation in autocomplete
  const handleSearchKeyDown = useCallback((e) => {
    if (!autocompleteOpen || autocompleteSuggestions.length === 0) {
      if (e.key === 'ArrowDown' && searchQuery.trim().length >= 2) {
        setAutocompleteOpen(true)
        setAutocompleteIndex(0)
        e.preventDefault()
      } else if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
        // Handle Enter even when autocomplete is closed - navigate to search results
        e.preventDefault()
        setSelectedCategory(null)
        setDebouncedSearchQuery(searchQuery.trim())
        setSearchParams({ q: searchQuery.trim() })
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setAutocompleteIndex(prev =>
          prev < autocompleteSuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setAutocompleteIndex(prev =>
          prev > 0 ? prev - 1 : autocompleteSuggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (autocompleteIndex >= 0 && autocompleteSuggestions[autocompleteIndex]) {
          handleAutocompleteSelect(autocompleteSuggestions[autocompleteIndex])
        } else if (searchQuery.trim().length >= 2) {
          // No autocomplete selection - trigger search like Home page does
          setAutocompleteOpen(false)
          setAutocompleteIndex(-1)
          setSelectedCategory(null)
          setDebouncedSearchQuery(searchQuery.trim())
          setSearchParams({ q: searchQuery.trim() })
        }
        break
      case 'Escape':
        setAutocompleteOpen(false)
        setAutocompleteIndex(-1)
        break
    }
  }, [autocompleteOpen, autocompleteSuggestions, autocompleteIndex, handleAutocompleteSelect, searchQuery, setSearchParams])

  // Are we showing dishes or the category grid?
  const showingDishes = selectedCategory || debouncedSearchQuery.trim()

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      {/* Header - only shows when viewing dishes */}
      {showingDishes && (
        <header style={{ background: 'var(--color-bg)' }}>
          {/* Category indicator when viewing dishes */}
          {selectedCategory && !debouncedSearchQuery.trim() && (
            <div className="px-4 py-3 flex items-center gap-3">
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {CATEGORIES.find(c => c.id === selectedCategory)?.label}
              </span>
              <button
                onClick={handleBackToCategories}
                className="text-xs font-medium px-2 py-1 rounded-lg transition-colors"
                style={{ color: 'var(--color-primary)', background: 'var(--color-primary-muted)' }}
              >
                Clear
              </button>
            </div>
          )}

          {/* Search results heading */}
          {debouncedSearchQuery.trim() && !selectedCategory && (
            <div className="px-4 py-3">
              <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Best "{debouncedSearchQuery}" near you
              </h1>
            </div>
          )}
        </header>
      )}

      {/* Main Content */}
      {!showingDishes ? (
        /* Category Grid - Plates on a dining table */
        <div
          className="px-6 pt-5 pb-6 relative"
          style={{
            background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 50%, #121212 100%)',
            minHeight: 'calc(100vh - 80px)',
          }}
        >
          {/* Table edge - top bevel/rim catching light */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.08) 80%, transparent 100%)',
            }}
          />

          {/* Section title - anchors the grid */}
          <div className="flex justify-center pt-4 pb-10">
            <span
              className="text-[11px] font-semibold tracking-[0.2em] uppercase"
              style={{ color: 'rgba(255, 255, 255, 0.45)' }}
            >
              Categories
            </span>
          </div>

          {/* Category grid - 12 items, 4 rows of 3, shelf-like rhythm */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-7 justify-items-center">
            {CATEGORIES.map((category) => (
              <CategoryImageCard
                key={category.id}
                category={category}
                isActive={selectedCategory === category.id}
                onClick={() => handleCategoryChange(category.id)}
                size={72}
              />
            ))}
          </div>

          {/* Search bar - escape hatch, visually separate from categories */}
          <div className="mt-auto pt-10">
            <div className="relative">
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: 'var(--color-bg)',
                  border: `1px solid ${searchFocused ? 'var(--color-primary)' : 'var(--color-divider)'}`,
                  boxShadow: searchFocused ? '0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent)' : 'none',
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
                  ref={searchInputRef}
                  type="text"
                  placeholder="Find the best ___ near you"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (e.target.value.length >= 2) {
                      setAutocompleteOpen(true)
                    } else {
                      setAutocompleteOpen(false)
                    }
                    setAutocompleteIndex(-1)
                  }}
                  onFocus={() => {
                    setSearchFocused(true)
                    if (searchQuery.length >= 2 && autocompleteSuggestions.length > 0) {
                      setAutocompleteOpen(true)
                    }
                  }}
                  onBlur={() => setSearchFocused(false)}
                  onKeyDown={handleSearchKeyDown}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: 'var(--color-text-primary)' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      clearSearch()
                      searchInputRef.current?.focus()
                    }}
                    className="p-1 rounded-full transition-colors"
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

            {/* Autocomplete dropdown */}
            {autocompleteOpen && autocompleteSuggestions.length > 0 && (
              <div
                ref={autocompleteRef}
                className="absolute bottom-full left-0 right-0 mb-1 rounded-lg shadow-lg border overflow-hidden z-50"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-divider)' }}
              >
                {autocompleteSuggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.id}`}
                    onClick={() => handleAutocompleteSelect(suggestion)}
                    className="w-full px-3 py-2.5 text-left flex items-center gap-2 transition-colors"
                    style={{
                      background: index === autocompleteIndex ? 'var(--color-primary-muted)' : 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = index === autocompleteIndex ? 'var(--color-primary-muted)' : 'transparent'}
                  >
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {suggestion.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                        {suggestion.type === 'dish' ? `at ${suggestion.subtitle}` : suggestion.subtitle}
                      </p>
                    </div>

                    {/* Type badge */}
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: suggestion.type === 'dish' ? 'var(--color-primary-muted)' : 'rgba(59, 130, 246, 0.15)',
                        color: suggestion.type === 'dish' ? 'var(--color-primary)' : '#60A5FA'
                      }}
                    >
                      {suggestion.type === 'dish' ? 'Dish' : 'Spot'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      ) : (
        /* Dish List View */
        <>
          {/* Results count and sort */}
          <div className="px-4 py-2 border-b flex items-center justify-between" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-divider)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {loading ? (
                'Loading...'
              ) : (
                <>
                  <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{filteredDishes.length}</span>
                  {' '}
                  {filteredDishes.length === 1 ? 'dish' : 'dishes'}
                  {debouncedSearchQuery && (
                    <span> matching "{debouncedSearchQuery}"</span>
                  )}
                </>
              )}
            </p>

            {/* Sort dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span>{SORT_OPTIONS.find(o => o.id === sortBy)?.icon}</span>
                <span>{SORT_OPTIONS.find(o => o.id === sortBy)?.label}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {sortDropdownOpen && (
                <div className="absolute right-0 mt-1 w-40 rounded-xl shadow-lg border py-1 z-50" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-divider)' }}>
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSortChange(option.id)}
                      className={`w-full px-3 py-2 text-sm text-left flex items-center gap-2 transition-colors ${
                        sortBy === option.id ? 'font-medium' : ''
                      }`}
                      style={{ color: sortBy === option.id ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                      {sortBy === option.id && (
                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dish Grid */}
          <div className="px-4 py-4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <DishCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            ) : filteredDishes.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
                  <span className="text-2xl">🔍</span>
                </div>
                <p className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {debouncedSearchQuery
                    ? `No dishes found for "${debouncedSearchQuery}"`
                    : 'No dishes in this category yet'
                  }
                </p>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-tertiary)' }}>
                  {debouncedSearchQuery
                    ? 'Try a different search or browse by category'
                    : 'Be the first to add one!'
                  }
                </p>

                {/* Try different category */}
                <p className="text-xs mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
                  Try a different category above
                </p>

                {/* Clear filter button */}
                <button
                  onClick={handleBackToCategories}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98] transition-all"
                  style={{ background: 'var(--color-primary)' }}
                >
                  Clear Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredDishes.map((dish) => (
                  <BrowseCard
                    key={dish.dish_id}
                    dish={dish}
                    onClick={() => openDishModal(dish)}
                    isFavorite={isSaved ? isSaved(dish.dish_id) : false}
                    onToggleFavorite={handleToggleSave}
                  />
                ))}
              </div>
            )}

            {/* Footer */}
            {!loading && filteredDishes.length > 0 && (
              <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'var(--color-divider)' }}>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {filteredDishes.length} {filteredDishes.length === 1 ? 'dish' : 'dishes'} found
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Dish Detail Modal */}
      <DishModal
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        onVote={handleVote}
        onLoginRequired={handleLoginRequired}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {/* Impact feedback toast */}
      <ImpactFeedback
        impact={impactFeedback}
        onClose={() => setImpactFeedback(null)}
      />
    </div>
  )
}
