import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { restaurantsApi } from '../api'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useSavedDishes } from '../hooks/useSavedDishes'
import { DishCard } from '../components/DishCard'
import { LoginModal } from '../components/Auth/LoginModal'
import { getCategoryImage } from '../constants/categoryImages'

const MIN_VOTES_FOR_RANKING = 5
const TOP_DISHES_COUNT = 5

export function Restaurants() {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dishSearchQuery, setDishSearchQuery] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const { location, radius } = useLocationContext()
  const { dishes, loading: dishesLoading, error: dishesError, refetch } = useDishes(
    location,
    radius,
    null,
    selectedRestaurant?.id
  )
  const { isSaved, toggleSave } = useSavedDishes(user?.id)

  // Fetch restaurants with dish counts and details
  useEffect(() => {
    async function fetchRestaurants() {
      setLoading(true)
      try {
        const data = await restaurantsApi.getAll()
        setRestaurants(data)
      } catch (error) {
        console.error('Error fetching restaurants:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRestaurants()
  }, [])

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

  // Compute top dish and total votes per restaurant
  const restaurantStats = useMemo(() => {
    if (!dishes?.length) return {}

    const stats = {}
    dishes.forEach(dish => {
      const rid = dish.restaurant_id
      if (!rid) return

      if (!stats[rid]) {
        stats[rid] = {
          totalVotes: 0,
          topRankedDish: null, // Highest rated with 5+ votes
          topVotedDish: null,  // Most votes (fallback)
        }
      }

      stats[rid].totalVotes += (dish.total_votes || 0)

      // Track highest rated dish (with 5+ votes)
      const isRanked = (dish.total_votes || 0) >= MIN_VOTES_FOR_RANKING
      if (isRanked) {
        if (!stats[rid].topRankedDish || (dish.avg_rating || 0) > (stats[rid].topRankedDish.avg_rating || 0)) {
          stats[rid].topRankedDish = dish
        }
      }

      // Track most voted dish (fallback)
      if (!stats[rid].topVotedDish || (dish.total_votes || 0) > (stats[rid].topVotedDish.total_votes || 0)) {
        stats[rid].topVotedDish = dish
      }
    })

    return stats
  }, [dishes])

  // Filter restaurants by search and sort alphabetically
  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [restaurants, searchQuery])

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white px-4 py-2">
        <div className="flex flex-col items-center mb-2">
          <img src="/logo.png" alt="What's Good Here" className="h-12 md:h-14 lg:h-16 w-auto" />
        </div>

        {/* Search bar - context-aware */}
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder={selectedRestaurant ? `Search dishes at ${selectedRestaurant.name}...` : "Search restaurants..."}
            value={selectedRestaurant ? dishSearchQuery : searchQuery}
            onChange={(e) => selectedRestaurant ? setDishSearchQuery(e.target.value) : setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-neutral-100 rounded-xl border-0 focus:ring-2 focus:bg-white transition-all"
            style={{ '--tw-ring-color': 'var(--color-primary)' }}
          />
          {/* Clear button when searching dishes */}
          {selectedRestaurant && dishSearchQuery && (
            <button
              onClick={() => setDishSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-neutral-200 transition-colors"
            >
              <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Restaurant List */}
      {!selectedRestaurant && (
        <div className="p-4">
          {/* Section Header */}
          <div className="mb-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Restaurants near you
            </h2>
          </div>

          {loading || dishesLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-neutral-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRestaurants.map((restaurant) => {
                const stats = restaurantStats[restaurant.id] || {}

                return (
                  <button
                    key={restaurant.id}
                    onClick={() => setSelectedRestaurant(restaurant)}
                    className="w-full bg-white rounded-xl border border-neutral-200 p-4 text-left hover:border-orange-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Restaurant info */}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors">
                          {restaurant.name}
                        </h3>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                          {stats.totalVotes > 0
                            ? `${stats.totalVotes} total dish votes`
                            : 'No votes yet'
                          }
                        </p>
                      </div>

                      {/* Chevron */}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-neutral-400 group-hover:text-orange-400 transition-colors flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>
                )
              })}

              {filteredRestaurants.length === 0 && (
                <div className="text-center py-12 text-neutral-500">
                  No restaurants found
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Restaurant View */}
      {selectedRestaurant && (
        <>
          {/* Back button and restaurant header */}
          <div className="sticky top-0 z-20 bg-white border-b border-neutral-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedRestaurant(null)
                  setDishSearchQuery('')
                }}
                className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-neutral-900 truncate">
                  {selectedRestaurant.name}
                </h2>
                <p className="text-sm text-neutral-500">
                  {selectedRestaurant.dishCount} dishes
                </p>
              </div>
            </div>
          </div>

          {/* Restaurant Details Card */}
          <div className="bg-white border-b border-neutral-200 px-4 py-4">
            <div className="space-y-3">
              {/* Address with Maps link */}
              {selectedRestaurant.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedRestaurant.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-neutral-700 hover:text-orange-600 transition-colors group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mt-0.5 flex-shrink-0 text-neutral-400 group-hover:opacity-80">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span className="text-sm">{selectedRestaurant.address}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mt-0.5 flex-shrink-0 text-neutral-300 group-hover:text-orange-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}

              {/* Call Restaurant link */}
              {selectedRestaurant.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedRestaurant.name + ' ' + selectedRestaurant.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-neutral-700 hover:text-orange-600 transition-colors group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0 text-neutral-400 group-hover:opacity-80">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  <span className="text-sm">Call Restaurant</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0 text-neutral-300 group-hover:text-orange-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}
            </div>

            {/* Quick action buttons */}
            {selectedRestaurant.address && (
              <div className="flex gap-2 mt-4">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedRestaurant.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 text-white py-2.5 px-4 rounded-xl font-medium hover:opacity-90 transition-colors"
                  style={{ background: 'var(--color-primary)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                  </svg>
                  Directions
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedRestaurant.name + ' ' + selectedRestaurant.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-neutral-100 text-neutral-700 py-2.5 px-4 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  Call
                </a>
              </div>
            )}
          </div>

          {/* What Should I Order? - Confidence View */}
          <RestaurantDishes
            dishes={dishes}
            loading={dishesLoading}
            error={dishesError}
            onVote={handleVote}
            onLoginRequired={handleLoginRequired}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            user={user}
            searchQuery={dishSearchQuery}
          />
        </>
      )}

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  )
}

// Restaurant dishes component - Job #2: "What should I order?"
function RestaurantDishes({ dishes, loading, error, onVote, onLoginRequired, isSaved, onToggleSave, user, searchQuery = '' }) {
  const [showAllDishes, setShowAllDishes] = useState(false)

  // Filter and sort dishes
  const sortedDishes = useMemo(() => {
    if (!dishes?.length) return { top: [], rest: [], filtered: false }

    // Filter by search query if provided
    let filteredDishes = dishes
    const query = searchQuery.toLowerCase().trim()
    if (query) {
      filteredDishes = dishes.filter(d =>
        (d.dish_name || '').toLowerCase().includes(query) ||
        (d.category || '').toLowerCase().includes(query)
      )
    }

    const sorted = [...filteredDishes].sort((a, b) => {
      const aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
      const bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
      // Ranked dishes first
      if (aRanked && !bRanked) return -1
      if (!aRanked && bRanked) return 1
      // Then by percent_worth_it (order again %)
      const aPct = a.percent_worth_it || 0
      const bPct = b.percent_worth_it || 0
      if (bPct !== aPct) return bPct - aPct
      // Tie-breaker: avg_rating
      const aRating = a.avg_rating || 0
      const bRating = b.avg_rating || 0
      if (bRating !== aRating) return bRating - aRating
      // Final tie-breaker: vote count
      return (b.total_votes || 0) - (a.total_votes || 0)
    })

    return {
      top: sorted.slice(0, TOP_DISHES_COUNT),
      rest: sorted.slice(TOP_DISHES_COUNT),
      filtered: query.length > 0,
      totalMatches: filteredDishes.length,
    }
  }, [dishes, searchQuery])

  const rankedCount = dishes?.filter(d => (d.total_votes || 0) >= MIN_VOTES_FOR_RANKING).length || 0

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--color-divider)' }} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>
      </div>
    )
  }

  const handleToggleSave = async (dishId) => {
    if (!user) {
      onLoginRequired()
      return
    }
    await onToggleSave(dishId)
  }

  return (
    <div className="px-4 py-4">
      {/* Section Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {sortedDishes.filtered
            ? `Results for "${searchQuery}"`
            : 'What should I order?'
          }
        </h3>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
          {sortedDishes.filtered
            ? `${sortedDishes.totalMatches} ${sortedDishes.totalMatches === 1 ? 'dish' : 'dishes'} found`
            : rankedCount > 0
              ? `Top picks based on ${rankedCount} rated ${rankedCount === 1 ? 'dish' : 'dishes'}`
              : 'Not enough votes yet — be the first to rate dishes here'
          }
        </p>
      </div>

      {/* Top Dishes */}
      {sortedDishes.top.length > 0 ? (
        <div className="space-y-3">
          {sortedDishes.top.map((dish, index) => (
            <TopDishCard
              key={dish.dish_id}
              dish={dish}
              rank={index + 1}
              onVote={onVote}
              onLoginRequired={onLoginRequired}
              isFavorite={isSaved ? isSaved(dish.dish_id) : false}
              onToggleFavorite={handleToggleSave}
            />
          ))}
        </div>
      ) : (
        <div
          className="py-8 text-center rounded-xl"
          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-divider)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {sortedDishes.filtered
              ? `No dishes matching "${searchQuery}"`
              : 'No dishes at this restaurant yet'
            }
          </p>
          {sortedDishes.filtered && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              Try a different search term
            </p>
          )}
        </div>
      )}

      {/* More Dishes */}
      {sortedDishes.rest.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowAllDishes(!showAllDishes)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: 'var(--color-bg)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-divider)'
            }}
          >
            {showAllDishes ? 'Show less' : `See ${sortedDishes.rest.length} more dishes`}
            <svg
              className={`w-4 h-4 transition-transform ${showAllDishes ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAllDishes && (
            <div className="mt-4 space-y-3">
              {sortedDishes.rest.map((dish, index) => (
                <TopDishCard
                  key={dish.dish_id}
                  dish={dish}
                  rank={TOP_DISHES_COUNT + index + 1}
                  onVote={onVote}
                  onLoginRequired={onLoginRequired}
                  isFavorite={isSaved ? isSaved(dish.dish_id) : false}
                  onToggleFavorite={handleToggleSave}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Compact dish card for restaurant view - shows order again % prominently
function TopDishCard({ dish, rank, onVote, onLoginRequired, isFavorite, onToggleFavorite }) {
  const navigate = useNavigate()
  const {
    dish_id,
    dish_name,
    category,
    photo_url,
    price,
    total_votes,
    percent_worth_it,
    avg_rating,
  } = dish

  const imgSrc = photo_url || getCategoryImage(category)
  const isRanked = (total_votes || 0) >= MIN_VOTES_FOR_RANKING
  const votes = total_votes || 0

  const handleClick = () => {
    navigate(`/dish/${dish_id}`)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex gap-3 p-3 rounded-xl text-left transition-all hover:shadow-md hover:border-orange-300"
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-divider)'
      }}
    >
      {/* Rank Badge */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1"
        style={{
          background: rank <= 3 && isRanked ? 'var(--color-primary)' : 'var(--color-surface)',
          color: rank <= 3 && isRanked ? 'white' : 'var(--color-text-tertiary)',
        }}
      >
        {rank}
      </div>

      {/* Photo */}
      <div
        className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
        style={{ background: 'var(--color-surface)' }}
      >
        <img
          src={imgSrc}
          alt={dish_name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dish Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
              {dish_name}
            </h4>
            {price && (
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                ${Number(price).toFixed(0)}
              </p>
            )}
          </div>

          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(dish_id)
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-neutral-100 text-neutral-400 hover:text-red-500'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={2}
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Rating Info */}
        <div className="flex items-center gap-3 mt-2">
          {isRanked ? (
            <>
              <div
                className="text-sm font-bold px-2 py-0.5 rounded"
                style={{ background: 'var(--color-primary)', color: 'white' }}
              >
                {Math.round(percent_worth_it)}% would order again
              </div>
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {avg_rating}/10 · {votes} votes
              </span>
            </>
          ) : (
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {votes > 0 ? `${votes} of ${MIN_VOTES_FOR_RANKING} votes to rank` : 'Be first to rate'}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
