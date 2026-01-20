import { supabase } from '../lib/supabase'
import posthog from 'posthog-js'
import { checkVoteRateLimit } from '../lib/rateLimiter'

/**
 * Votes API - Centralized data fetching and mutation for votes
 */

export const votesApi = {
  /**
   * Submit or update a vote for a dish
   * @param {Object} params
   * @param {string} params.dishId - Dish ID
   * @param {boolean} params.wouldOrderAgain - Vote value
   * @param {number} params.rating10 - Optional 1-10 rating
   * @returns {Promise<Object>} Success status
   */
  async submitVote({ dishId, wouldOrderAgain, rating10 = null }) {
    try {
      // Check rate limit before processing
      const rateLimit = checkVoteRateLimit()
      if (!rateLimit.allowed) {
        throw new Error(rateLimit.message)
      }

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You must be logged in to vote')
      }

      // Upsert vote with both fields
      const { error } = await supabase
        .from('votes')
        .upsert(
          {
            dish_id: dishId,
            user_id: user.id,
            would_order_again: wouldOrderAgain,
            rating_10: rating10,
          },
          {
            onConflict: 'dish_id,user_id',
          }
        )

      if (error) {
        throw error
      }

      posthog.capture('vote_submitted', {
        dish_id: dishId,
        would_order_again: wouldOrderAgain,
        rating: rating10,
      })

      return { success: true }
    } catch (error) {
      console.error('Error submitting vote:', error)
      throw error
    }
  },

  /**
   * Get all votes for the current user
   * @returns {Promise<Object>} Map of dish IDs to vote data
   */
  async getUserVotes() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return {}
      }

      const { data, error } = await supabase
        .from('votes')
        .select('dish_id, would_order_again, rating_10')
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      // Return as a map for easy lookup
      return (data || []).reduce((acc, vote) => {
        acc[vote.dish_id] = {
          wouldOrderAgain: vote.would_order_again,
          rating10: vote.rating_10,
        }
        return acc
      }, {})
    } catch (error) {
      console.error('Error fetching user votes:', error)
      throw error
    }
  },

  /**
   * Get detailed votes for a user with dish and restaurant info
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of votes with dish details
   */
  async getDetailedVotesForUser(userId) {
    try {
      if (!userId) {
        return []
      }

      const { data, error } = await supabase
        .from('votes')
        .select(`
          id,
          would_order_again,
          rating_10,
          created_at,
          dishes (
            id,
            name,
            category,
            price,
            photo_url,
            avg_rating,
            total_votes,
            restaurants (name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching detailed votes:', error)
      throw error
    }
  },

  /**
   * Delete a vote for a dish
   * @param {string} dishId - Dish ID
   * @returns {Promise<Object>} Success status
   */
  async deleteVote(dishId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('dish_id', dishId)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting vote:', error)
      throw error
    }
  },

  /**
   * Get count of ranked dishes (5+ votes) that a user has voted on
   * @param {string} userId - User ID
   * @returns {Promise<number>} Count of dishes helped rank
   */
  async getDishesHelpedRank(userId) {
    try {
      if (!userId) {
        return 0
      }

      // Get all dish IDs the user voted on
      const { data: userVotes, error: votesError } = await supabase
        .from('votes')
        .select('dish_id')
        .eq('user_id', userId)

      if (votesError) throw votesError
      if (!userVotes?.length) return 0

      const dishIds = userVotes.map(v => v.dish_id)

      // Count votes for each of those dishes
      const { data: voteCounts, error: countError } = await supabase
        .from('votes')
        .select('dish_id')
        .in('dish_id', dishIds)

      if (countError) throw countError

      // Group by dish_id and count those with 5+
      const counts = {}
      voteCounts?.forEach(v => {
        counts[v.dish_id] = (counts[v.dish_id] || 0) + 1
      })

      // Count dishes with 5+ votes
      const rankedCount = Object.values(counts).filter(c => c >= 5).length
      return rankedCount
    } catch (error) {
      console.error('Error getting dishes helped rank:', error)
      throw error
    }
  },
}
