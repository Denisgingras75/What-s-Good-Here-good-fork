import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { capture } from '../lib/analytics'
import { useAuth } from '../context/AuthContext'
import { logger } from '../utils/logger'
import { restaurantsApi } from '../api/restaurantsApi'
import { followsApi } from '../api/followsApi'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useFavorites } from '../hooks/useFavorites'
import { useRestaurants } from '../hooks/useRestaurants'
import { LoginModal } from '../components/Auth/LoginModal'
import { AddDishModal } from '../components/AddDishModal'
import { RestaurantDishes, RestaurantMenu, RestaurantMap } from '../components/restaurants'
import { RadiusSheet } from '../components/LocationPicker'
import { LocationBanner } from '../components/LocationBanner'
import { AddRestaurantModal } from '../components/AddRestaurantModal'
import { useNearbyPlaces } from '../hooks/useNearbyPlaces'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { getRatingColor } from '../utils/ranking'

export function Restaurants() {
  const { user } = useAuth()
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [dishSearchQuery, setDishSearchQuery] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('top')
  const [restaurantTab, setRestaurantTab] = useState('open')
  const [friendsVotesByDish, setFriendsVotesByDish] = useState({})
  const [addDishModalOpen, setAddDishModalOpen] = useState(false)
  const [showRadiusSheet, setShowRadiusSheet] = useState(false)
  const [addRestaurantModalOpen, setAddRestaurantModalOpen] = useState(false)
  const [addRestaurantInitialQuery, setAddRestaurantInitialQuery] = useState('')
  const [viewMode, setViewMode] = useState('list')

  const { location, radius, setRadius, permissionState, requestLocation } = useLocationContext()

  // Use distance-filtered restaurants when location is available
  const { restaurants, loading, error: fetchError, isDistanceFiltered } = useRestaurants(
    location, radius, permissionState
  )

  const { dishes, loading: dishesLoading, error: dishesError, refetch } = useDishes(
    location,
    radius,
    null,
    selectedRestaurant?.id
  )
  const { isFavorite, toggleFavorite } = useFavorites(user?.id)

  // Google Place IDs already in DB (to filter out from discovery)
  const existingPlaceIds = useMemo(() =>
    restaurants.filter(r => r.google_place_id).map(r => r.google_place_id),
    [restaurants]
  )

  // Discover nearby restaurants from Google Places (authenticated users, capped at 10mi)
  const { places: nearbyPlaces, loading: nearbyLoading } = useNearbyPlaces({
    lat: location?.lat,
    lng: location?.lng,
    radius,
    isAuthenticated: !!user,
    existingPlaceIds,
  })

  // Auto-select restaurant from URL param
  useEffect(() => {
    if (restaurantId && restaurants.length > 0 && !selectedRestaurant) {
      const restaurant = restaurants.find(r => r.id === restaurantId)
      if (restaurant) {
        restaurantsApi.getById(restaurant.id)
          .then(full => setSelectedRestaurant({ ...restaurant, ...full }))
          .catch(() => setSelectedRestaurant(restaurant))
      }
    }
  }, [restaurantId, restaurants, selectedRestaurant])

  // Fetch friend votes when a restaurant is selected
  useEffect(() => {
    if (!selectedRestaurant?.id || !user) {
      setFriendsVotesByDish({})
      return
    }

    async function fetchFriendsVotes() {
      try {
        const votes = await followsApi.getFriendsVotesForRestaurant(selectedRestaurant.id)
        const byDish = {}
        votes.forEach(vote => {
          if (!byDish[vote.dish_id]) {
            byDish[vote.dish_id] = []
          }
          byDish[vote.dish_id].push(vote)
        })
        setFriendsVotesByDish(byDish)
      } catch (err) {
        logger.error('Failed to fetch friends votes for restaurant:', err)
        setFriendsVotesByDish({})
      }
    }

    fetchFriendsVotes()
  }, [selectedRestaurant?.id, user])

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

  const handleRestaurantSelect = async (restaurant) => {
    const stats = restaurantStats[restaurant.id] || {}
    capture('restaurant_viewed', {
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      restaurant_address: restaurant.address,
      total_dish_votes: stats.totalVotes || 0,
      dish_count: restaurant.dishCount || restaurant.dish_count || 0,
    })
    try {
      const full = await restaurantsApi.getById(restaurant.id)
      setSelectedRestaurant({ ...restaurant, ...full })
    } catch (err) {
      logger.error('Error fetching restaurant details:', err)
      setSelectedRestaurant(restaurant)
    }
    setActiveTab('top')
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
          topRankedDish: null,
          topVotedDish: null,
        }
      }

      stats[rid].totalVotes += (dish.total_votes || 0)

      const isRanked = (dish.total_votes || 0) >= MIN_VOTES_FOR_RANKING
      if (isRanked) {
        if (!stats[rid].topRankedDish || (dish.avg_rating || 0) > (stats[rid].topRankedDish.avg_rating || 0)) {
          stats[rid].topRankedDish = dish
        }
      }

      if (!stats[rid].topVotedDish || (dish.total_votes || 0) > (stats[rid].topVotedDish.total_votes || 0)) {
        stats[rid].topVotedDish = dish
      }
    })

    return stats
  }, [dishes])

  // Filter restaurants by open/closed tab and search
  // Distance-filtered results are already sorted by distance from the RPC
  const filteredRestaurants = useMemo(() => {
    const filtered = restaurants
      .filter(r => restaurantTab === 'open' ? r.is_open !== false : r.is_open === false)
      .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))

    // Only sort alphabetically if not distance-filtered (fallback mode)
    if (!isDistanceFiltered) {
      return filtered.slice().sort((a, b) => a.name.localeCompare(b.name))
    }
    return filtered
  }, [restaurants, searchQuery, restaurantTab, isDistanceFiltered])

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%)' }}>
      <h1 className="sr-only">Restaurants</h1>

      {/* Header */}
      <header
        className="px-4 pt-4 pb-3 relative"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200, 90, 84, 0.04) 0%, transparent 70%),
            var(--color-bg)
          `,
        }}
      >
        {/* Bottom divider */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
          style={{
            width: '90%',
            background: 'linear-gradient(90deg, transparent, var(--color-divider), transparent)',
          }}
        />
        {/* Search bar */}
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
              fontSize: '14px',
              '--tw-ring-color': 'var(--color-primary)',
            }}
          />
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
        <div className="p-4 pt-5">
          {/* Section Header with Radius Chip */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-1 h-6 rounded-full"
                style={{ background: 'linear-gradient(180deg, var(--color-primary) 0%, var(--color-accent-orange) 100%)' }}
              />
              <h2
                className="font-bold"
                style={{
                  color: 'var(--color-text-primary)',
                  fontSize: '18px',
                  letterSpacing: '-0.01em',
                }}
              >
                {isDistanceFiltered ? `Restaurants within ${radius} mi` : 'Restaurants near you'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Map/List toggle */}
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                aria-label={viewMode === 'list' ? 'Switch to map view' : 'Switch to list view'}
                className="flex items-center justify-center w-8 h-8 rounded-full border transition-all active:scale-95"
                style={{
                  background: viewMode === 'map' ? 'rgba(200, 90, 84, 0.15)' : 'var(--color-surface-elevated)',
                  borderColor: viewMode === 'map' ? 'rgba(200, 90, 84, 0.3)' : 'var(--color-divider)',
                  color: viewMode === 'map' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                }}
              >
                {viewMode === 'list' ? (
                  /* Map icon */
                  <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                  </svg>
                ) : (
                  /* List icon */
                  <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                )}
              </button>

              {/* Radius chip */}
              <button
                onClick={() => setShowRadiusSheet(true)}
                aria-label={`Search radius: ${radius} miles. Tap to change`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                style={{
                  background: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-divider)',
                  color: 'var(--color-text-secondary)',
                }}
              >
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
          </div>

          {/* Location permission banner */}
          <LocationBanner
            permissionState={permissionState}
            requestLocation={requestLocation}
            message="Enable location to see restaurants near you"
          />

          {/* Open / Closed Tab Switcher */}
          <div
            className="flex rounded-xl p-1 mb-5"
            style={{
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-divider)',
            }}
            role="tablist"
            aria-label="Restaurant status filter"
          >
            <button
              role="tab"
              aria-selected={restaurantTab === 'open'}
              onClick={() => setRestaurantTab('open')}
              className="flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all"
              style={{
                background: restaurantTab === 'open' ? 'var(--color-primary)' : 'transparent',
                color: restaurantTab === 'open' ? 'white' : 'var(--color-text-secondary)',
                boxShadow: restaurantTab === 'open' ? '0 2px 8px -2px rgba(200, 90, 84, 0.4)' : 'none',
              }}
            >
              Open
            </button>
            <button
              role="tab"
              aria-selected={restaurantTab === 'closed'}
              onClick={() => setRestaurantTab('closed')}
              className="flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all"
              style={{
                background: restaurantTab === 'closed' ? 'var(--color-primary)' : 'transparent',
                color: restaurantTab === 'closed' ? 'white' : 'var(--color-text-secondary)',
                boxShadow: restaurantTab === 'closed' ? '0 2px 8px -2px rgba(200, 90, 84, 0.4)' : 'none',
              }}
            >
              Closed
            </button>
          </div>

          {/* Map View */}
          {viewMode === 'map' && !fetchError && !loading && (
            <div className="mt-4">
              <RestaurantMap
                restaurants={filteredRestaurants}
                userLocation={location}
                onSelectRestaurant={handleRestaurantSelect}
              />
            </div>
          )}

          {/* List View */}
          {viewMode === 'map' && !fetchError && !loading ? null : fetchError ? (
            <div className="text-center py-12">
              <p role="alert" className="text-sm mb-4" style={{ color: 'var(--color-danger)' }}>{fetchError.message}</p>
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
                const dishCount = restaurant.dish_count ?? restaurant.dishCount ?? 0
                const distanceMiles = restaurant.distance_miles

                return (
                  <button
                    key={restaurant.id}
                    onClick={() => handleRestaurantSelect(restaurant)}
                    className="w-full rounded-xl p-4 text-left transition-all active:scale-[0.99] hover:border-[rgba(224,120,86,0.2)]"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-card) 0%, rgba(217, 167, 101, 0.03) 100%)',
                      border: '1px solid rgba(217, 167, 101, 0.1)',
                      borderLeft: '3px solid var(--color-accent-gold)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(217, 167, 101, 0.04)',
                      opacity: restaurant.is_open ? 1 : 0.6,
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Restaurant info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className="font-bold truncate"
                            style={{
                              color: 'var(--color-text-primary)',
                              fontSize: '15px',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {restaurant.name}
                          </h3>
                          {/* Distance badge */}
                          {distanceMiles != null && (
                            <span
                              className="flex-shrink-0 px-2 py-0.5 rounded-full font-semibold"
                              style={{
                                fontSize: '10px',
                                background: 'rgba(107, 179, 132, 0.12)',
                                color: 'var(--color-rating)',
                                border: '1px solid rgba(107, 179, 132, 0.2)',
                              }}
                            >
                              {distanceMiles} mi
                            </span>
                          )}
                        </div>
                        {!restaurant.is_open && (
                          <span
                            className="inline-block mt-1 px-2 py-0.5 rounded-full font-semibold"
                            style={{
                              fontSize: '10px',
                              background: 'rgba(200, 90, 84, 0.15)',
                              color: 'var(--color-primary)',
                              border: '1px solid rgba(200, 90, 84, 0.25)',
                            }}
                          >
                            Closed for Season
                          </span>
                        )}
                        {/* Cuisine + dish count */}
                        <p
                          className="mt-1 font-medium"
                          style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}
                        >
                          {restaurant.cuisine && (
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                              {restaurant.cuisine}
                              {' · '}
                            </span>
                          )}
                          {dishCount} {dishCount === 1 ? 'dish' : 'dishes'}
                        </p>
                        {restaurant.knownFor && (
                          <p
                            className="mt-0.5 font-medium"
                            style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}
                          >
                            Known for{' '}
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                              {restaurant.knownFor.name}
                            </span>
                            {' · '}
                            <span
                              className="font-bold"
                              style={{ color: getRatingColor(restaurant.knownFor.rating) }}
                            >
                              {restaurant.knownFor.rating}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Chevron */}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>
                )
              })}

              {filteredRestaurants.length === 0 && (
                <div
                  className="text-center py-12 rounded-xl"
                  style={{
                    color: 'var(--color-text-tertiary)',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-divider)',
                  }}
                >
                  <p className="font-medium" style={{ fontSize: '14px' }}>
                    {searchQuery
                      ? 'No restaurants found'
                      : restaurantTab === 'open'
                        ? 'No open restaurants found'
                        : 'No closed restaurants'
                    }
                  </p>
                  {isDistanceFiltered && !searchQuery && (
                    <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                      Try increasing your search radius
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Discover More Restaurants — Google Places nearby search (auth only) */}
          {user && nearbyPlaces.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-1 h-6 rounded-full"
                  style={{ background: 'linear-gradient(180deg, var(--color-accent-gold) 0%, var(--color-accent-orange) 100%)' }}
                />
                <h2
                  className="font-bold"
                  style={{
                    color: 'var(--color-text-primary)',
                    fontSize: '16px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Discover more restaurants
                </h2>
              </div>
              <p className="text-xs mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
                Found on Google Maps — not yet on WGH
              </p>
              <div className="space-y-2">
                {nearbyPlaces.map((place) => (
                  <div
                    key={place.placeId}
                    className="rounded-xl p-4 flex items-center justify-between gap-3"
                    style={{
                      background: 'var(--color-card)',
                      border: '1px solid var(--color-divider)',
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className="font-semibold truncate"
                        style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}
                      >
                        {place.name}
                      </p>
                      {place.address && (
                        <p
                          className="text-xs truncate mt-0.5"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          {place.address}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setAddRestaurantInitialQuery(place.name)
                        setAddRestaurantModalOpen(true)
                      }}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
                      style={{
                        background: 'rgba(217, 167, 101, 0.12)',
                        color: 'var(--color-accent-gold)',
                        border: '1px solid rgba(217, 167, 101, 0.2)',
                      }}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Add to WGH
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {user && !nearbyLoading && nearbyPlaces.length === 0 && (
            <p
              className="mt-6 text-center text-xs py-3"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              No additional restaurants found nearby from Google
            </p>
          )}
          {user && nearbyLoading && (
            <div className="mt-8 flex justify-center py-4">
              <div className="animate-spin w-5 h-5 border-2 rounded-full" style={{ borderColor: 'var(--color-divider)', borderTopColor: 'var(--color-accent-gold)' }} />
            </div>
          )}
        </div>
      )}

      {/* Selected Restaurant View */}
      {selectedRestaurant && (
        <>
          {/* Back button and restaurant header */}
          <div
            className="sticky top-0 z-20 px-4 py-3"
            style={{
              background: 'var(--color-bg)',
              boxShadow: '0 4px 12px -4px rgba(0, 0, 0, 0.2)',
              borderBottom: '1px solid var(--color-divider)',
            }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedRestaurant(null)
                  setDishSearchQuery('')
                  if (restaurantId) {
                    navigate('/restaurants', { replace: true })
                  }
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div className="min-w-0">
                <h2
                  className="font-bold truncate"
                  style={{
                    color: 'var(--color-text-primary)',
                    fontSize: '20px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {selectedRestaurant.name}
                </h2>
                <p className="font-medium" style={{ color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
                  {selectedRestaurant.dish_count ?? selectedRestaurant.dishCount ?? 0} dishes
                  {selectedRestaurant.distance_miles != null && (
                    <span> · {selectedRestaurant.distance_miles} mi away</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Restaurant Details Card */}
          <div className="px-4 py-4 relative" style={{ background: 'var(--color-bg)' }}>
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
              style={{
                width: '90%',
                background: 'linear-gradient(90deg, transparent, var(--color-divider), transparent)',
              }}
            />
            <div className="space-y-3">
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

              {user && (
                <button
                  onClick={() => setAddDishModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98]"
                  style={{
                    background: 'rgba(217, 167, 101, 0.1)',
                    color: 'var(--color-accent-gold)',
                    border: '1px solid rgba(217, 167, 101, 0.2)',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add a dish
                </button>
              )}
            </div>

          </div>

          {/* Tab Switcher */}
          <div className="px-4 pt-4">
            <div
              className="flex rounded-xl p-1"
              style={{
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-divider)',
              }}
              role="tablist"
              aria-label="Restaurant view"
            >
              <button
                role="tab"
                aria-selected={activeTab === 'top'}
                onClick={() => setActiveTab('top')}
                className="flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all"
                style={{
                  background: activeTab === 'top' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'top' ? 'white' : 'var(--color-text-secondary)',
                  boxShadow: activeTab === 'top' ? '0 2px 8px -2px rgba(200, 90, 84, 0.4)' : 'none',
                }}
              >
                Top Rated
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'menu'}
                onClick={() => setActiveTab('menu')}
                className="flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all"
                style={{
                  background: activeTab === 'menu' ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === 'menu' ? 'white' : 'var(--color-text-secondary)',
                  boxShadow: activeTab === 'menu' ? '0 2px 8px -2px rgba(200, 90, 84, 0.4)' : 'none',
                }}
              >
                Menu
              </button>
            </div>
            <div
              className="mt-3 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent-gold), transparent)' }}
            />
          </div>

          {/* Dish Content */}
          {activeTab === 'top' ? (
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
              friendsVotesByDish={friendsVotesByDish}
            />
          ) : (
            <RestaurantMenu
              dishes={dishes}
              loading={dishesLoading}
              error={dishesError}
              searchQuery={dishSearchQuery}
              menuSectionOrder={selectedRestaurant?.menu_section_order || []}
            />
          )}
        </>
      )}

      {/* Radius Sheet */}
      <RadiusSheet
        isOpen={showRadiusSheet}
        onClose={() => setShowRadiusSheet(false)}
        radius={radius}
        onRadiusChange={setRadius}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {selectedRestaurant && (
        <AddDishModal
          isOpen={addDishModalOpen}
          onClose={() => setAddDishModalOpen(false)}
          restaurantId={selectedRestaurant.id}
          restaurantName={selectedRestaurant.name}
          onDishCreated={() => refetch()}
        />
      )}

      <AddRestaurantModal
        isOpen={addRestaurantModalOpen}
        onClose={() => setAddRestaurantModalOpen(false)}
        initialQuery={addRestaurantInitialQuery}
      />
    </div>
  )
}
