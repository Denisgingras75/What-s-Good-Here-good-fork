import { supabase } from '../lib/supabase'
import { capture } from '../lib/analytics'
import { checkVoteRateLimit } from '../lib/rateLimiter'
import { containsBlockedContent } from '../lib/reviewBlocklist'
import { MAX_REVIEW_LENGTH } from '../constants/app'
import { classifyError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

/**
 * Create a classified error with type information
 */
function createClassifiedError(error) {
  const classifiedError = new Error(error.message || 'An error occurred')
  classifiedError.type = classifyError(error)
  classifiedError.originalError = error
  return classifiedError
}

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
   * @param {string} params.reviewText - Optional review text (max 200 chars)
   * @returns {Promise<Object>} Success status
   */
  async submitVote({ dishId, wouldOrderAgain, rating10 = null, reviewText = null }) {
    // Quick client-side check first (better UX)
      const clientRateLimit = checkVoteRateLimit()
      if (!clientRateLimit.allowed) {
        throw new Error(clientRateLimit.message)
      }

      // Validate review text if provided
      if (reviewText) {
        // Check length
        if (reviewText.length > MAX_REVIEW_LENGTH) {
          throw new Error(`Review is ${reviewText.length - MAX_REVIEW_LENGTH} characters over limit`)
        }
        // Check for blocked content
        if (containsBlockedContent(reviewText)) {
          throw new Error('Review contains inappropriate content. Please revise.')
        }
      }

      // Treat empty string as no review
      const cleanReviewText = reviewText?.trim() || null

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You must be logged in to vote')
      }

      // Server-side rate limit check (authoritative)
      const { data: serverRateLimit, error: rateLimitError } = await supabase
        .rpc('check_vote_rate_limit')

      if (rateLimitError) {
        // If server rate limit check fails, allow the vote (graceful degradation)
      } else if (serverRateLimit && !serverRateLimit.allowed) {
        throw new Error(serverRateLimit.message || 'Too many votes. Please wait.')
      }

      // Upsert vote with all fields
      const voteData = {
        dish_id: dishId,
        user_id: user.id,
        would_order_again: wouldOrderAgain,
        rating_10: rating10,
      }

      // Only include review fields if there's a review
      if (cleanReviewText) {
        voteData.review_text = cleanReviewText
        voteData.review_created_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('votes')
        .upsert(voteData, {
          onConflict: 'dish_id,user_id',
        })

      if (error) {
        throw createClassifiedError(error)
      }

      capture('vote_submitted', {
        dish_id: dishId,
        would_order_again: wouldOrderAgain,
        rating: rating10,
        has_review: !!cleanReviewText,
      })

      return { success: true }
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
        throw createClassifiedError(error)
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
      logger.error('Error fetching user votes:', error)
      throw error.type ? error : createClassifiedError(error)
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
        throw createClassifiedError(error)
      }

      return data || []
    } catch (error) {
      logger.error('Error fetching detailed votes:', error)
      throw error.type ? error : createClassifiedError(error)
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
        throw createClassifiedError(error)
      }

      return { success: true }
    } catch (error) {
      logger.error('Error deleting vote:', error)
      throw error.type ? error : createClassifiedError(error)
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

      if (votesError) throw createClassifiedError(votesError)
      if (!userVotes?.length) return 0

      const dishIds = userVotes.map(v => v.dish_id)

      // Count votes for each of those dishes
      const { data: voteCounts, error: countError } = await supabase
        .from('votes')
        .select('dish_id')
        .in('dish_id', dishIds)

      if (countError) throw createClassifiedError(countError)

      // Group by dish_id and count those with 5+
      const counts = {}
      voteCounts?.forEach(v => {
        counts[v.dish_id] = (counts[v.dish_id] || 0) + 1
      })

      // Count dishes with 5+ votes
      const rankedCount = Object.values(counts).filter(c => c >= 5).length
      return rankedCount
    } catch (error) {
      logger.error('Error getting dishes helped rank:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  /**
   * Get all reviews for a dish with user info
   * @param {string} dishId - Dish ID
   * @param {Object} options - Pagination options
   * @returns {Promise<Array>} Array of reviews with user info
   */
  async getReviewsForDish(dishId, { limit = 10, offset = 0 } = {}) {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          id,
          review_text,
          rating_10,
          would_order_again,
          review_created_at,
          user_id,
          profiles (
            id,
            display_name
          )
        `)
        .eq('dish_id', dishId)
        .not('review_text', 'is', null)
        .neq('review_text', '')
        .order('review_created_at', { ascending: false, nullsFirst: false })
        .range(offset, offset + limit - 1)

      if (error) {
        logger.error('Error fetching reviews for dish:', error)
        return [] // Graceful degradation
      }

      return data || []
    } catch (error) {
      logger.error('Error fetching reviews for dish:', error)
      return [] // Graceful degradation - don't break the UI
    }
  },

  /**
   * Get smart snippet for a dish (best review to show on card)
   * Priority: 9+ rated reviews first, then most recent
   * @param {string} dishId - Dish ID
   * @returns {Promise<Object|null>} Best review or null
   */
  async getSmartSnippetForDish(dishId) {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          review_text,
          rating_10,
          review_created_at,
          user_id,
          profiles (
            id,
            display_name
          )
        `)
        .eq('dish_id', dishId)
        .not('review_text', 'is', null)
        .neq('review_text', '')
        .order('rating_10', { ascending: false, nullsFirst: false })
        .order('review_created_at', { ascending: false, nullsFirst: false })
        .limit(1)

      if (error) {
        logger.error('Error fetching smart snippet:', error)
        return null // Graceful degradation
      }

      // Return the best review or null
      return data?.[0] || null
    } catch (error) {
      logger.error('Error fetching smart snippet:', error)
      return null // Graceful degradation - don't break the UI
    }
  },

  /**
   * Get all reviews written by a user with dish info
   * @param {string} userId - User ID
   * @param {Object} options - Pagination options
   * @returns {Promise<Array>} Array of reviews with dish info
   */
  async getReviewsForUser(userId, { limit = 20, offset = 0 } = {}) {
    try {
      if (!userId) {
        return []
      }

      const { data, error } = await supabase
        .from('votes')
        .select(`
          id,
          review_text,
          rating_10,
          would_order_again,
          review_created_at,
          dish_id,
          dishes (
            id,
            name,
            photo_url,
            category,
            price,
            restaurants (name)
          )
        `)
        .eq('user_id', userId)
        .not('review_text', 'is', null)
        .neq('review_text', '')
        .order('review_created_at', { ascending: false, nullsFirst: false })
        .range(offset, offset + limit - 1)

      if (error) {
        logger.error('Error fetching reviews for user:', error)
        return []
      }

      return data || []
    } catch (error) {
      logger.error('Error fetching reviews for user:', error)
      return []
    }
  },
}
