import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLocationContext } from '../context/LocationContext'
import { useNearbyRestaurant } from '../hooks/useNearbyRestaurant'
import { useNearbyPlaces } from '../hooks/useNearbyPlaces'
import { AddDishModal } from './AddDishModal'
import { AddRestaurantModal } from './AddRestaurantModal'
import { LoginModal } from './Auth/LoginModal'

/**
 * Smart location-based check-in card — Neo-Brutalist style.
 * Adapts to location state:
 * 1. No GPS permission → "Enable GPS to check in"
 * 2. GPS loading → spinner
 * 3. Near a WGH restaurant → "You're at [Name]!" with Check In button
 * 4. Near a Google Place (not in WGH) → "At [Place]? Add it!"
 * 5. GPS granted, no match → "Know a good spot nearby?"
 * 6. GPS denied/unsupported → returns null
 */
export function NearbyNudge() {
  const navigate = useNavigate()
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

  const [addDishOpen, setAddDishOpen] = useState(false)
  const [addRestaurantOpen, setAddRestaurantOpen] = useState(false)
  const [addRestaurantQuery, setAddRestaurantQuery] = useState('')
  const [loginOpen, setLoginOpen] = useState(false)

  // Hide if truly can't use location
  if (permissionState === 'denied' || permissionState === 'unsupported') return null

  const handleCheckIn = () => {
    if (!nearbyRestaurant) return
    // Navigate to the restaurant page — that's the check-in destination
    navigate(`/restaurants/${nearbyRestaurant.id}`)
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

  // State 1: GPS not yet granted
  const needsPermission = permissionState === 'prompt' || (!hasRealLocation && !isLoading)

  // --- State: Need GPS permission ---
  if (needsPermission) {
    return (
      <>
        <div
          className="mx-5 my-3 px-5 py-4 rounded-xl"
          style={{
            background: '#FFF7ED',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#F97316', border: '2px solid #000000' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#000000" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ color: '#000000', fontSize: '15px', fontWeight: 800 }}>
                At a restaurant?
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#666666' }}>
                Enable GPS to check in and rate dishes
              </p>
            </div>
            <button
              onClick={promptForLocation}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-xs transition-all duration-150"
              style={{
                background: '#F97316',
                color: '#000000',
                fontWeight: 800,
                border: '3px solid #000000',
                boxShadow: '3px 3px 0px 0px #000000',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translate(2px, 2px)'
                e.currentTarget.style.boxShadow = '1px 1px 0px 0px #000000'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)'
                e.currentTarget.style.boxShadow = '3px 3px 0px 0px #000000'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)'
                e.currentTarget.style.boxShadow = '3px 3px 0px 0px #000000'
              }}
            >
              Enable GPS
            </button>
          </div>
        </div>
        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      </>
    )
  }

  // --- State: Loading ---
  if (isLoading) {
    return (
      <div
        className="mx-5 my-3 px-5 py-4 rounded-xl"
        style={{
          background: '#FFF7ED',
          border: '3px solid #000000',
          boxShadow: '4px 4px 0px 0px #000000',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex-shrink-0 w-6 h-6 rounded-full border-3 animate-spin"
            style={{
              borderWidth: '3px',
              borderColor: '#F5F5F5',
              borderTopColor: '#F97316',
            }}
          />
          <p style={{ color: '#000000', fontSize: '14px', fontWeight: 700 }}>
            Checking nearby restaurants...
          </p>
        </div>
      </div>
    )
  }

  // --- State: Found WGH restaurant nearby → CHECK IN ---
  if (nearbyRestaurant) {
    const distanceMi = nearbyRestaurant.distance_meters
      ? (nearbyRestaurant.distance_meters / 1609).toFixed(1)
      : null

    return (
      <>
        <div
          className="mx-5 my-3 rounded-xl overflow-hidden"
          style={{
            border: '3px solid #000000',
            boxShadow: '6px 6px 0px 0px #000000',
          }}
        >
          {/* Header — orange banner */}
          <div
            className="px-5 py-3 flex items-center gap-3"
            style={{ background: '#F97316', borderBottom: '3px solid #000000' }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#000000" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span style={{ color: '#000000', fontSize: '13px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              You&apos;re here
            </span>
          </div>

          {/* Body — restaurant info + actions */}
          <div className="px-5 py-4" style={{ background: '#FFFFFF' }}>
            <p style={{ color: '#000000', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {nearbyRestaurant.name}
            </p>
            <p className="text-xs mt-1" style={{ color: '#666666' }}>
              {nearbyRestaurant.address}
              {distanceMi && ` · ${distanceMi} mi away`}
            </p>

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCheckIn}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all duration-150"
                style={{
                  background: '#F97316',
                  color: '#000000',
                  fontWeight: 800,
                  border: '3px solid #000000',
                  boxShadow: '4px 4px 0px 0px #000000',
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translate(2px, 2px)'
                  e.currentTarget.style.boxShadow = '2px 2px 0px 0px #000000'
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)'
                  e.currentTarget.style.boxShadow = '4px 4px 0px 0px #000000'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)'
                  e.currentTarget.style.boxShadow = '4px 4px 0px 0px #000000'
                }}
              >
                Check In
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>

              <button
                onClick={handleRateDish}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm transition-all duration-150"
                style={{
                  background: '#FFFFFF',
                  color: '#000000',
                  fontWeight: 700,
                  border: '3px solid #000000',
                  boxShadow: '4px 4px 0px 0px #000000',
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translate(2px, 2px)'
                  e.currentTarget.style.boxShadow = '2px 2px 0px 0px #000000'
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)'
                  e.currentTarget.style.boxShadow = '4px 4px 0px 0px #000000'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)'
                  e.currentTarget.style.boxShadow = '4px 4px 0px 0px #000000'
                }}
              >
                Rate a dish
              </button>
            </div>
          </div>
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
        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      </>
    )
  }

  // --- State: Google Place nearby (not in WGH yet) ---
  if (closestGooglePlace) {
    return (
      <>
        <div
          className="mx-5 my-3 rounded-xl overflow-hidden"
          style={{
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        >
          <div
            className="px-5 py-3 flex items-center gap-3"
            style={{ background: '#FFF7ED', borderBottom: '2px solid #000000' }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#F97316" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span style={{ color: '#000000', fontSize: '13px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Near you
            </span>
          </div>

          <div className="px-5 py-4" style={{ background: '#FFFFFF' }}>
            <p style={{ color: '#000000', fontSize: '18px', fontWeight: 800 }}>
              At {closestGooglePlace.name}?
            </p>
            <p className="text-xs mt-1" style={{ color: '#666666' }}>
              This restaurant isn&apos;t on WGH yet. Be the first to add it!
            </p>

            <button
              onClick={() => handleAddRestaurant(closestGooglePlace.name)}
              className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all duration-150"
              style={{
                background: '#F97316',
                color: '#000000',
                fontWeight: 800,
                border: '3px solid #000000',
                boxShadow: '4px 4px 0px 0px #000000',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translate(2px, 2px)'
                e.currentTarget.style.boxShadow = '2px 2px 0px 0px #000000'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)'
                e.currentTarget.style.boxShadow = '4px 4px 0px 0px #000000'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)'
                e.currentTarget.style.boxShadow = '4px 4px 0px 0px #000000'
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add {closestGooglePlace.name}
            </button>
          </div>
        </div>

        <AddRestaurantModal
          isOpen={addRestaurantOpen}
          onClose={() => setAddRestaurantOpen(false)}
          initialQuery={addRestaurantQuery}
        />
        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      </>
    )
  }

  // --- State: GPS works but nothing nearby ---
  return (
    <>
      <div
        className="mx-5 my-3 px-5 py-4 rounded-xl"
        style={{
          background: '#FFF7ED',
          border: '3px solid #000000',
          boxShadow: '4px 4px 0px 0px #000000',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#F97316', border: '2px solid #000000' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#000000" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ color: '#000000', fontSize: '15px', fontWeight: 800 }}>
              Know a good spot nearby?
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#666666' }}>
              Add a restaurant and be the first to rate it
            </p>
          </div>
          <button
            onClick={() => handleAddRestaurant('')}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-xs transition-all duration-150"
            style={{
              background: '#F97316',
              color: '#000000',
              fontWeight: 800,
              border: '3px solid #000000',
              boxShadow: '3px 3px 0px 0px #000000',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(2px, 2px)'
              e.currentTarget.style.boxShadow = '1px 1px 0px 0px #000000'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)'
              e.currentTarget.style.boxShadow = '3px 3px 0px 0px #000000'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)'
              e.currentTarget.style.boxShadow = '3px 3px 0px 0px #000000'
            }}
          >
            Add a spot
          </button>
        </div>
      </div>

      <AddRestaurantModal
        isOpen={addRestaurantOpen}
        onClose={() => setAddRestaurantOpen(false)}
        initialQuery={addRestaurantQuery}
      />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
