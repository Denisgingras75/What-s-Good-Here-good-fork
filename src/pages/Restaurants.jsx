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
import { LoginModal } from '../components/Auth/LoginModal'
import { RestaurantDishes, RestaurantMenu } from '../components/restaurants'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { getRatingColor } from '../utils/ranking'

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
  const [activeTab, setActiveTab] = useState('top')
  const [restaurantTab, setRestaurantTab] = useState('open')
  const [friendsVotesByDish, setFriendsVotesByDish] = useState({})

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
        // Fetch full data (includes menu_section_order)
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
        // Group votes by dish_id
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
      dish_count: restaurant.dishCount,
    })
    // Fetch full restaurant data (includes menu_section_order)
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

  // Filter restaurants by open/closed tab, search, and sort alphabetically
  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter(r => restaurantTab === 'open' ? r.is_open !== false : r.is_open === false)
      .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [restaurants, searchQuery, restaurantTab])

  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF' }}>
      <h1 className="sr-only">Restaurants</h1>

      {/* Header */}
      <header
        className="px-4 pt-4 pb-3"
        style={{
          background: '#FFFFFF',
          borderBottom: '2px solid #1A1A1A',
        }}
      >
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
            style={{ color: '#999999' }}
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
            className="w-full pl-10 pr-4 py-3 rounded-lg"
            style={{
              background: '#FFFFFF',
              border: '1px solid #1A1A1A',
              color: '#1A1A1A',
              fontSize: '14px',
            }}
          />
          {/* Clear button when searching dishes */}
          {selectedRestaurant && dishSearchQuery && (
            <button
              onClick={() => setDishSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              style={{ color: '#999999' }}
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
          {/* Section Header */}
          <div className="mb-4">
            <h2
              style={{
                fontFamily: "'aglet-sans', sans-serif",
                fontWeight: 800,
                color: '#E4440A',
                fontSize: '22px',
                letterSpacing: '-0.01em',
              }}
            >
              Restaurants
            </h2>
          </div>

          {/* Open / Closed Tab Switcher */}
          <div
            className="flex rounded-lg p-1 mb-5"
            style={{
              background: '#FFFFFF',
              border: '1px solid #1A1A1A',
            }}
            role="tablist"
            aria-label="Restaurant status filter"
          >
            <button
              role="tab"
              aria-selected={restaurantTab === 'open'}
              onClick={() => setRestaurantTab('open')}
              className="flex-1 py-1.5 text-sm font-bold rounded-md transition-all"
              style={{
                background: restaurantTab === 'open' ? '#E4440A' : 'transparent',
                color: restaurantTab === 'open' ? '#FFFFFF' : '#999999',
              }}
            >
              Open
            </button>
            <button
              role="tab"
              aria-selected={restaurantTab === 'closed'}
              onClick={() => setRestaurantTab('closed')}
              className="flex-1 py-1.5 text-sm font-bold rounded-md transition-all"
              style={{
                background: restaurantTab === 'closed' ? '#E4440A' : 'transparent',
                color: restaurantTab === 'closed' ? '#FFFFFF' : '#999999',
              }}
            >
              Closed
            </button>
          </div>

          {fetchError ? (
            <div className="text-center py-12">
              <p role="alert" className="text-sm mb-4" style={{ color: '#E4440A' }}>{fetchError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 text-sm font-bold rounded-lg card-press"
                style={{
                  background: '#E4440A',
                  color: '#FFFFFF',
                  border: '2px solid #1A1A1A',
                  boxShadow: '2px 2px 0px #1A1A1A',
                }}
              >
                Try Again
              </button>
            </div>
          ) : loading || dishesLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl animate-pulse"
                  style={{ background: '#F5F5F5', border: '2px solid #E0E0E0' }}
                />
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
                    className="w-full rounded-xl p-4 text-left card-press"
                    style={{
                      background: restaurant.is_open
                        ? 'linear-gradient(135deg, #FFFFFF 50%, #FDE8DC 100%)'
                        : 'linear-gradient(135deg, #F5F5F5 50%, #EDEDED 100%)',
                      border: restaurant.is_open ? '2px solid #C4753C' : '2px solid #CCCCCC',
                      boxShadow: restaurant.is_open ? '2px 2px 0px #C4753C' : '2px 2px 0px #CCCCCC',
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Restaurant info */}
                      <div className="min-w-0 flex-1">
                        <h3
                          className="font-bold"
                          style={{
                            fontFamily: "'aglet-sans', sans-serif",
                            color: restaurant.is_open ? '#1A1A1A' : '#999999',
                            fontSize: restaurant.is_open ? '18px' : '14px',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {restaurant.name}
                        </h3>
                        {restaurant.is_open && restaurant.town && (
                          <p
                            className="mt-0.5 font-medium"
                            style={{
                              fontSize: '12px',
                              color: '#BBBBBB',
                              letterSpacing: '0.02em',
                              textTransform: 'uppercase',
                            }}
                          >
                            {restaurant.town}
                          </p>
                        )}
                        {!restaurant.is_open && (
                          <span
                            className="inline-block mt-1 px-2 py-0.5 rounded font-bold"
                            style={{
                              fontSize: '10px',
                              background: '#FFF0EB',
                              color: '#E4440A',
                              border: '1px solid #E4440A',
                            }}
                          >
                            Closed for Season
                          </span>
                        )}
                        {restaurant.knownFor && (
                          <p
                            className="mt-1.5 font-medium"
                            style={{ fontSize: '12px', color: '#BBBBBB' }}
                          >
                            Known for{' '}
                            <span style={{ color: '#999999' }}>
                              {restaurant.knownFor.name}
                            </span>
                            {' \u00B7 '}
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
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0" style={{ color: '#1A1A1A' }}>
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
                    color: '#999999',
                    background: '#FFFFFF',
                    border: '1px solid #E0E0E0',
                  }}
                >
                  <p className="font-bold" style={{ fontSize: '14px' }}>
                    {searchQuery
                      ? 'No restaurants found'
                      : restaurantTab === 'open'
                        ? 'No open restaurants found'
                        : 'No closed restaurants'
                    }
                  </p>
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
          <div
            className="sticky top-0 z-20 px-4 py-3"
            style={{
              background: '#FFFFFF',
              borderBottom: '2px solid #1A1A1A',
            }}
          >
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
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ color: '#1A1A1A' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div className="min-w-0">
                <h2
                  className="font-bold truncate"
                  style={{
                    fontFamily: "'aglet-sans', sans-serif",
                    fontWeight: 800,
                    color: '#1A1A1A',
                    fontSize: '22px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {selectedRestaurant.name}
                </h2>
                <p className="font-medium" style={{ color: '#BBBBBB', fontSize: '13px' }}>
                  {selectedRestaurant.dishCount} dishes
                </p>
              </div>
            </div>
          </div>

          {/* Restaurant Details Card */}
          <div className="px-4 py-4" style={{ background: '#FFFFFF', borderBottom: '1px solid #E0E0E0' }}>
            <div className="space-y-3">
              {/* Address with Maps link */}
              {selectedRestaurant.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedRestaurant.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group"
                  style={{ color: '#999999' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#BBBBBB' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span className="text-sm">{selectedRestaurant.address}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#CCCCCC' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}

            </div>

          </div>

          {/* Tab Switcher */}
          <div className="px-4 pt-4">
            <div
              className="flex rounded-lg p-1"
              style={{
                background: '#FFFFFF',
                border: '1px solid #1A1A1A',
              }}
              role="tablist"
              aria-label="Restaurant view"
            >
              <button
                role="tab"
                aria-selected={activeTab === 'top'}
                onClick={() => setActiveTab('top')}
                className="flex-1 py-1.5 text-sm font-bold rounded-md transition-all"
                style={{
                  background: activeTab === 'top' ? '#E4440A' : 'transparent',
                  color: activeTab === 'top' ? '#FFFFFF' : '#999999',
                }}
              >
                Top Rated
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'menu'}
                onClick={() => setActiveTab('menu')}
                className="flex-1 py-1.5 text-sm font-bold rounded-md transition-all"
                style={{
                  background: activeTab === 'menu' ? '#E4440A' : 'transparent',
                  color: activeTab === 'menu' ? '#FFFFFF' : '#999999',
                }}
              >
                Menu
              </button>
            </div>
            <div
              className="mt-3 h-px"
              style={{ background: '#E0E0E0' }}
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
              restaurantName={selectedRestaurant?.name}
              restaurantTown={selectedRestaurant?.town}
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

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  )
}
