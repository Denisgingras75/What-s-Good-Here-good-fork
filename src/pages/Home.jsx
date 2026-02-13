import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useProfile } from '../hooks/useProfile'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { BROWSE_CATEGORIES, getCategoryNeonImage } from '../constants/categories'
import { SearchHero, Top10Compact } from '../components/home'

export function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)

  const { location, radius, town, setTown } = useLocationContext()

  // Fetch dishes with town filter
  const { dishes, loading, error } = useDishes(location, radius, null, null, town)

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

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <h1 className="sr-only">What's Good Here - Top Ranked Dishes Near You</h1>

      {/* Section 1: Hero with search, town filter, categories */}
      <SearchHero
        town={town}
        onTownChange={setTown}
        loading={loading}
        categoryScroll={
          <div
            className="flex gap-2.5 overflow-x-auto px-4 pb-1"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {BROWSE_CATEGORIES.map((category) => (
              <CategoryPill
                key={category.id}
                category={category}
                onClick={() => navigate(`/browse?category=${encodeURIComponent(category.id)}`)}
              />
            ))}
          </div>
        }
      />

      {/* Section 2: Top 10 */}
      <section className="px-4 py-6">
        {loading ? (
          <Top10Skeleton />
        ) : error ? (
          <div className="py-8 text-center">
            <p role="alert" className="text-sm" style={{ color: 'var(--color-danger)' }}>
              {error?.message || error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg"
              style={{ background: 'var(--color-primary)', color: 'white' }}
            >
              Retry
            </button>
          </div>
        ) : top10Dishes.length > 0 ? (
          <div className="max-w-lg mx-auto">
            <Top10Compact
              dishes={top10Dishes}
              personalDishes={personalTop10Dishes}
              showToggle={showPersonalToggle}
              initialCount={3}
              town={town}
            />
          </div>
        ) : (
          <EmptyState onBrowse={() => navigate('/browse')} />
        )}
      </section>
    </div>
  )
}

function CategoryPill({ category, onClick }) {
  const imageSrc = getCategoryNeonImage(category.id)
  const [loaded, setLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full text-sm font-medium transition-all active:scale-[0.97]"
      style={{
        background: 'var(--color-surface-elevated)',
        color: 'var(--color-text-secondary)',
      }}
    >
      {imageSrc && !imgError ? (
        <img
          src={imageSrc}
          alt=""
          className="w-6 h-6 rounded-full object-cover"
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
          style={{ background: 'var(--color-surface)' }}
        >
          {category.emoji}
        </span>
      )}
      {category.label}
    </button>
  )
}

// Skeleton for Top 10 section while loading
function Top10Skeleton() {
  return (
    <div
      className="rounded-2xl p-4 max-w-lg mx-auto animate-pulse"
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-divider)',
      }}
    >
      <div className="h-6 w-48 rounded mb-4" style={{ background: 'var(--color-surface-elevated)' }} />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full" style={{ background: 'var(--color-surface-elevated)' }} />
            <div className="flex-1">
              <div className="h-4 w-32 rounded mb-1" style={{ background: 'var(--color-surface-elevated)' }} />
              <div className="h-3 w-24 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
            </div>
            <div className="h-5 w-8 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Empty state when no dishes found
function EmptyState({ onBrowse }) {
  return (
    <div className="py-12 text-center">
      <img
        src="/search-not-found.png"
        alt=""
        className="w-16 h-16 mx-auto mb-4 rounded-full object-cover"
      />
      <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
        No dishes found
      </p>
      <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
        Try selecting a different town
      </p>
      <button
        onClick={onBrowse}
        className="mt-4 px-6 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-90"
        style={{ background: 'var(--color-primary)', color: 'white' }}
      >
        Browse All Dishes
      </button>
    </div>
  )
}
