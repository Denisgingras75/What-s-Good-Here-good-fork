import { supabase } from '../lib/supabase'
import posthog from 'posthog-js'
import { logger } from '../utils/logger'
import { sanitizeSearchQuery } from '../utils/sanitize'

/**
 * Auth API - Centralized authentication operations
 */

export const authApi = {
  /**
   * Sign in with Google OAuth
   * @param {string|null} redirectUrl - Optional custom redirect URL
   * @returns {Promise<Object>} Auth response
   */
  async signInWithGoogle(redirectUrl = null) {
    try {
      posthog.capture('login_started', { method: 'google' })

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl || window.location.origin,
        },
      })
      if (error) {
        posthog.capture('login_failed', { method: 'google', error: error.message })
        throw error
      }
      return { success: true }
    } catch (error) {
      logger.error('Error signing in with Google:', error)
      throw error
    }
  },

  /**
   * Sign in with magic link via email
   * @param {string} email - User email
   * @param {string|null} redirectUrl - Optional custom redirect URL
   * @returns {Promise<Object>} Auth response
   */
  async signInWithMagicLink(email, redirectUrl = null) {
    try {
      posthog.capture('login_started', { method: 'magic_link' })

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl || window.location.origin,
        },
      })
      if (error) {
        posthog.capture('login_failed', { method: 'magic_link', error: error.message })
        throw error
      }
      posthog.capture('magic_link_sent')
      return { success: true }
    } catch (error) {
      logger.error('Error sending magic link:', error)
      throw error
    }
  },

  /**
   * Sign up with email, password, and username
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} username - Display name (must be unique)
   * @returns {Promise<Object>} Auth response
   */
  async signUpWithPassword(email, password, username) {
    try {
      posthog.capture('signup_started', { method: 'password' })

      // Check if username is already taken
      // Sanitize username for safe database query
      const sanitizedUsername = sanitizeSearchQuery(username, 30)
      const { data: existingUser, error: usernameError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('display_name', sanitizedUsername)
        .single()

      if (usernameError && usernameError.code !== 'PGRST116') {
        throw usernameError
      }

      if (existingUser) {
        throw new Error('This username is already taken. Please choose another.')
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: username,
          },
        },
      })

      if (error) {
        posthog.capture('signup_failed', { method: 'password', error: error.message })
        throw error
      }

      // Update the profile with the display name
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ display_name: username })
          .eq('id', data.user.id)

        if (profileError) {
          throw profileError
        }
      }

      posthog.capture('signup_completed', { method: 'password' })
      return { success: true, user: data.user }
    } catch (error) {
      logger.error('Error signing up:', error)
      throw error
    }
  },

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Auth response
   */
  async signInWithPassword(email, password) {
    try {
      posthog.capture('login_started', { method: 'password' })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        posthog.capture('login_failed', { method: 'password', error: error.message })
        throw error
      }

      posthog.capture('login_completed', { method: 'password' })
      return { success: true, user: data.user }
    } catch (error) {
      logger.error('Error signing in:', error)
      throw error
    }
  },

  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<Object>} Result
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      logger.error('Error sending password reset:', error)
      throw error
    }
  },

  /**
   * Update password (after clicking reset link)
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      logger.error('Error updating password:', error)
      throw error
    }
  },

  /**
   * Check if a username is available
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} True if available
   */
  async isUsernameAvailable(username) {
    try {
      // Sanitize username for safe database query
      const sanitizedUsername = sanitizeSearchQuery(username, 30)
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .ilike('display_name', sanitizedUsername)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return !data
    } catch (error) {
      // PGRST116 means no rows found, which means username is available
      if (error.code === 'PGRST116') return true
      logger.error('Error checking username:', error)
      throw new Error('Unable to check username availability')
    }
  },

  /**
   * Get current user's vote for a dish
   * @param {string} dishId - Dish ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Vote data or null
   */
  async getUserVoteForDish(dishId, userId) {
    try {
      if (!userId) {
        return null
      }

      const { data, error } = await supabase
        .from('votes')
        .select('would_order_again, rating_10, review_text, review_created_at')
        .eq('dish_id', dishId)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is fine
        throw error
      }

      return data || null
    } catch (error) {
      logger.error('Error fetching user vote:', error)
      throw error
    }
  },
}
