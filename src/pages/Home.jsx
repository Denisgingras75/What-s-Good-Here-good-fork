import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from '../hooks/useLocation'
import { useDishes } from '../hooks/useDishes'
import { LocationPicker } from '../components/LocationPicker'
import { LoginModal } from '../components/Auth/LoginModal'
import { getCategoryImage } from '../constants/categoryImages'

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

  const { location, radius, setRadius, error: locationError } = useLocation()
  const { dishes, loading, error, refetch } = useDishes(
    location,
    radius,
    null,
    null
  )

  // Get top dishes overall
  const topDishes = dishes?.slice(0, 10) || []

  // Get top 3 dishes per category
  const getTopByCategory = (categoryId) => {
    return dishes?.filter(d => d.category === categoryId).slice(0, 3) || []
  }

  const handleCategoryClick = (categoryId) => {
    navigate(`/browse?category=${categoryId}`)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="text-xl">🍽️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 font-serif">
              What's Good Here
            </h1>
            <p className="text-xs text-neutral-500">Martha's Vineyard</p>
          </div>
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
                <DishCard key={dish.dish_id} dish={dish} />
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
                    <DishCard key={dish.dish_id} dish={dish} />
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
                <DishCard key={dish.dish_id} dish={dish} />
              ))}
            </div>
          )}
        </section>
      </main>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  )
}

// Compact horizontal dish card
function DishCard({ dish }) {
  const {
    dish_id,
    dish_name,
    category,
    image_url,
    restaurant_name,
    percent_worth_it,
    total_votes,
  } = dish

  return (
    <div className="flex-shrink-0 w-64 bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Image */}
      <div className="relative h-28 bg-neutral-100">
        {image_url ? (
          <img
            src={image_url}
            alt={dish_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
            <span className="text-4xl opacity-50">🍽️</span>
          </div>
        )}

        {/* Rating Badge */}
        {total_votes > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <span className="text-emerald-500 text-xs">👍</span>
            <span className="text-xs font-bold text-neutral-900">
              {Math.round(percent_worth_it)}%
            </span>
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
    </div>
  )
}
