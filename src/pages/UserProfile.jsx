import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logger } from '../utils/logger'
import { followsApi } from '../api/followsApi'
import { votesApi } from '../api/votesApi'
import { FollowListModal } from '../components/FollowListModal'
import { ProfileSkeleton } from '../components/Skeleton'
import { VotedDishCard, ReviewCard, ReviewDetailModal } from '../components/profile'
import { supabase } from '../lib/supabase'
import {
  calculateCategoryTiers,
  calculateCategoryProgress,
} from '../hooks/useUserVotes'
import { useRatingIdentity } from '../hooks/useRatingIdentity'
import { getRankForBadgeCount } from '../constants/ranks'
import { TIER_DESCRIPTIONS } from '../constants/categories'
import { calculateArchetype, getArchetypeById } from '../utils/calculateArchetype'
import { getRarityColor, RARITY_LABELS } from '../constants/badgeDefinitions'

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
  const [tasteCompat, setTasteCompat] = useState(null)

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === userId

  // Redirect to /profile if viewing own profile
  useEffect(() => {
    if (isOwnProfile) {
      navigate('/profile', { replace: true })
    }
  }, [isOwnProfile, navigate])

  // Fetch rating identity for this user (behind feature flag)
  const ratingIdentity = useRatingIdentity(userId)

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

  // Fetch taste compatibility
  useEffect(() => {
    async function fetchCompatibility() {
      if (!currentUser || !userId || isOwnProfile) return
      try {
        const compat = await followsApi.getTasteCompatibility(userId)
        setTasteCompat(compat)
      } catch (err) {
        logger.error('Failed to fetch taste compatibility:', err)
      }
    }
    fetchCompatibility()
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

  // Calculate category tiers, progress, and archetype stats from recent_votes
  const { categoryTiers, categoryProgress, ratingVariance, categoryConcentration, uniqueRestaurants } = useMemo(() => {
    if (!profile?.recent_votes?.length) {
      return { categoryTiers: [], categoryProgress: [], ratingVariance: 0, categoryConcentration: 0, uniqueRestaurants: 0 }
    }

    // Count votes per category + unique restaurants
    const categoryCounts = {}
    const restaurantNames = new Set()
    profile.recent_votes.forEach(vote => {
      const cat = vote.dish?.category
      if (cat) {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
      }
      if (vote.dish?.restaurant_name) {
        restaurantNames.add(vote.dish.restaurant_name)
      }
    })

    // Rating variance (std dev)
    const avgRating = profile.stats?.avg_rating || 0
    const ratingsWithValue = profile.recent_votes.filter(v => v.rating != null)
    const variance = ratingsWithValue.length > 1
      ? Math.sqrt(ratingsWithValue.reduce((sum, v) => sum + Math.pow(v.rating - avgRating, 2), 0) / ratingsWithValue.length)
      : 0

    // Category concentration (Herfindahl index)
    const catValues = Object.values(categoryCounts)
    const catTotal = catValues.reduce((a, b) => a + b, 0)
    const concentration = catTotal > 0
      ? catValues.reduce((sum, c) => sum + Math.pow(c / catTotal, 2), 0)
      : 0

    return {
      categoryTiers: calculateCategoryTiers(categoryCounts),
      categoryProgress: calculateCategoryProgress(categoryCounts),
      ratingVariance: variance,
      categoryConcentration: concentration,
      uniqueRestaurants: restaurantNames.size,
    }
  }, [profile?.recent_votes, profile?.stats?.avg_rating])

  if (loading) {
    return <ProfileSkeleton />
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--color-surface)' }}>
        <img src="/search-not-found.png" alt="" className="w-16 h-16 mx-auto mb-4 rounded-full object-cover" />
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

  // Rank from badge count
  const badgeCount = profile.badges?.length || 0
  const currentRank = getRankForBadgeCount(badgeCount)
  const totalVotes = profile.stats?.total_votes || 0

  // Archetype
  const archetypeResult = calculateArchetype(
    { totalVotes, avgRating: profile.stats?.avg_rating || 0, ratingVariance, categoryConcentration, categoryTiers },
    ratingIdentity,
    { followers: profile.follower_count || 0, following: profile.following_count || 0 }
  )
  const archetype = archetypeResult.id ? getArchetypeById(archetypeResult.id) : null

  // Primary title from highest tier or personality
  const getPrimaryTitle = () => {
    if (categoryTiers.length > 0) {
      const highestTier = categoryTiers[0]
      return `${highestTier.label} ${highestTier.title}`
    }
    if (personality) return personality.title
    return 'Food Explorer'
  }

  // Top category progress
  const topProgress = categoryProgress.length > 0 ? categoryProgress[0] : null
  const isCloseToNextTier = topProgress && topProgress.votesNeeded <= 3

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <h1 className="sr-only">{profile.display_name}'s Profile</h1>
      {/* Header */}
      <div
        className="relative px-4 pt-8 pb-6 overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 90% 50% at 20% 0%, ${currentRank.color}08 0%, transparent 70%),
            radial-gradient(ellipse 70% 60% at 80% 100%, rgba(217, 167, 101, 0.04) 0%, transparent 70%),
            var(--color-bg)
          `,
        }}
      >
        {/* Bottom divider */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
          style={{
            width: '90%',
            background: 'linear-gradient(90deg, transparent, var(--color-divider), transparent)',
          }}
        />

        {/* Avatar + Name row */}
        <div className="flex items-center gap-4">
          {/* Avatar with rank-colored ring */}
          <div className="relative flex-shrink-0">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{
                background: 'var(--color-primary)',
                boxShadow: `0 4px 20px -4px ${currentRank.color}60, 0 0 0 ${badgeCount >= 5 ? '4px' : badgeCount >= 1 ? '3px' : '2px'} ${currentRank.color}30`,
              }}
            >
              {profile.display_name?.charAt(0).toUpperCase() || '?'}
            </div>
            {/* Rank emoji badge */}
            {badgeCount >= 1 && (
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-md"
                style={{ background: currentRank.color, border: '2px solid var(--color-bg)' }}
              >
                {currentRank.emoji}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Display Name */}
            <h2
              className="font-bold"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: '22px',
                letterSpacing: '-0.02em',
                lineHeight: '1.2',
              }}
            >
              {profile.display_name || 'Anonymous'}
            </h2>

            {/* Follow Stats */}
            <div className="flex items-center gap-2 mt-1.5" style={{ fontSize: '13px' }}>
              <button
                onClick={() => setFollowListModal('followers')}
                className="hover:underline transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {profile.follower_count || 0}
                </span> followers
              </button>
              <span style={{ color: 'var(--color-text-tertiary)' }}>&middot;</span>
              <button
                onClick={() => setFollowListModal('following')}
                className="hover:underline transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {profile.following_count || 0}
                </span> following
              </button>
            </div>
          </div>
        </div>

        {/* Taste Compatibility */}
        {!isOwnProfile && tasteCompat && (
          <div
            className="mt-4 px-3.5 py-3 rounded-xl"
            style={{
              background: tasteCompat.compatibility_pct != null
                ? 'linear-gradient(135deg, rgba(244, 122, 31, 0.08) 0%, rgba(217, 167, 101, 0.06) 100%)'
                : 'var(--color-surface-elevated)',
              border: tasteCompat.compatibility_pct != null
                ? '1px solid rgba(244, 122, 31, 0.15)'
                : '1px solid var(--color-divider)',
            }}
          >
            {tasteCompat.compatibility_pct != null ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
                  {tasteCompat.compatibility_pct}%
                </span>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    taste match
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    Based on {tasteCompat.shared_dishes} shared {tasteCompat.shared_dishes === 1 ? 'dish' : 'dishes'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                {tasteCompat.shared_dishes > 0
                  ? `${tasteCompat.shared_dishes} shared ${tasteCompat.shared_dishes === 1 ? 'dish' : 'dishes'} — rate ${3 - tasteCompat.shared_dishes} more to see your taste match`
                  : 'Rate the same dishes to see your taste match'
                }
              </p>
            )}
          </div>
        )}

        {/* Rank Title + Archetype */}
        <div className="mt-5">
          <h3
            className="font-bold"
            style={{
              color: currentRank.color,
              fontSize: '17px',
              letterSpacing: '-0.01em',
            }}
          >
            {currentRank.emoji} {currentRank.title}
          </h3>
          <p
            className="font-bold mt-0.5"
            style={{
              color: 'var(--color-primary)',
              fontSize: '15px',
            }}
          >
            {getPrimaryTitle()}
          </p>
          {archetype && archetypeResult.confidence === 'established' && (
            <p className="mt-1 font-medium" style={{ color: archetype.color, fontSize: '13px' }}>
              {archetype.emoji} {archetype.label}
            </p>
          )}
          {archetype && archetypeResult.confidence === 'emerging' && (
            <p className="mt-1" style={{ color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
              trending toward {archetype.label.replace('The ', '')}
            </p>
          )}
        </div>

        {/* Compact Stats Row */}
        <div className="flex items-center gap-4 mt-3" style={{ fontSize: '13px' }}>
          {badgeCount > 0 && (
            <span className="flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
              <span style={{ color: currentRank.color }}>{currentRank.emoji}</span>
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{badgeCount}</span>
            </span>
          )}
          {totalVotes > 0 && (
            <span className="flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
              <span>🍴</span>
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{totalVotes}</span>
            </span>
          )}
          {uniqueRestaurants > 0 && (
            <span className="flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
              <span>🏠</span>
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{uniqueRestaurants}</span>
            </span>
          )}
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

        {/* Expertise Progress */}
        {topProgress && (
          <div
            className="mt-4 w-full text-left p-3.5 rounded-xl"
            style={{
              background: 'var(--color-surface-elevated)',
              border: `1px solid ${isCloseToNextTier ? 'rgba(245, 158, 11, 0.4)' : 'var(--color-divider)'}`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {topProgress.emoji} {topProgress.label}: {topProgress.currentTier?.title || 'Newcomer'} → {topProgress.nextTier.title}
              </span>
              <span className="text-xs font-bold" style={{ color: isCloseToNextTier ? '#F59E0B' : 'var(--color-text-tertiary)' }}>
                {topProgress.count}/{topProgress.nextTier.min}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-divider)' }}>
              <div
                className={`h-full rounded-full transition-all duration-1000 ${isCloseToNextTier ? 'animate-glow-breathe' : ''}`}
                style={{
                  width: `${Math.min(topProgress.progress * 100, 100)}%`,
                  background: isCloseToNextTier
                    ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                    : 'var(--color-primary)',
                }}
              />
            </div>
            <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-tertiary)' }}>
              {TIER_DESCRIPTIONS[topProgress.nextTier.title] || ''}
            </p>
          </div>
        )}

        {/* Badges */}
        {profile.badges?.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge) => {
                const rarityColor = getRarityColor(badge.rarity)
                const isRarePlus = badge.rarity === 'rare' || badge.rarity === 'epic' || badge.rarity === 'legendary'
                return (
                  <div
                    key={badge.key}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${isRarePlus ? 'animate-rarity-glow' : ''}`}
                    style={{
                      background: `${rarityColor}10`,
                      border: `1.5px solid ${rarityColor}50`,
                    }}
                  >
                    <span>{badge.icon}</span>
                    <span className="font-medium" style={{ color: rarityColor }}>
                      {badge.name}
                    </span>
                  </div>
                )
              })}
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
              <img src="/empty-plate.png" alt="" className="w-14 h-14 mx-auto mb-2 rounded-full object-cover" />
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
