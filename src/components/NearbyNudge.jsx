import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNearbyRestaurant } from '../hooks/useNearbyRestaurant'
import { AddDishModal } from './AddDishModal'
import { AddRestaurantModal } from './AddRestaurantModal'
import { LoginModal } from './Auth/LoginModal'

const DISMISS_KEY = 'wgh_nearby_nudge_dismissed'

/**
 * Non-intrusive banner that detects GPS proximity to restaurants.
 * - Near a known restaurant: "At [Name]? Rate a dish!"
 * - Has location but no match: "Know this spot? Add it to WGH"
 * - No location permission: renders nothing
 */
export function NearbyNudge() {
  const { user } = useAuth()
  const { nearbyRestaurant, isLoading, hasRealLocation } = useNearbyRestaurant()

  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === 'true'
    } catch {
      return false
    }
  })

  const [addDishOpen, setAddDishOpen] = useState(false)
  const [addRestaurantOpen, setAddRestaurantOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  // Don't render if: no GPS, dismissed, or still loading
  if (!hasRealLocation || dismissed || isLoading) return null

  const handleDismiss = () => {
    setDismissed(true)
    try {
      sessionStorage.setItem(DISMISS_KEY, 'true')
    } catch {
      // sessionStorage unavailable
    }
  }

  const handleRateDish = () => {
    if (!user) {
      setLoginOpen(true)
      return
    }
    setAddDishOpen(true)
  }

  const handleAddRestaurant = () => {
    if (!user) {
      setLoginOpen(true)
      return
    }
    setAddRestaurantOpen(true)
  }

  return (
    <>
      <div
        className="mx-4 my-3 px-4 py-3 rounded-xl flex items-center gap-3"
        style={{
          background: 'var(--color-card)',
          borderLeft: '3px solid var(--color-accent-gold)',
        }}
      >
        <div className="flex-1 min-w-0">
          {nearbyRestaurant ? (
            <>
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                At {nearbyRestaurant.name}?
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                Rate a dish and help others discover what&apos;s good
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Know this spot?
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                Add it to WGH so others can find it
              </p>
            </>
          )}
        </div>

        {nearbyRestaurant ? (
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
        ) : (
          <button
            onClick={handleAddRestaurant}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.97]"
            style={{
              background: 'rgba(217, 167, 101, 0.15)',
              color: 'var(--color-accent-gold)',
              border: '1px solid rgba(217, 167, 101, 0.3)',
            }}
          >
            Add it
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
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
      />
    </>
  )
}
