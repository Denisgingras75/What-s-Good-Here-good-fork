import { supabase } from '../lib/supabase'

/**
 * Notifications API
 */
export const notificationsApi = {
  /**
   * Get notifications for current user
   * @param {number} limit - Max results
   * @returns {Promise<Array>}
   */
  async getNotifications(limit = 20) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }

    return data || []
  },

  /**
   * Get unread notification count
   * @returns {Promise<number>}
   */
  async getUnreadCount() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }

    return count || 0
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<boolean>}
   */
  async markAllAsRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) {
      console.error('Error marking notifications as read:', error)
      return false
    }

    return true
  },

  /**
   * Mark a single notification as read
   * @param {string} notificationId
   * @returns {Promise<boolean>}
   */
  async markAsRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return false
    }

    return true
  },
}
