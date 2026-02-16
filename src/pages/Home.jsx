import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useDishSearch } from '../hooks/useDishSearch'
import { useProfile } from '../hooks/useProfile'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { BROWSE_CATEGORIES, getCategoryNeonImage } from '../constants/categories'
import { SearchHero, Top10Compact } from '../components/home'
import { TownPicker } from '../components/TownPicker'

export function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)

  const { location, radius, town, setTown } = useLocationContext()

  // Inline category filtering
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Inline search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLimit, setSearchLimit] = useState(10)
  const handleSearchChange = useCallback((q) => {
    setSearchQuery(q)
    setSearchLimit(10)
    if (q) setSelectedCategory(null)
  }, [])
  const { results: searchResults, loading: searchLoading } = useDishSearch(searchQuery, searchLimit, town)
  const hasMoreResults = searchResults.length === searchLimit

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

  // Personal toggle disabled for now — re-enable later
  // const showPersonalToggle = !selectedCategory && user && profile?.preferred_categories?.length > 0
  const showPersonalToggle = false

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <h1 className="sr-only">What's Good Here - Top Ranked Dishes Near You</h1>

      {/* Section 1: Hero with search, town filter, categories */}
      <SearchHero
        town={town}
        loading={loading}
        onSearchChange={handleSearchChange}
        categoryScroll={
          <CategoryNav
            town={town}
            onTownChange={setTown}
            selectedCategory={selectedCategory}
            onCategoryChange={(cat) => {
              setSelectedCategory(cat)
              if (cat) setSearchQuery('')
            }}
          />
        }
      />

      {/* Section 2: Top 10 / Search Results */}
      <section className="px-4 pt-8 pb-6" style={{ background: 'var(--color-surface)' }}>
        {searchQuery ? (
          <div className="max-w-lg mx-auto">
            {searchLoading ? (
              <Top10Skeleton />
            ) : searchResults.length > 0 ? (
              <>
                <Top10Compact
                  key={`search-${searchQuery}`}
                  dishes={searchResults}
                  town={town}
                  categoryLabel={`"${searchQuery}"`}
                />
                {hasMoreResults && (
                  <button
                    onClick={() => setSearchLimit(prev => prev + 10)}
                    className="w-full mt-3 py-3 text-sm font-medium rounded-xl transition-opacity hover:opacity-70"
                    style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-accent-gold)' }}
                  >
                    Show more
                  </button>
                )}
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  No dishes found for "{searchQuery}"
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Try a different search
                </p>
              </div>
            )}
          </div>
        ) : loading ? (
          <Top10Skeleton />
        ) : error ? (
          <div className="py-8 text-center">
            <p role="alert" className="text-sm" style={{ color: 'var(--color-danger)' }}>
              {error?.message || error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg"
              style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
            >
              Retry
            </button>
          </div>
        ) : top10Dishes.length > 0 ? (
          <div className="max-w-lg mx-auto">
            {/* #1 Hero — only for the main Top 10, not category filtered */}
            {!selectedCategory && top10Dishes[0] && (
              <NumberOneHero dish={top10Dishes[0]} town={town} onClick={() => navigate(`/dish/${top10Dishes[0].dish_id}`)} />
            )}
            <Top10Compact
              key={selectedCategory || 'top10'}
              dishes={selectedCategory ? categoryDishes : (top10Dishes.slice(1))}
              personalDishes={personalTop10Dishes}
              showToggle={showPersonalToggle}
              town={town}
              categoryLabel={selectedCategoryLabel}
              startRank={selectedCategory ? 1 : 2}
            />
          </div>
        ) : (
          <EmptyState onBrowse={() => navigate('/browse')} />
        )}
      </section>
    </div>
  )
}

const scrollStyle = {
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  WebkitOverflowScrolling: 'touch',
}

function CategoryNav({ town, onTownChange, selectedCategory, onCategoryChange }) {
  const [townPickerOpen, setTownPickerOpen] = useState(false)

  return (
    <div className="flex items-center gap-1 pl-2 pr-4 pb-1">
      <TownPicker
        town={town}
        onTownChange={onTownChange}
        isOpen={townPickerOpen}
        onToggle={setTownPickerOpen}
      />
      {!townPickerOpen && (
        <div className="flex items-center gap-2 overflow-x-auto" style={scrollStyle}>
          {BROWSE_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id
            const imageSrc = getCategoryNeonImage(cat.id)
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(isActive ? null : cat.id)}
                className="flex-shrink-0 flex flex-col items-center gap-1 py-1 transition-all active:scale-[0.97]"
                style={{
                  minWidth: '48px',
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                }}
              >
                <div
                  className="rounded-full overflow-hidden flex items-center justify-center"
                  style={{
                    width: '44px',
                    height: '44px',
                    background: 'var(--color-surface-elevated)',
                    boxShadow: isActive ? '0 0 0 2px var(--color-primary)' : 'none',
                  }}
                >
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                      style={{
                        filter: isActive ? 'brightness(1.2) saturate(0.8)' : 'brightness(1.0) saturate(0.7)',
                      }}
                    />
                  ) : (
                    <span className="text-base">{cat.emoji}</span>
                  )}
                </div>
                <span style={{ fontSize: '10.5px', fontWeight: isActive ? 600 : 500, letterSpacing: '0.01em' }}>
                  {cat.label}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// #1 Dish — typographic hero announcement
function NumberOneHero({ dish, town, onClick }) {
  const { dish_name, restaurant_name, avg_rating, total_votes } = dish
  const isRanked = (total_votes || 0) >= MIN_VOTES_FOR_RANKING

  return (
    <button
      onClick={onClick}
      className="w-full text-left mb-6 py-5 px-4 rounded-2xl transition-all active:scale-[0.99]"
      style={{
        background: 'var(--color-surface-elevated)',
        borderLeft: '3px solid var(--color-medal-gold)',
      }}
    >
      <p
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--color-medal-gold)',
          marginBottom: '8px',
        }}
      >
        #1 {town ? `in ${town}` : 'on the Vineyard'} right now
      </p>
      <h2
        style={{
          fontFamily: "'aglet-sans', sans-serif",
          fontWeight: 700,
          fontSize: '24px',
          color: 'var(--color-text-primary)',
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
        }}
      >
        {dish_name}
      </h2>
      <p
        style={{
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'var(--color-text-secondary)',
          marginTop: '4px',
        }}
      >
        {restaurant_name}
      </p>
      <div className="flex items-center gap-3 mt-4">
        {isRanked && (
          <span
            style={{
              fontFamily: "'aglet-sans', sans-serif",
              fontWeight: 700,
              fontSize: '28px',
              color: 'var(--color-rating)',
              lineHeight: 1,
            }}
          >
            {avg_rating}
          </span>
        )}
        <span
          style={{
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
          }}
        >
          {total_votes} vote{total_votes === 1 ? '' : 's'}
        </span>
      </div>
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
        Try selecting a different town
      </p>
      <button
        onClick={onBrowse}
        className="mt-4 px-6 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-90"
        style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
      >
        Browse All Dishes
      </button>
    </div>
  )
}
