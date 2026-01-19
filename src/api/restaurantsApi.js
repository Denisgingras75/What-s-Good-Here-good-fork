import { supabase } from '../lib/supabase'

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
      console.error('Error fetching restaurants:', error)
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
      console.error('Error fetching open restaurants:', error)
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

    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name, address')
      .eq('is_open', true)
      .ilike('name', `%${query}%`)
      .limit(limit)

    if (error) {
      console.error('Error searching restaurants:', error)
      throw error
    }

    return data || []
  },

  /**
   * Get a single restaurant by ID
   * @param {string} restaurantId - Restaurant ID
   * @returns {Promise<Object>} Restaurant object
   */
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
      console.error('Error fetching restaurant:', error)
      throw error
    }
  },
}
