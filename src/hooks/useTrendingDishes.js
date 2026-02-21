import { useQuery } from '@tanstack/react-query'
import { dishesApi } from '../api/dishesApi'
import { getUserMessage } from '../utils/errorHandler'

/**
 * Fetch trending dishes (most votes in last 7 days)
 */
export function useTrendingDishes(limit = 10, town = null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dishes', 'trending', limit, town],
    queryFn: () => dishesApi.getTrending(limit, town),
    staleTime: 5 * 60 * 1000, // 5 min
  })

  return {
    trending: data || [],
    loading: isLoading,
    error: error ? { message: getUserMessage(error, 'loading trending dishes') } : null,
  }
}

/**
 * Fetch recently added dishes
 */
export function useRecentDishes(limit = 10, town = null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dishes', 'recent', limit, town],
    queryFn: () => dishesApi.getRecent(limit, town),
    staleTime: 5 * 60 * 1000, // 5 min
  })

  return {
    recent: data || [],
    loading: isLoading,
    error: error ? { message: getUserMessage(error, 'loading recent dishes') } : null,
  }
}
