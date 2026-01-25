import { useQuery } from '@tanstack/react-query'
import { dishesApi } from '../api/dishesApi'
import { logger } from '../utils/logger'

/**
 * Search dishes with React Query caching
 * Great for autocomplete - caches previous searches
 * @param {string} query - Search query
 * @param {number} limit - Max results (default 5)
 * @returns {Object} { results, loading, error }
 */
export function useDishSearch(query, limit = 5) {
  const trimmedQuery = query?.trim() || ''

  const { data, isLoading, error } = useQuery({
    queryKey: ['dishSearch', trimmedQuery, limit],
    queryFn: () => dishesApi.search(trimmedQuery, limit),
    enabled: trimmedQuery.length >= 2, // Only search with 2+ chars
    staleTime: 1000 * 60 * 5, // Cache search results for 5 minutes
    gcTime: 1000 * 60 * 15, // Keep in cache for 15 minutes
  })

  if (error) {
    logger.error('Error searching dishes:', error)
  }

  // Debug logging
  console.log('useDishSearch:', {
    query: trimmedQuery,
    dataType: typeof data,
    dataIsArray: Array.isArray(data),
    dataLength: data?.length,
    isLoading,
    error: error?.message,
  })

  return {
    // Ensure we always return an array, even if API returns unexpected data
    results: Array.isArray(data) ? data : [],
    loading: isLoading && trimmedQuery.length >= 2,
    error,
  }
}
