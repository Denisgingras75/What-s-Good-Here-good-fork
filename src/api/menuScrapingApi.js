import { supabase } from '../lib/supabase'
import { createClassifiedError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

/**
 * Menu Scraping API - Triggers menu extraction from restaurant websites
 * Uses the menu-refresh Supabase Edge Function which fetches the menu URL,
 * extracts dishes with Claude Haiku, and upserts them into the database.
 */

export const menuScrapingApi = {
  /**
   * Trigger menu scraping for a single restaurant
   * @param {string} restaurantId - Restaurant UUID
   * @returns {Promise<Object>} Scraping result with stats
   */
  async scrapeMenu(restaurantId) {
    if (!restaurantId) throw createClassifiedError(new Error('Restaurant ID required'))

    try {
      const response = await supabase.functions.invoke('menu-refresh', {
        body: { restaurant_id: restaurantId },
      })

      if (response.error) {
        throw createClassifiedError(response.error)
      }

      const data = response.data
      if (!data) {
        return { status: 'no_data', inserted: 0, updated: 0 }
      }

      // Single restaurant mode returns results array with one entry
      const result = data.results?.[0] || data
      return {
        status: result.status || 'unknown',
        inserted: result.inserted || data.total_inserted || 0,
        updated: result.updated || data.total_updated || 0,
        unchanged: result.unchanged || 0,
        totalDishes: result.total_dishes || 0,
      }
    } catch (error) {
      logger.error('Menu scraping error:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  /**
   * Update a restaurant's menu URL and optionally trigger scraping
   * @param {string} restaurantId - Restaurant UUID
   * @param {string} menuUrl - URL to the restaurant's online menu
   * @param {boolean} triggerScrape - Whether to scrape immediately (default: true)
   * @returns {Promise<Object>} Update result
   */
  async setMenuUrl(restaurantId, menuUrl, triggerScrape = true) {
    if (!restaurantId) throw createClassifiedError(new Error('Restaurant ID required'))

    try {
      // Update menu_url on the restaurant
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ menu_url: menuUrl || null })
        .eq('id', restaurantId)

      if (updateError) throw createClassifiedError(updateError)

      // Optionally trigger scraping
      if (triggerScrape && menuUrl) {
        try {
          const scrapeResult = await this.scrapeMenu(restaurantId)
          return { updated: true, scrapeResult }
        } catch (scrapeErr) {
          // Menu URL saved successfully, scraping failed — don't block
          logger.warn('Menu URL saved but scraping failed:', scrapeErr)
          return { updated: true, scrapeResult: { status: 'error', error: scrapeErr?.message } }
        }
      }

      return { updated: true, scrapeResult: null }
    } catch (error) {
      logger.error('Set menu URL error:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },
}
