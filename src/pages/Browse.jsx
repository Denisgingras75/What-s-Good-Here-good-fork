import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLocation } from '../hooks/useLocation'
import { useDishes } from '../hooks/useDishes'
import { useSavedDishes } from '../hooks/useSavedDishes'
import { BrowseCard } from '../components/BrowseCard'
import { ReviewFlow } from '../components/ReviewFlow'
import { LoginModal } from '../components/Auth/LoginModal'
import { getCategoryImage } from '../constants/categoryImages'
import { supabase } from '../lib/supabase'

const CATEGORIES = [
  { id: null, label: 'All', emoji: '🍽️' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'burger', label: 'Burgers', emoji: '🍔' },
  { id: 'taco', label: 'Tacos', emoji: '🌮' },
  { id: 'wings', label: 'Wings', emoji: '🍗' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣' },
  { id: 'sandwich', label: 'Sandwiches', emoji: '🥪' },
  { id: 'breakfast sandwich', label: 'Bfast Sandwich', emoji: '🥯' },
  { id: 'pasta', label: 'Pasta', emoji: '🍝' },
  { id: 'pokebowl', label: 'Poke', emoji: '🥗' },
  { id: 'lobster roll', label: 'Lobster Rolls', emoji: '🦞' },
  { id: 'seafood', label: 'Seafood', emoji: '🦐' },
  { id: 'chowder', label: 'Chowder', emoji: '🍲' },
  { id: 'soup', label: 'Soups', emoji: '🍜' },
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { id: 'salad', label: 'Salads', emoji: '🥗' },
  { id: 'fries', label: 'Fries', emoji: '🍟' },
  { id: 'tendys', label: 'Tendys', emoji: '🍗' },
  { id: 'fried chicken', label: 'Fried Chicken', emoji: '🍗' },
  { id: 'apps', label: 'Apps', emoji: '🧆' },
  { id: 'entree', label: 'Entrees', emoji: '🥩' },
]

export function Browse() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState(null)
  const [user, setUser] = useState(null)
  const categoryScrollRef = useRef(null)

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Handle category from URL params (when coming from home page)
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [searchParams])

  const { location, radius } = useLocation()
  const { dishes, loading, error, refetch } = useDishes(
    location,
    radius,
    selectedCategory,
    null
  )
  const { isSaved, toggleSave } = useSavedDishes(user?.id)

  const handleVote = () => {
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
    // Update URL params
    if (categoryId) {
      setSearchParams({ category: categoryId })
    } else {
      setSearchParams({})
    }
  }

  // Filter dishes by search query (dish name or restaurant name)
  const filteredDishes = dishes.filter(dish => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      dish.dish_name?.toLowerCase().includes(query) ||
      dish.restaurant_name?.toLowerCase().includes(query)
    )
  })

  // Clear search
  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="flex flex-col items-center py-3">
          <img src="/logo.png" alt="What's Good Here" className="h-20 w-auto" />
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search dishes or restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-neutral-100 rounded-xl border-0 focus:ring-2 focus:bg-white transition-all"
              style={{ '--tw-ring-color': 'var(--color-primary)' }}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-300 flex items-center justify-center hover:bg-neutral-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-neutral-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category chips - horizontal scroll */}
        <div
          ref={categoryScrollRef}
          className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide"
        >
          {CATEGORIES.map((category) => (
            <button
              key={category.id || 'all'}
              onClick={() => handleCategoryChange(category.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
              style={selectedCategory === category.id ? { background: 'var(--color-primary)' } : {}}
            >
              <span>{category.emoji}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Results count */}
      <div className="px-4 py-2 bg-stone-50 border-b border-neutral-100">
        <p className="text-sm text-neutral-500">
          {loading ? (
            'Loading...'
          ) : (
            <>
              <span className="font-medium text-neutral-700">{filteredDishes.length}</span>
              {' '}
              {filteredDishes.length === 1 ? 'dish' : 'dishes'}
              {selectedCategory && (
                <span> in {CATEGORIES.find(c => c.id === selectedCategory)?.label}</span>
              )}
              {searchQuery && (
                <span> matching "{searchQuery}"</span>
              )}
            </>
          )}
        </p>
      </div>

      {/* Dish Grid */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: 'var(--color-primary)' }} />
              <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Finding dishes...</p>
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
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
              <span className="text-2xl">🔍</span>
            </div>
            <p className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>No dishes found</p>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Try a different category or search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredDishes.map((dish) => (
              <BrowseCard
                key={dish.dish_id}
                dish={dish}
                onClick={() => setSelectedDish(dish)}
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

      {/* Dish Detail Modal */}
      {selectedDish && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedDish(null)}
          />

          {/* Modal Content - flex column with sticky bottom */}
          <div
            className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-t-3xl animate-slide-up"
            style={{ background: 'var(--color-bg)' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-divider)' }} />
            </div>

            {/* Close button */}
            <button
              onClick={() => setSelectedDish(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-4">
              {/* Dish Image - shorter for modal */}
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden" style={{ background: 'var(--color-surface)' }}>
                <img
                  src={selectedDish.photo_url || getCategoryImage(selectedDish.category)}
                  alt={selectedDish.dish_name}
                  className="w-full h-full object-cover"
                />
                {/* Rating badge */}
                {(selectedDish.total_votes || 0) >= 10 && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                    <span className="text-sm font-semibold text-white">
                      👍 {Math.round(selectedDish.percent_worth_it)}%
                    </span>
                  </div>
                )}
                {/* Favorite button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleSave(selectedDish.dish_id)
                  }}
                  className={`absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    isSaved?.(selectedDish.dish_id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90 backdrop-blur-sm text-neutral-400'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isSaved?.(selectedDish.dish_id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </button>
              </div>

              {/* Dish Info */}
              <div className="py-4">
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {selectedDish.dish_name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {selectedDish.restaurant_name}
                  </span>
                  {selectedDish.price && (
                    <>
                      <span style={{ color: 'var(--color-divider)' }}>•</span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        ${Number(selectedDish.price).toFixed(2)}
                      </span>
                    </>
                  )}
                  {selectedDish.distance_miles && (
                    <>
                      <span style={{ color: 'var(--color-divider)' }}>•</span>
                      <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        {Number(selectedDish.distance_miles).toFixed(1)} mi
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  {(selectedDish.total_votes || 0) === 0
                    ? 'Be first to rate this dish'
                    : `${selectedDish.total_votes} votes`
                  }
                </p>
              </div>
            </div>

            {/* Sticky Bottom - Review Flow */}
            <div
              className="flex-shrink-0 px-4 py-4 border-t"
              style={{ borderColor: 'var(--color-divider)', background: 'var(--color-bg)' }}
            >
              <ReviewFlow
                dishId={selectedDish.dish_id}
                dishName={selectedDish.dish_name}
                category={selectedDish.category}
                totalVotes={selectedDish.total_votes || 0}
                yesVotes={selectedDish.yes_votes || 0}
                onVote={handleVote}
                onLoginRequired={handleLoginRequired}
              />
            </div>
          </div>
        </div>
      )}

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  )
}
