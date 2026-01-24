import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/authApi'
import { adminApi } from '../api/adminApi'
import { followsApi } from '../api/followsApi'
import { votesApi } from '../api/votesApi'
import { dishPhotosApi } from '../api/dishPhotosApi'
import { useProfile } from '../hooks/useProfile'
import { useUserVotes } from '../hooks/useUserVotes'
import { useSavedDishes } from '../hooks/useSavedDishes'
import { useUnratedDishes } from '../hooks/useUnratedDishes'
import { useBadges } from '../hooks/useBadges'
import { isSoundMuted, toggleSoundMute } from '../lib/sounds'
import { getCategoryImage } from '../constants/categoryImages'
import { getCategoryById } from '../constants/categories'
import { PHOTO_TIERS_LIST } from '../constants/photoQuality'
import { DishModal } from '../components/DishModal'
import { LoginModal } from '../components/Auth/LoginModal'
import { UserSearch } from '../components/UserSearch'
import { FollowListModal } from '../components/FollowListModal'
import { ProfileSkeleton } from '../components/Skeleton'
import { CategoryPicker } from '../components/CategoryPicker'
import { CategoryIcon } from '../components/CategoryIcon'
import { HeartIcon } from '../components/HeartIcon'
import { ThumbsUpIcon } from '../components/ThumbsUpIcon'
import { getRatingColor } from '../utils/ranking'

const TABS = [
  { id: 'unrated', label: 'Unrated', emoji: '📷' },
  { id: 'worth-it', label: "Good Here", emoji: '👍' },
  { id: 'avoid', label: "Not Good", emoji: '👎' },
  { id: 'saved', label: 'Heard Good Here', emoji: '❤️' },
  { id: 'reviews', label: 'Reviews', emoji: '📝' },
]

const REMEMBERED_EMAIL_KEY = 'whats-good-here-email'

export function Profile() {
  const navigate = useNavigate()
  const { user, loading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('worth-it')
  const [soundMuted, setSoundMuted] = useState(isSoundMuted())
  const [authLoading, setAuthLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [nameStatus, setNameStatus] = useState(null) // null | 'checking' | 'available' | 'taken' | 'same'

  const { profile, updateProfile } = useProfile(user?.id)
  const { worthItDishes, avoidDishes, stats, loading: votesLoading, refetch: refetchVotes } = useUserVotes(user?.id)
  const { savedDishes, loading: savedLoading, unsaveDish } = useSavedDishes(user?.id)
  const { dishes: unratedDishes, count: unratedCount, loading: unratedLoading, refetch: refetchUnrated } = useUnratedDishes(user?.id)
  const { badges, loading: badgesLoading } = useBadges(user?.id)
  const [selectedDish, setSelectedDish] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [expandedTabs, setExpandedTabs] = useState({}) // Track which tabs show all dishes
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 })
  const [followListModal, setFollowListModal] = useState(null) // 'followers' | 'following' | null
  const [editingFavorites, setEditingFavorites] = useState(false)
  const [editedCategories, setEditedCategories] = useState([])
  const [userReviews, setUserReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

  // Check admin status from database (matches RLS policies)
  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      return
    }
    adminApi.isAdmin().then(setIsAdmin)
  }, [user])

  // Fetch follow counts
  useEffect(() => {
    if (!user) return
    followsApi.getFollowCounts(user.id)
      .then(setFollowCounts)
      .catch((error) => {
        console.error('Failed to fetch follow counts:', error)
      })
  }, [user])

  // Load remembered email on mount (for logged-out state)
  useEffect(() => {
    if (!user) {
      try {
        const savedEmail = sessionStorage.getItem(REMEMBERED_EMAIL_KEY)
        if (savedEmail) {
          setEmail(savedEmail)
        }
      } catch (e) {
          console.warn('Profile: unable to read remembered email', e)
      }
    }
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
        console.error('Profile: username check failed', error)
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
        console.error('Failed to fetch reviews:', error)
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
      // Remember the email for next time
      try {
        sessionStorage.setItem(REMEMBERED_EMAIL_KEY, email)
      } catch (e) {
          console.warn('Profile: unable to persist remembered email', e)
      }
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

    if (newName.trim()) {
      await updateProfile({ display_name: newName.trim() })
    }
    setEditingName(false)
    setNameStatus(null)
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
        return savedDishes
      case 'reviews':
        return userReviews
      default:
        return []
    }
  }

  const tabDishes = getTabDishes()
  const isLoading = activeTab === 'saved' ? savedLoading :
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
    await Promise.all([refetchUnrated(), refetchVotes()])
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
      console.error('Failed to delete photo:', error)
      alert('Failed to delete photo. Please try again.')
    }
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  return (
    <div style={{ background: 'var(--color-surface)' }}>
      {user ? (
        <>
          {/* Hero Identity Card */}
          <HeroIdentityCard
            user={user}
            profile={profile}
            stats={stats}
            badges={badges}
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

          {/* Compact Identity Snapshot - Category tiers without progress bars */}
          {(stats.categoryTiers.length > 0 || stats.categoryProgress.length > 0) && (
            <IdentitySnapshot categoryTiers={stats.categoryTiers} categoryProgress={stats.categoryProgress} />
          )}

          {/* Find Friends Section */}
          <div className="px-4 py-3 border-b" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-divider)' }}>
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: 'var(--color-primary)', padding: '2px' }}
            >
              <UserSearch />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b py-2" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-divider)' }}>
            <div className="flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-white shadow-md'
                      : 'text-[color:var(--color-text-secondary)]'
                  }`}
                  style={activeTab === tab.id
                    ? { background: 'var(--color-primary)' }
                    : { background: 'var(--color-surface-elevated)' }}
                >
                  {tab.id === 'saved' ? <HeartIcon size={24} /> : tab.id === 'worth-it' ? <ThumbsUpIcon size={24} /> : <span>{tab.emoji}</span>}
                  <span>{tab.label}</span>
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-black/20'
                  }`}>
                    {tab.id === 'unrated' ? unratedCount :
                     tab.id === 'worth-it' ? worthItDishes.length :
                     tab.id === 'avoid' ? avoidDishes.length :
                     tab.id === 'reviews' ? userReviews.length :
                     savedDishes.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--color-surface-elevated)' }} />
                ))}
              </div>
            ) : tabDishes.length > 0 ? (
              <div className="space-y-3">
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
                    <ProfileReviewCard
                      key={review.id}
                      review={review}
                    />
                  ))
                ) : (
                  // Other tabs
                  visibleDishes.map((dish) => (
                    <ProfileDishCard
                      key={dish.dish_id}
                      dish={dish}
                      tab={activeTab}
                      onUnsave={activeTab === 'saved' ? () => unsaveDish(dish.dish_id) : null}
                    />
                  ))
                )}

                {/* View more / View less button */}
                {hasMoreDishes && (
                  <button
                    onClick={() => setExpandedTabs(prev => ({ ...prev, [activeTab]: !isTabExpanded }))}
                    className="w-full py-3 text-center rounded-xl border-2 border-dashed hover:bg-[color:var(--color-surface-elevated)] transition-colors"
                    style={{ borderColor: 'var(--color-divider)' }}
                  >
                    <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
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
          <div className="p-4 pt-0">
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-divider)' }}>
                <h2 className="font-semibold text-[color:var(--color-text-primary)]">Settings</h2>
              </div>

              {/* Edit Favorites */}
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

              {/* Sound Toggle */}
              <button
                onClick={handleToggleSound}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--color-surface-elevated)] transition-colors border-t"
                style={{ borderColor: 'var(--color-divider)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface-elevated)' }}>
                    {soundMuted ? '🔇' : '🔊'}
                  </div>
                  <span className="font-medium text-[color:var(--color-text-primary)]">Bite Sounds</span>
                </div>
                <div className="w-12 h-7 rounded-full transition-colors" style={{ background: soundMuted ? 'var(--color-surface-elevated)' : 'var(--color-primary)' }}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform mt-1 ${soundMuted ? 'ml-1' : 'ml-6'}`} />
                </div>
              </button>

              {/* Admin Panel Link - only visible to admins */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--color-surface-elevated)] transition-colors border-t" style={{ borderColor: 'var(--color-divider)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface-elevated)' }}>
                      ⚙️
                    </div>
                    <span className="font-medium text-[color:var(--color-text-primary)]">Admin Panel</span>
                  </div>
                  <svg className="w-5 h-5 text-[color:var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}

              {/* How Badges Work */}
              <a
                href="/badges"
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--color-surface-elevated)] transition-colors border-t" style={{ borderColor: 'var(--color-divider)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface-elevated)' }}>
                    🏆
                  </div>
                  <span className="font-medium text-[color:var(--color-text-primary)]">How Badges Work</span>
                </div>
                <svg className="w-5 h-5 text-[color:var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              {/* How Photos Work */}
              <PhotosInfoSection />

              {/* Our Mission */}
              <MissionSection />

              {/* Privacy Policy */}
              <a
                href="/privacy"
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--color-surface-elevated)] transition-colors border-t" style={{ borderColor: 'var(--color-divider)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface-elevated)' }}>
                    🔒
                  </div>
                  <span className="font-medium text-[color:var(--color-text-primary)]">Privacy Policy</span>
                </div>
                <svg className="w-5 h-5 text-[color:var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              {/* Terms of Service */}
              <a
                href="/terms"
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--color-surface-elevated)] transition-colors border-t" style={{ borderColor: 'var(--color-divider)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface-elevated)' }}>
                    📋
                  </div>
                  <span className="font-medium text-[color:var(--color-text-primary)]">Terms of Service</span>
                </div>
                <svg className="w-5 h-5 text-[color:var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[color:var(--color-surface-elevated)] transition-colors border-t"
                style={{ borderColor: 'var(--color-divider)' }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
                  🚪
                </div>
                <span className="font-medium text-red-400">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Sign In Card */
        <div className="p-4">
          <div className="rounded-2xl border p-6" style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--color-primary)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[color:var(--color-text-primary)]">Sign in to vote</h2>
              <p className="text-sm text-[color:var(--color-text-secondary)] mt-1">
                Track your votes, save favorites, and help others find great food
              </p>
            </div>

            {message && (
              <div className={`p-3 rounded-lg mb-4 text-sm ${
                message.type === 'error'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              {/* Google Sign In - Primary */}
              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 rounded-xl font-semibold text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-surface-elevated)] active:scale-[0.98] transition-all disabled:opacity-50"
                style={{ background: 'var(--color-surface-elevated)', borderColor: 'var(--color-divider)' }}
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
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all mb-3"
                  style={{ background: 'var(--color-surface-elevated)', borderColor: 'var(--color-divider)', color: 'var(--color-text-primary)' }}
                />
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full px-4 py-3 text-[color:var(--color-text-primary)] font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
                  style={{ background: 'var(--color-surface-elevated)' }}
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

// Compact dish card for profile tabs
function ProfileDishCard({ dish, tab, onUnsave }) {
  const imageUrl = dish.photo_url || getCategoryImage(dish.category)

  // Calculate difference between user rating and community average
  const hasComparison = dish.rating_10 && dish.community_avg && dish.total_votes >= 2
  const ratingDiff = hasComparison ? dish.rating_10 - dish.community_avg : null

  return (
    <div className="rounded-xl border overflow-hidden flex" style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}>
      {/* Image */}
      <div className="w-24 h-24 flex-shrink-0" style={{ background: 'var(--color-surface-elevated)' }}>
        <img
          src={imageUrl}
          alt={dish.dish_name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-semibold text-[color:var(--color-text-primary)] truncate">{dish.dish_name}</h3>
          <p className="text-sm text-[color:var(--color-text-secondary)] truncate">{dish.restaurant_name}</p>
        </div>

        <div className="flex items-center justify-between">
          {/* Rating comparison */}
          <div className="flex items-center gap-2">
            {dish.rating_10 && (
              <span className="text-sm font-semibold" style={{ color: getRatingColor(dish.rating_10) }}>
                {dish.rating_10}
              </span>
            )}
            {hasComparison && (
              <span className="text-xs text-[color:var(--color-text-tertiary)]">
                · avg {dish.community_avg.toFixed(1)}
                {ratingDiff !== 0 && (
                  <span className={ratingDiff > 0 ? 'text-emerald-500' : 'text-red-400'}>
                    {' '}({ratingDiff > 0 ? '+' : ''}{ratingDiff.toFixed(1)})
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Tab-specific indicator */}
          {tab === 'worth-it' && (
            <span className="text-emerald-500 text-lg">👍</span>
          )}
          {tab === 'avoid' && (
            <span className="text-red-500 text-lg">👎</span>
          )}
          {tab === 'saved' && onUnsave && (
            <button
              onClick={onUnsave}
              className="text-red-500 hover:text-red-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Card for displaying a user's review
function ProfileReviewCard({ review }) {
  const dish = review.dishes
  const imageUrl = dish?.photo_url || getCategoryImage(dish?.category)

  // Format date
  const formattedDate = review.review_created_at
    ? new Date(review.review_created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  return (
    <Link
      to={`/dish/${review.dish_id}`}
      className="block rounded-xl border overflow-hidden"
      style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}
    >
      <div className="flex">
        {/* Image */}
        <div className="w-20 h-20 flex-shrink-0" style={{ background: 'var(--color-surface-elevated)' }}>
          <img
            src={imageUrl}
            alt={dish?.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-[color:var(--color-text-primary)] truncate text-sm">{dish?.name}</h3>
              <p className="text-xs text-[color:var(--color-text-secondary)] truncate">{dish?.restaurants?.name}</p>
            </div>
            {review.rating_10 && (
              <span className="text-sm font-bold flex-shrink-0" style={{ color: getRatingColor(review.rating_10) }}>
                {review.rating_10}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Review text */}
      <div className="px-3 pb-3">
        <p className="text-sm text-[color:var(--color-text-secondary)] line-clamp-2 italic">
          "{review.review_text}"
        </p>
        {formattedDate && (
          <p className="text-xs text-[color:var(--color-text-tertiary)] mt-1">{formattedDate}</p>
        )}
      </div>
    </Link>
  )
}

// Empty state for tabs
function EmptyState({ tab }) {
  const content = {
    'unrated': {
      emoji: '📷',
      title: 'No photos yet',
      description: 'Add photos of dishes you try - rate them now or later!',
    },
    'worth-it': {
      emoji: '👍',
      title: "Nothing good here yet",
      description: "Dishes you'd order again will appear here",
    },
    'avoid': {
      emoji: '👎',
      title: "Nothing to skip yet",
      description: "Dishes that weren't good will appear here",
    },
    'saved': {
      emoji: '❤️',
      title: "No dishes saved yet",
      description: 'Save dishes you heard were good to try later',
    },
    'reviews': {
      emoji: '📝',
      title: 'No reviews yet',
      description: 'Share your thoughts when you rate a dish',
    },
  }

  const { emoji, title, description } = content[tab]

  return (
    <div className="rounded-2xl border p-8 text-center" style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}>
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="font-semibold text-[color:var(--color-text-primary)]">{title}</h3>
      <p className="text-sm text-[color:var(--color-text-secondary)] mt-1">{description}</p>
    </div>
  )
}

// Card for unrated dishes (dishes with photos but no vote)
function UnratedDishCard({ dish, onClick, onDelete }) {
  const imageUrl = dish.user_photo_url || dish.photo_url || getCategoryImage(dish.category)

  // Format time since photo was taken
  const timeSince = dish.photo_created_at
    ? new Date(dish.photo_created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete?.()
  }

  return (
    <div
      className="w-full rounded-xl border overflow-hidden flex text-left hover:shadow-md transition-shadow"
      style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}
    >
      {/* Image with photo indicator - clickable to rate */}
      <button
        onClick={onClick}
        className="w-24 h-24 flex-shrink-0 relative"
        style={{ background: 'var(--color-surface-elevated)' }}
      >
        <img
          src={imageUrl}
          alt={dish.dish_name}
          className="w-full h-full object-cover"
        />
        {dish.user_photo_url && (
          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
            <span>📷</span>
            <span>Your photo</span>
          </div>
        )}
      </button>

      {/* Info - clickable to rate */}
      <button onClick={onClick} className="flex-1 p-3 flex flex-col justify-between min-w-0 text-left">
        <div>
          <h3 className="font-semibold text-[color:var(--color-text-primary)] truncate">{dish.dish_name}</h3>
          <p className="text-sm text-[color:var(--color-text-secondary)] truncate">{dish.restaurant_name}</p>
        </div>

        <div className="flex items-center justify-between">
          {timeSince && (
            <span className="text-xs text-[color:var(--color-text-tertiary)]">Added {timeSince}</span>
          )}
          <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
            Rate now →
          </span>
        </div>
      </button>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="px-3 flex items-center justify-center hover:bg-red-50 transition-colors"
        style={{ borderLeft: '1px solid var(--color-divider)' }}
        aria-label="Delete photo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-500">
          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}

// Photos info section with expandable details
function PhotosInfoSection() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-t" style={{ borderColor: 'var(--color-divider)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--color-surface-elevated)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface-elevated)' }}>
            📷
          </div>
          <span className="font-medium text-[color:var(--color-text-primary)]">How Photos Work</span>
        </div>
        <svg
          className={`w-5 h-5 text-[color:var(--color-text-tertiary)] transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <p className="text-sm text-[color:var(--color-text-secondary)] mb-4">
            When you add a photo, we automatically sort it so the clearest ones represent each dish. Everyone can contribute — not all photos are shown the same way.
          </p>

          <div className="space-y-2">
            {PHOTO_TIERS_LIST.map((tier) => (
              <div
                key={tier.label}
                className="flex items-center gap-3 p-2 rounded-lg bg-[color:var(--color-surface-elevated)]"
              >
                <span className="text-xl">{tier.icon}</span>
                <div className="flex-1">
                  <span className="font-semibold text-[color:var(--color-text-primary)]">{tier.label}</span>
                  <p className="text-xs text-[color:var(--color-text-secondary)]">{tier.description}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-[color:var(--color-text-secondary)] mt-4">
            If a photo is too dark, too bright, or too small, we'll ask you to try again with a clearer shot.
          </p>

          <p className="text-xs text-[color:var(--color-text-tertiary)] mt-3 text-center">
            This keeps the app trustworthy and makes dishes easier to recognize.
          </p>
        </div>
      )}
    </div>
  )
}

// Our Mission section with expandable details
function MissionSection() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-t" style={{ borderColor: 'var(--color-divider)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--color-surface-elevated)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface-elevated)' }}>
            💡
          </div>
          <span className="font-medium text-[color:var(--color-text-primary)]">Our Mission</span>
        </div>
        <svg
          className={`w-5 h-5 text-[color:var(--color-text-tertiary)] transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <p className="text-sm text-[color:var(--color-text-secondary)] mb-4">
            Restaurants collect an incredible amount of data — what you ordered, when you came, how long you stayed, and whether you returned. They have dashboards, analytics, and insights.
          </p>

          <p className="text-sm text-[color:var(--color-text-secondary)] mb-4">
            But when you sit down at a new place, what do you have?
          </p>

          <div className="bg-[color:var(--color-surface-elevated)] rounded-xl p-4 mb-4 text-center">
            <p className="text-sm text-[color:var(--color-text-primary)] font-medium">A menu.</p>
            <p className="text-sm text-[color:var(--color-text-secondary)]">No context.</p>
            <p className="text-sm text-[color:var(--color-text-secondary)]">No signal.</p>
            <p className="text-sm text-[color:var(--color-text-tertiary)]">Just a guess.</p>
          </div>

          <p className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-4">
            What's Good Here exists to change that.
          </p>

          <p className="text-sm text-[color:var(--color-text-secondary)] mb-4">
            We give diners access to the data that actually matters when you're ordering: what real people thought of real dishes. No influencers. No hype. Just honest votes.
          </p>

          <p className="text-sm text-[color:var(--color-text-secondary)] mb-4">
            When enough people agree a dish is worth ordering, it rises to the top — making it easier for the next person to decide with confidence.
          </p>

          <div className="rounded-xl p-4 mt-4" style={{ background: 'var(--color-primary-muted)' }}>
            <p className="text-sm font-medium text-[color:var(--color-text-primary)] text-center">
              Every vote you cast helps someone else eat better.
            </p>
            <p className="text-xs text-[color:var(--color-text-secondary)] text-center mt-1">
              That's the mission.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Hero Identity Card - dominant card replacing the cluttered header
function HeroIdentityCard({
  user,
  profile,
  stats,
  badges,
  followCounts,
  editingName,
  newName,
  nameStatus,
  setEditingName,
  setNewName,
  setNameStatus,
  handleSaveName,
  setFollowListModal,
}) {
  const navigate = useNavigate()

  // Derive primary identity title from highest tier or rating personality
  const getPrimaryTitle = () => {
    if (stats.categoryTiers.length > 0) {
      // Use highest tier as primary identity
      const highestTier = stats.categoryTiers[0]
      return `${highestTier.label} ${highestTier.title}`
    }
    if (stats.ratingPersonality) {
      return stats.ratingPersonality.title
    }
    return 'Food Explorer'
  }

  // Calculate badges earned
  const unlockedBadges = badges?.filter(b => b.unlocked) || []
  const badgeCount = unlockedBadges.length

  // Get near-term goal (closest to unlocking)
  const getNearTermGoal = () => {
    // Check category progress first
    if (stats.categoryProgress.length > 0) {
      const closest = stats.categoryProgress[0]
      return `${closest.votesNeeded} vote${closest.votesNeeded === 1 ? '' : 's'} to ${closest.nextTier.title} in ${closest.label}`
    }
    // Fall back to encouraging first votes
    if (stats.totalVotes === 0) {
      return 'Rate your first dish to get started'
    }
    return null
  }

  const nearTermGoal = getNearTermGoal()

  return (
    <div className="border-b px-4 py-6" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-divider)' }}>
      {/* Avatar + Name row */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg" style={{ background: 'var(--color-primary)' }}>
          {profile?.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Display Name */}
          {editingName ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value.replace(/\s/g, ''))}
                    className="w-full px-3 py-1.5 border rounded-lg text-lg font-bold focus:outline-none pr-8"
                    style={{
                      background: 'var(--color-surface-elevated)',
                      borderColor: nameStatus === 'taken' ? '#ef4444' : nameStatus === 'available' ? '#10b981' : 'var(--color-divider)',
                      color: 'var(--color-text-primary)'
                    }}
                    autoFocus
                    maxLength={30}
                  />
                  {nameStatus && nameStatus !== 'same' && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm">
                      {nameStatus === 'checking' && '⏳'}
                      {nameStatus === 'available' && '✓'}
                      {nameStatus === 'taken' && '✗'}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSaveName}
                  disabled={nameStatus === 'taken' || nameStatus === 'checking'}
                  className="px-3 py-1.5 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  style={{ background: 'var(--color-primary)' }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingName(false)
                    setNewName(profile?.display_name || '')
                    setNameStatus(null)
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Cancel
                </button>
              </div>
              {nameStatus === 'taken' && (
                <p className="text-xs" style={{ color: '#ef4444' }}>This username is already taken</p>
              )}
              {nameStatus === 'available' && (
                <p className="text-xs" style={{ color: '#10b981' }}>Username available!</p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-xl font-bold transition-colors flex items-center gap-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {profile?.display_name || 'Set your name'}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[color:var(--color-text-tertiary)]">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>
            </button>
          )}

          {/* Follow Stats */}
          <div className="flex items-center gap-3 mt-1 text-sm">
            <button
              onClick={() => setFollowListModal('followers')}
              className="hover:underline"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {followCounts.followers}
              </span> followers
            </button>
            <button
              onClick={() => setFollowListModal('following')}
              className="hover:underline"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {followCounts.following}
              </span> following
            </button>
          </div>
        </div>
      </div>

      {/* Primary Identity Title */}
      <div className="mt-4">
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
          {getPrimaryTitle()}
        </h2>
        {/* Secondary line: rank info + badges */}
        <p className="text-sm text-[color:var(--color-text-secondary)] mt-0.5">
          {stats.totalVotes > 0 ? `${stats.totalVotes} ratings` : 'Getting started'}
          {badgeCount > 0 && ` · ${badgeCount} badge${badgeCount === 1 ? '' : 's'} earned`}
        </p>
      </div>

      {/* Near-term Goal CTA */}
      {nearTermGoal && (
        <button
          onClick={() => navigate('/badges')}
          className="mt-4 w-full p-3 rounded-xl text-left transition-colors hover:opacity-90"
          style={{
            background: 'var(--color-primary-muted)',
            border: '1px solid var(--color-primary)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[color:var(--color-text-tertiary)] uppercase tracking-wide">
                Next Goal
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                {nearTermGoal}
              </p>
            </div>
            <svg className="w-5 h-5" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      )}
    </div>
  )
}

// Compact Identity Snapshot - category tiers without progress bars
function IdentitySnapshot({ categoryTiers, categoryProgress }) {
  const navigate = useNavigate()

  // Combine current tiers with "near" tiers from progress
  const getDisplayRows = () => {
    const rows = []

    // Add current tiers first (up to 3)
    categoryTiers.slice(0, 3).forEach(tier => {
      rows.push({
        categoryId: tier.category,
        categoryLabel: tier.label,
        tier: tier.title,
        tierIcon: tier.icon,
        isNear: false,
      })
    })

    // If we have room, add "near" tiers from progress
    if (rows.length < 3 && categoryProgress.length > 0) {
      categoryProgress.slice(0, 3 - rows.length).forEach(prog => {
        // Only add if not already in rows
        if (!rows.find(r => r.categoryLabel === prog.label)) {
          rows.push({
            categoryId: prog.category,
            categoryLabel: prog.label,
            tier: `Near ${prog.nextTier.title}`,
            tierIcon: prog.nextTier.icon,
            isNear: true,
          })
        }
      })
    }

    return rows.slice(0, 3)
  }

  const displayRows = getDisplayRows()

  if (displayRows.length === 0) return null

  return (
    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-divider)' }}>
      <div className="space-y-2">
        {displayRows.map((row, idx) => (
          <button
            key={idx}
            onClick={() => navigate('/badges')}
            className="w-full flex items-center justify-between py-2 px-3 rounded-lg transition-colors hover:bg-[color:var(--color-surface-elevated)]"
          >
            <div className="flex items-center gap-3">
              <CategoryIcon category={row.categoryId} size={24} />
              <span className="font-medium text-[color:var(--color-text-primary)]">{row.categoryLabel}</span>
              <span className="text-[color:var(--color-text-tertiary)]">·</span>
              <span
                className={`font-semibold ${row.isNear ? 'text-[color:var(--color-text-secondary)]' : ''}`}
                style={!row.isNear ? { color: 'var(--color-primary)' } : undefined}
              >
                {row.tierIcon} {row.tier}
              </span>
            </div>
            <svg className="w-4 h-4 text-[color:var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

// Edit Favorites Section for personalized Top 10
function EditFavoritesSection({
  currentCategories,
  editing,
  editedCategories,
  onStartEdit,
  onCancelEdit,
  onSave,
  onCategoriesChange,
}) {
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave()
    setSaving(false)
  }

  // Get category info for display
  const displayCategories = currentCategories.map(id => getCategoryById(id)).filter(Boolean)

  return (
    <div className="border-b" style={{ borderColor: 'var(--color-divider)' }}>
      <button
        onClick={editing ? null : onStartEdit}
        className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
          editing ? '' : 'hover:bg-[color:var(--color-surface-elevated)]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface-elevated)' }}>
            <HeartIcon size={32} />
          </div>
          <div className="text-left">
            <span className="font-medium text-[color:var(--color-text-primary)]">Favorite Categories</span>
            {!editing && displayCategories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {displayCategories.map(cat => (
                  <span
                    key={cat.id}
                    className="text-xs px-1.5 py-0.5 rounded flex items-center gap-1"
                    style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}
                  >
                    <CategoryIcon category={cat.id} size={14} />
                    {cat.label}
                  </span>
                ))}
              </div>
            )}
            {!editing && displayCategories.length === 0 && (
              <p className="text-xs text-[color:var(--color-text-tertiary)]">
                Set your favorites for a personalized Top 10
              </p>
            )}
          </div>
        </div>
        {!editing && (
          <svg className="w-5 h-5 text-[color:var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>

      {/* Expanded editor */}
      {editing && (
        <div className="px-4 pb-4">
          <CategoryPicker
            selectedCategories={editedCategories}
            onSelectionChange={onCategoriesChange}
            showHeader={true}
            compact={true}
          />
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onCancelEdit}
              disabled={saving}
              className="px-4 py-2 font-medium rounded-xl"
              style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface-elevated)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
