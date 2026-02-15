import { useQuery } from '@tanstack/react-query'
import { placesApi } from '../api/placesApi'
import { logger } from '../utils/logger'

const MILES_TO_METERS = 1609.34
const MAX_DISCOVERY_RADIUS_MI = 10

/**
 * Discover nearby restaurants via Google Places that aren't already in the DB.
 * Only runs when: user is authenticated and location is available.
 * Search radius is capped at 10 miles (Oak Bluffs / Edgartown focus).
 *
 * @param {Object} params
 * @param {number} params.lat - User latitude
 * @param {number} params.lng - User longitude
 * @param {number} params.radius - Radius in miles (capped at 10)
 * @param {boolean} params.isAuthenticated - Whether user is logged in
 * @param {string[]} params.existingPlaceIds - Google Place IDs already in DB
 */
export function useNearbyPlaces({ lat, lng, radius, isAuthenticated, existingPlaceIds = [] }) {
  const enabled = !!isAuthenticated && !!lat && !!lng
  const searchRadius = Math.min(radius, MAX_DISCOVERY_RADIUS_MI)
  const radiusMeters = Math.round(searchRadius * MILES_TO_METERS)

  const { data, isLoading, error } = useQuery({
    queryKey: ['nearbyPlaces', lat, lng, searchRadius],
    queryFn: async () => {
      return placesApi.discoverNearby(lat, lng, radiusMeters)
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Google Places API is rate-limited — retries make it worse
  })

  // Filter out places already in the DB
  const existingSet = new Set(existingPlaceIds)
  const places = (data || []).filter(p => !existingSet.has(p.placeId))

  if (error) {
    logger.error('Error discovering nearby places:', error)
  }

  return {
    places,
    loading: isLoading && enabled,
    error: error ? { message: 'Could not load nearby restaurant suggestions' } : null,
  }
}
