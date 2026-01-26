import { supabase } from '../lib/supabase'
import { logger } from '../utils/logger'

/**
 * Rating Identity API - Centralized data fetching for the Rating Identity system
 */

export const ratingIdentityApi = {
  /**
   * Get user's rating identity stats (bias, label, pending votes, etc.)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Rating identity stats
   */
  async getUserRatingIdentity(userId) {
    try {
      if (!userId) {
        return {
          ratingBias: 0.0,
          biasLabel: 'New Voter',
          votesWithConsensus: 0,
          votesPending: 0,
          dishesHelpedEstablish: 0,
          categoryBiases: {},
        }
      }

      const { data, error } = await supabase
        .rpc('get_user_rating_identity', { target_user_id: userId })

      if (error) {
        logger.error('Error fetching rating identity:', error)
        throw error
      }

      // RPC returns an array, get first row
      const row = data?.[0] || data

      return {
        ratingBias: row?.rating_bias ?? 0.0,
        biasLabel: row?.bias_label ?? 'New Voter',
        votesWithConsensus: row?.votes_with_consensus ?? 0,
        votesPending: row?.votes_pending ?? 0,
        dishesHelpedEstablish: row?.dishes_helped_establish ?? 0,
        categoryBiases: row?.category_biases ?? {},
      }
    } catch (error) {
      logger.error('Error fetching rating identity:', error)
      // Return defaults on error (graceful degradation)
      return {
        ratingBias: 0.0,
        biasLabel: 'New Voter',
        votesWithConsensus: 0,
        votesPending: 0,
        dishesHelpedEstablish: 0,
        categoryBiases: {},
      }
    }
  },

  /**
   * Get unseen reveal notifications for the current user
   * @returns {Promise<Array>} Array of unseen reveals
   */
  async getUnseenReveals() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return []
      }

      const { data, error } = await supabase
        .rpc('get_unseen_reveals', { target_user_id: user.id })

      if (error) {
        logger.error('Error fetching unseen reveals:', error)
        return []
      }

      return (data || []).map(reveal => ({
        id: reveal.id,
        dishId: reveal.dish_id,
        dishName: reveal.dish_name,
        userRating: reveal.user_rating,
        consensusRating: reveal.consensus_rating,
        deviation: reveal.deviation,
        wasEarlyVoter: reveal.was_early_voter,
        biasBefore: reveal.bias_before,
        biasAfter: reveal.bias_after,
        createdAt: reveal.created_at,
      }))
    } catch (error) {
      logger.error('Error fetching unseen reveals:', error)
      return []
    }
  },

  /**
   * Mark reveal notifications as seen
   * @param {string[]} eventIds - Array of event IDs to mark as seen
   * @returns {Promise<boolean>} Success status
   */
  async markRevealsSeen(eventIds) {
    try {
      if (!eventIds || eventIds.length === 0) {
        return true
      }

      const { error } = await supabase
        .rpc('mark_reveals_seen', { event_ids: eventIds })

      if (error) {
        logger.error('Error marking reveals as seen:', error)
        return false
      }

      return true
    } catch (error) {
      logger.error('Error marking reveals as seen:', error)
      return false
    }
  },
}
