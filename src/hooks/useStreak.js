import { useQuery } from '@tanstack/react-query'
import { leaderboardApi } from '../api/leaderboardApi'
import { logger } from '../utils/logger'

const DEFAULT_STREAK = {
  currentStreak: 0,
  longestStreak: 0,
  votesThisWeek: 0,
  lastVoteDate: null,
  status: 'none',
}

/**
 * Hook for managing user streak data
 * @param {string} userId - Optional user ID (defaults to current user)
 * @returns {Object} Streak state and actions
 */
export function useStreak(userId = null) {
  const { data: streak, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['streak', userId || 'me'],
    queryFn: async () => {
      return userId
        ? leaderboardApi.getUserStreak(userId)
        : leaderboardApi.getMyStreak()
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  if (error) {
    logger.error('Error fetching streak:', error)
  }

  return {
    ...(streak || DEFAULT_STREAK),
    loading,
    error,
    refresh: refetch,
  }
}
