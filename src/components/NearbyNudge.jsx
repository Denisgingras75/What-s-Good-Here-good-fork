import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocationContext } from '../context/LocationContext'
import { useNearbyRestaurant } from '../hooks/useNearbyRestaurant'
import { useNearbyPlaces } from '../hooks/useNearbyPlaces'
import { AddDishModal } from './AddDishModal'
import { AddRestaurantModal } from './AddRestaurantModal'
import { LoginModal } from './Auth/LoginModal'

const DISMISS_KEY = 'wgh_nearby_nudge_dismissed'

/**
 * Smart location nudge — always visible, adapts to state:
 * 1. No GPS permission → "Enable GPS to find what's near you"
 * 2. GPS granted, near a known restaurant → "At [Name]? Rate a dish!"
 * 3. GPS granted, no WGH match, Google Place found → "At [Place]? Add it to WGH"
 * 4. GPS granted, no match at all → "Know a good spot? Add it"
 * 5. GPS denied/unsupported → returns null (nothing we can do)
 */
export function NearbyNudge() {
  const { user } = useAuth()
  const { location, permissionState, promptForLocation } = useLocationContext()
  const { nearbyRestaurant, isLoading, hasRealLocation } = useNearbyRestaurant()

  // When no WGH restaurant found, check Google Places for context
  const { places: nearbyGooglePlaces } = useNearbyPlaces({
    lat: location?.lat,
    lng: location?.lng,
    radius: 1, // 1 mile — very close for nudge purposes
    isAuthenticated: !!user,
    existingPlaceIds: [],
  })

  // Closest Google Place (if any)
  const closestGooglePlace = !nearbyRestaurant && nearbyGooglePlaces.length > 0
    ? nearbyGooglePlaces[0]
    : null

  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === 'true'
    } catch {
      return false
    }
  })

  const [addDishOpen, setAddDishOpen] = useState(false)
  const [addRestaurantOpen, setAddRestaurantOpen] = useState(false)
  const [addRestaurantQuery, setAddRestaurantQuery] = useState('')
  const [loginOpen, setLoginOpen] = useState(false)

  // Only hide if dismissed or truly can't use location
  if (dismissed) return null
  if (permissionState === 'denied' || permissionState === 'unsupported') return null

  const handleDismiss = () => {
    setDismissed(true)
    try {
      sessionStorage.setItem(DISMISS_KEY, 'true')
    } catch {
      // sessionStorage unavailable
    }
  }

  const handleRateDish = () => {
    if (!user) { setLoginOpen(true); return }
    setAddDishOpen(true)
  }

  const handleAddRestaurant = (placeName) => {
    if (!user) { setLoginOpen(true); return }
    setAddRestaurantQuery(placeName || '')
    setAddRestaurantOpen(true)
  }

  // State 1: GPS not yet granted — be the location prompt
  const needsPermission = permissionState === 'prompt' || (!hasRealLocation && !isLoading)

  return (
    <>
      <div
        className="mx-4 my-3 px-4 py-3 rounded-xl"
        style={{
          background: 'var(--color-card)',
          borderLeft: '3px solid var(--color-accent-gold)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {needsPermission ? (
              <>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  What&apos;s near you?
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                  Enable GPS to discover restaurants and rate dishes nearby
                </p>
              </>
            ) : isLoading ? (
              <>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Looking around...
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                  Checking for restaurants nearby
                </p>
              </>
            ) : nearbyRestaurant ? (
              <>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                  At {nearbyRestaurant.name}?
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                  Rate a dish and help others discover what&apos;s good
                </p>
              </>
            ) : closestGooglePlace ? (
              <>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                  At {closestGooglePlace.name}?
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                  Add it to WGH and be the first to rate a dish
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Know a good spot nearby?
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                  Be the first to add it — anywhere in the world
                </p>
              </>
            )}
          </div>

          {needsPermission ? (
            <button
              onClick={promptForLocation}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.97]"
              style={{
                background: 'var(--color-accent-gold)',
                color: 'var(--color-bg)',
              }}
            >
              Enable GPS
            </button>
          ) : isLoading ? (
            <div
              className="flex-shrink-0 w-5 h-5 rounded-full border-2 animate-spin"
              style={{
                borderColor: 'var(--color-divider)',
                borderTopColor: 'var(--color-accent-gold)',
              }}
            />
          ) : nearbyRestaurant ? (
            <button
              onClick={handleRateDish}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.97]"
              style={{
                background: 'var(--color-accent-gold)',
                color: 'var(--color-bg)',
              }}
            >
              Rate a dish
            </button>
          ) : closestGooglePlace ? (
            <button
              onClick={() => handleAddRestaurant(closestGooglePlace.name)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.97]"
              style={{
                background: 'var(--color-accent-gold)',
                color: 'var(--color-bg)',
              }}
            >
              Add it
            </button>
          ) : (
            <button
              onClick={() => handleAddRestaurant('')}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.97]"
              style={{
                background: 'var(--color-accent-gold)',
                color: 'var(--color-bg)',
              }}
            >
              Add a spot
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-text-tertiary)' }}
            aria-label="Dismiss"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* "Not here?" fallback when we matched the wrong restaurant */}
        {!needsPermission && !isLoading && (nearbyRestaurant || closestGooglePlace) && (
          <button
            onClick={() => handleAddRestaurant('')}
            className="mt-2 text-xs transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Not here? Add a different restaurant
          </button>
        )}
      </div>

      {nearbyRestaurant && (
        <AddDishModal
          isOpen={addDishOpen}
          onClose={() => setAddDishOpen(false)}
          restaurantId={nearbyRestaurant.id}
          restaurantName={nearbyRestaurant.name}
          onDishCreated={() => setAddDishOpen(false)}
        />
      )}

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
