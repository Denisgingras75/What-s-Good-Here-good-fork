import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useProfile } from '../hooks/useProfile'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { BROWSE_CATEGORIES, getCategoryNeonImage } from '../constants/categories'
import { SearchHero, Top10Compact } from '../components/home'
import { TownPicker } from '../components/TownPicker'
import { RadiusSheet } from '../components/LocationPicker'
import { LocationBanner } from '../components/LocationBanner'
import { NearbyNudge } from '../components/NearbyNudge'

export function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)

  const { location, radius, setRadius, town, setTown, permissionState, requestLocation } = useLocationContext()
  const [showRadiusSheet, setShowRadiusSheet] = useState(false)

  // Inline category filtering
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Fetch dishes with town filter
  const { dishes, loading, error } = useDishes(location, radius, null, null, town)

  const rankSort = (a, b) => {
    const aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
    const bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
    if (aRanked && !bRanked) return -1
    if (!aRanked && bRanked) return 1
    return (b.avg_rating || 0) - (a.avg_rating || 0)
  }

  // Top 10 dishes on the island (all categories)
  const top10Dishes = useMemo(() => {
    if (!dishes?.length) return []
    return dishes.slice().sort(rankSort).slice(0, 10)
  }, [dishes])

  // Category-filtered dishes
  const categoryDishes = useMemo(() => {
    if (!selectedCategory || !dishes?.length) return []
    return dishes
      .filter(dish => dish.category?.toLowerCase() === selectedCategory)
      .slice()
      .sort(rankSort)
      .slice(0, 10)
  }, [dishes, selectedCategory])

  const selectedCategoryLabel = selectedCategory
    ? BROWSE_CATEGORIES.find(c => c.id === selectedCategory)?.label
    : null

  // Personal Top 10 based on user's preferred categories
  const personalTop10Dishes = useMemo(() => {
    if (!dishes?.length || !profile?.preferred_categories?.length) return []

    const preferredCats = profile.preferred_categories.map(c => c.toLowerCase())

    return dishes
      .filter(dish => preferredCats.includes(dish.category?.toLowerCase()))
      .slice()
      .sort(rankSort)
      .slice(0, 10)
  }, [dishes, profile?.preferred_categories])

  // Whether to show the toggle (user is logged in and has preferences)
  const showPersonalToggle = !selectedCategory && user && profile?.preferred_categories?.length > 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <h1 className="sr-only">What's Good Here - Top Ranked Dishes Near You</h1>

      {/* Section 1: Hero with search, town filter, categories */}
      <SearchHero
        town={town}
        loading={loading}
        categoryScroll={
          <CategoryScroll
            town={town}
            onTownChange={setTown}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        }
      />

      {/* Section divider */}
      <div
        className="mx-4"
        style={{ borderTop: '1px solid var(--color-divider)' }}
      />

      {/* Nearby nudge — passive check-in */}
      <NearbyNudge />

      {/* Section 2: Top 10 */}
      <section className="px-4 py-6">
        {/* Location banner */}
        <LocationBanner
          permissionState={permissionState}
          requestLocation={requestLocation}
        />

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
            {/* Radius badge — contextual with the Top 10 list */}
            <div className="flex items-center justify-between mb-2">
              <span className="sr-only">Search radius: {radius} miles</span>
              <button
                onClick={() => setShowRadiusSheet(true)}
                aria-label={`Search radius: ${radius} miles. Tap to change`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-[0.97]"
                style={{
                  background: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-divider)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <svg
                  aria-hidden="true"
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span>{radius} mi</span>
                <svg
                  aria-hidden="true"
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <Top10Compact
              key={selectedCategory || 'top10'}
              dishes={selectedCategory ? categoryDishes : top10Dishes}
              personalDishes={personalTop10Dishes}
              showToggle={showPersonalToggle}
              town={town}
              categoryLabel={selectedCategoryLabel}
              onSeeAll={selectedCategory ? () => navigate(`/browse?category=${encodeURIComponent(selectedCategory)}`) : undefined}
            />
          </div>
        ) : (
          <EmptyState onBrowse={(path) => navigate(path || '/restaurants')} />
        )}

        {/* Browse all restaurants link */}
        {!loading && !error && top10Dishes.length > 0 && (
          <div className="max-w-lg mx-auto mt-4 text-center">
            <button
              onClick={() => navigate('/restaurants')}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-[0.97]"
              style={{
                color: 'var(--color-accent-gold)',
                background: 'rgba(217, 167, 101, 0.1)',
                border: '1px solid rgba(217, 167, 101, 0.2)',
                boxShadow: '0 0 20px rgba(217, 167, 101, 0.08)',
              }}
            >
              Browse all restaurants
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        )}
      </section>

      <RadiusSheet
        isOpen={showRadiusSheet}
        onClose={() => setShowRadiusSheet(false)}
        radius={radius}
        onRadiusChange={setRadius}
      />
    </div>
  )
}

const scrollStyle = {
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  WebkitOverflowScrolling: 'touch',
}

function CategoryScroll({ town, onTownChange, selectedCategory, onCategoryChange }) {
  const [townPickerOpen, setTownPickerOpen] = useState(false)

  if (townPickerOpen) {
    return (
      <div className="flex items-center gap-2.5 overflow-x-auto px-4 pb-1" style={scrollStyle}>
        <TownPicker
          town={town}
          onTownChange={onTownChange}
          isOpen
          onToggle={setTownPickerOpen}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2.5 px-4 pb-1">
      <TownPicker
        town={town}
        onTownChange={onTownChange}
        isOpen={false}
        onToggle={setTownPickerOpen}
      />
      <div className="flex items-center gap-2.5 overflow-x-auto" style={scrollStyle}>
        {BROWSE_CATEGORIES.map((category) => (
          <CategoryPill
            key={category.id}
            category={category}
            isActive={selectedCategory === category.id}
            onClick={() => onCategoryChange(prev => prev === category.id ? null : category.id)}
          />
        ))}
      </div>
    </div>
  )
}

function CategoryPill({ category, isActive, onClick }) {
  const imageSrc = getCategoryNeonImage(category.id)
  const [loaded, setLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full text-sm font-medium transition-all active:scale-[0.97]"
      style={{
        background: isActive ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
        color: isActive ? 'white' : 'var(--color-text-secondary)',
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
    <div className="max-w-lg mx-auto animate-pulse">
      <div className="h-4 w-48 rounded mb-1" style={{ background: 'var(--color-surface-elevated)' }} />
      <div className="h-5 w-36 rounded mb-4" style={{ background: 'var(--color-surface-elevated)' }} />
      <div className="space-y-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 px-3 rounded-lg mb-1.5" style={{ background: 'var(--color-surface-elevated)' }}>
            <div className="w-6 h-6 rounded-full" style={{ background: 'var(--color-surface)' }} />
            <div className="flex-1">
              <div className="h-4 w-32 rounded mb-1" style={{ background: 'var(--color-surface)' }} />
              <div className="h-3 w-24 rounded" style={{ background: 'var(--color-surface)' }} />
            </div>
            <div className="h-5 w-8 rounded" style={{ background: 'var(--color-surface)' }} />
          </div>
        ))}
        {[...Array(7)].map((_, i) => (
          <div key={i + 3} className="flex items-center gap-3 py-2.5 px-2" style={{ opacity: 0.6 }}>
            <div className="w-6 h-4 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
            <div className="flex-1">
              <div className="h-3.5 w-28 rounded mb-1" style={{ background: 'var(--color-surface-elevated)' }} />
              <div className="h-3 w-20 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
            </div>
            <div className="h-4 w-7 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
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
        Try selecting a different town or expanding your radius
      </p>
      <button
        onClick={() => onBrowse('/restaurants')}
        className="mt-4 px-6 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-90"
        style={{ background: 'var(--color-primary)', color: 'white' }}
      >
        Browse Restaurants
      </button>
    </div>
  )
}
