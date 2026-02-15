import { useState, useMemo, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { capture } from '../lib/analytics'
import { useAuth } from '../context/AuthContext'
import { useLocationContext } from '../context/LocationContext'
import { useRestaurants } from '../hooks/useRestaurants'
import { useNearbyPlaces } from '../hooks/useNearbyPlaces'
import { DishSearch } from '../components/DishSearch'
import { RestaurantCard } from '../components/restaurants'
import { RadiusSheet } from '../components/LocationPicker'
import { LocationBanner } from '../components/LocationBanner'
import { AddRestaurantModal } from '../components/AddRestaurantModal'
import { ErrorBoundary } from '../components/ErrorBoundary'

const RestaurantMap = lazy(() =>
  import('../components/restaurants/RestaurantMap').then(m => ({ default: m.RestaurantMap }))
)

export function Restaurants() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { location, radius, setRadius, permissionState, requestLocation } = useLocationContext()

  const [restaurantTab, setRestaurantTab] = useState('open')
  const [viewMode, setViewMode] = useState('list')
  const [showRadiusSheet, setShowRadiusSheet] = useState(false)
  const [addRestaurantModalOpen, setAddRestaurantModalOpen] = useState(false)
  const [addRestaurantInitialQuery, setAddRestaurantInitialQuery] = useState('')

  // Fetch restaurants (distance-filtered when location available)
  const { restaurants, loading, error: fetchError, isDistanceFiltered } = useRestaurants(
    location, radius, permissionState
  )

  // Google Place IDs already in DB (to filter from discovery)
  const existingPlaceIds = useMemo(() =>
    restaurants.filter(r => r.google_place_id).map(r => r.google_place_id),
    [restaurants]
  )

  // Discover nearby restaurants from Google Places (auth only, capped at 10mi)
  const { places: nearbyPlaces, loading: nearbyLoading } = useNearbyPlaces({
    lat: location?.lat,
    lng: location?.lng,
    radius,
    isAuthenticated: !!user,
    existingPlaceIds,
  })

  // Filter by open/closed tab (distance-sorted results keep their order)
  const filteredRestaurants = useMemo(() => {
    const filtered = restaurants
      .filter(r => restaurantTab === 'open' ? r.is_open !== false : r.is_open === false)

    if (!isDistanceFiltered) {
      return filtered.slice().sort((a, b) => a.name.localeCompare(b.name))
    }
    return filtered
  }, [restaurants, restaurantTab, isDistanceFiltered])

  const handleRestaurantSelect = (restaurant) => {
    capture('restaurant_viewed', {
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      restaurant_address: restaurant.address,
      dish_count: restaurant.dish_count ?? restaurant.dishCount ?? 0,
    })
    navigate(`/restaurants/${restaurant.id}`)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%)' }}>
      <h1 className="sr-only">Restaurants</h1>

      {/* DishSearch — same as Home, handles dish/restaurant/category search */}
      <header
        className="px-4 pt-4 pb-3 relative"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200, 90, 84, 0.04) 0%, transparent 70%),
            var(--color-bg)
          `,
        }}
      >
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
          style={{
            width: '90%',
            background: 'linear-gradient(90deg, transparent, var(--color-divider), transparent)',
          }}
        />
        <DishSearch placeholder="Search dishes, restaurants..." />
      </header>

      <div className="p-4 pt-5">
        {/* Section Header with controls */}
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
                <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                </svg>
              ) : (
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

        {/* Map View — wrapped in ErrorBoundary to prevent Leaflet crashes */}
        {viewMode === 'map' && !fetchError && !loading && (
          <div className="mt-4">
            <ErrorBoundary>
              <Suspense fallback={
                <div className="flex justify-center py-12">
                  <div className="animate-spin w-6 h-6 border-2 rounded-full" style={{ borderColor: 'var(--color-divider)', borderTopColor: 'var(--color-accent-gold)' }} />
                </div>
              }>
                <RestaurantMap
                  restaurants={filteredRestaurants}
                  nearbyPlaces={nearbyPlaces}
                  userLocation={location}
                  onSelectRestaurant={handleRestaurantSelect}
                  onAddPlace={(placeName) => {
                    setAddRestaurantInitialQuery(placeName)
                    setAddRestaurantModalOpen(true)
                  }}
                />
              </Suspense>
            </ErrorBoundary>
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
        ) : loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--color-card)' }} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onSelect={handleRestaurantSelect}
              />
            ))}

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
                  {restaurantTab === 'open'
                    ? 'No open restaurants found'
                    : 'No closed restaurants'
                  }
                </p>
                {isDistanceFiltered && (
                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                    Try increasing your search radius
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Discover More Restaurants — Google Places (auth only) */}
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

      {/* Add restaurant floating CTA (authenticated) */}
      {user && (
        <button
          onClick={() => {
            setAddRestaurantInitialQuery('')
            setAddRestaurantModalOpen(true)
          }}
          className="fixed bottom-20 right-4 z-10 flex items-center gap-2 px-4 py-3 rounded-full font-semibold text-sm shadow-lg transition-all active:scale-95"
          style={{
            background: 'var(--color-accent-gold)',
            color: 'var(--color-bg)',
            boxShadow: '0 4px 16px rgba(217, 167, 101, 0.4)',
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add a restaurant
        </button>
      )}

      {/* Radius Sheet */}
      <RadiusSheet
        isOpen={showRadiusSheet}
        onClose={() => setShowRadiusSheet(false)}
        radius={radius}
        onRadiusChange={setRadius}
      />

      <AddRestaurantModal
        isOpen={addRestaurantModalOpen}
        onClose={() => setAddRestaurantModalOpen(false)}
        initialQuery={addRestaurantInitialQuery}
      />
    </div>
  )
}
