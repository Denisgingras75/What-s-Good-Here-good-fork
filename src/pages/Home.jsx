import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from '../hooks/useLocation'
import { useDishes } from '../hooks/useDishes'
import { useSavedDishes } from '../hooks/useSavedDishes'
import { LocationPicker } from '../components/LocationPicker'
import { DishCard as FullDishCard } from '../components/DishCard'
import { LoginModal } from '../components/Auth/LoginModal'
import { getCategoryImage } from '../constants/categoryImages'
import { supabase } from '../lib/supabase'

const FEATURED_CATEGORIES = [
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'burger', label: 'Burgers', emoji: '🍔' },
  { id: 'lobster roll', label: 'Lobster Rolls', emoji: '🦞' },
  { id: 'taco', label: 'Tacos', emoji: '🌮' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣' },
]

export function Home() {
  const navigate = useNavigate()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState(null)
  const [user, setUser] = useState(null)

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const { location, radius, setRadius, error: locationError } = useLocation()
  const { dishes, loading, error, refetch } = useDishes(
    location,
    radius,
    null,
    null
  )
  const { isSaved, toggleSave } = useSavedDishes(user?.id)

  // Get top dishes overall
  const topDishes = dishes?.slice(0, 10) || []

  // Get top 3 dishes per category
  const getTopByCategory = (categoryId) => {
    return dishes?.filter(d => d.category === categoryId).slice(0, 3) || []
  }

  const handleCategoryClick = (categoryId) => {
    navigate(`/browse?category=${categoryId}`)
  }

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

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-4">
        <div className="flex flex-col items-center">
          <img
            src="/logo.png"
            alt="What's Good Here"
            className="h-32 w-auto"
          />
          <p className="text-xs text-neutral-500 mt-1">Martha's Vineyard</p>
        </div>
      </header>

      {/* Location Picker */}
      <LocationPicker
        radius={radius}
        onRadiusChange={setRadius}
        location={location}
        error={locationError}
      />

      {/* Main Content */}
      <main className="pb-8">
        {/* Trending Now */}
        <section className="py-5">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-lg font-bold text-neutral-900 font-serif flex items-center gap-2">
              <span>🔥</span> Trending Now
            </h2>
          </div>

          {loading ? (
            <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64 h-40 bg-neutral-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
              {topDishes.slice(0, 5).map((dish) => (
                <DishCard
                  key={dish.dish_id}
                  dish={dish}
                  onClick={() => setSelectedDish(dish)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Best by Category */}
        {FEATURED_CATEGORIES.map((category) => {
          const categoryDishes = getTopByCategory(category.id)
          if (categoryDishes.length === 0 && !loading) return null

          return (
            <section key={category.id} className="py-5 border-t border-neutral-100">
              <div className="flex items-center justify-between px-4 mb-3">
                <h2 className="text-lg font-bold text-neutral-900 font-serif flex items-center gap-2">
                  <span>{category.emoji}</span> Best {category.label}
                </h2>
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className="text-orange-500 text-sm font-semibold"
                >
                  See all →
                </button>
              </div>

              {loading ? (
                <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-64 h-40 bg-neutral-200 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
                  {categoryDishes.map((dish) => (
                    <DishCard
                      key={dish.dish_id}
                      dish={dish}
                      onClick={() => setSelectedDish(dish)}
                    />
                  ))}
                  {categoryDishes.length > 0 && (
                    <button
                      onClick={() => handleCategoryClick(category.id)}
                      className="flex-shrink-0 w-32 h-40 bg-neutral-100 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-neutral-200 transition-colors"
                    >
                      <span className="text-2xl">{category.emoji}</span>
                      <span className="text-sm font-medium text-neutral-600">See all</span>
                    </button>
                  )}
                </div>
              )}
            </section>
          )
        })}

        {/* Top Rated Overall */}
        <section className="py-5 border-t border-neutral-100">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-lg font-bold text-neutral-900 font-serif flex items-center gap-2">
              <span>⭐</span> Top Rated Overall
            </h2>
            <button
              onClick={() => navigate('/browse')}
              className="text-orange-500 text-sm font-semibold"
            >
              See all →
            </button>
          </div>

          {loading ? (
            <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64 h-40 bg-neutral-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">
              {topDishes.map((dish) => (
                <DishCard
                  key={dish.dish_id}
                  dish={dish}
                  onClick={() => setSelectedDish(dish)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Dish Detail Modal */}
      {selectedDish && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedDish(null)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-stone-50 rounded-t-3xl animate-slide-up">
            {/* Close button */}
            <button
              onClick={() => setSelectedDish(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Dish Card */}
            <div className="p-4 pt-2">
              <FullDishCard
                dish={selectedDish}
                onVote={handleVote}
                onLoginRequired={handleLoginRequired}
                isFavorite={isSaved ? isSaved(selectedDish.dish_id) : false}
                onToggleFavorite={handleToggleSave}
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

// Compact horizontal dish card
function DishCard({ dish, onClick }) {
  const {
    dish_id,
    dish_name,
    category,
    image_url,
    photo_url,
    restaurant_name,
    percent_worth_it,
    total_votes,
  } = dish

  // Use photo_url if available, otherwise use category-based image
  const imgSrc = photo_url || getCategoryImage(category)

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-64 bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden text-left hover:shadow-md hover:border-orange-200 transition-all active:scale-[0.98]"
    >
      {/* Image */}
      <div className="relative h-28 bg-neutral-100">
        <img
          src={imgSrc}
          alt={dish_name}
          className="w-full h-full object-cover"
        />

        {/* Rating Badge */}
        {total_votes > 0 ? (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <span className="text-emerald-500 text-xs">👍</span>
            <span className="text-xs font-bold text-neutral-900">
              {Math.round(percent_worth_it)}%
            </span>
          </div>
        ) : (
          <div className="absolute top-2 right-2 bg-orange-500 px-2 py-1 rounded-full shadow-sm">
            <span className="text-xs font-medium text-white">Be first to rate!</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-neutral-900 text-sm truncate">
          {dish_name}
        </h3>
        <p className="text-xs text-neutral-500 truncate mt-0.5">
          {restaurant_name}
        </p>
        {total_votes > 0 && (
          <p className="text-xs text-neutral-400 mt-1">
            {total_votes} {total_votes === 1 ? 'vote' : 'votes'}
          </p>
        )}
      </div>
    </button>
  )
}
