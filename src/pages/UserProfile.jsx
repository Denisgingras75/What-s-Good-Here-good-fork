import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { followsApi } from '../api'
import { getCategoryImage } from '../constants/categoryImages'
import { getRatingColor } from '../utils/ranking'
import { FollowListModal } from '../components/FollowListModal'
import { supabase } from '../lib/supabase'

/**
 * Public User Profile Page
 * View another user's profile, stats, badges, and recent ratings
 */
export function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [followListModal, setFollowListModal] = useState(null) // 'followers' | 'following' | null
  const [myRatings, setMyRatings] = useState({}) // { dishId: rating }
  const [showAllRatings, setShowAllRatings] = useState(false)

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === userId

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      setError(null)

      const data = await followsApi.getUserProfile(userId)
      if (!data) {
        setError('User not found')
      } else {
        setProfile(data)
      }
      setLoading(false)
    }

    if (userId) {
      fetchProfile()
    }
  }, [userId])

  // Check follow status
  useEffect(() => {
    async function checkFollowStatus() {
      if (currentUser && userId && !isOwnProfile) {
        const following = await followsApi.isFollowing(userId)
        setIsFollowing(following)
      }
    }
    checkFollowStatus()
  }, [currentUser, userId, isOwnProfile])

  // Fetch current user's ratings for the same dishes (for comparison)
  useEffect(() => {
    async function fetchMyRatings() {
      if (!currentUser || !profile?.recent_votes?.length || isOwnProfile) return

      const dishIds = profile.recent_votes
        .map(v => v.dish?.id)
        .filter(Boolean)

      if (dishIds.length === 0) return

      const { data } = await supabase
        .from('votes')
        .select('dish_id, rating_10')
        .eq('user_id', currentUser.id)
        .in('dish_id', dishIds)

      if (data) {
        const ratingsMap = {}
        data.forEach(v => { ratingsMap[v.dish_id] = v.rating_10 })
        setMyRatings(ratingsMap)
      }
    }
    fetchMyRatings()
  }, [currentUser, profile?.recent_votes, isOwnProfile])

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    setFollowLoading(true)
    if (isFollowing) {
      const result = await followsApi.unfollow(userId)
      if (result.success) {
        setIsFollowing(false)
        setProfile(prev => ({
          ...prev,
          follower_count: Math.max(0, (prev.follower_count || 0) - 1)
        }))
      }
    } else {
      const result = await followsApi.follow(userId)
      if (result.success) {
        setIsFollowing(true)
        setProfile(prev => ({
          ...prev,
          follower_count: (prev.follower_count || 0) + 1
        }))
      }
    }
    setFollowLoading(false)
  }

  // Handle share profile
  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.display_name} on What's Good Here`,
          url,
        })
      } catch (e) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url)
      // Could show a toast here
    }
  }

  // Get rating personality based on avg rating
  const getRatingPersonality = (avgRating) => {
    if (!avgRating) return null
    if (avgRating >= 8.5) return { emoji: '😍', title: 'Loves Everything' }
    if (avgRating >= 7.0) return { emoji: '😊', title: 'Generous Rater' }
    if (avgRating >= 5.5) return { emoji: '🤔', title: 'Fair Judge' }
    return { emoji: '😤', title: 'Tough Critic' }
  }

  // Format member since date
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--color-surface)' }}>
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          User not found
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          This profile doesn't exist or may have been removed.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--color-primary)', color: 'white' }}
        >
          Go Back
        </button>
      </div>
    )
  }

  const personality = getRatingPersonality(profile.stats?.avg_rating)

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      {/* Header */}
      <div className="border-b px-4 py-6" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-divider)' }}>
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
            style={{ background: 'var(--color-primary)' }}
          >
            {profile.display_name?.charAt(0).toUpperCase() || '?'}
          </div>

          <div className="flex-1 min-w-0">
            {/* Display Name */}
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {profile.display_name || 'Anonymous'}
            </h1>

            {/* Rating Personality */}
            {personality && (
              <div className="flex items-center gap-1.5 mt-1">
                <span>{personality.emoji}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                  {personality.title}
                </span>
              </div>
            )}

            {/* Stats Summary */}
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {profile.stats?.total_votes > 0
                ? `${profile.stats.total_votes} ${profile.stats.total_votes === 1 ? 'dish' : 'dishes'} rated`
                : 'No ratings yet'
              }
              {memberSince && ` · Since ${memberSince}`}
            </p>

            {/* Follow Stats */}
            <div className="flex items-center gap-3 mt-2 text-sm">
              <button
                onClick={() => setFollowListModal('followers')}
                className="hover:underline"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {profile.follower_count || 0}
                </span> followers
              </button>
              <button
                onClick={() => setFollowListModal('following')}
                className="hover:underline"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {profile.following_count || 0}
                </span> following
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          {isOwnProfile ? (
            <>
              <Link
                to="/profile"
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center transition-colors"
                style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)' }}
              >
                Edit Profile
              </Link>
              <button
                onClick={handleShare}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)' }}
              >
                Share
              </button>
            </>
          ) : (
            <button
              onClick={handleFollowToggle}
              disabled={followLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              style={{
                background: isFollowing ? 'var(--color-surface-elevated)' : 'var(--color-primary)',
                color: isFollowing ? 'var(--color-text-primary)' : 'white',
              }}
            >
              {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* Quick Stats Cards */}
        {profile.stats?.total_votes > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="rounded-xl p-3 text-center" style={{ background: 'var(--color-surface-elevated)' }}>
              <div className="text-2xl font-bold text-emerald-500">{profile.stats.worth_it}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Worth It</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'var(--color-surface-elevated)' }}>
              <div className="text-2xl font-bold text-red-500">{profile.stats.avoid}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Avoid</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'var(--color-surface-elevated)' }}>
              <div className="text-2xl font-bold" style={{ color: getRatingColor(profile.stats.avg_rating) }}>
                {profile.stats.avg_rating ? profile.stats.avg_rating.toFixed(1) : '—'}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Avg Rating</div>
            </div>
          </div>
        )}

        {/* Badges */}
        {profile.badges?.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge) => (
                <div
                  key={badge.key}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border"
                  style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}
                >
                  <span>{badge.icon}</span>
                  <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Ratings */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          {profile.display_name}'s Ratings
        </h3>

        {profile.recent_votes?.length > 0 ? (
          <div className="space-y-3">
            {(showAllRatings ? profile.recent_votes : profile.recent_votes.slice(0, 5)).map((vote, index) => (
              <RecentVoteCard key={index} vote={vote} myRating={myRatings[vote.dish?.id]} />
            ))}

            {/* View more / View less button */}
            {profile.recent_votes.length > 5 && (
              <button
                onClick={() => setShowAllRatings(!showAllRatings)}
                className="w-full py-3 text-center rounded-xl border-2 border-dashed hover:bg-white/5 transition-colors"
                style={{ borderColor: 'var(--color-divider)' }}
              >
                <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                  {showAllRatings
                    ? 'Show less'
                    : `View ${profile.recent_votes.length - 5} more ${profile.recent_votes.length - 5 === 1 ? 'dish' : 'dishes'}`
                  }
                </span>
              </button>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="text-4xl mb-2">🍽️</div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              No ratings yet
            </p>
          </div>
        )}
      </div>

      {/* Follow List Modal */}
      {followListModal && (
        <FollowListModal
          userId={userId}
          type={followListModal}
          onClose={() => setFollowListModal(null)}
        />
      )}
    </div>
  )
}

// Recent vote card component
function RecentVoteCard({ vote, myRating }) {
  const navigate = useNavigate()
  const { dish, rating, would_order_again } = vote

  if (!dish) return null

  const imgSrc = dish.photo_url || getCategoryImage(dish.category)

  // Their rating (the friend's rating)
  const theirRating = Number(rating) || 0

  // My rating comparison (if I rated the same dish)
  const myRatingNum = Number(myRating) || 0
  const hasMyRating = myRating !== undefined && myRating !== null && myRatingNum >= 1 && myRatingNum <= 10

  // Community average and delta (how friend's rating compares to community)
  const communityAvg = dish.avg_rating ? Number(dish.avg_rating) : null
  const communityDelta = communityAvg ? Math.round((theirRating - communityAvg) * 10) / 10 : null

  return (
    <button
      onClick={() => navigate(`/dish/${dish.id}`)}
      className="w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.99]"
      style={{ background: 'var(--color-bg)', border: '1px solid var(--color-divider)' }}
    >
      {/* Dish Photo */}
      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--color-surface)' }}>
        <img src={imgSrc} alt={dish.name} className="w-full h-full object-cover" />
      </div>

      {/* Dish Info */}
      <div className="flex-1 min-w-0 text-left">
        <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
          {dish.name}
        </h4>
        <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
          {dish.restaurant_name}
        </p>
        {/* Community average */}
        {communityAvg && (
          <p className="text-xs mt-0.5">
            <span style={{ color: 'var(--color-text-tertiary)' }}>Community: </span>
            <span style={{ color: getRatingColor(communityAvg) }}>{communityAvg.toFixed(1)}</span>
          </p>
        )}
        {/* Show if you also rated this */}
        {hasMyRating && (
          <p className="text-xs mt-0.5">
            <span style={{ color: 'var(--color-text-tertiary)' }}>You: </span>
            <span style={{ color: getRatingColor(myRatingNum) }}>{myRatingNum}</span>
          </p>
        )}
      </div>

      {/* Their Rating */}
      <div className="flex-shrink-0 text-right">
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold" style={{ color: getRatingColor(theirRating) }}>
            {theirRating}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>/10</span>
        </div>
        <div className="mt-1">
          <span className="text-xs">
            {would_order_again ? '👍' : '👎'}
          </span>
        </div>
      </div>
    </button>
  )
}

export default UserProfile
