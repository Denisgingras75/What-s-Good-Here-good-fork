import { supabase } from '../lib/supabase'
import { logger } from '../utils/logger'
import { sanitizeSearchQuery } from '../utils/sanitize'

/**
 * Restaurants API - Centralized data fetching for restaurants
 */

export const restaurantsApi = {
  /**
   * Get all restaurants with dish counts
   * @returns {Promise<Array>} Array of restaurants with dish counts
   */
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          id,
          name,
          address,
          lat,
          lng,
          is_open,
          dishes (id)
        `)
        .order('name')

      if (error) {
        throw error
      }

      // Transform to include dish count
      return (data || []).map(r => ({
        ...r,
        dishCount: r.dishes?.length || 0,
        dishes: undefined, // Remove the dishes array, keep only count
      }))
    } catch (error) {
      logger.error('Error fetching restaurants:', error)
      throw error
    }
  },

  /**
   * Get open restaurants
   * @returns {Promise<Array>} Array of open restaurants
   */
  async getOpen() {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, address')
        .eq('is_open', true)
        .order('name')

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      logger.error('Error fetching open restaurants:', error)
      throw error
    }
  },

  /**
   * Search restaurants by name
   * @param {string} query - Search query
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Array of matching restaurants
   * @throws {Error} On API failure
   */
  async search(query, limit = 5) {
    if (!query?.trim()) return []

    // Sanitize query to prevent SQL injection via LIKE patterns
    const sanitized = sanitizeSearchQuery(query, 50)
    if (!sanitized) return []

    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name, address')
      .eq('is_open', true)
      .ilike('name', `%${sanitized}%`)
      .limit(limit)

    if (error) {
      logger.error('Error searching restaurants:', error)
      throw error
    }

    return data || []
  },

  /**
   * Get a single restaurant by ID
   * @param {string} restaurantId - Restaurant ID
   * @returns {Promise<Object>} Restaurant object
   */
  /**
   * Get total restaurant count
   * @returns {Promise<number>} Total number of restaurants
   */
  async getCount() {
    try {
      const { count, error } = await supabase
        .from('restaurants')
        .select('id', { count: 'exact', head: true })

      if (error) throw error
      return count || 0
    } catch (error) {
      logger.error('Error fetching restaurant count:', error)
      return 0
    }
  },

  async getById(restaurantId) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      logger.error('Error fetching restaurant:', error)
      throw error
    }
  },
}
