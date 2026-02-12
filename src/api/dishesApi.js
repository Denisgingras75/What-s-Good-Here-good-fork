import { supabase } from '../lib/supabase'
import { createClassifiedError } from '../utils/errorHandler'
import { sanitizeSearchQuery } from '../utils/sanitize'
import { logger } from '../utils/logger'

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
   * @param {string|null} params.town - Optional town filter (e.g., 'Oak Bluffs')
   * @returns {Promise<Array>} Array of ranked dishes
   * @throws {Error} With classified error type
   */
  async getRankedDishes({ lat, lng, radiusMiles, category = null, town = null }) {
    try {
      const { data, error } = await supabase.rpc('get_ranked_dishes', {
        user_lat: lat,
        user_lng: lng,
        radius_miles: radiusMiles,
        filter_category: category,
        filter_town: town,
      })

      if (error) {
        throw createClassifiedError(error)
      }

      // Return all dishes - don't limit on client side
      // The database function handles filtering by radius
      return data || []
    } catch (error) {
      logger.error('Error fetching ranked dishes:', error)
      throw error.type ? error : createClassifiedError(error)
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
        throw createClassifiedError(error)
      }

      return data || []
    } catch (error) {
      logger.error('Error fetching restaurant dishes:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  /**
   * Search dishes by name, category, tags, or cuisine
   * Searches ALL dishes regardless of category - categories are shortcuts, not containers
   * Results sorted by avg_rating (highest first) so best matches rise to top
   * For multi-word queries like "Mexican food", extracts the meaningful word
   * @param {string} query - Search query
   * @param {number} limit - Max results
   * @param {string|null} town - Optional town filter (e.g., 'Oak Bluffs')
   * @returns {Promise<Array>} Array of matching dishes sorted by rating
   * @throws {Error} On API failure
   */
  async search(query, limit = 5, town = null) {
    if (!query?.trim()) return []

    // Sanitize query to prevent SQL injection via LIKE patterns
    const sanitized = sanitizeSearchQuery(query, 50)
    if (!sanitized) return []

    // Extract meaningful search term by filtering out common filler words
    // "Mexican food" -> "Mexican", "best pizza near me" -> "pizza"
    const stopWords = new Set(['food', 'foods', 'the', 'a', 'an', 'and', 'or', 'for', 'of', 'at', 'to', 'on', 'best', 'good', 'great', 'near', 'me', 'find', 'get', 'want', 'looking'])
    const words = sanitized.split(/\s+/).filter(w => w.length >= 2 && !stopWords.has(w.toLowerCase()))

    // Use the first meaningful word, or fall back to full sanitized query
    let searchTerm = words.length > 0 ? words[0] : sanitized

    // Normalize common misspellings and variations to match stored cuisine values
    const synonyms = {
      'indiana': 'indian',
      'indain': 'indian',
      'italien': 'italian',
      'italain': 'italian',
      'mexcian': 'mexican',
      'maxican': 'mexican',
      'chineese': 'chinese',
      'chinease': 'chinese',
      'japaneese': 'japanese',
      'japenese': 'japanese',
      'thia': 'thai',
      'tai': 'thai',
    }
    const normalized = synonyms[searchTerm.toLowerCase()]
    if (normalized) {
      searchTerm = normalized
    }

    const selectFields = `
      id,
      name,
      category,
      tags,
      photo_url,
      price,
      value_score,
      value_percentile,
      total_votes,
      avg_rating,
      restaurants!inner (
        id,
        name,
        is_open,
        cuisine,
        town
      )
    `

    // Build query helper that applies common filters
    // For Supabase foreign table filtering, we filter the results after fetching
    // since PostgREST foreign table filters can be unreliable
    const runSearchQuery = async (additionalFilter) => {
      let query = supabase
        .from('dishes')
        .select(selectFields)
        .eq('restaurants.is_open', true)

      // Apply the additional search-specific filter
      query = additionalFilter(query)

      // Apply ordering and limit
      const result = await query
        .order('avg_rating', { ascending: false, nullsFirst: false })
        .limit(town ? limit * 3 : limit) // Fetch more if we need to filter by town

      // If town filter is specified, filter results client-side
      // This is more reliable than PostgREST foreign table filtering
      if (town && result.data) {
        result.data = result.data.filter(dish => dish.restaurants?.town === town).slice(0, limit)
      }

      return result
    }

    // Run all 3 search queries in parallel for better performance
    const [nameResult, cuisineResult, tagResult] = await Promise.all([
      // Query 1: Search by dish name and category
      runSearchQuery((q) => q.or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)),
      // Query 2: Search by restaurant cuisine
      runSearchQuery((q) => q.ilike('restaurants.cuisine', `%${searchTerm}%`)),
      // Query 3: Search by dish tags
      runSearchQuery((q) => q.contains('tags', [searchTerm.toLowerCase()])),
    ])

    // Check for errors
    if (nameResult.error) {
      logger.error('Error searching dishes by name:', nameResult.error)
      throw createClassifiedError(nameResult.error)
    }
    if (cuisineResult.error) {
      logger.error('Error searching dishes by cuisine:', cuisineResult.error)
      throw createClassifiedError(cuisineResult.error)
    }
    if (tagResult.error) {
      logger.error('Error searching dishes by tags:', tagResult.error)
      throw createClassifiedError(tagResult.error)
    }

    const nameData = nameResult.data
    const cuisineData = cuisineResult.data
    const tagData = tagResult.data

    // Merge all results, removing duplicates
    const allResults = [...(nameData || [])]
    const existingIds = new Set(allResults.map(d => d.id))

    for (const dish of [...(cuisineData || []), ...(tagData || [])]) {
      if (!existingIds.has(dish.id)) {
        allResults.push(dish)
        existingIds.add(dish.id)
      }
    }

    // Sort merged results by rating and limit
    allResults.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
    const limited = allResults.slice(0, limit)

    // Transform to match expected format, filtering out any without valid restaurant data
    return limited
      .filter(dish => dish.restaurants) // Defensive: skip dishes without restaurant data
      .map(dish => ({
        dish_id: dish.id,
        dish_name: dish.name,
        category: dish.category,
        tags: dish.tags || [],
        photo_url: dish.photo_url,
        price: dish.price,
        value_score: dish.value_score,
        value_percentile: dish.value_percentile,
        total_votes: dish.total_votes || 0,
        avg_rating: dish.avg_rating,
        restaurant_id: dish.restaurants?.id,
        restaurant_name: dish.restaurants?.name,
        restaurant_cuisine: dish.restaurants?.cuisine,
        restaurant_town: dish.restaurants?.town,
      }))
  },

  /**
   * Get variants for a parent dish
   * @param {string} parentDishId - Parent dish ID
   * @returns {Promise<Array>} Array of variant dishes with vote stats
   * @throws {Error} With classified error type
   */
  async getVariants(parentDishId) {
    try {
      const { data, error } = await supabase.rpc('get_dish_variants', {
        p_parent_dish_id: parentDishId,
      })

      if (error) {
        throw createClassifiedError(error)
      }

      return data || []
    } catch (error) {
      logger.error('Error fetching dish variants:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  /**
   * Check if a dish has variants
   * @param {string} dishId - Dish ID to check
   * @returns {Promise<boolean>} True if dish has variants
   */
  async hasVariants(dishId) {
    try {
      const { count, error } = await supabase
        .from('dishes')
        .select('id', { count: 'exact', head: true })
        .eq('parent_dish_id', dishId)

      if (error) {
        logger.error('Error checking for variants:', error)
        return false
      }

      return count > 0
    } catch (error) {
      logger.error('Error checking for variants:', error)
      return false
    }
  },

  /**
   * Get parent dish info for a variant
   * @param {string} dishId - Child dish ID
   * @returns {Promise<Object|null>} Parent dish info or null if no parent
   */
  async getParentDish(dishId) {
    try {
      // First get the dish to find its parent_dish_id
      const { data: dish, error: dishError } = await supabase
        .from('dishes')
        .select('parent_dish_id')
        .eq('id', dishId)
        .single()

      if (dishError || !dish?.parent_dish_id) {
        return null
      }

      // Get parent dish info
      const { data: parent, error: parentError } = await supabase
        .from('dishes')
        .select(`
          id,
          name,
          category,
          restaurant_id,
          restaurants (
            id,
            name
          )
        `)
        .eq('id', dish.parent_dish_id)
        .single()

      if (parentError) {
        logger.error('Error fetching parent dish:', parentError)
        return null
      }

      return parent
    } catch (error) {
      logger.error('Error getting parent dish:', error)
      return null
    }
  },

  /**
   * Get sibling variants for a dish (other variants of the same parent)
   * @param {string} dishId - Dish ID
   * @returns {Promise<Array>} Array of sibling variant dishes
   */
  async getSiblingVariants(dishId) {
    try {
      // First get the dish to find its parent_dish_id
      const { data: dish, error: dishError } = await supabase
        .from('dishes')
        .select('parent_dish_id')
        .eq('id', dishId)
        .single()

      if (dishError || !dish?.parent_dish_id) {
        return []
      }

      // Get all variants of this parent (including the current dish)
      return this.getVariants(dish.parent_dish_id)
    } catch (error) {
      logger.error('Error getting sibling variants:', error)
      return []
    }
  },

  /**
   * Get a single dish by ID with vote stats
   * Uses pre-computed avg_rating and total_votes from dishes table (maintained by trigger).
   * Queries votes table for yes_votes count (computed on-the-fly, no column on dishes table).
   * @param {string} dishId - Dish ID
   * @returns {Promise<Object>} Dish object with vote stats
   * @throws {Error} With classified error type
   */
  async getDishById(dishId) {
    try {
      // Fetch dish with restaurant info (including cuisine) and parent info
      const { data: dish, error: dishError } = await supabase
        .from('dishes')
        .select(`
          *,
          parent_dish_id,
          display_order,
          restaurants (
            id,
            name,
            address,
            lat,
            lng,
            cuisine
          )
        `)
        .eq('id', dishId)
        .single()

      if (dishError) {
        throw createClassifiedError(dishError)
      }

      // Count yes_votes and check variants in parallel
      // Note: avg_rating and total_votes come from pre-computed dish columns.
      const [yesVotesResult, hasVariantsResult] = await Promise.all([
        supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('dish_id', dishId)
          .eq('would_order_again', true),
        this.hasVariants(dishId),
      ])

      const yesVotes = yesVotesResult.error ? 0 : (yesVotesResult.count || 0)
      if (yesVotesResult.error) {
        logger.error('Error counting yes votes for dish:', yesVotesResult.error)
      }

      return {
        ...dish,
        yes_votes: yesVotes,
        has_variants: hasVariantsResult,
      }
    } catch (error) {
      logger.error('Error fetching dish:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },
}
