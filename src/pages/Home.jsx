import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useDishSearch } from '../hooks/useDishSearch'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { BROWSE_CATEGORIES } from '../constants/categories'
import { SearchHero, Top10Compact, DishPhotoFade, NearbyDiscovery } from '../components/home'
import { CategoryIcon } from '../components/home/CategoryIcons'
import { TownPicker } from '../components/TownPicker'
import { NearbyNudge } from '../components/NearbyNudge'
import { getRatingColor } from '../utils/ranking'

export function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { location, radius, town, setTown } = useLocationContext()

  // Town picker
  const [townPickerOpen, setTownPickerOpen] = useState(false)

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

  // Top 10 dishes (all categories)
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
  }, [dishes, selectedCategory])

  const selectedCategoryLabel = selectedCategory
    ? BROWSE_CATEGORIES.find(c => c.id === selectedCategory)?.label
    : null

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface-elevated)' }}>
      <h1 className="sr-only">What's Good Here - Top Ranked Dishes Near You</h1>

      {/* Section 1: Hero with search + town filter */}
      <SearchHero
        town={town}
        loading={loading}
        onSearchChange={handleSearchChange}
        townPicker={
          <TownPicker
            town={town}
            onTownChange={setTown}
            isOpen={townPickerOpen}
            onToggle={setTownPickerOpen}
          />
        }
      />

      {/* Nearby nudge — location-aware contextual prompt */}
      <NearbyNudge />

      {/* Trust banner — shows dish/restaurant count + verified label */}
      {!loading && dishes?.length > 0 && (
        <div className="px-5 py-2">
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
            {dishes.length} dishes rated · {new Set(dishes.map(d => d.restaurant_id)).size} restaurants · Verified human reviews
          </p>
        </div>
      )}

      {/* Section 2: #1 Hero → Categories → Rest of Top 10 */}
      <section className="px-4 pt-6 pb-6" style={{ background: 'var(--color-surface-elevated)' }}>
        {searchQuery ? (
          <div className="max-w-lg mx-auto">
            {searchLoading ? (
              <Top10Skeleton />
            ) : searchResults.length > 0 ? (
              <>
                {searchResults[0] && (
                  <NumberOneHero
                    dish={searchResults[0]}
                    town={town}
                    onClick={() => navigate(`/dish/${searchResults[0].dish_id}`)}
                  />
                )}
                <Top10Compact
                  key={`search-${searchQuery}`}
                  dishes={searchResults.slice(1)}
                  town={town}
                  categoryLabel={`"${searchQuery}"`}
                  startRank={2}
                />
                {hasMoreResults && (
                  <button
                    onClick={() => setSearchLimit(prev => prev + 10)}
                    className="w-full mt-3 py-3 text-sm font-medium rounded-xl transition-opacity hover:opacity-70"
                    style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                  >
                    Show more
                  </button>
                )}
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
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
            <p role="alert" className="text-sm" style={{ color: 'var(--color-red)' }}>
              {error?.message || error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg"
              style={{ background: 'var(--color-primary)', color: '#FFFFFF' }}
            >
              Retry
            </button>
          </div>
        ) : top10Dishes.length > 0 ? (
          <div className="max-w-lg mx-auto">
            {/* Category scroll — above all content it controls */}
            <div className="mb-5 -mx-4 stagger-item">
              <CategoryNav
                selectedCategory={selectedCategory}
                onCategoryChange={(cat) => {
                  setSelectedCategory(cat)
                  if (cat) setSearchQuery('')
                }}
              />
            </div>

            {/* Category headline — when filtering */}
            {selectedCategoryLabel && (
              <p
                className="font-bold mb-4 stagger-item"
                style={{
                  fontFamily: "'aglet-sans', sans-serif",
                  color: 'var(--color-primary)',
                  fontSize: '20px',
                  letterSpacing: '-0.02em',
                }}
              >
                {town ? `Best ${selectedCategoryLabel} in ${town}` : `Best ${selectedCategoryLabel} on the Vineyard`}
              </p>
            )}
            {/* #1 Hero */}
            {(selectedCategory ? categoryDishes[0] : top10Dishes[0]) && (
              <NumberOneHero
                dish={selectedCategory ? categoryDishes[0] : top10Dishes[0]}
                town={town}
                onClick={() => navigate(`/dish/${(selectedCategory ? categoryDishes[0] : top10Dishes[0]).dish_id}`)}
              />
            )}

            <Top10Compact
              key={selectedCategory || 'top10'}
              dishes={selectedCategory ? categoryDishes.slice(1) : top10Dishes.slice(1)}
              town={town}
              categoryLabel={selectedCategoryLabel}
              startRank={2}
            />
          </div>
        ) : (
          <>
            <EmptyState onBrowse={() => navigate('/browse')} />
            <NearbyDiscovery />
          </>
        )}
      </section>
    </div>
  )
}

const scrollStyle = {
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  WebkitOverflowScrolling: 'touch',
  overscrollBehaviorX: 'contain',
  touchAction: 'pan-x',
}

function CategoryNav({ selectedCategory, onCategoryChange }) {
  return (
    <div className="flex items-center gap-2 pl-3 pr-4 pb-2 overflow-x-auto" style={scrollStyle}>
      {BROWSE_CATEGORIES.map((cat) => {
        const isActive = selectedCategory === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(isActive ? null : cat.id)}
            className="flex-shrink-0 flex flex-col items-center justify-center card-press"
            style={{
              width: '60px',
              height: '80px',
              background: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
              borderRadius: '12px',
            }}
          >
            <CategoryIcon
              categoryId={cat.id}
              size={48}
              color={isActive ? '#FFFFFF' : 'var(--color-primary)'}
            />
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: isActive ? '#FFFFFF' : 'var(--color-text-primary)',
                marginTop: '4px',
                lineHeight: 1.1,
                textAlign: 'center',
              }}
            >
              {cat.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// #1 Dish — massive editorial hero card
function NumberOneHero({ dish, town, onClick }) {
  const { dish_name, restaurant_name, avg_rating, total_votes, category, featured_photo_url } = dish
  const isRanked = (total_votes || 0) >= MIN_VOTES_FOR_RANKING
  const [photoFailed, setPhotoFailed] = useState(false)
  const showPhoto = featured_photo_url && !photoFailed

  return (
    <button
      onClick={onClick}
      className="w-full text-left mb-5 rounded-2xl overflow-hidden card-press-hero stagger-item"
      style={{
        position: 'relative',
        background: 'var(--color-surface-elevated)',
        border: 'none',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Top bar — rank label */}
      <div
        className="px-4 py-2.5"
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'linear-gradient(105deg, #B8860B 0%, #D4A520 12%, #C89B18 25%, #E8C840 38%, #D4A520 50%, #B8930F 62%, #D9B32E 75%, #C49318 88%, #A67B0A 100%)',
        }}
      >
        <p
          style={{
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
          }}
        >
          #1 {town ? `in ${town}` : 'on the Vineyard'}
        </p>
      </div>

      {showPhoto && (
        <DishPhotoFade photoUrl={featured_photo_url} dishName={dish_name} loading="eager" onPhotoError={() => setPhotoFailed(true)} />
      )}

      {/* Main content — text left, icon right (only when no photo) */}
      <div className="flex items-center gap-3 py-5 px-4" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex-1 min-w-0" style={showPhoto ? { maxWidth: '50%' } : undefined}>
          <h2
            style={{
              fontFamily: "'aglet-sans', sans-serif",
              fontWeight: 800,
              fontSize: '34px',
              color: 'var(--color-text-primary)',
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
            }}
          >
            {dish_name}
          </h2>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-tertiary)',
              marginTop: '7px',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            {restaurant_name}
          </p>
          {isRanked && (
            <div className="flex items-start gap-0 mt-4">
              <div style={{ paddingRight: '16px' }}>
                <span style={{ fontFamily: "'aglet-sans', sans-serif", fontWeight: 800, fontSize: '28px', lineHeight: 1, color: getRatingColor(avg_rating) }}>
                  {avg_rating}
                </span>
                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>avg rating</p>
              </div>
              <div style={{ paddingLeft: '16px', paddingRight: '16px', borderLeft: '1px solid var(--color-divider)' }}>
                <span style={{ fontFamily: "'aglet-sans', sans-serif", fontWeight: 800, fontSize: '28px', lineHeight: 1, color: getRatingColor(dish.percent_worth_it / 10) }}>
                  {dish.percent_worth_it}%
                </span>
                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>would reorder</p>
              </div>
              <div style={{ paddingLeft: '16px', borderLeft: '1px solid var(--color-divider)' }}>
                <span style={{ fontFamily: "'aglet-sans', sans-serif", fontWeight: 800, fontSize: '28px', lineHeight: 1, color: 'var(--color-text-primary)' }}>
                  {total_votes}
                </span>
                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>votes</p>
              </div>
            </div>
          )}
        </div>
        {!showPhoto && (
          <CategoryIcon categoryId={category} dishName={dish_name} size={96} color="var(--color-primary)" />
        )}
      </div>
    </button>
  )
}

// Skeleton for Top 10 section while loading
function Top10Skeleton() {
  return (
    <div className="max-w-lg mx-auto animate-pulse">
      <div className="h-5 w-32 rounded mb-4" style={{ background: '#F0F0F0' }} />
      <div className="space-y-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 px-3 rounded-xl mb-1.5" style={{ background: '#F5F5F5' }}>
            <div className="w-6 h-6 rounded-full" style={{ background: '#E8E8E8' }} />
            <div className="flex-1">
              <div className="h-4 w-32 rounded mb-1" style={{ background: '#E8E8E8' }} />
              <div className="h-3 w-24 rounded" style={{ background: '#E8E8E8' }} />
            </div>
            <div className="h-5 w-8 rounded" style={{ background: '#E8E8E8' }} />
          </div>
        ))}
        {[...Array(7)].map((_, i) => (
          <div key={i + 3} className="flex items-center gap-3 py-2.5 px-2" style={{ opacity: 0.6 }}>
            <div className="w-6 h-4 rounded" style={{ background: '#F0F0F0' }} />
            <div className="flex-1">
              <div className="h-3.5 w-28 rounded mb-1" style={{ background: '#F0F0F0' }} />
              <div className="h-3 w-20 rounded" style={{ background: '#F0F0F0' }} />
            </div>
            <div className="h-4 w-7 rounded" style={{ background: '#F0F0F0' }} />
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
      <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
        No dishes found
      </p>
      <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
        Try selecting a different town
      </p>
      <button
        onClick={onBrowse}
        className="mt-4 px-6 py-2 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
        style={{ background: 'var(--color-primary)', color: '#FFFFFF' }}
      >
        Browse All Dishes
      </button>
    </div>
  )
}
