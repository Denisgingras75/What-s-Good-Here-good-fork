import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api'
import { useProfile } from '../hooks/useProfile'
import { useUserVotes } from '../hooks/useUserVotes'
import { useSavedDishes } from '../hooks/useSavedDishes'
import { useUnratedDishes } from '../hooks/useUnratedDishes'
import { isSoundMuted, toggleSoundMute } from '../lib/sounds'
import { getCategoryImage } from '../constants/categoryImages'
import { DishModal } from '../components/DishModal'
import { LoginModal } from '../components/Auth/LoginModal'

const TABS = [
  { id: 'unrated', label: 'Unrated', emoji: '📷' },
  { id: 'worth-it', label: 'Worth It', emoji: '👍' },
  { id: 'avoid', label: 'Avoid', emoji: '👎' },
  { id: 'saved', label: 'Saved', emoji: '❤️' },
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

  const { profile, updateProfile } = useProfile(user?.id)
  const { worthItDishes, avoidDishes, stats, loading: votesLoading, refetch: refetchVotes } = useUserVotes(user?.id)
  const { savedDishes, loading: savedLoading, unsaveDish } = useSavedDishes(user?.id)
  const { dishes: unratedDishes, count: unratedCount, loading: unratedLoading, refetch: refetchUnrated } = useUnratedDishes(user?.id)
  const [selectedDish, setSelectedDish] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Load remembered email on mount (for logged-out state)
  useEffect(() => {
    if (!user) {
      try {
        const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY)
        if (savedEmail) {
          setEmail(savedEmail)
        }
      } catch (e) {
        // localStorage not available
      }
    }
  }, [user])

  // Set initial name for editing
  useEffect(() => {
    if (profile?.display_name) {
      setNewName(profile.display_name)
    }
  }, [profile])

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
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email)
      } catch (e) {
        // localStorage not available
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
    if (newName.trim()) {
      await updateProfile({ display_name: newName.trim() })
    }
    setEditingName(false)
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
      default:
        return []
    }
  }

  const tabDishes = getTabDishes()
  const isLoading = activeTab === 'saved' ? savedLoading :
                    activeTab === 'unrated' ? unratedLoading : votesLoading

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

  // Format member since date
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-4">
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="What's Good Here" className="h-20 w-auto" />
        </div>
      </header>

      {user ? (
        <>
          {/* Profile Header */}
          <div className="bg-white border-b border-neutral-200 px-4 py-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg" style={{ background: 'var(--color-primary)' }}>
                {profile?.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                {/* Display Name */}
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-lg font-bold focus:border-orange-400 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="px-3 py-1.5 text-white rounded-lg text-sm font-medium"
                      style={{ background: 'var(--color-primary)' }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-xl font-bold transition-colors flex items-center gap-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {profile?.display_name || 'Set your name'}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-neutral-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                )}

                {/* Rating Personality */}
                {stats.ratingPersonality && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span>{stats.ratingPersonality.emoji}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                      {stats.ratingPersonality.title}
                    </span>
                  </div>
                )}

                {/* Contribution Stats */}
                <p className="text-sm text-neutral-500 mt-1">
                  {stats.totalVotes > 0
                    ? `${stats.totalVotes} ${stats.totalVotes === 1 ? 'dish' : 'dishes'} rated`
                    : 'Start rating to help others'
                  }
                  {stats.dishesHelpedRank > 0 && ` · Helped rank ${stats.dishesHelpedRank}`}
                  {stats.uniqueRestaurants > 0 && ` · ${stats.uniqueRestaurants} spots`}
                  {memberSince && ` · Since ${memberSince}`}
                </p>

                {/* Contributor Badge */}
                {stats.totalVotes >= 10 && (
                  <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'color-mix(in srgb, var(--color-rating) 20%, white)', color: 'var(--color-text-primary)' }}>
                    <span>🏝️</span>
                    <span>MV Contributor</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Cards */}
            {stats.totalVotes > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-neutral-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{stats.worthItCount}</div>
                  <div className="text-xs text-neutral-500">Worth It</div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-red-500">{stats.avoidCount}</div>
                  <div className="text-xs text-neutral-500">Avoid</div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-rating)' }}>
                    {stats.avgRating ? stats.avgRating.toFixed(1) : '—'}
                  </div>
                  <div className="text-xs text-neutral-500">Avg Rating</div>
                </div>
              </div>
            )}

            {/* Category Tiers */}
            {stats.categoryTiers.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  Your Ranks
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stats.categoryTiers.map((tier) => (
                    <div
                      key={tier.category}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 rounded-full text-sm"
                    >
                      <span>{tier.emoji}</span>
                      <span className="font-medium text-neutral-800">{tier.label}</span>
                      <span className="text-neutral-400">·</span>
                      <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                        {tier.icon} {tier.title}
                      </span>
                      <span className="text-xs text-neutral-400">({tier.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tier Progress Indicators */}
            {stats.categoryProgress.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  {stats.categoryTiers.length > 0 ? 'Level Up' : 'Progress'}
                </h3>
                <div className="space-y-2">
                  {stats.categoryProgress.slice(0, 3).map((prog) => (
                    <div
                      key={prog.category}
                      className="bg-white border border-neutral-200 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span>{prog.emoji}</span>
                          <span className="font-medium text-neutral-800">{prog.label}</span>
                          {prog.currentTier && (
                            <span className="text-xs text-neutral-400">
                              {prog.currentTier.icon} {prog.currentTier.title}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                          {prog.votesNeeded} more to {prog.nextTier.icon} {prog.nextTier.title}
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.round(prog.progress * 100)}%`,
                            background: 'var(--color-primary)',
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-neutral-400">{prog.count} votes</span>
                        <span className="text-xs text-neutral-400">{prog.nextTier.min} needed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top spot (if no progress yet, show encouragement) */}
            {stats.categoryProgress.length === 0 && stats.favoriteRestaurant && (
              <div className="flex flex-wrap gap-2 mt-3">
                <div className="px-3 py-1.5 bg-neutral-100 rounded-full text-xs font-medium text-neutral-600">
                  Top spot: <span className="text-neutral-900">{stats.favoriteRestaurant}</span>
                </div>
                <div className="px-3 py-1.5 bg-neutral-100 rounded-full text-xs font-medium text-neutral-500">
                  Keep rating to earn ranks!
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white border-b border-neutral-200 px-4 py-2">
            <div className="flex gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                  style={activeTab === tab.id ? { background: 'var(--color-primary)' } : {}}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-neutral-200'
                  }`}>
                    {tab.id === 'unrated' ? unratedCount :
                     tab.id === 'worth-it' ? worthItDishes.length :
                     tab.id === 'avoid' ? avoidDishes.length :
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
                  <div key={i} className="h-24 bg-neutral-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : tabDishes.length > 0 ? (
              <div className="space-y-3">
                {activeTab === 'unrated' ? (
                  // Unrated dishes - clickable to rate
                  tabDishes.map((dish) => (
                    <UnratedDishCard
                      key={dish.dish_id}
                      dish={dish}
                      onClick={() => handleUnratedDishClick(dish)}
                    />
                  ))
                ) : (
                  // Other tabs
                  tabDishes.map((dish) => (
                    <ProfileDishCard
                      key={dish.dish_id}
                      dish={dish}
                      tab={activeTab}
                      onUnsave={activeTab === 'saved' ? () => unsaveDish(dish.dish_id) : null}
                    />
                  ))
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

          {/* Settings */}
          <div className="p-4 pt-0">
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-100">
                <h2 className="font-semibold text-neutral-900">Settings</h2>
              </div>

              {/* Sound Toggle */}
              <button
                onClick={handleToggleSound}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                    {soundMuted ? '🔇' : '🔊'}
                  </div>
                  <span className="font-medium text-neutral-900">Bite Sounds</span>
                </div>
                <div className={`w-12 h-7 rounded-full transition-colors ${soundMuted ? 'bg-neutral-200' : ''}`} style={!soundMuted ? { background: 'var(--color-primary)' } : {}}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform mt-1 ${soundMuted ? 'ml-1' : 'ml-6'}`} />
                </div>
              </button>

              {/* How Ranks Work */}
              <RanksInfoSection />

              {/* How Photos Work */}
              <PhotosInfoSection />

              {/* Privacy Policy */}
              <a
                href="/privacy"
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors border-t border-neutral-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                    🔒
                  </div>
                  <span className="font-medium text-neutral-900">Privacy Policy</span>
                </div>
                <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              {/* Terms of Service */}
              <a
                href="/terms"
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors border-t border-neutral-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                    📋
                  </div>
                  <span className="font-medium text-neutral-900">Terms of Service</span>
                </div>
                <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors border-t border-neutral-100"
              >
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  🚪
                </div>
                <span className="font-medium text-red-600">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Sign In Card */
        <div className="p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--color-primary)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-neutral-900">Sign in to vote</h2>
              <p className="text-sm text-neutral-500 mt-1">
                Track your votes, save favorites, and help others find great food
              </p>
            </div>

            {message && (
              <div className={`p-3 rounded-lg mb-4 text-sm ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              {/* Google Sign In - Primary */}
              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-neutral-200 rounded-xl font-semibold text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98] transition-all disabled:opacity-50"
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
                <div className="flex-1 h-px bg-neutral-200" />
                <span className="text-xs font-medium text-neutral-400">or</span>
                <div className="flex-1 h-px bg-neutral-200" />
              </div>

              {/* Email Magic Link */}
              <form onSubmit={handleEmailSignIn}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-orange-400 focus:bg-white focus:outline-none transition-all mb-3"
                />
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full px-4 py-3 text-neutral-700 font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 active:scale-[0.98] transition-all disabled:opacity-50"
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

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex">
      {/* Image */}
      <div className="w-24 h-24 flex-shrink-0 bg-neutral-100">
        <img
          src={imageUrl}
          alt={dish.dish_name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-semibold text-neutral-900 truncate">{dish.dish_name}</h3>
          <p className="text-sm text-neutral-500 truncate">{dish.restaurant_name}</p>
        </div>

        <div className="flex items-center justify-between">
          {/* Rating if available */}
          {dish.rating_10 && (
            <span className="text-sm font-semibold" style={{ color: 'var(--color-rating)' }}>{dish.rating_10}/10</span>
          )}

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
      title: 'No favorites yet',
      description: 'Dishes you rate as "Worth It" will appear here',
    },
    'avoid': {
      emoji: '👎',
      title: 'Nothing to avoid',
      description: 'Dishes you think others should skip will appear here',
    },
    'saved': {
      emoji: '❤️',
      title: 'No saved dishes',
      description: 'Tap the heart on dishes you want to try later',
    },
  }

  const { emoji, title, description } = content[tab]

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="font-semibold text-neutral-900">{title}</h3>
      <p className="text-sm text-neutral-500 mt-1">{description}</p>
    </div>
  )
}

// Card for unrated dishes (dishes with photos but no vote)
function UnratedDishCard({ dish, onClick }) {
  const imageUrl = dish.user_photo_url || dish.photo_url || getCategoryImage(dish.category)

  // Format time since photo was taken
  const timeSince = dish.photo_created_at
    ? new Date(dish.photo_created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl border border-neutral-200 overflow-hidden flex text-left hover:shadow-md transition-shadow"
    >
      {/* Image with photo indicator */}
      <div className="w-24 h-24 flex-shrink-0 bg-neutral-100 relative">
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
      </div>

      {/* Info */}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-semibold text-neutral-900 truncate">{dish.dish_name}</h3>
          <p className="text-sm text-neutral-500 truncate">{dish.restaurant_name}</p>
        </div>

        <div className="flex items-center justify-between">
          {timeSince && (
            <span className="text-xs text-neutral-400">Added {timeSince}</span>
          )}
          <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
            Rate now →
          </span>
        </div>
      </div>
    </button>
  )
}

// Ranks info section with expandable details
function RanksInfoSection() {
  const [expanded, setExpanded] = useState(false)

  const tiers = [
    { min: 5, title: 'Explorer', icon: '🌱', description: 'Just getting started' },
    { min: 10, title: 'Fan', icon: '🔥', description: 'Building your expertise' },
    { min: 20, title: 'Connoisseur', icon: '💎', description: 'You know your stuff' },
    { min: 30, title: 'Expert', icon: '⭐', description: 'A trusted voice' },
    { min: 50, title: 'Master', icon: '👑', description: 'The ultimate authority' },
  ]

  return (
    <div className="border-t border-neutral-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
            🏆
          </div>
          <span className="font-medium text-neutral-900">How Ranks Work</span>
        </div>
        <svg
          className={`w-5 h-5 text-neutral-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <p className="text-sm text-neutral-600 mb-4">
            Rate dishes in a category to earn ranks! Each category tracks your progress separately.
          </p>

          <div className="space-y-2">
            {tiers.map((tier) => (
              <div
                key={tier.title}
                className="flex items-center gap-3 p-2 rounded-lg bg-neutral-50"
              >
                <span className="text-xl">{tier.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">{tier.title}</span>
                    <span className="text-xs px-2 py-0.5 bg-neutral-200 rounded-full text-neutral-600">
                      {tier.min}+ votes
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">{tier.description}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-neutral-400 mt-4 text-center">
            Your rating style also earns you a personality badge based on your average scores.
          </p>
        </div>
      )}
    </div>
  )
}

// Photos info section with expandable details
function PhotosInfoSection() {
  const [expanded, setExpanded] = useState(false)

  const tiers = [
    {
      icon: '⭐',
      title: 'Featured',
      description: 'May be used as the main image for a dish',
    },
    {
      icon: '👥',
      title: 'Community',
      description: 'Appears in the Community Photos section',
    },
    {
      icon: '📁',
      title: 'Saved',
      description: 'Only shown under "See all photos"',
    },
  ]

  return (
    <div className="border-t border-neutral-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
            📷
          </div>
          <span className="font-medium text-neutral-900">How Photos Work</span>
        </div>
        <svg
          className={`w-5 h-5 text-neutral-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <p className="text-sm text-neutral-600 mb-4">
            When you add a photo, we automatically sort it so the clearest ones represent each dish. Everyone can contribute — not all photos are shown the same way.
          </p>

          <div className="space-y-2">
            {tiers.map((tier) => (
              <div
                key={tier.title}
                className="flex items-center gap-3 p-2 rounded-lg bg-neutral-50"
              >
                <span className="text-xl">{tier.icon}</span>
                <div className="flex-1">
                  <span className="font-semibold text-neutral-900">{tier.title}</span>
                  <p className="text-xs text-neutral-500">{tier.description}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-neutral-600 mt-4">
            If a photo is too dark, too bright, or too small, we'll ask you to try again with a clearer shot.
          </p>

          <p className="text-xs text-neutral-400 mt-3 text-center">
            This keeps the app trustworthy and makes dishes easier to recognize.
          </p>
        </div>
      )}
    </div>
  )
}
