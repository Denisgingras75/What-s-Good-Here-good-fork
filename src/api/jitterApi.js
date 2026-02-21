import { supabase } from '../lib/supabase'
import { createClassifiedError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

export const jitterApi = {
  /**
   * Get the current user's jitter profile (confidence level, consistency score)
   */
  async getMyProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('jitter_profiles')
        .select('confidence_level, consistency_score, review_count, flagged')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw createClassifiedError(error)
      return data
    } catch (error) {
      logger.error('Failed to get jitter profile:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  /**
   * Get trust badge type for a given user based on their jitter profile.
   * Returns: 'trusted_reviewer' | 'human_verified' | 'building' | null
   */
  getTrustBadgeType(jitterProfile) {
    if (!jitterProfile) return null
    if (jitterProfile.flagged) return null

    if (jitterProfile.confidence_level === 'high' && jitterProfile.consistency_score >= 0.6) {
      return 'trusted_reviewer'
    }
    if (jitterProfile.confidence_level === 'medium' && jitterProfile.consistency_score >= 0.4) {
      return 'human_verified'
    }
    if (jitterProfile.review_count > 0) {
      return 'building'
    }
    return null
  },
}
