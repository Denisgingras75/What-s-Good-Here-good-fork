import { supabase } from '../lib/supabase'
import { createClassifiedError } from '../utils/errorHandler'
import { sanitizeSearchQuery } from '../utils/sanitize'
import { logger } from '../utils/logger'
import { TAG_SYNONYMS } from '../constants/tags'

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
   * Multi-word aware: "lobster roll" searches as phrase first, then AND tokens
   * Fallback ladder: phrase → AND name → cross-field → OR (broadest)
   * Tag synonym expansion: "light" also searches fresh, healthy tags
   * @param {string} query - Search query
   * @param {number} limit - Max results
   * @param {string|null} town - Optional town filter (e.g., 'Oak Bluffs')
   * @returns {Promise<Array>} Array of matching dishes sorted by rating
   * @throws {Error} On API failure
   */
  async search(query, limit = 5, town = null) {
    if (!query?.trim()) return []

    const sanitized = sanitizeSearchQuery(query, 50)
    if (!sanitized) return []

    // --- Tokenize ---
    const stopWords = new Set([
      'food', 'foods', 'the', 'a', 'an', 'and', 'or', 'for', 'of', 'at',
      'to', 'on', 'best', 'good', 'great', 'near', 'me', 'find', 'get',
      'want', 'looking', 'something', 'whats', "what's", 'is', 'some',
    ])
    const allWords = sanitized.toLowerCase().split(/\s+/).filter(w => w.length >= 2)
    const tokens = allWords.filter(w => !stopWords.has(w))

    if (tokens.length === 0) return []

    // --- Normalize misspellings ---
    const misspellings = {
      'indiana': 'indian', 'indain': 'indian',
      'italien': 'italian', 'italain': 'italian',
      'mexcian': 'mexican', 'maxican': 'mexican',
      'chineese': 'chinese', 'chinease': 'chinese',
      'japaneese': 'japanese', 'japenese': 'japanese',
      'thia': 'thai', 'tai': 'thai',
    }
    const normalizedTokens = tokens.map(t => misspellings[t] || t)
    const phrase = normalizedTokens.join(' ')

    // --- Expand tag synonyms ---
    const expandedTags = []
    for (const token of normalizedTokens) {
      const synonyms = TAG_SYNONYMS[token]
      if (synonyms) {
        expandedTags.push(...synonyms)
      } else {
        expandedTags.push(token)
      }
    }
    const uniqueTags = [...new Set(expandedTags)]

    const selectFields = `
      id, name, category, tags, photo_url, price,
      value_score, value_percentile, total_votes, avg_rating,
      restaurants!inner ( id, name, is_open, cuisine, town )
    `

    const fetchLimit = town ? limit * 4 : limit

    const buildQuery = () => {
      return supabase
        .from('dishes')
        .select(selectFields)
        .eq('restaurants.is_open', true)
    }

    const applyTownFilter = (data) => {
      if (!town || !data) return data || []
      return data.filter(d => d.restaurants?.town === town)
    }

    const transformResult = (dish) => ({
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
    })

    // Merge helper: adds new dishes to results, skipping duplicates
    const mergeInto = (results, existingIds, newData) => {
      const filtered = applyTownFilter(newData)
      for (const d of filtered) {
        if (!existingIds.has(d.id)) {
          results.push(d)
          existingIds.add(d.id)
        }
      }
    }

    try {
      let results = []
      const existingIds = new Set()
      let lastError = null
      let anyLevelSucceeded = false

      // Level 1: Exact phrase match on dish name (highest precision)
      if (normalizedTokens.length > 1) {
        const { data, error } = await buildQuery()
          .ilike('name', `%${phrase}%`)
          .order('avg_rating', { ascending: false, nullsFirst: false })
          .limit(fetchLimit)
        if (error) {
          logger.error('Search phrase match error:', error)
          lastError = error
        } else {
          anyLevelSucceeded = true
          mergeInto(results, existingIds, data)
        }
      }

      // Level 2: AND tokens on dish name (e.g. "fried" AND "chicken" both in name)
      if (results.length < limit && normalizedTokens.length > 1) {
        let q = buildQuery()
        for (const token of normalizedTokens) {
          q = q.ilike('name', `%${token}%`)
        }
        const { data, error } = await q
          .order('avg_rating', { ascending: false, nullsFirst: false })
          .limit(fetchLimit)
        if (error) {
          logger.error('Search AND-name error:', error)
          lastError = error
        } else {
          anyLevelSucceeded = true
          mergeInto(results, existingIds, data)
        }
      }

      // Level 3: Cross-field search (name/category/cuisine + tag overlap)
      if (results.length < limit) {
        const orParts = normalizedTokens.map(t =>
          `name.ilike.%${t}%,category.ilike.%${t}%,restaurants.cuisine.ilike.%${t}%`
        ).join(',')

        const [fieldResult, tagResult] = await Promise.all([
          buildQuery()
            .or(orParts)
            .order('avg_rating', { ascending: false, nullsFirst: false })
            .limit(fetchLimit),
          buildQuery()
            .overlaps('tags', uniqueTags)
            .order('avg_rating', { ascending: false, nullsFirst: false })
            .limit(fetchLimit),
        ])

        if (fieldResult.error) {
          logger.error('Search cross-field error:', fieldResult.error)
          lastError = fieldResult.error
        } else {
          anyLevelSucceeded = true
          mergeInto(results, existingIds, fieldResult.data)
        }

        if (tagResult.error) {
          logger.error('Search tag overlap error:', tagResult.error)
          lastError = tagResult.error
        } else {
          anyLevelSucceeded = true
          mergeInto(results, existingIds, tagResult.data)
        }
      }

      // Level 4: OR-token broadest fallback (if still under 3 results)
      if (results.length < 3) {
        const orParts = normalizedTokens.map(t =>
          `name.ilike.%${t}%`
        ).join(',')

        const { data, error } = await buildQuery()
          .or(orParts)
          .order('avg_rating', { ascending: false, nullsFirst: false })
          .limit(fetchLimit)
        if (error) {
          logger.error('Search OR-fallback error:', error)
          lastError = error
        } else {
          anyLevelSucceeded = true
          mergeInto(results, existingIds, data)
        }
      }

      // If every level failed, throw so the caller sees an error (not "no results")
      if (!anyLevelSucceeded && lastError) {
        throw createClassifiedError(lastError)
      }

      // Sort by rating and limit
      results.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))

      return results
        .slice(0, limit)
        .filter(dish => dish.restaurants)
        .map(transformResult)

    } catch (error) {
      logger.error('Error searching dishes:', error)
      throw error.type ? error : createClassifiedError(error)
    }
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
            cuisine,
            town
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
