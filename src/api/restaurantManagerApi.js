import { supabase } from '../lib/supabase'
import { createClassifiedError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

export const restaurantManagerApi = {
  /**
   * Get the restaurant the current user manages (if any)
   * If user manages multiple, returns the first one.
   * @returns {Promise<{restaurant: Object, role: string}|null>}
   */
  async getMyRestaurant() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('restaurant_managers')
      .select(`
        role,
        restaurants (
          id,
          name,
          address,
          town,
          phone,
          website_url,
          facebook_url,
          instagram_url
        )
      `)
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (error) {
      logger.error('Error fetching manager status:', error)
      throw createClassifiedError(error)
    }

    if (!data) return null

    return {
      restaurant: data.restaurants,
      role: data.role,
    }
  },

  /**
   * Create an invite link for a restaurant (admin only)
   * @param {string} restaurantId
   * @returns {Promise<{token: string, expiresAt: string}>}
   */
  async createInvite(restaurantId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw createClassifiedError(new Error('Not authenticated'))

    const { data, error } = await supabase
      .from('restaurant_invites')
      .insert({
        restaurant_id: restaurantId,
        created_by: user.id,
      })
      .select('token, expires_at')
      .single()

    if (error) {
      logger.error('Error creating invite:', error)
      throw createClassifiedError(error)
    }

    return { token: data.token, expiresAt: data.expires_at }
  },

  /**
   * Get all invites for a restaurant (admin only)
   * @param {string} restaurantId
   * @returns {Promise<Array>}
   */
  async getInvitesForRestaurant(restaurantId) {
    const { data, error } = await supabase
      .from('restaurant_invites')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching invites:', error)
      throw createClassifiedError(error)
    }

    return data || []
  },

  /**
   * Get all managers for a restaurant (admin only)
   * @param {string} restaurantId
   * @returns {Promise<Array>}
   */
  async getManagersForRestaurant(restaurantId) {
    const { data, error } = await supabase
      .from('restaurant_managers')
      .select(`
        id,
        role,
        accepted_at,
        user_id,
        profiles:user_id (display_name)
      `)
      .eq('restaurant_id', restaurantId)

    if (error) {
      logger.error('Error fetching managers:', error)
      throw createClassifiedError(error)
    }

    return data || []
  },

  /**
   * Remove a manager (admin only)
   * @param {string} managerId
   */
  async removeManager(managerId) {
    const { error } = await supabase
      .from('restaurant_managers')
      .delete()
      .eq('id', managerId)

    if (error) {
      logger.error('Error removing manager:', error)
      throw createClassifiedError(error)
    }
  },

  /**
   * Get invite details (public, no auth required)
   * @param {string} token
   * @returns {Promise<{valid: boolean, restaurantName?: string, expiresAt?: string, error?: string}>}
   */
  async getInviteDetails(token) {
    const { data, error } = await supabase.rpc('get_invite_details', { p_token: token })

    if (error) {
      logger.error('Error fetching invite details:', error)
      throw createClassifiedError(error)
    }

    return data
  },

  /**
   * Accept a restaurant invite (requires auth)
   * @param {string} token
   * @returns {Promise<{success: boolean, restaurantId?: string, restaurantName?: string, error?: string}>}
   */
  async acceptInvite(token) {
    const { data, error } = await supabase.rpc('accept_restaurant_invite', { p_token: token })

    if (error) {
      logger.error('Error accepting invite:', error)
      throw createClassifiedError(error)
    }

    return data
  },

  /**
   * Update restaurant contact/social info (manager)
   * @param {string} restaurantId
   * @param {Object} updates - { phone, website_url, facebook_url, instagram_url }
   * @returns {Promise<Object>}
   */
  async updateRestaurantInfo(restaurantId, updates) {
    const allowed = {}
    if (updates.phone !== undefined) allowed.phone = updates.phone?.trim() || null
    if (updates.website_url !== undefined) allowed.website_url = updates.website_url?.trim() || null
    if (updates.facebook_url !== undefined) allowed.facebook_url = updates.facebook_url?.trim() || null
    if (updates.instagram_url !== undefined) allowed.instagram_url = updates.instagram_url?.trim() || null

    const { data, error } = await supabase
      .from('restaurants')
      .update(allowed)
      .eq('id', restaurantId)
      .select('id, name, phone, website_url, facebook_url, instagram_url')
      .single()

    if (error) {
      logger.error('Error updating restaurant info:', error)
      throw createClassifiedError(error)
    }

    return data
  },

  /**
   * Get all dishes for a restaurant (manager view)
   * @param {string} restaurantId
   * @returns {Promise<Array>}
   */
  async getRestaurantDishes(restaurantId) {
    const { data, error } = await supabase
      .from('dishes')
      .select('id, name, category, price, photo_url')
      .eq('restaurant_id', restaurantId)
      .order('category')
      .order('name')

    if (error) {
      logger.error('Error fetching restaurant dishes:', error)
      throw createClassifiedError(error)
    }

    return data || []
  },

  /**
   * Add a dish to a restaurant (manager)
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async addDish({ restaurantId, name, category, price, photoUrl }) {
    const { data, error } = await supabase
      .from('dishes')
      .insert({
        restaurant_id: restaurantId,
        name: name.trim(),
        category: category.toLowerCase(),
        price: price ? parseFloat(price) : null,
        photo_url: photoUrl?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error adding dish:', error)
      throw createClassifiedError(error)
    }

    return data
  },

  /**
   * Update a dish (manager)
   * @param {string} dishId
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateDish(dishId, { name, price, photoUrl }) {
    const updates = {}
    if (name !== undefined) updates.name = name.trim()
    if (price !== undefined) updates.price = price ? parseFloat(price) : null
    if (photoUrl !== undefined) updates.photo_url = photoUrl?.trim() || null

    const { data, error } = await supabase
      .from('dishes')
      .update(updates)
      .eq('id', dishId)
      .select()
      .single()

    if (error) {
      logger.error('Error updating dish:', error)
      throw createClassifiedError(error)
    }

    return data
  },

  /**
   * Get all specials for a restaurant (active + inactive for managers)
   * @param {string} restaurantId
   * @returns {Promise<Array>}
   */
  async getRestaurantSpecials(restaurantId) {
    const { data, error } = await supabase
      .from('specials')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching restaurant specials:', error)
      throw createClassifiedError(error)
    }

    return data || []
  },

  /**
   * Create a special (manager)
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async createSpecial({ restaurantId, dealName, description, price, expiresAt }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw createClassifiedError(new Error('Not authenticated'))

    const { data, error } = await supabase
      .from('specials')
      .insert({
        restaurant_id: restaurantId,
        deal_name: dealName,
        description,
        price: price ? parseFloat(price) : null,
        expires_at: expiresAt || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating special:', error)
      throw createClassifiedError(error)
    }

    return data
  },

  /**
   * Update a special (manager)
   * Whitelists fields to prevent arbitrary column updates.
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateSpecial(id, updates) {
    const allowed = {}
    if (updates.deal_name !== undefined) allowed.deal_name = updates.deal_name
    if (updates.description !== undefined) allowed.description = updates.description
    if (updates.price !== undefined) allowed.price = updates.price
    if (updates.expires_at !== undefined) allowed.expires_at = updates.expires_at
    if (updates.is_active !== undefined) allowed.is_active = updates.is_active

    const { data, error } = await supabase
      .from('specials')
      .update(allowed)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating special:', error)
      throw createClassifiedError(error)
    }

    return data
  },

  /**
   * Deactivate a special (soft delete)
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async deactivateSpecial(id) {
    return this.updateSpecial(id, { is_active: false })
  },

  /**
   * Get all events for a restaurant (active + inactive for managers)
   * @param {string} restaurantId
   * @returns {Promise<Array>}
   */
  async getRestaurantEvents(restaurantId) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('is_active', { ascending: false })
      .order('event_date', { ascending: true })

    if (error) {
      logger.error('Error fetching restaurant events:', error)
      throw createClassifiedError(error)
    }

    return data || []
  },

  /**
   * Create an event (manager)
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async createEvent({ restaurantId, eventName, description, eventDate, startTime, endTime, eventType, recurringPattern, recurringDayOfWeek }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw createClassifiedError(new Error('Not authenticated'))

    const { data, error } = await supabase
      .from('events')
      .insert({
        restaurant_id: restaurantId,
        event_name: eventName,
        description,
        event_date: eventDate,
        start_time: startTime || null,
        end_time: endTime || null,
        event_type: eventType,
        recurring_pattern: recurringPattern || null,
        recurring_day_of_week: recurringDayOfWeek != null ? recurringDayOfWeek : null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating event:', error)
      throw createClassifiedError(error)
    }

    return data
  },

  /**
   * Update an event (manager)
   * Whitelists fields to prevent arbitrary column updates.
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateEvent(id, updates) {
    const allowed = {}
    if (updates.event_name !== undefined) allowed.event_name = updates.event_name
    if (updates.description !== undefined) allowed.description = updates.description
    if (updates.event_date !== undefined) allowed.event_date = updates.event_date
    if (updates.start_time !== undefined) allowed.start_time = updates.start_time
    if (updates.end_time !== undefined) allowed.end_time = updates.end_time
    if (updates.event_type !== undefined) allowed.event_type = updates.event_type
    if (updates.recurring_pattern !== undefined) allowed.recurring_pattern = updates.recurring_pattern
    if (updates.recurring_day_of_week !== undefined) allowed.recurring_day_of_week = updates.recurring_day_of_week
    if (updates.is_active !== undefined) allowed.is_active = updates.is_active

    const { data, error } = await supabase
      .from('events')
      .update(allowed)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating event:', error)
      throw createClassifiedError(error)
    }

    return data
  },

  /**
   * Deactivate an event (soft delete)
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async deactivateEvent(id) {
    return this.updateEvent(id, { is_active: false })
  },
}
