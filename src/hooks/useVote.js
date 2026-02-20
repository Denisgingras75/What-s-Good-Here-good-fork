import { useState, useRef, useCallback } from 'react'
import { votesApi } from '../api/votesApi'
import { badgesApi } from '../api/badgesApi'
import { supabase } from '../lib/supabase'
import { logger } from '../utils/logger'

export function useVote() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  // Track in-flight requests per dish to prevent double submissions
  const inFlightRef = useRef(new Set())

  // Submit wouldOrderAgain, rating_10, and optional review text in one call
  // Returns { success, newBadges?, badgeProgress? }
  const submitVote = useCallback(async (dishId, wouldOrderAgain, rating10, reviewText = null, purityData = null) => {
    // Prevent duplicate submissions for the same dish
    if (inFlightRef.current.has(dishId)) {
      return { success: false, error: 'Vote already in progress' }
    }

    try {
      inFlightRef.current.add(dishId)
      setSubmitting(true)
      setError(null)

      await votesApi.submitVote({
        dishId,
        wouldOrderAgain,
        rating10,
        reviewText,
        purityData,
      })

      // Fire-and-forget badge evaluation (non-blocking)
      // We resolve it in background so the vote feels instant
      const { data: { user } } = await supabase.auth.getUser()
      let newBadges = []
      let badgeProgress = null

      if (user) {
        try {
          const [badges, progress, userBadges] = await Promise.all([
            badgesApi.evaluateUserBadges(user.id),
            badgesApi.getBadgeProgress(user.id),
            badgesApi.getUserBadges(user.id),
          ])
          newBadges = badges
          const earnedKeys = (userBadges || []).map(b => b.badge_key || b.key)
          badgeProgress = progress
            ? { stats: progress, earnedKeys }
            : null
        } catch (badgeErr) {
          // Non-critical - don't fail the vote
          logger.error('Badge evaluation error (non-critical):', badgeErr)
        }
      }

      return { success: true, newBadges, badgeProgress }
    } catch (err) {
      logger.error('Error submitting vote:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      inFlightRef.current.delete(dishId)
      setSubmitting(inFlightRef.current.size > 0)
    }
  }, [])

  const getUserVotes = async () => {
    try {
      return await votesApi.getUserVotes()
    } catch (err) {
      logger.error('Error fetching user votes:', err)
      return {}
    }
  }

  return {
    submitVote,
    getUserVotes,
    submitting,
    error,
  }
}
