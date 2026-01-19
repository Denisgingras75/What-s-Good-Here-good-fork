import { supabase } from '../lib/supabase'
import { classifyError } from '../utils/errorHandler'

/**
 * Dishes API - Centralized data fetching for dishes
 */

export const dishesApi = {
  /**
   * Get ranked dishes by location with optional filters
   * @param {Object} params
   * @param {number} params.lat - User latitude
   * @param {number} params.lng - User longitude
   * @param {number} params.radiusMiles - Search radius in miles
   * @param {string|null} params.category - Optional category filter
   * @returns {Promise<Array>} Array of ranked dishes
   * @throws {Error} With classified error type
   */
  async getRankedDishes({ lat, lng, radiusMiles, category = null }) {
    try {
      const { data, error } = await supabase.rpc('get_ranked_dishes', {
        user_lat: lat,
        user_lng: lng,
        radius_miles: radiusMiles,
        filter_category: category,
      })

      if (error) {
        const classifiedError = new Error(error.message)
        classifiedError.type = classifyError(error)
        classifiedError.originalError = error
        throw classifiedError
      }

      return data || []
    } catch (error) {
      console.error('Error fetching ranked dishes:', error)
      throw error
    }
  },

  /**
   * Get dishes for a specific restaurant with vote data
   * Sorted by percent_worth_it DESC for "Most loved here" ranking (Confidence view)
   * @param {Object} params
   * @param {string} params.restaurantId - Restaurant ID
   * @returns {Promise<Array>} Array of dishes with vote stats
   * @throws {Error} With classified error type
   */
  async getDishesForRestaurant({ restaurantId }) {
    try {
      const { data, error } = await supabase.rpc('get_restaurant_dishes', {
        p_restaurant_id: restaurantId,
      })

      if (error) {
        const classifiedError = new Error(error.message)
        classifiedError.type = classifyError(error)
        classifiedError.originalError = error
        throw classifiedError
      }

      return data || []
    } catch (error) {
      console.error('Error fetching restaurant dishes:', error)
      throw error
    }
  },

  /**
   * Search dishes by name (for autocomplete)
   * Searches ALL dishes regardless of category - categories are shortcuts, not containers
   * Results sorted by avg_rating (highest first) so best matches rise to top
   * @param {string} query - Search query
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Array of matching dishes sorted by rating
   * @throws {Error} On API failure
   */
  async search(query, limit = 5) {
    if (!query?.trim()) return []

    const { data, error } = await supabase
      .from('dishes')
      .select(`
        id,
        name,
        category,
        photo_url,
        total_votes,
        yes_votes,
        avg_rating,
        restaurants!inner (
          id,
          name,
          is_open
        )
      `)
      .eq('restaurants.is_open', true)
      .ilike('name', `%${query}%`)
      .order('avg_rating', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (error) {
      console.error('Error searching dishes:', error)
      throw error
    }

    // Transform to match expected format
    return (data || []).map(dish => ({
      dish_id: dish.id,
      dish_name: dish.name,
      category: dish.category,
      photo_url: dish.photo_url,
      total_votes: dish.total_votes || 0,
      avg_rating: dish.avg_rating,
      restaurant_id: dish.restaurants.id,
      restaurant_name: dish.restaurants.name,
    }))
  },

  /**
   * Get a single dish by ID
   * @param {string} dishId - Dish ID
   * @returns {Promise<Object>} Dish object
   * @throws {Error} With classified error type
   */
  async getDishById(dishId) {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select(`
          *,
          restaurants (
            id,
            name,
            address,
            lat,
            lng
          )
        `)
        .eq('id', dishId)
        .single()

      if (error) {
        const classifiedError = new Error(error.message)
        classifiedError.type = classifyError(error)
        classifiedError.originalError = error
        throw classifiedError
      }

      return data
    } catch (error) {
      console.error('Error fetching dish:', error)
      throw error
    }
  },
}
