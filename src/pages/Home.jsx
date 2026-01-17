import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { LocationPicker } from '../components/LocationPicker'
import { DishSearch } from '../components/DishSearch'
import { getCategoryImage } from '../constants/categoryImages'

const MIN_VOTES_FOR_RANKING = 5

// Featured categories for homepage - these are the "hero" categories
const FEATURED_CATEGORIES = [
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'burger', label: 'Burger', emoji: '🍔' },
  { id: 'lobster roll', label: 'Lobster Roll', emoji: '🦞' },
  { id: 'seafood', label: 'Seafood', emoji: '🦐' },
]

export function Home() {
  const navigate = useNavigate()

  const {
    location,
    radius,
    setRadius,
    error: locationError,
    permissionState,
    isUsingDefault,
    requestLocation,
    useDefaultLocation,
    loading: locationLoading
  } = useLocationContext()

  // Fetch ALL dishes once, then filter by category client-side
  const { dishes, loading, error } = useDishes(location, radius, null, null)

  // Group dishes by category and get top 3 for each featured category
  const categoryRankings = useMemo(() => {
    if (!dishes?.length) return []

    return FEATURED_CATEGORIES.map(category => {
      // Filter dishes for this category
      const categoryDishes = dishes.filter(d =>
        d.category?.toLowerCase() === category.id.toLowerCase()
      )

      // Sort by avg_rating (ranked dishes first, then by score)
      const sorted = [...categoryDishes].sort((a, b) => {
        const aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
        const bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
        if (aRanked && !bRanked) return -1
        if (!aRanked && bRanked) return 1
        return (b.avg_rating || 0) - (a.avg_rating || 0)
      })

      // Take top 3
      const topDishes = sorted.slice(0, 3)

      return {
        ...category,
        dishes: topDishes,
        totalCount: categoryDishes.length,
      }
    }).filter(cat => cat.dishes.length > 0) // Only show categories with dishes
  }, [dishes])

  // Top 10 dishes on the island (all categories)
  const top10Dishes = useMemo(() => {
    if (!dishes?.length) return []

    return [...dishes].sort((a, b) => {
      const aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
      const bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
      if (aRanked && !bRanked) return -1
      if (!aRanked && bRanked) return 1
      return (b.avg_rating || 0) - (a.avg_rating || 0)
    }).slice(0, 10)
  }, [dishes])

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      {/* Header */}
      <header className="py-3" style={{ background: 'var(--color-bg)' }}>
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="What's Good Here"
            className="h-12 md:h-14 lg:h-16 w-auto"
          />
        </div>
      </header>

      {/* Location Picker */}
      <LocationPicker
        radius={radius}
        onRadiusChange={setRadius}
        location={location}
        error={locationError}
        permissionState={permissionState}
        isUsingDefault={isUsingDefault}
        onRequestLocation={requestLocation}
        onUseDefault={useDefaultLocation}
        loading={locationLoading}
      />

      {/* Search Bar */}
      <div className="px-4 py-3" style={{ background: 'var(--color-bg)' }}>
        <DishSearch dishes={dishes} loading={loading} />
        <p className="text-center text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
          Ranked by votes from locals & visitors
        </p>
      </div>

      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error.message || error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg"
              style={{ background: 'var(--color-primary)', color: 'white' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Category Rankings + Top 10 Sidebar */}
        {!loading && !error && (
          <div className="lg:flex lg:gap-8">
            {/* Left: Category Rankings */}
            <div className="flex-1 space-y-8">
              {categoryRankings.map(category => (
                <CategoryRanking
                  key={category.id}
                  category={category}
                  onViewAll={() => navigate(`/browse?category=${encodeURIComponent(category.id)}`)}
                />
              ))}

              {/* Empty state if no categories have dishes */}
              {categoryRankings.length === 0 && (
                <div className="py-12 text-center">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-bg)' }}
                  >
                    <span className="text-2xl">🔍</span>
                  </div>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    No dishes found nearby
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    Try increasing your search radius
                  </p>
                </div>
              )}

              {/* All Categories Link */}
              {categoryRankings.length > 0 && (
                <div className="pt-4 text-center lg:text-left">
                  <button
                    onClick={() => navigate('/browse')}
                    className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    style={{
                      color: 'var(--color-text-secondary)',
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-divider)'
                    }}
                  >
                    Find the best of something else →
                  </button>
                </div>
              )}
            </div>

            {/* Right: Top 10 Sidebar (desktop) / Below (mobile) */}
            {top10Dishes.length > 0 && (
              <Top10Sidebar dishes={top10Dishes} />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// Category ranking section
function CategoryRanking({ category, onViewAll }) {
  const { label, dishes, totalCount } = category

  return (
    <section>
      {/* Category Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Best {label} near you
        </h2>
        {totalCount > 3 && (
          <button
            onClick={onViewAll}
            className="text-xs font-medium"
            style={{ color: 'var(--color-primary)' }}
          >
            See all {totalCount} →
          </button>
        )}
      </div>

      {/* Top Dishes */}
      <div className="space-y-2">
        {dishes.map((dish, index) => (
          <RankedDishRow
            key={dish.dish_id}
            dish={dish}
            rank={index + 1}
          />
        ))}
      </div>
    </section>
  )
}

// Compact dish row for homepage rankings
function RankedDishRow({ dish, rank }) {
  const navigate = useNavigate()
  const {
    dish_id,
    dish_name,
    restaurant_name,
    category,
    photo_url,
    avg_rating,
    total_votes,
    distance_miles,
  } = dish

  const imgSrc = photo_url || getCategoryImage(category)
  const isRanked = (total_votes || 0) >= MIN_VOTES_FOR_RANKING

  const handleClick = () => {
    navigate(`/dish/${dish_id}`)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.99] group"
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-divider)'
      }}
    >
      {/* Rank Badge */}
      <div className="relative flex-shrink-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm"
          style={{
            background: rank === 1 ? 'var(--color-primary)' : 'var(--color-surface)',
            color: rank === 1 ? 'white' : 'var(--color-text-tertiary)',
          }}
        >
          {rank}
        </div>
        {/* Winner badge for #1 with enough votes */}
        {rank === 1 && isRanked && (
          <div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-warning, #f59e0b)' }}
          >
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        )}
      </div>

      {/* Photo */}
      <div
        className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
        style={{ background: 'var(--color-surface)' }}
      >
        <img
          src={imgSrc}
          alt={dish_name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dish Info */}
      <div className="flex-1 min-w-0 text-left">
        <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
          {dish_name}
        </h3>
        <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
          {restaurant_name}
          {distance_miles && ` · ${Number(distance_miles).toFixed(1)} mi`}
        </p>
      </div>

      {/* Rating */}
      <div className="flex-shrink-0 text-right">
        {isRanked ? (
          <div className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
            {avg_rating ? `${avg_rating}/10` : '—'}
          </div>
        ) : (
          <div
            className="text-[10px] font-medium px-2 py-1 rounded-full"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-text-tertiary)',
            }}
          >
            {total_votes || 0}/{MIN_VOTES_FOR_RANKING} votes
          </div>
        )}
      </div>

      {/* Chevron */}
      <svg
        className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5"
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

// Loading skeleton for category section
function CategorySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-48 rounded mb-3" style={{ background: 'var(--color-divider)' }} />
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl"
            style={{ background: 'var(--color-divider)' }}
          />
        ))}
      </div>
    </div>
  )
}

// Top 10 Sidebar
function Top10Sidebar({ dishes }) {
  const navigate = useNavigate()

  return (
    <aside className="mt-8 lg:mt-0 lg:w-72 lg:flex-shrink-0">
      <div
        className="rounded-2xl p-4 lg:sticky lg:top-4"
        style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-divider)',
        }}
      >
        <h3 className="font-bold text-base mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Top 10 on the Island
        </h3>
        <div className="space-y-1">
          {dishes.map((dish, index) => (
            <Top10Row
              key={dish.dish_id}
              dish={dish}
              rank={index + 1}
              onClick={() => navigate(`/dish/${dish.dish_id}`)}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}

// Compact row for Top 10 sidebar
function Top10Row({ dish, rank, onClick }) {
  const { dish_name, restaurant_name, avg_rating, total_votes } = dish
  const isRanked = (total_votes || 0) >= MIN_VOTES_FOR_RANKING

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-neutral-50 transition-colors text-left group"
    >
      {/* Rank */}
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          background: rank <= 3 ? 'var(--color-primary)' : 'var(--color-surface)',
          color: rank <= 3 ? 'white' : 'var(--color-text-tertiary)',
        }}
      >
        {rank}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
          {dish_name}
        </p>
        <p className="text-xs truncate" style={{ color: 'var(--color-text-tertiary)' }}>
          {restaurant_name}
        </p>
      </div>

      {/* Rating or vote count */}
      <div className="flex-shrink-0">
        {isRanked ? (
          <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
            {avg_rating}/10
          </span>
        ) : (
          <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
            {total_votes || 0}/5
          </span>
        )}
      </div>
    </button>
  )
}
