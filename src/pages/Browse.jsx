import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLocation } from '../hooks/useLocation'
import { useDishes } from '../hooks/useDishes'
import { DishFeed } from '../components/DishFeed'
import { LoginModal } from '../components/Auth/LoginModal'
import { getCategoryImage, DEFAULT_DISH_IMAGE } from '../constants/categoryImages'

const CATEGORIES = [
  { id: null, label: 'All Dishes', emoji: null },
  { id: 'pizza', label: 'Pizza' },
  { id: 'burger', label: 'Burgers' },
  { id: 'taco', label: 'Tacos' },
  { id: 'wings', label: 'Wings' },
  { id: 'sushi', label: 'Sushi' },
  { id: 'sandwich', label: 'Sandwiches' },
  { id: 'breakfast sandwich', label: 'Breakfast Sandwiches' },
  { id: 'pasta', label: 'Pasta' },
  { id: 'pokebowl', label: 'Poke Bowls' },
  { id: 'lobster roll', label: 'Lobster Rolls' },
  { id: 'seafood', label: 'Seafood' },
  { id: 'chowder', label: 'Chowder' },
  { id: 'soup', label: 'Soups' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'salad', label: 'Salads' },
  { id: 'fries', label: 'Fries' },
  { id: 'tendys', label: 'Tendys' },
  { id: 'fried chicken', label: 'Fried Chicken' },
  { id: 'apps', label: 'Apps' },
  { id: 'entree', label: 'Entrees' },
]

export function Browse() {
  const [searchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loginModalOpen, setLoginModalOpen] = useState(false)

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

  // Filter categories by search
  const filteredCategories = CATEGORIES.filter(cat =>
    cat.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-4">
        <div className="flex flex-col items-center mb-4">
          <img src="/logo.png" alt="What's Good Here" className="h-20 w-auto" />
        </div>

        {/* Search bar */}
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
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-neutral-100 rounded-xl border-0 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
          />
        </div>
      </header>

      {/* Category Grid */}
      {!selectedCategory && (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {filteredCategories.map((category) => (
              <button
                key={category.id || 'all'}
                onClick={() => setSelectedCategory(category.id)}
                className="relative overflow-hidden rounded-2xl bg-white border border-neutral-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all aspect-[4/3] group"
              >
                <img
                  src={category.id ? getCategoryImage(category.id) : DEFAULT_DISH_IMAGE}
                  alt={category.label}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="text-white font-semibold text-lg drop-shadow-lg">
                    {category.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Category View */}
      {selectedCategory && (
        <>
          {/* Back button and category header */}
          <div className="sticky top-0 z-20 bg-white border-b border-neutral-200 px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <img
                src={getCategoryImage(selectedCategory)}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
              <h2 className="text-xl font-bold text-neutral-900">
                {CATEGORIES.find(c => c.id === selectedCategory)?.label}
              </h2>
            </div>
          </div>

          {/* Dish Feed */}
          <DishFeed
            dishes={dishes}
            loading={loading}
            error={error}
            onVote={handleVote}
            onLoginRequired={handleLoginRequired}
          />
        </>
      )}

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  )
}
