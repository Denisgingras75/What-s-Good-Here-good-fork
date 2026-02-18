import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useProfile } from '../hooks/useProfile'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { BROWSE_CATEGORIES } from '../constants/categories'
import { NearbyDiscovery } from '../components/home'
import { DishSearch } from '../components/DishSearch'
import { RadiusSheet } from '../components/LocationPicker'
import { NearbyNudge } from '../components/NearbyNudge'

// Map category IDs to emojis for the grid
const HOME_CATEGORIES = [
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'burger', label: 'Burgers', emoji: '🍔' },
  { id: 'sandwich', label: 'Sandwiches', emoji: '🥪' },
  { id: 'wings', label: 'Wings', emoji: '🍗' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣' },
  { id: 'taco', label: 'Tacos', emoji: '🌮' },
]

export function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)

  const { location, radius, setRadius, town, permissionState } = useLocationContext()
  const [showRadiusSheet, setShowRadiusSheet] = useState(false)

  const { dishes, loading, error } = useDishes(location, radius, null, null, town)

  const rankSort = (a, b) => {
    const aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
    const bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
    if (aRanked && !bRanked) return -1
    if (!aRanked && bRanked) return 1
    return (b.avg_rating || 0) - (a.avg_rating || 0)
  }

  // Top 10 dishes
  const top10Dishes = useMemo(() => {
    if (!dishes?.length) return []
    return dishes.slice().sort(rankSort).slice(0, 10)
  }, [dishes])

  // "More Top Picks" — dishes 11-20
  const moreTopPicks = useMemo(() => {
    if (!dishes?.length) return []
    return dishes.slice().sort(rankSort).slice(10, 20)
  }, [dishes])

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--color-bg)' }}>
      <h1 className="sr-only">What's Good Here - Top Ranked Dishes Near You</h1>

      {/* Header: Logo */}
      <header className="px-5 pt-6 pb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--color-primary)' }}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <h2
            className="font-bold"
            style={{ color: 'var(--color-text-primary)', fontSize: '22px', letterSpacing: '-0.02em' }}
          >
            What&apos;s Good Here
          </h2>
        </div>
      </header>

      {/* Search bar */}
      <div className="px-5 py-3">
        <DishSearch loading={loading} placeholder="What are you craving?" town={town} />
      </div>

      {/* Category Grid — 2x3 bold cards */}
      <section className="px-5 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {HOME_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/browse?category=${encodeURIComponent(cat.id)}`)}
              className="flex flex-col items-center justify-center py-5 rounded-2xl transition-all active:scale-[0.96]"
              style={{
                background: 'var(--color-card)',
                border: '2px solid var(--color-card-border, #1A1A1A)',
              }}
            >
              <span style={{ fontSize: '32px' }}>{cat.emoji}</span>
              <span
                className="mt-2 text-sm font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        {/* See all categories link */}
        <button
          onClick={() => navigate('/browse')}
          className="w-full mt-3 py-2 text-sm font-semibold text-center rounded-xl transition-all active:scale-[0.98]"
          style={{
            color: 'var(--color-primary)',
            border: '2px solid var(--color-card-border, #1A1A1A)',
          }}
        >
          See all categories
        </button>
      </section>

      {/* Nearby nudge */}
      <NearbyNudge />

      {/* Locals' Top 10 */}
      <section className="px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="font-bold"
            style={{ color: 'var(--color-primary)', fontSize: '22px', letterSpacing: '-0.02em' }}
          >
            Locals&apos; Top 10
          </h2>
          <button
            onClick={() => setShowRadiusSheet(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-[0.97]"
            style={{
              border: '2px solid var(--color-card-border, #1A1A1A)',
              color: 'var(--color-text-primary)',
            }}
          >
            {radius} mi
          </button>
        </div>

        {loading ? (
          <Top10Skeleton />
        ) : error ? (
          <div className="py-8 text-center">
            <p role="alert" className="text-sm font-medium" style={{ color: 'var(--color-danger)' }}>
              {error?.message || error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-5 py-2 text-sm font-bold rounded-xl"
              style={{ background: 'var(--color-primary)', color: 'white' }}
            >
              Retry
            </button>
          </div>
        ) : top10Dishes.length > 0 ? (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '2px solid var(--color-card-border, #1A1A1A)' }}
          >
            {top10Dishes.map((dish, i) => (
              <button
                key={dish.id}
                onClick={() => navigate(`/dish/${dish.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
                style={{
                  borderBottom: i < top10Dishes.length - 1 ? '1px solid var(--color-divider)' : 'none',
                }}
              >
                {/* Rank number */}
                <span
                  className="w-7 text-center font-bold flex-shrink-0"
                  style={{
                    color: i < 3 ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                    fontSize: i < 3 ? '18px' : '15px',
                  }}
                >
                  {i + 1}
                </span>

                {/* Dish info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-bold truncate"
                    style={{ color: 'var(--color-text-primary)', fontSize: '15px' }}
                  >
                    {dish.name}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    {dish.restaurant_name}
                  </p>
                </div>

                {/* Star rating */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <StarRating rating={dish.avg_rating} />
                </div>

                {/* Category emoji */}
                <span className="text-lg flex-shrink-0">
                  {getCategoryEmoji(dish.category)}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <>
            <EmptyState onBrowse={(path) => navigate(path || '/restaurants')} />
            <NearbyDiscovery />
          </>
        )}
      </section>

      {/* More Top Picks — horizontal scroll cards */}
      {!loading && moreTopPicks.length > 0 && (
        <section className="py-4">
          <h2
            className="px-5 font-bold mb-3"
            style={{ color: 'var(--color-text-primary)', fontSize: '20px', letterSpacing: '-0.02em' }}
          >
            More Top Picks
          </h2>
          <div
            className="flex gap-3 px-5 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {moreTopPicks.map((dish) => (
              <button
                key={dish.id}
                onClick={() => navigate(`/dish/${dish.id}`)}
                className="flex-shrink-0 w-44 rounded-2xl overflow-hidden text-left transition-all active:scale-[0.97]"
                style={{ border: '2px solid var(--color-card-border, #1A1A1A)' }}
              >
                {/* Food icon area */}
                <div
                  className="h-28 flex items-center justify-center"
                  style={{ background: 'var(--color-surface-elevated)' }}
                >
                  <span style={{ fontSize: '48px' }}>{getCategoryEmoji(dish.category)}</span>
                </div>
                <div className="p-3">
                  <p
                    className="font-bold truncate"
                    style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}
                  >
                    {dish.name}
                  </p>
                  <p
                    className="text-xs truncate mt-0.5"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    {dish.restaurant_name}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <StarRating rating={dish.avg_rating} size="sm" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Browse all button */}
      {!loading && !error && top10Dishes.length > 0 && (
        <div className="px-5 pb-6 text-center">
          <button
            onClick={() => navigate('/browse')}
            className="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
            style={{
              background: 'var(--color-primary)',
              color: 'white',
            }}
          >
            Browse all dishes
          </button>
        </div>
      )}

      <RadiusSheet
        isOpen={showRadiusSheet}
        onClose={() => setShowRadiusSheet(false)}
        radius={radius}
        onRadiusChange={setRadius}
      />
    </div>
  )
}

// Star rating component matching mockup
function StarRating({ rating, size = 'md' }) {
  const stars = 5
  const normalizedRating = Math.min(5, Math.max(0, (rating || 0) / 2)) // Convert 10-scale to 5-scale
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(stars)].map((_, i) => {
        const filled = i < Math.round(normalizedRating)
        return (
          <svg
            key={i}
            className={starSize}
            viewBox="0 0 20 20"
            fill={filled ? 'var(--color-primary)' : 'var(--color-divider)'}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )
      })}
    </div>
  )
}

// Map category to emoji
function getCategoryEmoji(category) {
  if (!category) return '🍽️'
  const cat = BROWSE_CATEGORIES.find(c => c.id === category.toLowerCase())
  return cat?.emoji || '🍽️'
}

// Skeleton for Top 10
function Top10Skeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ border: '2px solid var(--color-divider)' }}
    >
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ borderBottom: i < 4 ? '1px solid var(--color-divider)' : 'none' }}
        >
          <div className="w-7 h-5 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
          <div className="flex-1">
            <div className="h-4 w-32 rounded mb-1" style={{ background: 'var(--color-surface-elevated)' }} />
            <div className="h-3 w-24 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
          </div>
          <div className="h-4 w-16 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
        </div>
      ))}
    </div>
  )
}

// Empty state
function EmptyState({ onBrowse }) {
  return (
    <div
      className="py-10 text-center rounded-2xl"
      style={{ border: '2px solid var(--color-divider)' }}
    >
      <span style={{ fontSize: '40px' }}>🍽️</span>
      <p className="font-bold mt-3" style={{ color: 'var(--color-text-primary)', fontSize: '16px' }}>
        No dishes rated here yet
      </p>
      <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
        Be the first to rate a dish nearby
      </p>
      <button
        onClick={() => onBrowse('/restaurants')}
        className="mt-4 px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97]"
        style={{ background: 'var(--color-primary)', color: 'white' }}
      >
        Browse Restaurants
      </button>
    </div>
  )
}
