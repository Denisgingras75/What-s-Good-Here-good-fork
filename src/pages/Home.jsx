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
  const topDishes = dishes?.slice(0, 3) || []

  // Get top 2 dishes per category
  const getTopByCategory = (categoryId) => {
    return dishes?.filter(d => d.category === categoryId).slice(0, 2) || []
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
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      {/* Hero Section */}
      <header className="px-4 py-6" style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-divider)' }}>
        <div className="flex flex-col items-center text-center">
          <img
            src="/logo.png"
            alt="What's Good Here"
            className="h-16 w-auto mb-4"
          />
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Find the best dishes near you.
          </h1>
          <p className="mb-6 max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Real ratings by people on Martha's Vineyard.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/browse')}
            className="w-full max-w-xs px-6 py-3 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg"
            style={{ background: 'var(--color-primary)' }}
          >
            Find food near me
          </button>
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
      <main className="px-4 py-6 space-y-8">
        {/* Trending Now */}
        <section>
          <SectionHeader
            emoji="🔥"
            title="Trending Now"
            onSeeAll={() => navigate('/browse')}
          />

          {loading ? (
            <LoadingCards count={3} />
          ) : (
            <div className="space-y-3">
              {topDishes.map((dish, index) => (
                <VerticalDishCard
                  key={dish.dish_id}
                  dish={dish}
                  rank={index + 1}
                  onClick={() => setSelectedDish(dish)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Category Sections */}
        {FEATURED_CATEGORIES.map((category) => {
          const categoryDishes = getTopByCategory(category.id)
          if (categoryDishes.length === 0 && !loading) return null

          return (
            <section key={category.id}>
              <SectionHeader
                emoji={category.emoji}
                title={`Best ${category.label}`}
                onSeeAll={() => handleCategoryClick(category.id)}
              />

              {loading ? (
                <LoadingCards count={2} />
              ) : (
                <div className="space-y-3">
                  {categoryDishes.map((dish, index) => (
                    <VerticalDishCard
                      key={dish.dish_id}
                      dish={dish}
                      rank={index + 1}
                      onClick={() => setSelectedDish(dish)}
                    />
                  ))}
                </div>
              )}
            </section>
          )
        })}
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
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl animate-slide-up" style={{ background: 'var(--color-surface)' }}>
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

// Section header component
function SectionHeader({ emoji, title, onSeeAll }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
        <span>{emoji}</span> {title}
      </h2>
      <button
        onClick={onSeeAll}
        className="text-sm font-semibold"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        See all →
      </button>
    </div>
  )
}

// Loading placeholder cards
function LoadingCards({ count }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-xl animate-pulse"
          style={{ background: 'var(--color-divider)' }}
        />
      ))}
    </div>
  )
}

// Vertical dish card - compact and clean
function VerticalDishCard({ dish, rank, onClick }) {
  const {
    dish_name,
    category,
    photo_url,
    restaurant_name,
    percent_worth_it,
    total_votes,
  } = dish

  const imgSrc = photo_url || getCategoryImage(category)

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-3 rounded-xl border transition-all hover:shadow-md active:scale-[0.99]"
      style={{
        background: 'var(--color-bg)',
        borderColor: 'var(--color-divider)'
      }}
    >
      {/* Rank Badge */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
        style={{
          background: rank === 1 ? 'var(--color-primary)' : 'var(--color-surface)',
          color: rank === 1 ? 'white' : 'var(--color-text-secondary)',
          border: rank === 1 ? 'none' : '1px solid var(--color-divider)'
        }}
      >
        {rank}
      </div>

      {/* Image */}
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--color-surface)' }}>
        <img
          src={imgSrc}
          alt={dish_name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 text-left">
        <h3 className="font-semibold text-sm line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>
          {dish_name}
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          {restaurant_name}
        </p>
        {/* Rating info - subtle secondary line */}
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
          {total_votes === 0
            ? 'Be first to rate'
            : total_votes < 10
              ? `${total_votes} ${total_votes === 1 ? 'vote' : 'votes'}`
              : `👍 ${Math.round(percent_worth_it)}% · ${total_votes} votes`
          }
        </p>
      </div>

      {/* Arrow */}
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}
