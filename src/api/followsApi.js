import { supabase } from '../lib/supabase'
import { sanitizeSearchQuery } from '../utils/sanitize'

/**
 * Follows API - Social connections
 */

export const followsApi = {
  /**
   * Follow a user
   * @param {string} followedId - User ID to follow
   * @returns {Promise<void>}
   * @throws {Error} Not authenticated, self-follow, or API error
   */
  async follow(followedId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    if (user.id === followedId) {
      throw new Error('Cannot follow yourself')
    }

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        followed_id: followedId,
      })

    if (error) {
      // Handle duplicate follow gracefully - not an error
      if (error.code === '23505') {
        return // Already following, success
      }
      throw error
    }
  },

  /**
   * Unfollow a user
   * @param {string} followedId - User ID to unfollow
   * @returns {Promise<void>}
   * @throws {Error} Not authenticated or API error
   */
  async unfollow(followedId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('followed_id', followedId)

    if (error) {
      throw error
    }
  },

  /**
   * Check if current user follows another user
   * @param {string} followedId - User ID to check
   * @returns {Promise<boolean>}
   */
  async isFollowing(followedId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('followed_id', followedId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking follow status:', error)
      throw error
    }

    return !!data
  },

  /**
   * Get followers of a user with cursor-based pagination
   * @param {string} userId - User ID
   * @param {Object} options - Pagination options
   * @param {number} options.limit - Max results per page (default 20)
   * @param {string} options.cursor - Cursor for pagination (created_at of last item)
   * @returns {Promise<{users: Array, hasMore: boolean}>}
   */
  async getFollowers(userId, { limit = 20, cursor = null } = {}) {
    try {
      // Build query with cursor-based pagination
      let query = supabase
        .from('follows')
        .select('follower_id, created_at')
        .eq('followed_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit + 1) // Fetch one extra to check if there's more

      // Apply cursor filter if provided
      if (cursor) {
        query = query.lt('created_at', cursor)
      }

      const { data: followData, error: followError } = await query

      if (followError) {
        throw new Error('Failed to fetch followers')
      }

      if (!followData || followData.length === 0) {
        return { users: [], hasMore: false }
      }

      // Check if there are more results
      const hasMore = followData.length > limit
      const results = hasMore ? followData.slice(0, limit) : followData

      // Get profile info for each follower
      const followerIds = results.map(f => f.follower_id)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, follower_count')
        .in('id', followerIds)

      if (profileError) {
        // Continue without profile data
      }

      const profileMap = {}
      ;(profiles || []).forEach(p => { profileMap[p.id] = p })

      const users = results.map(f => ({
        id: f.follower_id,
        display_name: profileMap[f.follower_id]?.display_name || 'Anonymous',
        follower_count: profileMap[f.follower_id]?.follower_count || 0,
        followed_at: f.created_at,
      }))

      return { users, hasMore }
    } catch (err) {
      throw err
    }
  },

  /**
   * Get users that a user follows with cursor-based pagination
   * @param {string} userId - User ID
   * @param {Object} options - Pagination options
   * @param {number} options.limit - Max results per page (default 20)
   * @param {string} options.cursor - Cursor for pagination (created_at of last item)
   * @returns {Promise<{users: Array, hasMore: boolean}>}
   */
  async getFollowing(userId, { limit = 20, cursor = null } = {}) {
    try {
      // Build query with cursor-based pagination
      let query = supabase
        .from('follows')
        .select('followed_id, created_at')
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit + 1) // Fetch one extra to check if there's more

      // Apply cursor filter if provided
      if (cursor) {
        query = query.lt('created_at', cursor)
      }

      const { data: followData, error: followError } = await query

      if (followError) {
        throw new Error('Failed to fetch following')
      }

      if (!followData || followData.length === 0) {
        return { users: [], hasMore: false }
      }

      // Check if there are more results
      const hasMore = followData.length > limit
      const results = hasMore ? followData.slice(0, limit) : followData

      // Get profile info for each followed user
      const followedIds = results.map(f => f.followed_id)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, follower_count')
        .in('id', followedIds)

      if (profileError) {
        // Continue without profile data
      }

      const profileMap = {}
      ;(profiles || []).forEach(p => { profileMap[p.id] = p })

      const users = results.map(f => ({
        id: f.followed_id,
        display_name: profileMap[f.followed_id]?.display_name || 'Anonymous',
        follower_count: profileMap[f.followed_id]?.follower_count || 0,
        followed_at: f.created_at,
      }))

      return { users, hasMore }
    } catch (err) {
      throw err
    }
  },

  /**
   * Get follow counts for a user (counted live from follows table)
   * @param {string} userId - User ID
   * @returns {Promise<{followers: number, following: number}>}
   */
  async getFollowCounts(userId) {
    // Count followers (people who follow this user)
    const { count: followerCount, error: followerError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('followed_id', userId)

    // Count following (people this user follows)
    const { count: followingCount, error: followingError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)

    if (followerError || followingError) {
      console.error('Error fetching follow counts:', followerError || followingError)
      throw (followerError || followingError)
    }

    return {
      followers: followerCount || 0,
      following: followingCount || 0,
    }
  },

  /**
   * Get friends (people you follow) who voted on a dish
   * @param {string} dishId - Dish ID
   * @returns {Promise<Array>}
   */
  async getFriendsVotesForDish(dishId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .rpc('get_friends_votes_for_dish', {
          p_user_id: user.id,
          p_dish_id: dishId,
        })

      if (error) {
        console.error('Error fetching friends votes:', error)
        throw new Error('Failed to fetch friends votes')
      }

      return data || []
    } catch (err) {
      console.error('Unexpected error in getFriendsVotesForDish:', err)
      throw err
    }
  },

  /**
   * Search users by name
   * @param {string} query - Search query
   * @param {number} limit - Max results
   * @returns {Promise<Array>}
   */
  async searchUsers(query, limit = 10) {
    try {
      if (!query?.trim() || query.length < 2) return []

      // Sanitize query to prevent SQL injection via LIKE patterns
      const sanitized = sanitizeSearchQuery(query, 50)
      if (!sanitized || sanitized.length < 2) return []

      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, follower_count, following_count')
        .ilike('display_name', `%${sanitized}%`)
        .order('follower_count', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error searching users:', error)
        throw new Error('Failed to search users')
      }

      return data || []
    } catch (err) {
      console.error('Unexpected error in searchUsers:', err)
      throw err
    }
  },

  /**
   * Get a user's public profile data
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>}
   */
  async getUserProfile(userId) {
    // Run all independent queries in parallel for faster loading
    const [
      profileResult,
      followerResult,
      followingResult,
      votesResult,
      badgesResult,
    ] = await Promise.all([
      // 1. Get basic profile info
      supabase
        .from('profiles')
        .select('id, display_name, created_at')
        .eq('id', userId)
        .single(),
      // 2. Get follower count
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('followed_id', userId),
      // 3. Get following count
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId),
      // 4. Get votes with dish info (includes data for stats calculation)
      supabase
        .from('votes')
        .select(`
          rating_10,
          would_order_again,
          created_at,
          dishes (
            id,
            name,
            photo_url,
            category,
            avg_rating,
            restaurants (
              id,
              name
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
      // 5. Get badges
      supabase.rpc('get_user_badges', { p_user_id: userId, p_public_only: false }),
    ])

    // Check for profile error (required)
    if (profileResult.error) {
      return null
    }

    const profile = profileResult.data
    profile.follower_count = followerResult.count || 0
    profile.following_count = followingResult.count || 0

    // Calculate stats from votes (no separate query needed)
    const voteList = votesResult.data || []
    const totalVotes = voteList.length
    const worthItCount = voteList.filter(v => v.would_order_again).length
    const avoidCount = voteList.filter(v => !v.would_order_again).length
    const avgRating = totalVotes > 0
      ? Math.round((voteList.reduce((sum, v) => sum + (v.rating_10 || 0), 0) / totalVotes) * 10) / 10
      : null

    const badges = badgesResult.data || []

    // Map badge_key to key for consistency with UI
    const mappedBadges = badges.map(b => ({
      key: b.badge_key,
      name: b.name,
      subtitle: b.subtitle,
      description: b.description,
      icon: b.icon,
      unlocked_at: b.unlocked_at,
    }))

    return {
      ...profile,
      stats: {
        total_votes: totalVotes,
        worth_it: worthItCount,
        avoid: avoidCount,
        avg_rating: avgRating,
      },
      recent_votes: voteList.map(v => ({
        rating: v.rating_10,
        would_order_again: v.would_order_again,
        voted_at: v.created_at,
        dish: v.dishes ? {
          id: v.dishes.id,
          name: v.dishes.name,
          photo_url: v.dishes.photo_url,
          category: v.dishes.category,
          avg_rating: v.dishes.avg_rating,
          restaurant_name: v.dishes.restaurants?.name,
          restaurant_id: v.dishes.restaurants?.id,
        } : null,
      })),
      badges: mappedBadges,
    }
  },
}
