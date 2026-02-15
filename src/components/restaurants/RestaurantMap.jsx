import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Auto-fit bounds when restaurants or location change
function FitBounds({ restaurants, userLocation }) {
  const map = useMap()
  const prevCountRef = useRef(0)

  useEffect(() => {
    const points = restaurants
      .filter(r => r.lat && r.lng)
      .map(r => [r.lat, r.lng])

    if (userLocation?.lat && userLocation?.lng) {
      points.push([userLocation.lat, userLocation.lng])
    }

    if (points.length === 0) return

    // Fit bounds when restaurant count changes or on first render
    if (points.length !== prevCountRef.current) {
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
      prevCountRef.current = points.length
    }
  }, [restaurants, userLocation, map])

  return null
}

export function RestaurantMap({ restaurants, userLocation, onSelectRestaurant }) {
  const defaultCenter = [41.43, -70.56] // Martha's Vineyard
  const center = userLocation?.lat && userLocation?.lng
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter

  return (
    <div
      style={{
        height: 'calc(100dvh - 160px)',
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--color-divider)',
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

        {/* User location — blue pulsing dot */}
        {userLocation?.lat && userLocation?.lng && (
          <>
            {/* Outer pulse ring */}
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
            {/* Inner dot */}
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

        {/* Restaurant pins */}
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
      </MapContainer>
    </div>
  )
}
