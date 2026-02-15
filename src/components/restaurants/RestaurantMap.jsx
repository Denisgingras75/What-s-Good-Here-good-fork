import { useState, useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { placesApi } from '../../api/placesApi'
import { logger } from '../../utils/logger'

const MILES_TO_METERS = 1609.34
const EXTRA_RADIUS_MI = 5

// Auto-fit bounds on first render only
function FitBounds({ restaurants, userLocation }) {
  const map = useMap()
  const fittedRef = useRef(false)

  useEffect(() => {
    if (fittedRef.current) return

    const points = restaurants
      .filter(r => r.lat && r.lng)
      .map(r => [r.lat, r.lng])

    if (userLocation?.lat && userLocation?.lng) {
      points.push([userLocation.lat, userLocation.lng])
    }

    if (points.length === 0) return

    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
    fittedRef.current = true
  }, [restaurants, userLocation, map])

  return null
}

// Fetches Google Places within the user's radius + 5mi
// Triggers on initial load and when map stops moving (if center shifted enough)
function MapPlacesLoader({ onPlacesLoaded, existingPlaceIds, userLocation, radiusMi }) {
  const map = useMap()
  const timerRef = useRef(null)
  const lastFetchRef = useRef(null)
  const discoveryRadiusMeters = Math.round((radiusMi + EXTRA_RADIUS_MI) * MILES_TO_METERS)

  const fetchPlaces = useCallback(async (center) => {
    if (!center) return

    // Skip if we fetched from a very similar center recently (< 500m)
    if (lastFetchRef.current) {
      const dist = map.distance(center, lastFetchRef.current)
      if (dist < 500) return
    }
    lastFetchRef.current = center

    // Cap at 40km (~25mi) to match edge function limit
    const clampedRadius = Math.min(discoveryRadiusMeters, 40234)

    try {
      const places = await placesApi.discoverNearby(center.lat, center.lng, clampedRadius)
      const existingSet = new Set(existingPlaceIds || [])
      const filtered = places.filter(p => p.lat && p.lng && !existingSet.has(p.placeId))
      onPlacesLoaded(filtered)
    } catch (err) {
      logger.error('Map places fetch error:', err)
    }
  }, [map, onPlacesLoaded, existingPlaceIds, discoveryRadiusMeters])

  useMapEvents({
    moveend: () => {
      // Debounce: wait 800ms after map stops moving
      if (timerRef.current) clearTimeout(timerRef.current)
      const center = map.getCenter()
      timerRef.current = setTimeout(() => fetchPlaces(center), 800)
    },
  })

  // Fetch on initial mount using user location or map center
  useEffect(() => {
    const center = userLocation?.lat && userLocation?.lng
      ? L.latLng(userLocation.lat, userLocation.lng)
      : map.getCenter()
    const timer = setTimeout(() => fetchPlaces(center), 500)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

// Search bar overlay — geocodes and flies to location, then triggers Places fetch
function MapSearchBar({ onSearch }) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const map = useMap()

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const encoded = encodeURIComponent(query.trim())
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=us`
      )
      const data = await res.json()
      if (data.length > 0) {
        const { lat, lon } = data[0]
        // flyTo triggers moveend which triggers MapPlacesLoader
        map.flyTo([parseFloat(lat), parseFloat(lon)], 14, { duration: 1.5 })
        if (onSearch) onSearch(query.trim())
      }
    } catch (err) {
      logger.error('Map geocode error:', err)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        right: '50px',
        zIndex: 1000,
        display: 'flex',
        gap: '6px',
      }}
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search a location..."
        style={{
          flex: 1,
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(0,0,0,0.2)',
          background: 'white',
          fontSize: '13px',
          color: '#333',
          outline: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        }}
      />
      <button
        onClick={handleSearch}
        disabled={searching}
        style={{
          padding: '8px 12px',
          borderRadius: '8px',
          border: 'none',
          background: '#6BB384',
          color: 'white',
          fontSize: '13px',
          fontWeight: 600,
          cursor: searching ? 'wait' : 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          opacity: searching ? 0.7 : 1,
        }}
      >
        {searching ? '...' : 'Go'}
      </button>
    </div>
  )
}

// Popup content for a discovered Google Place — fetches details on mount
function PlacePopupContent({ place, onAddPlace }) {
  const [details, setDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const fetchedRef = useRef(false)

  const fetchDetails = useCallback(async () => {
    if (fetchedRef.current || !place.placeId) return
    fetchedRef.current = true
    setLoadingDetails(true)
    try {
      const d = await placesApi.getDetails(place.placeId)
      setDetails(d)
    } catch (err) {
      logger.error('Place details fetch error:', err)
    } finally {
      setLoadingDetails(false)
    }
  }, [place.placeId])

  // Fetch details when popup opens (component mounts)
  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  const googleMapsUrl = details?.googleMapsUrl
  const websiteUrl = details?.websiteUrl

  return (
    <div style={{ minWidth: '160px' }}>
      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
        {place.name}
      </div>
      {place.address && (
        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
          {place.address}
        </div>
      )}
      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '6px', fontStyle: 'italic' }}>
        Not on WGH yet
      </div>

      {loadingDetails && (
        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '6px' }}>
          Loading details...
        </div>
      )}

      {/* Links row */}
      {(googleMapsUrl || websiteUrl) && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#4A90D9',
                textDecoration: 'none',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              Google Maps
            </a>
          )}
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#4A90D9',
                textDecoration: 'none',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.97.633-3.792 1.708-5.272" />
              </svg>
              Website
            </a>
          )}
        </div>
      )}

      {/* Add to WGH button */}
      {onAddPlace && (
        <button
          onClick={() => onAddPlace(place.name)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            background: 'rgba(107, 179, 132, 0.15)',
            color: '#6BB384',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add to WGH
        </button>
      )}
    </div>
  )
}

export function RestaurantMap({ restaurants, userLocation, onSelectRestaurant, onAddPlace, isAuthenticated, existingPlaceIds, radiusMi }) {
  const defaultCenter = [41.43, -70.56] // Martha's Vineyard
  const center = userLocation?.lat && userLocation?.lng
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter

  const [discoveredPlaces, setDiscoveredPlaces] = useState([])

  return (
    <div
      style={{
        height: 'calc(100dvh - 160px)',
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--color-divider)',
        position: 'relative',
      }}
    >
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        attributionControl={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds restaurants={restaurants} userLocation={userLocation} />

        {/* Search bar — geocodes and flies to location, moveend then triggers Places fetch */}
        <MapSearchBar />

        {/* Dynamic Google Places loader — uses radius setting + 5mi */}
        {isAuthenticated && (
          <MapPlacesLoader
            onPlacesLoaded={setDiscoveredPlaces}
            existingPlaceIds={existingPlaceIds}
            userLocation={userLocation}
            radiusMi={radiusMi || 10}
          />
        )}

        {/* User location — blue pulsing dot */}
        {userLocation?.lat && userLocation?.lng && (
          <>
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={16}
              pathOptions={{
                color: '#4A90D9',
                fillColor: '#4A90D9',
                fillOpacity: 0.15,
                weight: 1,
                opacity: 0.3,
              }}
            />
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={7}
              pathOptions={{
                color: '#fff',
                fillColor: '#4A90D9',
                fillOpacity: 1,
                weight: 2,
              }}
            >
              <Popup>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>You are here</span>
              </Popup>
            </CircleMarker>
          </>
        )}

        {/* DB restaurant pins — gold solid */}
        {restaurants
          .filter(r => r.lat && r.lng)
          .map(restaurant => {
            const isOpen = restaurant.is_open !== false
            const dishCount = restaurant.dish_count ?? restaurant.dishCount ?? 0
            const distanceMiles = restaurant.distance_miles

            return (
              <CircleMarker
                key={restaurant.id}
                center={[restaurant.lat, restaurant.lng]}
                radius={8}
                pathOptions={{
                  color: isOpen ? '#D9A765' : '#7D7168',
                  fillColor: isOpen ? '#D9A765' : '#7D7168',
                  fillOpacity: isOpen ? 0.9 : 0.5,
                  weight: 2,
                  opacity: 1,
                }}
              >
                <Popup>
                  <div style={{ minWidth: '140px' }}>
                    <button
                      onClick={() => onSelectRestaurant(restaurant)}
                      style={{
                        all: 'unset',
                        cursor: 'pointer',
                        display: 'block',
                        width: '100%',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                        {restaurant.name}
                      </div>
                      {restaurant.cuisine && (
                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '2px' }}>
                          {restaurant.cuisine}
                        </div>
                      )}
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {dishCount} {dishCount === 1 ? 'dish' : 'dishes'}
                        {distanceMiles != null && ` \u00b7 ${distanceMiles} mi`}
                      </div>
                      {!isOpen && (
                        <div style={{ fontSize: '11px', color: 'var(--color-primary)', marginTop: '2px', fontWeight: 600 }}>
                          Closed for Season
                        </div>
                      )}
                      <div style={{ fontSize: '11px', color: 'var(--color-accent-gold)', marginTop: '4px', fontWeight: 500 }}>
                        View dishes &rarr;
                      </div>
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}

        {/* Google Places pins — green dashed, discovered dynamically */}
        {discoveredPlaces.map(place => (
          <CircleMarker
            key={place.placeId}
            center={[place.lat, place.lng]}
            radius={7}
            pathOptions={{
              color: '#6BB384',
              fillColor: '#6BB384',
              fillOpacity: 0.35,
              weight: 2,
              dashArray: '4 4',
              opacity: 0.8,
            }}
          >
            <Popup>
              <PlacePopupContent place={place} onAddPlace={onAddPlace} />
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          zIndex: 1000,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#D9A765', display: 'inline-block' }} />
          <span style={{ color: '#555' }}>On WGH</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6BB384', opacity: 0.5, border: '1px dashed #6BB384', display: 'inline-block' }} />
          <span style={{ color: '#555' }}>Google Places</span>
        </div>
      </div>
    </div>
  )
}
