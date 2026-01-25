import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logger } from '../utils/logger'
import { followsApi } from '../api/followsApi'
import { votesApi } from '../api/votesApi'
import { getRatingColor } from '../utils/ranking'
import { FollowListModal } from '../components/FollowListModal'
import { ProfileSkeleton } from '../components/Skeleton'
import { CategoryIcon } from '../components/CategoryIcon'
import { VotedDishCard, ReviewCard, ReviewDetailModal } from '../components/profile'
import { supabase } from '../lib/supabase'
import {
  calculateCategoryTiers,
  calculateCategoryProgress,
} from '../hooks/useUserVotes'

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
  const [userReviews, setUserReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [activityTab, setActivityTab] = useState('ratings') // 'ratings' | 'reviews'

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === userId

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      setError(null)

      try {
        const data = await followsApi.getUserProfile(userId)
        if (!data) {
          setError('User not found')
        } else {
          setProfile(data)
        }
      } catch (err) {
        logger.error('Failed to fetch profile:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchProfile()
    }
  }, [userId])

  // Check follow status
  useEffect(() => {
    async function checkFollowStatus() {
      if (currentUser && userId && !isOwnProfile) {
        try {
          const following = await followsApi.isFollowing(userId)
          setIsFollowing(following)
        } catch (err) {
          logger.error('Failed to check follow status:', err)
        }
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

      try {
        const { data, error } = await supabase
          .from('votes')
          .select('dish_id, rating_10')
          .eq('user_id', currentUser.id)
          .in('dish_id', dishIds)

        if (error) throw error

        if (data) {
          const ratingsMap = {}
          data.forEach(v => { ratingsMap[v.dish_id] = v.rating_10 })
          setMyRatings(ratingsMap)
        }
      } catch (err) {
        logger.error('Failed to fetch my ratings:', err)
      }
    }
    fetchMyRatings()
  }, [currentUser, profile?.recent_votes, isOwnProfile])

  // Fetch user's written reviews
  useEffect(() => {
    async function fetchReviews() {
      if (!userId) return
      setReviewsLoading(true)
      try {
        const reviews = await votesApi.getReviewsForUser(userId)
        setUserReviews(reviews)
      } catch (error) {
        logger.error('Failed to fetch reviews:', error)
      } finally {
        setReviewsLoading(false)
      }
    }
    fetchReviews()
  }, [userId])

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    setFollowLoading(true)
    try {
      if (isFollowing) {
        await followsApi.unfollow(userId)
        setIsFollowing(false)
        setProfile(prev => ({
          ...prev,
          follower_count: Math.max(0, (prev.follower_count || 0) - 1)
        }))
      } else {
        await followsApi.follow(userId)
        setIsFollowing(true)
        setProfile(prev => ({
          ...prev,
          follower_count: (prev.follower_count || 0) + 1
        }))
      }
    } catch {
      // Error is already logged by Sentry, just fail silently for UX
    } finally {
      setFollowLoading(false)
    }
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
      } catch {
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

  // Calculate category tiers and progress from recent_votes
  const { categoryTiers, categoryProgress } = useMemo(() => {
    if (!profile?.recent_votes?.length) {
      return { categoryTiers: [], categoryProgress: [] }
    }

    // Count votes per category
    const categoryCounts = {}
    profile.recent_votes.forEach(vote => {
      const cat = vote.dish?.category
      if (cat) {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
      }
    })

    return {
      categoryTiers: calculateCategoryTiers(categoryCounts),
      categoryProgress: calculateCategoryProgress(categoryCounts),
    }
  }, [profile?.recent_votes])

  // Format member since date
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null

  if (loading) {
    return <ProfileSkeleton />
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
      <h1 className="sr-only">{profile.display_name}'s Profile</h1>
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
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Good Here</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'var(--color-surface-elevated)' }}>
              <div className="text-2xl font-bold text-red-500">{profile.stats.avoid}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Not Good</div>
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

        {/* Category Tiers - Achieved Ranks */}
        {categoryTiers.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              {isOwnProfile ? 'Your Ranks' : `${profile.display_name}'s Ranks`}
            </h3>
            <div className="flex flex-wrap gap-2">
              {categoryTiers.map((tier) => (
                <div
                  key={tier.category}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border"
                  style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}
                >
                  <CategoryIcon category={tier.category} size={18} />
                  <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{tier.label}</span>
                  <span style={{ color: 'var(--color-text-tertiary)' }}>·</span>
                  <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {tier.icon} {tier.title}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>({tier.count})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Progress - Working towards next tier */}
        {categoryProgress.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              {categoryTiers.length > 0 ? 'Level Up' : 'Progress'}
            </h3>
            <div className="space-y-2">
              {categoryProgress.slice(0, 3).map((prog) => (
                <div
                  key={prog.category}
                  className="rounded-xl p-3 border"
                  style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CategoryIcon category={prog.category} size={20} />
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{prog.label}</span>
                      {prog.currentTier && (
                        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          {prog.currentTier.icon} {prog.currentTier.title}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                      {prog.votesNeeded} more to {prog.nextTier.icon} {prog.nextTier.title}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-elevated)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.round(prog.progress * 100)}%`,
                        background: 'var(--color-primary)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{prog.count} votes</span>
                    <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{prog.nextTier.min} needed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Activity Section with Tabs */}
      <div className="px-4 py-4">
        {/* Tab Bar */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActivityTab('ratings')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              activityTab === 'ratings'
                ? 'text-white shadow-md'
                : 'text-[color:var(--color-text-secondary)]'
            }`}
            style={activityTab === 'ratings'
              ? { background: 'var(--color-primary)' }
              : { background: 'var(--color-surface-elevated)' }}
          >
            {profile.display_name}'s Ratings
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
              activityTab === 'ratings' ? 'bg-white/20' : 'bg-black/10'
            }`}>
              {profile.recent_votes?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActivityTab('reviews')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              activityTab === 'reviews'
                ? 'text-white shadow-md'
                : 'text-[color:var(--color-text-secondary)]'
            }`}
            style={activityTab === 'reviews'
              ? { background: 'var(--color-primary)' }
              : { background: 'var(--color-surface-elevated)' }}
          >
            Written Reviews
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
              activityTab === 'reviews' ? 'bg-white/20' : 'bg-black/10'
            }`}>
              {userReviews.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {activityTab === 'ratings' ? (
          // Ratings Tab
          profile.recent_votes?.length > 0 ? (
            <div className="space-y-3">
              {(showAllRatings ? profile.recent_votes : profile.recent_votes.slice(0, 5)).map((vote, index) => (
                <VotedDishCard
                  key={index}
                  dish={{
                    dish_id: vote.dish?.id,
                    dish_name: vote.dish?.name,
                    photo_url: vote.dish?.photo_url,
                    category: vote.dish?.category,
                    restaurant_name: vote.dish?.restaurant_name,
                    avg_rating: vote.dish?.avg_rating,
                  }}
                  variant="other-profile"
                  theirRating={vote.rating}
                  myRating={myRatings[vote.dish?.id]}
                  wouldOrderAgain={vote.would_order_again}
                />
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
                      : `View ${profile.recent_votes.length - 5} more ${profile.recent_votes.length - 5 === 1 ? 'rating' : 'ratings'}`
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
          )
        ) : (
          // Reviews Tab
          reviewsLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--color-surface-elevated)' }} />
              ))}
            </div>
          ) : userReviews.length > 0 ? (
            <div className="space-y-3">
              {(showAllReviews ? userReviews : userReviews.slice(0, 5)).map((review) => (
                <ReviewCard key={review.id} review={review} onClick={() => setSelectedReview(review)} />
              ))}

              {/* View more / View less button */}
              {userReviews.length > 5 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="w-full py-3 text-center rounded-xl border-2 border-dashed hover:bg-white/5 transition-colors"
                  style={{ borderColor: 'var(--color-divider)' }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                    {showAllReviews
                      ? 'Show less'
                      : `View ${userReviews.length - 5} more ${userReviews.length - 5 === 1 ? 'review' : 'reviews'}`
                    }
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                No reviews yet
              </p>
            </div>
          )
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

      {/* Review Detail Modal */}
      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          reviewerName={profile.display_name}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </div>
  )
}

export default UserProfile
