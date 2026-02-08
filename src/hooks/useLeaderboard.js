import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { leaderboardApi } from '../api/leaderboardApi'
import { logger } from '../utils/logger'

/**
 * Hook for managing friends leaderboard data
 * @param {number} limit - Max leaderboard entries (default 10)
 * @returns {Object} Leaderboard state and actions
 */
export function useLeaderboard(limit = 10) {
  const [resetCountdown, setResetCountdown] = useState(null)

  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      const [leaderboardData, countdown] = await Promise.all([
        leaderboardApi.getFriendsLeaderboard(limit),
        leaderboardApi.getWeeklyResetCountdown(),
      ])
      return { ...leaderboardData, countdown }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Sync countdown from query data into local state for the timer
  useEffect(() => {
    if (data?.countdown != null) {
      setResetCountdown(data.countdown)
    }
  }, [data?.countdown])

  if (error) {
    logger.error('Error fetching leaderboard:', error)
  }

  // Countdown timer — ticks every second, local state only
  useEffect(() => {
    if (resetCountdown === null || resetCountdown <= 0) return

    const timer = setInterval(() => {
      setResetCountdown(prev => {
        if (prev === null || prev <= 1) {
          // Refetch when reset happens
          refetch()
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [resetCountdown, refetch])

  // Format countdown for display
  const formatCountdown = useCallback(() => {
    if (resetCountdown === null || resetCountdown <= 0) return null

    const days = Math.floor(resetCountdown / 86400)
    const hours = Math.floor((resetCountdown % 86400) / 3600)
    const minutes = Math.floor((resetCountdown % 3600) / 60)

    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }, [resetCountdown])

  return {
    leaderboard: data?.leaderboard || [],
    myRank: data?.myRank ?? null,
    resetCountdown,
    formattedCountdown: formatCountdown(),
    loading,
    error,
    refetch,
  }
}
