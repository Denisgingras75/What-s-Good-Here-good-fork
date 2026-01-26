import { useState, useEffect, useCallback } from 'react'
import { ratingIdentityApi } from '../api/ratingIdentityApi'
import { logger } from '../utils/logger'

/**
 * Hook for managing reveal notifications (when a dish reaches consensus)
 * @returns {Object} Reveals data, loading state, and actions
 */
export function useRevealNotifications() {
  const [reveals, setReveals] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentReveal, setCurrentReveal] = useState(null)

  const fetchReveals = useCallback(async () => {
    setLoading(true)
    try {
      const data = await ratingIdentityApi.getUnseenReveals()
      setReveals(data)
      // Show the most recent reveal first
      if (data.length > 0) {
        setCurrentReveal(data[0])
      }
    } catch (err) {
      logger.error('Error fetching reveals:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReveals()
  }, [fetchReveals])

  const dismissReveal = useCallback(async (revealId) => {
    // Mark as seen
    await ratingIdentityApi.markRevealsSeen([revealId])

    // Remove from local state
    setReveals(prev => prev.filter(r => r.id !== revealId))

    // Show next reveal if any
    const remaining = reveals.filter(r => r.id !== revealId)
    setCurrentReveal(remaining.length > 0 ? remaining[0] : null)
  }, [reveals])

  const dismissAllReveals = useCallback(async () => {
    const ids = reveals.map(r => r.id)
    if (ids.length > 0) {
      await ratingIdentityApi.markRevealsSeen(ids)
    }
    setReveals([])
    setCurrentReveal(null)
  }, [reveals])

  return {
    reveals,
    currentReveal,
    loading,
    unseenCount: reveals.length,
    dismissReveal,
    dismissAllReveals,
    refetch: fetchReveals,
  }
}
