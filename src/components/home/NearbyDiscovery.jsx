import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLocationContext } from '../../context/LocationContext'
import { useNearbyPlaces } from '../../hooks/useNearbyPlaces'
import { AddRestaurantModal } from '../AddRestaurantModal'
import { LoginModal } from '../Auth/LoginModal'

/**
 * NearbyDiscovery — shown on Home when there are no WGH dishes nearby.
 * Discovers restaurants from Google Places and prompts users to add them.
 *
 * Handles three states:
 * 1. Not authenticated → shows sign-in prompt
 * 2. Authenticated, places found → shows place cards with "Be the first to rate" CTA
 * 3. Authenticated, no places → shows manual add prompt
 */
export function NearbyDiscovery({ existingPlaceIds = [] }) {
  const { user } = useAuth()
  const { location, radius, permissionState } = useLocationContext()

  const { places, loading, error, needsAuth } = useNearbyPlaces({
    lat: location?.lat,
    lng: location?.lng,
    radius: radius + 5,
    isAuthenticated: !!user,
    existingPlaceIds,
  })

  const [addRestaurantOpen, setAddRestaurantOpen] = useState(false)
  const [addRestaurantQuery, setAddRestaurantQuery] = useState('')
  const [loginOpen, setLoginOpen] = useState(false)

  const handleAddPlace = (placeName) => {
    if (!user) {
      setLoginOpen(true)
      return
    }
    setAddRestaurantQuery(placeName)
    setAddRestaurantOpen(true)
  }

  // No GPS available — don't show discovery
  if (permissionState !== 'granted') return null

  return (
    <>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-1 h-6 rounded-full"
            style={{ background: 'linear-gradient(180deg, var(--color-accent-gold) 0%, var(--color-accent-orange) 100%)' }}
          />
          <div>
            <h3
              className="font-bold"
              style={{ color: 'var(--color-text-primary)', fontSize: '16px' }}
            >
              Restaurants near you
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Found on Google Maps — be the first to rate a dish
            </p>
          </div>
        </div>

        {/* Auth prompt for logged-out users */}
        {needsAuth && (
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-divider)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Sign in to discover nearby restaurants
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              We'll show you restaurants from Google Maps that haven't been rated yet
            </p>
            <button
              onClick={() => setLoginOpen(true)}
              className="mt-3 px-5 py-2 rounded-full text-sm font-semibold transition-all active:scale-[0.97]"
              style={{ background: 'var(--color-primary)', color: 'white' }}
            >
              Sign in
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl animate-pulse"
                style={{ background: 'var(--color-card)' }}
              />
            ))}
          </div>
        )}

        {/* Error state — visible so we can debug */}
        {error && !needsAuth && !loading && (
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-divider)' }}
          >
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              {error.message}
            </p>
          </div>
        )}

        {/* Place cards */}
        {!loading && places.length > 0 && (
          <div className="space-y-2">
            {places.slice(0, 8).map((place) => (
              <button
                key={place.placeId}
                onClick={() => handleAddPlace(place.name)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors"
                style={{ background: 'var(--color-card)', border: '1px solid var(--color-divider)' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent-gold)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-divider)'}
              >
                {/* Map pin icon */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(107, 179, 132, 0.12)' }}
                >
                  <svg
                    className="w-4.5 h-4.5"
                    style={{ color: 'var(--color-rating)', width: '18px', height: '18px' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>

                {/* Place info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm truncate"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {place.name}
                  </p>
                  {place.address && (
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                      {place.address}
                    </p>
                  )}
                </div>

                {/* CTA */}
                <span
                  className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: 'rgba(217, 167, 101, 0.12)',
                    color: 'var(--color-accent-gold)',
                  }}
                >
                  + Rate
                </span>
              </button>
            ))}
          </div>
        )}

        {/* No places found — manual add */}
        {!loading && !needsAuth && !error && places.length === 0 && user && (
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-divider)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              No restaurants discovered nearby
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              Know a good spot? Add it and be the first to rate
            </p>
            <button
              onClick={() => { setAddRestaurantQuery(''); setAddRestaurantOpen(true) }}
              className="mt-3 px-5 py-2 rounded-full text-sm font-semibold transition-all active:scale-[0.97]"
              style={{
                background: 'rgba(217, 167, 101, 0.12)',
                color: 'var(--color-accent-gold)',
                border: '1px solid rgba(217, 167, 101, 0.25)',
              }}
            >
              Add a restaurant
            </button>
          </div>
        )}
      </div>

      <AddRestaurantModal
        isOpen={addRestaurantOpen}
        onClose={() => setAddRestaurantOpen(false)}
        initialQuery={addRestaurantQuery}
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
      />
    </>
  )
}
