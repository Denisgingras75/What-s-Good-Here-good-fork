import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useDishSearch } from '../hooks/useDishSearch'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { BROWSE_CATEGORIES } from '../constants/categories'
import { SearchHero, Top10Compact } from '../components/home'
import { CategoryIcon } from '../components/home/CategoryIcons'
import { TownPicker } from '../components/TownPicker'
import { getRatingColor } from '../utils/ranking'

export function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

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
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>
      <h1 className="sr-only">What's Good Here - Top Ranked Dishes Near You</h1>

      {/* Section 1: Hero with search + categories */}
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
      <section className="px-4 pt-6 pb-6" style={{ background: '#FFFFFF' }}>
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
                    style={{ background: '#F5F5F5', color: '#1A1A1A' }}
                  >
                    Show more
                  </button>
                )}
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm font-medium" style={{ color: '#999999' }}>
                  No dishes found for "{searchQuery}"
                </p>
                <p className="text-xs mt-1" style={{ color: '#CCCCCC' }}>
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
              style={{ background: '#E4440A', color: '#FFFFFF' }}
            >
              Retry
            </button>
          </div>
        ) : top10Dishes.length > 0 ? (
          <div className="max-w-lg mx-auto">
            {/* Category headline — above the #1 hero when filtering */}
            {selectedCategoryLabel && (
              <p
                className="font-bold mb-4 stagger-item"
                style={{
                  fontFamily: "'aglet-sans', sans-serif",
                  color: '#E4440A',
                  fontSize: '20px',
                  letterSpacing: '-0.02em',
                }}
              >
                {town ? `Best ${selectedCategoryLabel} in ${town}` : `Best ${selectedCategoryLabel} on the Vineyard`}
              </p>
            )}
            {/* #1 Hero — always shown */}
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
              startRank={2}
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
  overscrollBehaviorX: 'contain',
  touchAction: 'pan-x',
}

function CategoryNav({ town, onTownChange, selectedCategory, onCategoryChange }) {
  const [townPickerOpen, setTownPickerOpen] = useState(false)

  return (
    <div className="flex items-center gap-2 pl-3 pr-4 pb-2 overflow-x-auto" style={scrollStyle}>
      <TownPicker
        town={town}
        onTownChange={onTownChange}
        isOpen={townPickerOpen}
        onToggle={setTownPickerOpen}
      />
      {!townPickerOpen && (
        <div className="flex items-center gap-2">
          {BROWSE_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(isActive ? null : cat.id)}
                className="flex-shrink-0 flex flex-col items-center justify-center card-press"
                style={{
                  width: '64px',
                  height: '84px',
                  background: isActive ? '#E4440A' : '#FFFFFF',
                  border: '3px solid #1A1A1A',
                  borderRadius: '12px',
                  boxShadow: '3px 3px 0px #1A1A1A',
                }}
              >
                <CategoryIcon
                  categoryId={cat.id}
                  size={42}
                  color={isActive ? '#FFFFFF' : '#E4440A'}
                />
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    color: isActive ? '#FFFFFF' : '#1A1A1A',
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
      )}
    </div>
  )
}

// #1 Dish — massive editorial hero card
function NumberOneHero({ dish, town, onClick }) {
  const { dish_name, restaurant_name, avg_rating, total_votes, category } = dish
  const isRanked = (total_votes || 0) >= MIN_VOTES_FOR_RANKING

  return (
    <button
      onClick={onClick}
      className="w-full text-left mb-5 rounded-2xl overflow-hidden card-press-hero stagger-item"
      style={{
        background: '#FFFFFF',
        border: '3px solid #1A1A1A',
        boxShadow: '5px 5px 0px #1A1A1A',
      }}
    >
      {/* Top bar — rank label */}
      <div
        className="px-4 py-2.5"
        style={{
          borderBottom: '3px solid #1A1A1A',
          background: '#E4440A',
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

      {/* Main content — text left, big icon right */}
      <div className="flex items-center gap-3 py-5 px-4">
        <div className="flex-1 min-w-0">
          <h2
            style={{
              fontFamily: "'aglet-sans', sans-serif",
              fontWeight: 800,
              fontSize: '34px',
              color: '#1A1A1A',
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
              color: '#999999',
              marginTop: '7px',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            {restaurant_name}
          </p>
          <div className="flex items-baseline gap-3 mt-4">
            {isRanked && (
              <span
                style={{
                  fontFamily: "'aglet-sans', sans-serif",
                  fontWeight: 800,
                  fontSize: '50px',
                  color: getRatingColor(avg_rating),
                  lineHeight: 1,
                }}
              >
                {avg_rating}
              </span>
            )}
            <span
              style={{
                fontSize: '12px',
                color: '#BBBBBB',
                fontWeight: 500,
              }}
            >
              {total_votes} vote{total_votes === 1 ? '' : 's'}
            </span>
          </div>
        </div>
        <CategoryIcon categoryId={category} size={96} color="#E4440A" />
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
      <p className="font-bold text-lg" style={{ color: '#1A1A1A' }}>
        No dishes found
      </p>
      <p className="text-sm mt-1" style={{ color: '#999999' }}>
        Try selecting a different town
      </p>
      <button
        onClick={onBrowse}
        className="mt-4 px-6 py-2 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
        style={{ background: '#E4440A', color: '#FFFFFF' }}
      >
        Browse All Dishes
      </button>
    </div>
  )
}
