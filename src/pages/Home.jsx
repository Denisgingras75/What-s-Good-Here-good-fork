import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useProfile } from '../hooks/useProfile'
import { LocationPicker } from '../components/LocationPicker'
import { DishSearch } from '../components/DishSearch'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { RankedDishRow, Top10Sidebar, CategorySkeleton } from '../components/home'

// Featured categories for homepage - these are the "hero" categories
const FEATURED_CATEGORIES = [
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'burger', label: 'Burger', emoji: '🍔' },
  { id: 'lobster roll', label: 'Lobster Roll', emoji: '🦞' },
  { id: 'seafood', label: 'Seafood', emoji: '🦐' },
]

export function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)
  const [top10Tab, setTop10Tab] = useState('mv') // 'mv' or 'personal'

  const { location, radius, setRadius } = useLocationContext()

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
      const sorted = categoryDishes.slice().sort((a, b) => {
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

    return dishes.slice().sort((a, b) => {
      const aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
      const bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
      if (aRanked && !bRanked) return -1
      if (!aRanked && bRanked) return 1
      return (b.avg_rating || 0) - (a.avg_rating || 0)
    }).slice(0, 10)
  }, [dishes])

  // Personal Top 10 based on user's preferred categories
  const personalTop10Dishes = useMemo(() => {
    if (!dishes?.length || !profile?.preferred_categories?.length) return []

    const preferredCats = profile.preferred_categories.map(c => c.toLowerCase())

    return dishes
      .filter(dish => preferredCats.includes(dish.category?.toLowerCase()))
      .slice()
      .sort((a, b) => {
        const aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
        const bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
        if (aRanked && !bRanked) return -1
        if (!aRanked && bRanked) return 1
        return (b.avg_rating || 0) - (a.avg_rating || 0)
      })
      .slice(0, 10)
  }, [dishes, profile?.preferred_categories])

  // Whether to show the toggle (user is logged in and has preferences)
  const showPersonalToggle = user && profile?.preferred_categories?.length > 0

  // Which dishes to show in sidebar based on active tab
  const activeDishes = top10Tab === 'personal' && showPersonalToggle
    ? personalTop10Dishes
    : top10Dishes

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      {/* Header - hero logo with presence */}
      <header className="px-4 pt-8 pb-4 flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <img
          src="/logo.png"
          alt="What's Good Here"
          className="h-[100px] md:h-[120px] lg:h-[140px] w-auto object-contain"
        />
      </header>

      {/* Radius Picker */}
      <LocationPicker
        radius={radius}
        onRadiusChange={setRadius}
      />

      {/* Greeting + Search */}
      <div className="px-4 py-4" style={{ background: 'var(--color-bg)' }}>
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Hello{profile?.display_name ? `, ${profile.display_name}` : ''}!
        </h2>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          What do you want to eat today?
        </p>
        <DishSearch loading={loading} />
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        <h1 className="sr-only">What's Good Here - Top Ranked Dishes Near You</h1>
        {/* Loading State */}
        {loading && (
          <div className="space-y-8" aria-live="polite" aria-label="Loading categories">
            {[...Array(3)].map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-12 text-center">
            <p role="alert" className="text-sm" style={{ color: 'var(--color-danger)' }}>{error?.message || error}</p>
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
                  <button
                    onClick={() => navigate('/browse')}
                    className="mt-4 px-6 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ background: 'var(--color-primary)', color: 'white' }}
                  >
                    Browse All Dishes
                  </button>
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
            {activeDishes.length > 0 && (
              <Top10Sidebar
                dishes={activeDishes}
                showToggle={showPersonalToggle}
                activeTab={top10Tab}
                onTabChange={setTop10Tab}
              />
            )}
          </div>
        )}

      </div>
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
