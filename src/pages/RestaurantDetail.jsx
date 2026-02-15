import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { capture } from '../lib/analytics'
import { useAuth } from '../context/AuthContext'
import { logger } from '../utils/logger'
import { restaurantsApi } from '../api/restaurantsApi'
import { followsApi } from '../api/followsApi'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useFavorites } from '../hooks/useFavorites'
import { LoginModal } from '../components/Auth/LoginModal'
import { AddDishModal } from '../components/AddDishModal'
import { RestaurantDishes, RestaurantMenu } from '../components/restaurants'

export function RestaurantDetail() {
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { location, radius } = useLocationContext()

  const [restaurant, setRestaurant] = useState(null)
  const [loadingRestaurant, setLoadingRestaurant] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const [activeTab, setActiveTab] = useState('top')
  const [dishSearchQuery, setDishSearchQuery] = useState('')
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [addDishModalOpen, setAddDishModalOpen] = useState(false)
  const [friendsVotesByDish, setFriendsVotesByDish] = useState({})

  // Fetch restaurant by ID
  useEffect(() => {
    if (!restaurantId) return

    let cancelled = false
    setLoadingRestaurant(true)
    setFetchError(null)

    restaurantsApi.getById(restaurantId)
      .then(data => {
        if (!cancelled) {
          setRestaurant(data)
          capture('restaurant_viewed', {
            restaurant_id: data.id,
            restaurant_name: data.name,
            restaurant_address: data.address,
          })
        }
      })
      .catch(err => {
        if (!cancelled) {
          logger.error('Failed to fetch restaurant:', err)
          setFetchError(err)
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingRestaurant(false)
      })

    return () => { cancelled = true }
  }, [restaurantId])

  // Fetch dishes for this restaurant
  const { dishes, loading: dishesLoading, error: dishesError, refetch } = useDishes(
    location, radius, null, restaurantId
  )

  const { isFavorite, toggleFavorite } = useFavorites(user?.id)

  // Fetch friend votes
  useEffect(() => {
    if (!restaurantId || !user) {
      setFriendsVotesByDish({})
      return
    }

    let cancelled = false

    async function fetchFriendsVotes() {
      try {
        const votes = await followsApi.getFriendsVotesForRestaurant(restaurantId)
        if (cancelled) return
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
        if (!cancelled) setFriendsVotesByDish({})
      }
    }

    fetchFriendsVotes()
    return () => { cancelled = true }
  }, [restaurantId, user])

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

  // Loading state
  if (loadingRestaurant) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
        <div className="px-4 py-6 space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full" style={{ background: 'var(--color-surface-elevated)' }} />
            <div>
              <div className="h-5 w-40 rounded" style={{ background: 'var(--color-surface-elevated)' }} />
              <div className="h-3 w-24 rounded mt-2" style={{ background: 'var(--color-surface-elevated)' }} />
            </div>
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl" style={{ background: 'var(--color-card)' }} />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center px-4">
          <p role="alert" className="text-sm mb-4" style={{ color: 'var(--color-danger)' }}>
            {fetchError?.message || 'Failed to load restaurant'}
          </p>
          <button
            onClick={() => navigate('/restaurants')}
            className="px-4 py-2 text-sm font-medium rounded-lg"
            style={{ background: 'var(--color-primary)', color: 'white' }}
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    )
  }

  if (!restaurant) return null

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <h1 className="sr-only">{restaurant.name}</h1>

      {/* Sticky header with back button */}
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
            onClick={() => navigate('/restaurants')}
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
              {restaurant.name}
            </h2>
            <p className="font-medium" style={{ color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
              {restaurant.dish_count ?? restaurant.dishCount ?? 0} dishes
              {restaurant.distance_miles != null && (
                <span> · {restaurant.distance_miles} mi away</span>
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
          {restaurant.address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 hover:text-orange-400 transition-colors group"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mt-0.5 flex-shrink-0 group-hover:opacity-80" style={{ color: 'var(--color-text-tertiary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span className="text-sm">{restaurant.address}</span>
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
          menuSectionOrder={restaurant?.menu_section_order || []}
        />
      )}

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      <AddDishModal
        isOpen={addDishModalOpen}
        onClose={() => setAddDishModalOpen(false)}
        restaurantId={restaurantId}
        restaurantName={restaurant.name}
        onDishCreated={() => refetch()}
      />
    </div>
  )
}
