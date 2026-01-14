import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLocation } from '../hooks/useLocation'
import { useDishes } from '../hooks/useDishes'
import { DishFeed } from '../components/DishFeed'
import { LoginModal } from '../components/Auth/LoginModal'

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
  const categoryScrollRef = useRef(null)

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

  const handleVote = () => {
    refetch()
  }

  const handleLoginRequired = () => {
    setLoginModalOpen(true)
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
              className="w-full pl-10 pr-10 py-3 bg-neutral-100 rounded-xl border-0 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
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
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
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

      {/* Dish Feed */}
      <DishFeed
        dishes={filteredDishes}
        loading={loading}
        error={error}
        onVote={handleVote}
        onLoginRequired={handleLoginRequired}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  )
}
