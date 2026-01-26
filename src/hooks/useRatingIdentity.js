import { useState, useEffect, useCallback } from 'react'
import { ratingIdentityApi } from '../api/ratingIdentityApi'
import { logger } from '../utils/logger'

/**
 * Hook for fetching and managing user rating identity stats
 * @param {string} userId - User ID to fetch stats for
 * @returns {Object} Rating identity data and loading state
 */
export function useRatingIdentity(userId) {
  const [identity, setIdentity] = useState({
    ratingBias: 0.0,
    biasLabel: 'New Voter',
    votesWithConsensus: 0,
    votesPending: 0,
    dishesHelpedEstablish: 0,
    categoryBiases: {},
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchIdentity = useCallback(async () => {
    if (!userId) {
      setIdentity({
        ratingBias: 0.0,
        biasLabel: 'New Voter',
        votesWithConsensus: 0,
        votesPending: 0,
        dishesHelpedEstablish: 0,
        categoryBiases: {},
      })
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await ratingIdentityApi.getUserRatingIdentity(userId)
      setIdentity(data)
    } catch (err) {
      logger.error('Error in useRatingIdentity:', err)
      setError(err.message || 'Failed to load rating identity')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchIdentity()
  }, [fetchIdentity])

  const refetch = useCallback(() => {
    return fetchIdentity()
  }, [fetchIdentity])

  return {
    ...identity,
    loading,
    error,
    refetch,
  }
}
