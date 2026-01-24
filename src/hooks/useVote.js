import { useState, useRef, useCallback } from 'react'
import { votesApi } from '../api/votesApi'

export function useVote() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  // Track in-flight requests per dish to prevent double submissions
  const inFlightRef = useRef(new Set())

  // Submit wouldOrderAgain, rating_10, and optional review text in one call
  const submitVote = useCallback(async (dishId, wouldOrderAgain, rating10, reviewText = null) => {
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
      })

      return { success: true }
    } catch (err) {
      console.error('Error submitting vote:', err)
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
      console.error('Error fetching user votes:', err)
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
