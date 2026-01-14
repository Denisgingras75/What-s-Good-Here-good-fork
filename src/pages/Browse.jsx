import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { useLocation } from '../hooks/useLocation'
import { useDishes } from '../hooks/useDishes'
import { useSavedDishes } from '../hooks/useSavedDishes'
import { BrowseCard } from '../components/BrowseCard'
import { ReviewFlow, getPendingVoteFromStorage } from '../components/ReviewFlow'
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

  // Auto-reopen modal after OAuth/magic link login if there's a pending vote
  useEffect(() => {
    if (user && dishes?.length > 0 && !selectedDish) {
      const pending = getPendingVoteFromStorage()
      if (pending) {
        // Find the dish they were voting on
        const dish = dishes.find(d => d.dish_id === pending.dishId)
        if (dish) {
          // Small delay to ensure page is fully loaded after redirect
          setTimeout(() => {
            setSelectedDish(dish)
          }, 100)
        }
      }
    }
  }, [user, dishes, selectedDish])

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

      {/* Dish Detail Modal - Using portal to escape any CSS inheritance */}
      {selectedDish && createPortal(
        <div
          key={`modal-${selectedDish.dish_id}`}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '16px',
          }}
          onClick={() => setSelectedDish(null)}
        >
          {/* Modal card */}
          <div
            ref={(el) => { if (el) el.scrollTop = 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '360px',
              maxHeight: '85vh',
              overflowY: 'auto',
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedDish(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#e5e5e5',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>

            {/* Dish name + restaurant */}
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', paddingRight: '30px' }}>
              {selectedDish.dish_name}
            </h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
              {selectedDish.restaurant_name}
              {selectedDish.price && ` · $${Number(selectedDish.price).toFixed(0)}`}
            </p>

            {/* Review Flow - this is where thumbs up/down appears */}
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
        </div>,
        document.body
      )}

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  )
}
