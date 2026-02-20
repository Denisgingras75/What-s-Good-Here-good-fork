import { supabase } from '../lib/supabase'
import { createClassifiedError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

/**
 * Badges API — evaluation, progress, and retrieval
 */
export const badgesApi = {
  /**
   * Evaluate and award badges for a user.
   * Call after voting — returns newly_unlocked badges.
   * @param {string} userId
   * @returns {Promise<Array<{badge_key: string, newly_unlocked: boolean}>>}
   */
  async evaluateUserBadges(userId) {
    try {
      const { data, error } = await supabase.rpc('evaluate_user_badges', { p_user_id: userId })
      if (error) throw createClassifiedError(error)
      // Filter to only newly unlocked badges
      return (data || []).filter(b => b.newly_unlocked)
    } catch (error) {
      logger.error('Badge evaluation failed:', error)
      // Non-critical — don't break the vote flow
      return []
    }
  },

  /**
   * Get all badges a user has earned
   * @param {string} userId
   * @param {boolean} publicOnly
   * @returns {Promise<Array>}
   */
  async getUserBadges(userId, publicOnly = false) {
    try {
      const { data, error } = await supabase.rpc('get_user_badges', {
        p_user_id: userId,
        p_public_only: publicOnly,
      })
      if (error) throw createClassifiedError(error)
      return data || []
    } catch (error) {
      logger.error('Failed to fetch user badges:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  /**
   * Get badge evaluation stats — used to compute progress toward next badge
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  async getBadgeProgress(userId) {
    try {
      const { data, error } = await supabase.rpc('get_badge_evaluation_stats', { p_user_id: userId })
      if (error) throw createClassifiedError(error)
      return data || null
    } catch (error) {
      logger.error('Failed to fetch badge progress:', error)
      return null
    }
  },

  /**
   * Compute the nearest unearned category badge with progress.
   * Returns { badgeName, category, current, target, remaining } or null.
   * @param {Object} stats — from get_badge_evaluation_stats
   * @param {Array} earnedBadgeKeys — keys the user already has
   * @param {string|null} votedCategory — category just voted on (prioritized)
   */
  computeNearestBadge(stats, earnedBadgeKeys = [], votedCategory = null) {
    if (!stats || !stats.categoryStats) return null

    const earned = new Set(earnedBadgeKeys)
    const candidates = []

    for (const cat of stats.categoryStats) {
      if (!cat.category) continue
      const consensusVotes = cat.consensus_ratings || 0

      // Specialist: 10 consensus votes, |bias| <= 1.5
      const specialistKey = `specialist_${cat.category}`
      if (!earned.has(specialistKey) && consensusVotes < 10) {
        candidates.push({
          badgeKey: specialistKey,
          badgeName: `${capitalize(cat.category)} Specialist`,
          category: cat.category,
          current: consensusVotes,
          target: 10,
          remaining: 10 - consensusVotes,
          tier: 'specialist',
        })
      }

      // Authority: 20 consensus votes, |bias| <= 1.0
      const authorityKey = `authority_${cat.category}`
      if (!earned.has(authorityKey) && earned.has(specialistKey) && consensusVotes < 20) {
        candidates.push({
          badgeKey: authorityKey,
          badgeName: `${capitalize(cat.category)} Authority`,
          category: cat.category,
          current: consensusVotes,
          target: 20,
          remaining: 20 - consensusVotes,
          tier: 'authority',
        })
      }
    }

    if (candidates.length === 0) return null

    // Prioritize the category the user just voted on
    if (votedCategory) {
      const matchingCategory = candidates.filter(c => c.category === votedCategory)
      if (matchingCategory.length > 0) {
        // Return the closest badge in the voted category
        return matchingCategory.reduce((a, b) => a.remaining < b.remaining ? a : b)
      }
    }

    // Otherwise return the closest badge overall
    return candidates.reduce((a, b) => a.remaining < b.remaining ? a : b)
  },
}

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.substring(1).replace(/_/g, ' ')
}
