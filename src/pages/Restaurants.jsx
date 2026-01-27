import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { capture } from '../lib/analytics'
import { useAuth } from '../context/AuthContext'
import { logger } from '../utils/logger'
import { restaurantsApi } from '../api/restaurantsApi'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useFavorites } from '../hooks/useFavorites'
import { LoginModal } from '../components/Auth/LoginModal'
import { RestaurantDishes } from '../components/restaurants'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'

export function Restaurants() {
  const { user } = useAuth()
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
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
  const { isFavorite, toggleFavorite } = useFavorites(user?.id)

  // Fetch restaurants with dish counts and details
  useEffect(() => {
    async function fetchRestaurants() {
      setLoading(true)
      setFetchError(null)
      try {
        const data = await restaurantsApi.getAll()
        setRestaurants(data)
      } catch (error) {
        logger.error('Error fetching restaurants:', error)
        setFetchError('Unable to load restaurants. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchRestaurants()
  }, [])

  // Auto-select restaurant from URL param
  useEffect(() => {
    if (restaurantId && restaurants.length > 0 && !selectedRestaurant) {
      const restaurant = restaurants.find(r => r.id === restaurantId)
      if (restaurant) {
        setSelectedRestaurant(restaurant)
      }
    }
  }, [restaurantId, restaurants, selectedRestaurant])

  const handleVote = () => {
    refetch()
  }

  const handleLoginRequired = () => {
    setLoginModalOpen(true)
  }

  const handleToggleFavorite = async (dishId) => {
    if (!user) {
      setLoginModalOpen(true)
      return
    }
    await toggleFavorite(dishId)
  }

  const handleRestaurantSelect = (restaurant) => {
    const stats = restaurantStats[restaurant.id] || {}
    capture('restaurant_viewed', {
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      restaurant_address: restaurant.address,
      total_dish_votes: stats.totalVotes || 0,
      dish_count: restaurant.dishCount,
    })
    setSelectedRestaurant(restaurant)
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, var(--color-surface) 0%, #0d1b2a 100%)' }}>
      <h1 className="sr-only">Restaurants</h1>

      {/* Header */}
      <header className="px-4 pt-3 pb-2" style={{ background: 'var(--color-bg)', borderBottom: '1px solid rgba(255, 107, 107, 0.1)' }}>
        {/* Search bar - context-aware */}
        <div className="relative">
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            id="restaurant-search"
            name="restaurant-search"
            type="text"
            autoComplete="off"
            placeholder={selectedRestaurant ? `Search dishes at ${selectedRestaurant.name}...` : "Search restaurants..."}
            aria-label={selectedRestaurant ? `Search dishes at ${selectedRestaurant.name}` : "Search restaurants"}
            value={selectedRestaurant ? dishSearchQuery : searchQuery}
            onChange={(e) => selectedRestaurant ? setDishSearchQuery(e.target.value) : setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 transition-all"
            style={{
              background: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-divider)',
              color: 'var(--color-text-primary)',
              '--tw-ring-color': 'var(--color-primary)'
            }}
          />
          {/* Clear button when searching dishes */}
          {selectedRestaurant && dishSearchQuery && (
            <button
              onClick={() => setDishSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
          <div className="mb-4 flex items-center gap-3">
            <div
              className="w-1 h-6 rounded-full"
              style={{ background: 'linear-gradient(180deg, var(--color-primary) 0%, var(--color-accent-orange) 100%)' }}
            />
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Restaurants near you
            </h2>
          </div>

          {fetchError ? (
            <div className="text-center py-12">
              <p role="alert" className="text-sm mb-4" style={{ color: 'var(--color-danger)' }}>{fetchError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium rounded-lg"
                style={{ background: 'var(--color-primary)', color: 'white' }}
              >
                Try Again
              </button>
            </div>
          ) : loading || dishesLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--color-card)' }} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRestaurants.map((restaurant) => {
                const stats = restaurantStats[restaurant.id] || {}

                return (
                  <button
                    key={restaurant.id}
                    onClick={() => handleRestaurantSelect(restaurant)}
                    className="w-full rounded-xl p-4 text-left transition-all group"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-card) 0%, rgba(255, 107, 107, 0.03) 100%)',
                      border: '1px solid rgba(0, 245, 212, 0.15)',
                      borderLeft: '3px solid var(--color-primary)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 107, 107, 0.15), 0 0 30px rgba(0, 245, 212, 0.08)'
                      e.currentTarget.style.borderTopColor = 'rgba(0, 245, 212, 0.3)'
                      e.currentTarget.style.borderRightColor = 'rgba(0, 245, 212, 0.3)'
                      e.currentTarget.style.borderBottomColor = 'rgba(0, 245, 212, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)'
                      e.currentTarget.style.borderTopColor = 'rgba(0, 245, 212, 0.15)'
                      e.currentTarget.style.borderRightColor = 'rgba(0, 245, 212, 0.15)'
                      e.currentTarget.style.borderBottomColor = 'rgba(0, 245, 212, 0.15)'
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Restaurant info */}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold transition-colors" style={{ color: 'var(--color-text-primary)' }}>
                          {restaurant.name}
                        </h3>
                        <p className="text-xs mt-1" style={{ color: stats.totalVotes > 0 ? 'var(--color-accent-orange)' : 'var(--color-text-tertiary)' }}>
                          {stats.totalVotes > 0
                            ? `${stats.totalVotes} total dish votes`
                            : 'No votes yet'
                          }
                        </p>
                      </div>

                      {/* Chevron */}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transition-colors flex-shrink-0" style={{ color: 'var(--color-primary)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>
                )
              })}

              {filteredRestaurants.length === 0 && (
                <div className="text-center py-12" style={{ color: 'var(--color-text-tertiary)' }}>
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
          <div className="sticky top-0 z-20 border-b px-4 py-3" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-divider)' }}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedRestaurant(null)
                  setDishSearchQuery('')
                  // Clear URL param if present
                  if (restaurantId) {
                    navigate('/restaurants', { replace: true })
                  }
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div className="min-w-0">
                <h2 className="text-xl font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {selectedRestaurant.name}
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {selectedRestaurant.dishCount} dishes
                </p>
              </div>
            </div>
          </div>

          {/* Restaurant Details Card */}
          <div className="border-b px-4 py-4" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-divider)' }}>
            <div className="space-y-3">
              {/* Address with Maps link */}
              {selectedRestaurant.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedRestaurant.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 hover:text-orange-400 transition-colors group"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mt-0.5 flex-shrink-0 group-hover:opacity-80" style={{ color: 'var(--color-text-tertiary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span className="text-sm">{selectedRestaurant.address}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:text-orange-400" style={{ color: 'var(--color-divider)' }}>
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
                  className="flex items-center gap-3 transition-colors group"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0 group-hover:opacity-80" style={{ color: 'var(--color-text-tertiary)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  <span className="text-sm group-hover:text-[var(--color-primary)]">Call Restaurant</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0 group-hover:text-[var(--color-primary)]" style={{ color: 'var(--color-divider)' }}>
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
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium transition-colors"
                  style={{
                    background: 'var(--color-surface-elevated)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid rgba(0, 245, 212, 0.2)'
                  }}
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
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
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
