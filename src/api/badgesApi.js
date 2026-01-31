import { supabase } from '../lib/supabase'
import { logger } from '../utils/logger'

/**
 * Badges API - Centralized data fetching for badges/achievements
 */

export const badgesApi = {
  /**
   * Get all badge definitions
   * @returns {Promise<Array>} Array of badge definitions
   */
  async getAllBadges() {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      logger.error('Error fetching badges:', error)
      throw error
    }

    return data || []
  },

  /**
   * Get user's unlocked badges
   * @param {string} userId - User ID
   * @param {boolean} publicOnly - If true, only return public-eligible badges
   * @returns {Promise<Array>} Array of unlocked badges
   */
  async getUserBadges(userId, publicOnly = false) {
    const { data, error } = await supabase.rpc('get_user_badges', {
      p_user_id: userId,
      p_public_only: publicOnly,
    })

    if (error) {
      logger.error('Error fetching user badges:', error)
      throw error
    }

    return data || []
  },

  /**
   * Get user's public badges for display (max 6)
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of public badges
   */
  async getPublicBadges(userId) {
    const { data, error } = await supabase.rpc('get_public_badges', {
      p_user_id: userId,
    })

    if (error) {
      logger.error('Error fetching public badges:', error)
      throw error
    }

    return data || []
  },

  /**
   * Get user's badge stats (rated dishes count, restaurants count)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Stats object
   */
  async getUserBadgeStats(userId) {
    const { data, error } = await supabase.rpc('get_user_badge_stats', {
      p_user_id: userId,
    })

    if (error) {
      logger.error('Error fetching badge stats:', error)
      throw error
    }

    // RPC returns array with single row
    return data?.[0] || { rated_dishes_count: 0, restaurants_rated_count: 0 }
  },

  /**
   * Get badge evaluation stats (all data needed for progress calculation)
   * Returns: { totalDishes, totalRestaurants, globalBias, votesWithConsensus,
   *            followerCount, dishesHelpedEstablish, categoryStats }
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Evaluation stats
   */
  async getBadgeEvaluationStats(userId) {
    const { data, error } = await supabase.rpc('get_badge_evaluation_stats', {
      p_user_id: userId,
    })

    if (error) {
      logger.error('Error fetching badge evaluation stats:', error)
      throw error
    }

    // RPC returns JSON directly
    return data || {
      totalDishes: 0,
      totalRestaurants: 0,
      globalBias: 0,
      votesWithConsensus: 0,
      followerCount: 0,
      dishesHelpedEstablish: 0,
      categoryStats: [],
    }
  },

  /**
   * Evaluate and award any newly unlocked badges for a user
   * Call this after a vote is submitted
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of newly unlocked badges
   */
  async evaluateBadges(userId) {
    const { data, error } = await supabase.rpc('evaluate_user_badges', {
      p_user_id: userId,
    })

    if (error) {
      logger.error('Error evaluating badges:', error)
      throw error
    }

    // Filter to only newly unlocked badges
    const newlyUnlocked = (data || []).filter(b => b.newly_unlocked)

    // If there are newly unlocked badges, fetch their full details
    if (newlyUnlocked.length > 0) {
      const { data: badgeDetails, error: detailsError } = await supabase
        .from('badges')
        .select('*')
        .in('key', newlyUnlocked.map(b => b.badge_key))

      if (detailsError) {
        logger.error('Error fetching badge details:', detailsError)
        return newlyUnlocked
      }

      // Merge details with unlock info
      return newlyUnlocked.map(unlocked => ({
        ...unlocked,
        ...badgeDetails.find(b => b.key === unlocked.badge_key),
      }))
    }

    return []
  },
}
