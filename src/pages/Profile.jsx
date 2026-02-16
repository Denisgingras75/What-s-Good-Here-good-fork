import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logger } from '../utils/logger'
import { authApi } from '../api/authApi'
import { adminApi } from '../api/adminApi'
import { profileApi } from '../api/profileApi'
import { followsApi } from '../api/followsApi'
import { votesApi } from '../api/votesApi'
import { dishPhotosApi } from '../api/dishPhotosApi'
import { useProfile } from '../hooks/useProfile'
import { useUserVotes } from '../hooks/useUserVotes'
import { useFavorites } from '../hooks/useFavorites'
import { useUnratedDishes } from '../hooks/useUnratedDishes'
import { useRestaurantManager } from '../hooks/useRestaurantManager'
import { isSoundMuted, toggleSoundMute } from '../lib/sounds'
import { useTheme } from '../context/ThemeContext'
import { DishModal } from '../components/DishModal'
import { LoginModal } from '../components/Auth/LoginModal'
import { UserSearch } from '../components/UserSearch'
import { FollowListModal } from '../components/FollowListModal'
import { ProfileSkeleton } from '../components/Skeleton'
import { ThumbsUpIcon } from '../components/ThumbsUpIcon'
import { ThumbsDownIcon } from '../components/ThumbsDownIcon'
import { HearingIcon } from '../components/HearingIcon'
import { CameraIcon } from '../components/CameraIcon'
import { ReviewsIcon } from '../components/ReviewsIcon'
import {
  VotedDishCard,
  ReviewCard,
  EmptyState,
  UnratedDishCard,
  HeroIdentityCard,
  PhotosInfoSection,
  MissionSection,
} from '../components/profile'
import { SimilarTasteUsers } from '../components/SimilarTasteUsers'

const TABS = [
  { id: 'worth-it', label: "Good Here", emoji: null, icon: 'thumbsUp' },
  { id: 'avoid', label: "Not Good Here", emoji: null, icon: 'thumbsDown' },
  { id: 'saved', label: 'Heard it was Good Here', emoji: null, icon: 'hearing' },
  { id: 'reviews', label: 'Reviews', emoji: null, icon: 'reviews' },
  { id: 'unrated', label: 'Unrated', emoji: null, icon: 'camera' },
]

// SECURITY: Email is NOT persisted to storage to prevent XSS exposure of PII

export function Profile() {
  const navigate = useNavigate()
  const { user, loading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('worth-it')
  const [soundMuted, setSoundMuted] = useState(isSoundMuted())
  const { theme, toggleTheme } = useTheme()
  const [authLoading, setAuthLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [nameStatus, setNameStatus] = useState(null) // null | 'checking' | 'available' | 'taken' | 'same'

  const { profile, updateProfile } = useProfile(user?.id)
  const { worthItDishes, avoidDishes, stats, loading: votesLoading, refetch: refetchVotes } = useUserVotes(user?.id)
  const { favorites, loading: favoritesLoading, removeFavorite } = useFavorites(user?.id)
  const { dishes: unratedDishes, count: unratedCount, loading: unratedLoading, refetch: refetchUnrated } = useUnratedDishes(user?.id)

  const [selectedDish, setSelectedDish] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { isManager: isRestaurantManager } = useRestaurantManager()
  const [expandedTabs, setExpandedTabs] = useState({}) // Track which tabs show all dishes
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 })
  const [followListModal, setFollowListModal] = useState(null) // 'followers' | 'following' | null
  const [userReviews, setUserReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [ratingBias, setRatingBias] = useState(null)

  // Check admin status from database (matches RLS policies)
  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      return
    }
    adminApi.isAdmin().then(setIsAdmin).catch((error) => {
      logger.error('Failed to check admin status:', error)
    })
  }, [user])

  // Fetch follow counts
  useEffect(() => {
    if (!user) return
    followsApi.getFollowCounts(user.id)
      .then(setFollowCounts)
      .catch((error) => {
        logger.error('Failed to fetch follow counts:', error)
      })
  }, [user])

  // Fetch rating deviation score
  useEffect(() => {
    if (!user) {
      setRatingBias(null)
      return
    }
    profileApi.getRatingBias(user.id)
      .then(setRatingBias)
      .catch((error) => {
        logger.error('Failed to fetch rating bias:', error)
      })
  }, [user])

  // Set initial name for editing
  useEffect(() => {
    if (profile?.display_name) {
      setNewName(profile.display_name)
    }
  }, [profile])

  // Check username availability when editing name
  useEffect(() => {
    if (!editingName || !newName || newName.length < 2) {
      setNameStatus(null)
      return
    }

    // If name is same as current, no need to check
    if (newName.trim().toLowerCase() === profile?.display_name?.toLowerCase()) {
      setNameStatus('same')
      return
    }

    setNameStatus('checking')
    const timer = setTimeout(async () => {
      try {
        const available = await authApi.isUsernameAvailable(newName.trim())
        setNameStatus(available ? 'available' : 'taken')
      } catch (error) {
        logger.error('Profile: username check failed', error)
        setNameStatus(null)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [newName, editingName, profile?.display_name])

  // Fetch user's written reviews
  useEffect(() => {
    if (!user) {
      setUserReviews([])
      return
    }
    async function fetchReviews() {
      setReviewsLoading(true)
      try {
        const reviews = await votesApi.getReviewsForUser(user.id)
        setUserReviews(reviews)
      } catch (error) {
        logger.error('Failed to fetch reviews:', error)
      } finally {
        setReviewsLoading(false)
      }
    }
    fetchReviews()
  }, [user])

  const handleToggleSound = () => {
    const newMutedState = toggleSoundMute()
    setSoundMuted(newMutedState)
  }

  const handleSignOut = async () => {
    const confirmed = window.confirm('Are you sure you want to sign out?')
    if (!confirmed) return
    await signOut()
    navigate('/login')
  }

  const handleGoogleSignIn = async () => {
    setAuthLoading(true)
    try {
      await authApi.signInWithGoogle(window.location.href)
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
      setAuthLoading(false)
    }
  }

  const handleEmailSignIn = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    try {
      // Use current page URL so user returns to the same place after login
      await authApi.signInWithMagicLink(email, window.location.href)
      setMessage({ type: 'success', text: 'Check your email for a magic link!' })
      // Don't clear email - keep it visible so they know where to check
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSaveName = async () => {
    // Don't save if name is taken
    if (nameStatus === 'taken') {
      return
    }

    try {
      if (newName.trim()) {
        await updateProfile({ display_name: newName.trim() })
      }
      setEditingName(false)
      setNameStatus(null)
    } catch (error) {
      logger.error('Failed to save name:', error)
      setMessage({ type: 'error', text: 'Failed to save name. Please try again.' })
    }
  }

  // Get dishes for current tab
  const getTabDishes = () => {
    switch (activeTab) {
      case 'unrated':
        return unratedDishes
      case 'worth-it':
        return worthItDishes
      case 'avoid':
        return avoidDishes
      case 'saved':
        return favorites
      case 'reviews':
        return userReviews
      default:
        return []
    }
  }

  const tabDishes = getTabDishes()
  const isLoading = activeTab === 'saved' ? favoritesLoading :
                    activeTab === 'unrated' ? unratedLoading :
                    activeTab === 'reviews' ? reviewsLoading : votesLoading

  // Limit to 5 dishes unless expanded
  const MAX_VISIBLE_DISHES = 5
  const isTabExpanded = expandedTabs[activeTab] || false
  const visibleDishes = isTabExpanded ? tabDishes : tabDishes.slice(0, MAX_VISIBLE_DISHES)
  const hiddenCount = tabDishes.length - MAX_VISIBLE_DISHES
  const hasMoreDishes = hiddenCount > 0

  // Handle vote from unrated dish
  const handleVote = async () => {
    setSelectedDish(null)
    try {
      await Promise.all([refetchUnrated(), refetchVotes()])
    } catch (error) {
      logger.error('Failed to refresh after vote:', error)
    }
  }

  // Handle clicking an unrated dish to rate it
  const handleUnratedDishClick = (dish) => {
    // Transform to the format expected by DishModal
    setSelectedDish({
      dish_id: dish.dish_id,
      dish_name: dish.dish_name,
      restaurant_name: dish.restaurant_name,
      restaurant_id: dish.restaurant_id,
      category: dish.category,
      price: dish.price,
      photo_url: dish.photo_url,
      total_votes: 0,
      yes_votes: 0,
    })
  }

  // Handle deleting an unrated photo
  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Delete this photo? This cannot be undone.')) return
    try {
      await dishPhotosApi.deletePhoto(photoId)
      await refetchUnrated()
    } catch (error) {
      logger.error('Failed to delete photo:', error)
      alert('Failed to delete photo. Please try again.')
    }
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <h1 className="sr-only">Your Profile</h1>

      {user ? (
        <>
          {/* Hero Identity Card */}
          <HeroIdentityCard
            user={user}
            profile={profile}
            stats={stats}
            followCounts={followCounts}
            editingName={editingName}
            newName={newName}
            nameStatus={nameStatus}
            setEditingName={setEditingName}
            setNewName={setNewName}
            setNameStatus={setNameStatus}
            handleSaveName={handleSaveName}
            setFollowListModal={setFollowListModal}
          />

          {/* Rating Style + Deviation Score */}
          {(stats.ratingStyle || (ratingBias && ratingBias.votesWithConsensus > 0)) && (
            <div className="px-4 pt-4 flex gap-2.5">
              {stats.ratingStyle && (
                <div
                  className="flex-1 rounded-2xl border px-4 py-3.5"
                  style={{
                    background: 'var(--color-card)',
                    borderColor: 'var(--color-divider)',
                    boxShadow: '0 2px 12px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <p
                    className="text-sm font-bold"
                    style={{
                      color: stats.ratingStyle.level === 'generous' || stats.ratingStyle.level === 'easy'
                        ? 'var(--color-emerald)'
                        : stats.ratingStyle.level === 'tough'
                        ? 'var(--color-red)'
                        : 'var(--color-orange)',
                    }}
                  >
                    {stats.ratingStyle.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                    avg {stats.avgRating.toFixed(1)}/10
                  </p>
                </div>
              )}
              {ratingBias && ratingBias.votesWithConsensus > 0 && (
                <div
                  className="flex-1 rounded-2xl border px-4 py-3.5"
                  style={{
                    background: 'var(--color-card)',
                    borderColor: 'var(--color-divider)',
                    boxShadow: '0 2px 12px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <p className="text-sm font-bold" style={{
                    color: (() => {
                      const isAbove = stats.ratingStyle?.level === 'generous' || stats.ratingStyle?.level === 'easy'
                      if (isAbove) {
                        return ratingBias.ratingBias < 1.0 ? 'var(--color-emerald)' : 'var(--color-emerald-light)'
                      }
                      const isBelow = stats.ratingStyle?.level === 'tough'
                      if (isBelow) {
                        return ratingBias.ratingBias < 1.0 ? 'var(--color-red-light)' : 'var(--color-red)'
                      }
                      return 'var(--color-orange)' // fair judge
                    })(),
                  }}>
                    {ratingBias.biasLabel}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                    {ratingBias.ratingBias.toFixed(1)} pts from crowd
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Standout Picks */}
          {stats.totalVotes >= 3 && Object.keys(stats.standoutPicks).length > 0 && (
            <div className="px-4 pt-3 flex flex-col gap-2.5">
              {stats.standoutPicks.bestFind && (
                <div
                  className="rounded-xl border px-3.5 py-3 flex items-center gap-3"
                  style={{
                    background: 'var(--color-card)',
                    borderColor: 'var(--color-divider)',
                  }}
                >
                  <span className="text-lg flex-shrink-0" style={{ color: 'var(--color-accent-gold)' }}>
                    {'\u2B50'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
                      Your top pick
                    </p>
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {stats.standoutPicks.bestFind.dish_name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {stats.standoutPicks.bestFind.restaurant_name} &middot; You: {stats.standoutPicks.bestFind.userRating}/10
                    </p>
                  </div>
                </div>
              )}

              {stats.standoutPicks.harshestTake && (
                <div
                  className="rounded-xl border px-3.5 py-3 flex items-center gap-3"
                  style={{
                    background: 'var(--color-card)',
                    borderColor: 'rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <span className="text-lg flex-shrink-0" style={{ color: 'var(--color-red)' }}>
                    {'\uD83C\uDF36\uFE0F'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: 'var(--color-red)' }}>
                      Your hottest take
                    </p>
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {stats.standoutPicks.harshestTake.dish_name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {stats.standoutPicks.harshestTake.restaurant_name} &middot; You: {stats.standoutPicks.harshestTake.userRating}/10, Crowd: {stats.standoutPicks.harshestTake.communityAvg.toFixed(1)}/10
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Find Friends Section */}
          <div className="px-4 py-4 relative" style={{ background: 'var(--color-bg)' }}>
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
              style={{
                width: '90%',
                background: 'linear-gradient(90deg, transparent, var(--color-divider), transparent)',
              }}
            />
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: 'var(--color-primary)', padding: '2px' }}
            >
              <UserSearch />
            </div>
          </div>

          {/* Similar Taste Users */}
          {stats.totalVotes >= 5 && <SimilarTasteUsers />}

          {/* Unrated Photos Banner - shown when user has photos to rate */}
          {unratedCount > 0 && (
            <div className="px-4 py-4" style={{ background: 'var(--color-surface)' }}>
              <button
                onClick={() => {
                  // Open the first unrated dish
                  if (unratedDishes.length > 0) {
                    handleUnratedDishClick(unratedDishes[0])
                  }
                }}
                className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all hover:scale-[0.99] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent-orange) 100%)',
                  boxShadow: '0 4px 20px -4px rgba(232, 102, 60, 0.25), 0 2px 8px -2px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CameraIcon size={28} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold" style={{ fontSize: '17px', letterSpacing: '-0.01em', color: 'var(--color-text-on-primary)' }}>
                    {unratedCount} photo{unratedCount === 1 ? '' : 's'} to rate
                  </h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                    Tap to rate your dishes
                  </p>
                </div>
                <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'rgba(255, 255, 255, 0.6)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Tabs */}
          <div
            className="sticky top-0 z-10 py-2.5"
            style={{
              background: 'var(--color-surface)',
              boxShadow: '0 4px 12px -4px rgba(0, 0, 0, 0.06)',
              borderBottom: '1px solid var(--color-divider)',
            }}
          >
            <div className="flex gap-1.5 overflow-x-auto overflow-y-hidden px-4 pb-0.5 scrollbar-hide" style={{ touchAction: 'pan-x', overscrollBehaviorY: 'contain', WebkitOverflowScrolling: 'touch' }}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap active:scale-[0.97] ${
                    activeTab === tab.id
                      ? 'text-[color:var(--color-text-on-primary)]'
                      : 'text-[color:var(--color-text-secondary)]'
                  }`}
                  style={{
                    fontSize: '13px',
                    ...(activeTab === tab.id
                      ? {
                          background: 'var(--color-primary)',
                          boxShadow: '0 2px 8px -2px rgba(232, 102, 60, 0.25)',
                        }
                      : { background: 'var(--color-surface-elevated)' }),
                  }}
                >
                  {tab.id === 'saved' ? <HearingIcon size={40} active={activeTab === tab.id} /> : tab.id === 'worth-it' ? <ThumbsUpIcon size={28} active={activeTab === tab.id} /> : tab.id === 'avoid' ? <ThumbsDownIcon size={28} active={activeTab === tab.id} /> : tab.id === 'unrated' ? <CameraIcon size={40} active={activeTab === tab.id} /> : tab.id === 'reviews' ? <ReviewsIcon size={40} active={activeTab === tab.id} /> : <span>{tab.emoji}</span>}
                  <span>{tab.label}</span>
                  <span
                    className={`ml-0.5 px-1.5 py-0.5 rounded-full font-semibold ${
                      activeTab === tab.id ? 'bg-white/20' : 'bg-black/20'
                    }`}
                    style={{ fontSize: '11px' }}
                  >
                    {tab.id === 'unrated' ? unratedCount :
                     tab.id === 'worth-it' ? worthItDishes.length :
                     tab.id === 'avoid' ? avoidDishes.length :
                     tab.id === 'reviews' ? userReviews.length :
                     favorites.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 pt-5">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--color-surface-elevated)' }} />
                ))}
              </div>
            ) : tabDishes.length > 0 ? (
              <div className="space-y-3.5">
                {activeTab === 'unrated' ? (
                  // Unrated dishes - clickable to rate
                  visibleDishes.map((dish) => (
                    <UnratedDishCard
                      key={dish.dish_id}
                      dish={dish}
                      onClick={() => handleUnratedDishClick(dish)}
                      onDelete={() => handleDeletePhoto(dish.photo_id)}
                    />
                  ))
                ) : activeTab === 'reviews' ? (
                  // Reviews tab
                  visibleDishes.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                    />
                  ))
                ) : (
                  // Other tabs - Good Here, Not Good Here, Heard it was Good Here
                  visibleDishes.map((dish) => {
                    // Find review for this dish (for Good Here and Not Good Here tabs)
                    const review = userReviews.find(r => r.dish_id === dish.dish_id)
                    return (
                      <VotedDishCard
                        key={dish.dish_id}
                        dish={dish}
                        variant="own-profile"
                        tab={activeTab}
                        onUnsave={activeTab === 'saved' ? () => removeFavorite(dish.dish_id) : null}
                        reviewText={review?.review_text}
                      />
                    )
                  })
                )}

                {/* View more / View less button */}
                {hasMoreDishes && (
                  <button
                    onClick={() => setExpandedTabs(prev => ({ ...prev, [activeTab]: !isTabExpanded }))}
                    className="w-full py-3 text-center rounded-xl border-2 border-dashed transition-all hover:bg-[color:var(--color-surface-elevated)] hover:border-[color:var(--color-primary)] active:scale-[0.99]"
                    style={{ borderColor: 'var(--color-divider)' }}
                  >
                    <span className="font-semibold" style={{ color: 'var(--color-primary)', fontSize: '13px' }}>
                      {isTabExpanded
                        ? 'Show less'
                        : `View ${hiddenCount} more ${activeTab === 'reviews' ? (hiddenCount === 1 ? 'review' : 'reviews') : (hiddenCount === 1 ? 'dish' : 'dishes')}`
                      }
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <EmptyState tab={activeTab} />
            )}
          </div>

          {/* Dish Modal for rating unrated dishes */}
          {selectedDish && (
            <DishModal
              dish={selectedDish}
              onClose={() => setSelectedDish(null)}
              onVote={handleVote}
              onLoginRequired={() => setShowLoginModal(true)}
            />
          )}

          {/* Login Modal */}
          {showLoginModal && (
            <LoginModal onClose={() => setShowLoginModal(false)} />
          )}

          {/* Follow List Modal */}
          {followListModal && (
            <FollowListModal
              userId={user.id}
              type={followListModal}
              onClose={() => setFollowListModal(null)}
            />
          )}

          {/* Settings */}
          <div className="p-4 pt-2">
            {/* Section divider dot */}
            <div className="flex justify-center mb-5">
              <div className="w-1 h-1 rounded-full" style={{ background: 'var(--color-accent-gold)' }} />
            </div>
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                background: 'var(--color-card)',
                borderColor: 'var(--color-divider)',
                boxShadow: '0 2px 12px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div className="px-4 py-3.5 border-b" style={{ borderColor: 'var(--color-divider)' }}>
                <h2
                  className="font-bold"
                  style={{
                    color: 'var(--color-text-primary)',
                    fontSize: '15px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Settings
                </h2>
              </div>

              {/* Edit Favorites — disabled while personal Top 10 is off
              <EditFavoritesSection
                currentCategories={profile?.preferred_categories || []}
                editing={editingFavorites}
                editedCategories={editedCategories}
                onStartEdit={() => {
                  setEditedCategories(profile?.preferred_categories || [])
                  setEditingFavorites(true)
                }}
                onCancelEdit={() => setEditingFavorites(false)}
                onSave={async () => {
                  await updateProfile({ preferred_categories: editedCategories })
                  setEditingFavorites(false)
                }}
                onCategoriesChange={setEditedCategories}
              />
              */}

              {/* Sound Toggle */}
              <button
                onClick={handleToggleSound}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--color-surface-elevated)] transition-colors border-t"
                style={{ borderColor: 'var(--color-divider)' }}
              >
                <span className="font-medium text-[color:var(--color-text-primary)]">Bite Sounds</span>
                <div className="w-12 h-7 rounded-full transition-colors" style={{ background: soundMuted ? 'var(--color-surface-elevated)' : 'var(--color-primary)' }}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform mt-1 ${soundMuted ? 'ml-1' : 'ml-6'}`} />
                </div>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--color-surface-elevated)] transition-colors border-t"
                style={{ borderColor: 'var(--color-divider)' }}
              >
                <span className="font-medium text-[color:var(--color-text-primary)]">
                  {theme === 'dark' ? 'Ocean Dark Mode' : 'Light Mode'}
                </span>
                <div className="w-12 h-7 rounded-full transition-colors" style={{ background: theme === 'light' ? 'var(--color-primary)' : 'var(--color-surface-elevated)' }}>
                  <div className={`w-5 h-5 rounded-full shadow-sm transform transition-transform mt-1 ${theme === 'light' ? 'ml-6' : 'ml-1'}`} style={{ background: '#FFFFFF' }} />
                </div>
              </button>

              {/* Admin Panel Link - only visible to admins */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--color-surface-elevated)] transition-colors border-t" style={{ borderColor: 'var(--color-divider)' }}
                >
                  <span className="font-medium text-[color:var(--color-text-primary)]">Admin Panel</span>
                  <svg className="w-5 h-5 text-[color:var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}

              {/* Manage Restaurant Link - only visible to restaurant managers */}
              {isRestaurantManager && (
                <Link
                  to="/manage"
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--color-surface-elevated)] transition-colors border-t" style={{ borderColor: 'var(--color-divider)' }}
                >
                  <span className="font-medium text-[color:var(--color-text-primary)]">Manage Restaurant</span>
                  <svg className="w-5 h-5 text-[color:var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}

              {/* How Photos Work */}
              <PhotosInfoSection />

              {/* Our Mission */}
              <MissionSection />

              {/* Privacy Policy */}
              <a
                href="/privacy"
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--color-surface-elevated)] transition-colors border-t" style={{ borderColor: 'var(--color-divider)' }}
              >
                <span className="font-medium text-[color:var(--color-text-primary)]">Privacy Policy</span>
                <svg className="w-5 h-5 text-[color:var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              {/* Terms of Service */}
              <a
                href="/terms"
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--color-surface-elevated)] transition-colors border-t" style={{ borderColor: 'var(--color-divider)' }}
              >
                <span className="font-medium text-[color:var(--color-text-primary)]">Terms of Service</span>
                <svg className="w-5 h-5 text-[color:var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--color-surface-elevated)] transition-colors border-t"
                style={{ borderColor: 'var(--color-divider)' }}
              >
                <span className="font-medium" style={{ color: 'var(--color-danger)' }}>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Sign In Card */
        <div className="p-5 pt-8">
          <div
            className="rounded-2xl border p-7"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232, 102, 60, 0.05) 0%, transparent 70%),
                var(--color-card)
              `,
              borderColor: 'var(--color-divider)',
              boxShadow: '0 4px 24px -8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div className="text-center mb-7">
              <img
                src="/logo.png"
                alt="What's Good Here"
                className="w-40 h-auto mx-auto mb-5"
              />
              <h2
                className="font-bold"
                style={{
                  color: 'var(--color-text-primary)',
                  fontSize: '22px',
                  letterSpacing: '-0.02em',
                }}
              >
                Sign in <span style={{ color: 'var(--color-accent-gold)' }}>to vote</span>
              </h2>
              <p
                className="mt-2 font-medium"
                style={{
                  color: 'var(--color-text-tertiary)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                Track your votes, save favorites, and help others find great food
              </p>
            </div>

            {message && (
              <div className={`p-3 rounded-lg mb-4 text-sm ${
                message.type === 'error'
                  ? ''
                  : ''
              }`}
                style={{
                  background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: message.type === 'error' ? 'var(--color-red)' : 'var(--color-emerald)',
                }}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              {/* Google Sign In - Primary */}
              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border rounded-xl font-semibold text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-surface-elevated)] active:scale-[0.98] transition-all disabled:opacity-50"
                style={{
                  background: 'var(--color-surface-elevated)',
                  borderColor: 'var(--color-divider)',
                  fontSize: '14px',
                  boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.06)',
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px" style={{ background: 'var(--color-divider)' }} />
                <span className="text-xs font-medium text-[color:var(--color-text-tertiary)]">or</span>
                <div className="flex-1 h-px" style={{ background: 'var(--color-divider)' }} />
              </div>

              {/* Email Magic Link */}
              <form onSubmit={handleEmailSignIn}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none transition-all mb-3"
                  style={{
                    background: 'var(--color-surface-elevated)',
                    borderColor: 'var(--color-divider)',
                    color: 'var(--color-text-primary)',
                    fontSize: '14px',
                  }}
                />
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full px-4 py-3 text-[color:var(--color-text-primary)] font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
                  style={{
                    background: 'var(--color-surface-elevated)',
                    fontSize: '14px',
                  }}
                >
                  {authLoading ? 'Sending...' : 'Sign in with email'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
