import { useNearbyRestaurants } from './useNearbyRestaurants'
import { useLocationContext } from '../context/LocationContext'

/**
 * Find the single closest restaurant to the user's GPS location.
 * Reusable building block for proximity-based features (nudges, check-ins, etc.)
 *
 * @param {number} radiusMeters - Search radius (default 150m)
 * @returns {{ nearbyRestaurant: Object|null, isLoading: boolean, isNearRestaurant: boolean }}
 */
export function useNearbyRestaurant(radiusMeters = 150) {
  const { location, permissionState, isUsingDefault } = useLocationContext()

  // Only query when we have real GPS — not the fallback MV center
  const hasRealLocation = permissionState === 'granted' && !isUsingDefault

  const { nearby, loading } = useNearbyRestaurants(
    location?.lat,
    location?.lng,
    radiusMeters,
    hasRealLocation,
  )

  // Closest restaurant is first (RPC returns sorted by distance)
  const nearbyRestaurant = nearby.length > 0 ? nearby[0] : null

  return {
    nearbyRestaurant,
    isLoading: loading,
    isNearRestaurant: !!nearbyRestaurant,
    hasRealLocation,
  }
}
