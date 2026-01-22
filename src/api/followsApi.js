import { supabase } from '../lib/supabase'

/**
 * Follows API - Social connections
 */

export const followsApi = {
  /**
   * Follow a user
   * @param {string} followedId - User ID to follow
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async follow(followedId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    if (user.id === followedId) {
      return { success: false, error: 'Cannot follow yourself' }
    }

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        followed_id: followedId,
      })

    if (error) {
      // Handle duplicate follow gracefully
      if (error.code === '23505') {
        return { success: true } // Already following
      }
      console.error('Error following user:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  /**
   * Unfollow a user
   * @param {string} followedId - User ID to unfollow
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async unfollow(followedId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('followed_id', followedId)

    if (error) {
      console.error('Error unfollowing user:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
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
    }

    return !!data
  },

  /**
   * Get followers of a user
   * @param {string} userId - User ID
   * @param {number} limit - Max results
   * @returns {Promise<Array>}
   */
  async getFollowers(userId, limit = 50) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower_id,
        created_at,
        profiles!follows_follower_id_fkey (
          id,
          display_name,
          follower_count
        )
      `)
      .eq('followed_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching followers:', error)
      return []
    }

    return data.map(f => ({
      id: f.follower_id,
      display_name: f.profiles?.display_name || 'Anonymous',
      follower_count: f.profiles?.follower_count || 0,
      followed_at: f.created_at,
    }))
  },

  /**
   * Get users that a user follows
   * @param {string} userId - User ID
   * @param {number} limit - Max results
   * @returns {Promise<Array>}
   */
  async getFollowing(userId, limit = 50) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        followed_id,
        created_at,
        profiles!follows_followed_id_fkey (
          id,
          display_name,
          follower_count
        )
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching following:', error)
      return []
    }

    return data.map(f => ({
      id: f.followed_id,
      display_name: f.profiles?.display_name || 'Anonymous',
      follower_count: f.profiles?.follower_count || 0,
      followed_at: f.created_at,
    }))
  },

  /**
   * Get follow counts for a user
   * @param {string} userId - User ID
   * @returns {Promise<{followers: number, following: number}>}
   */
  async getFollowCounts(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('follower_count, following_count')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching follow counts:', error)
      return { followers: 0, following: 0 }
    }

    return {
      followers: data?.follower_count || 0,
      following: data?.following_count || 0,
    }
  },

  /**
   * Get friends (people you follow) who voted on a dish
   * @param {string} dishId - Dish ID
   * @returns {Promise<Array>}
   */
  async getFriendsVotesForDish(dishId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .rpc('get_friends_votes_for_dish', {
        p_user_id: user.id,
        p_dish_id: dishId,
      })

    if (error) {
      console.error('Error fetching friends votes:', error)
      return []
    }

    return data || []
  },

  /**
   * Search users by name
   * @param {string} query - Search query
   * @param {number} limit - Max results
   * @returns {Promise<Array>}
   */
  async searchUsers(query, limit = 10) {
    if (!query?.trim() || query.length < 2) return []

    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, follower_count, following_count')
      .ilike('display_name', `%${query}%`)
      .order('follower_count', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error searching users:', error)
      return []
    }

    return data || []
  },

  /**
   * Get a user's public profile data
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>}
   */
  async getUserProfile(userId) {
    // Get basic profile info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, follower_count, following_count, created_at')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return null
    }

    // Get vote stats
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('rating_10, would_order_again, created_at')
      .eq('user_id', userId)

    if (votesError) {
      console.error('Error fetching user votes:', votesError)
    }

    const voteList = votes || []
    const totalVotes = voteList.length
    const worthItCount = voteList.filter(v => v.would_order_again).length
    const avoidCount = voteList.filter(v => !v.would_order_again).length
    const avgRating = totalVotes > 0
      ? Math.round((voteList.reduce((sum, v) => sum + (v.rating_10 || 0), 0) / totalVotes) * 10) / 10
      : null

    // Get recent votes with dish info
    const { data: recentVotes, error: recentError } = await supabase
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
      .limit(5)

    if (recentError) {
      console.error('Error fetching recent votes:', recentError)
    }

    // Get all unlocked badges (not just public-eligible ones)
    const { data: badges, error: badgesError } = await supabase
      .rpc('get_user_badges', { p_user_id: userId, p_public_only: false })

    if (badgesError) {
      console.error('Error fetching badges:', badgesError)
    }

    // Map badge_key to key for consistency with UI
    const mappedBadges = (badges || []).map(b => ({
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
      recent_votes: (recentVotes || []).map(v => ({
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
