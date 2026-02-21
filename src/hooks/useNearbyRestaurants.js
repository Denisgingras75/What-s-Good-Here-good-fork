import { useQuery } from '@tanstack/react-query'
import { restaurantsApi } from '../api/restaurantsApi'
import { getUserMessage } from '../utils/errorHandler'

/**
 * Fetch restaurants near the user's current location
 * Enabled only when location permission is granted
 *
 * @param {number|null} lat - User latitude
 * @param {number|null} lng - User longitude
 * @param {number} radiusMeters - Search radius (default 150m)
 * @param {boolean} enabled - Whether location is available
 * @returns {{ nearby: Array, loading: boolean, error: Object|null }}
 */
export function useNearbyRestaurants(lat, lng, radiusMeters = 150, enabled = false) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['nearbyRestaurants', lat, lng, radiusMeters],
    queryFn: () => restaurantsApi.searchNearby(lat, lng, radiusMeters),
    enabled: enabled && lat != null && lng != null,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    nearby: data || [],
    loading: isLoading,
    error: error ? { message: getUserMessage(error, 'finding nearby restaurants') } : null,
  }
}
