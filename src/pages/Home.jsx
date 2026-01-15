import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useSavedDishes } from '../hooks/useSavedDishes'
import { LocationPicker } from '../components/LocationPicker'
import { DishModal } from '../components/DishModal'
import { getPendingVoteFromStorage } from '../components/ReviewFlow'
import { LoginModal } from '../components/Auth/LoginModal'
import { getCategoryImage } from '../constants/categoryImages'
import { DishRowSkeleton } from '../components/Skeleton'
import { ImpactFeedback, getImpactMessage } from '../components/ImpactFeedback'

const TOP_COUNT = 10
const MIN_VOTES_FOR_RANKING = 5

export function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [selectedDish, setSelectedDish] = useState(null)
  const [impactFeedback, setImpactFeedback] = useState(null)
  const beforeVoteRef = useRef(null)

  const {
    location,
    radius,
    setRadius,
    error: locationError,
    permissionState,
    isUsingDefault,
    requestLocation,
    useDefaultLocation,
    loading: locationLoading
  } = useLocationContext()
  const { dishes, loading, error, refetch } = useDishes(
    location,
    radius,
    null,
    null
  )
  const { isSaved, toggleSave } = useSavedDishes(user?.id)

  // Split dishes into ranked (enough votes) and unrated (not enough votes)
  const rankedDishes = dishes?.filter(d => (d.total_votes || 0) >= MIN_VOTES_FOR_RANKING) || []
  // Sort unranked by most votes desc, then by most recent (created_at would be ideal, fallback to dish_id)
  const unratedDishes = dishes
    ?.filter(d => (d.total_votes || 0) < MIN_VOTES_FOR_RANKING)
    .sort((a, b) => (b.total_votes || 0) - (a.total_votes || 0)) || []

  // Build the Top 10 list: ranked first, fill remaining with unrated
  const topRanked = rankedDishes.slice(0, TOP_COUNT)
  const spotsRemaining = TOP_COUNT - topRanked.length
  const fillerDishes = unratedDishes.slice(0, spotsRemaining)

  // Track when we're waiting for vote results
  const [pendingVoteData, setPendingVoteData] = useState(null)

  // Helper to find dish rank in current list
  const getDishRank = (dishId, dishList) => {
    const ranked = dishList?.filter(d => (d.total_votes || 0) >= MIN_VOTES_FOR_RANKING) || []
    const index = ranked.findIndex(d => d.dish_id === dishId)
    return index === -1 ? 999 : index + 1
  }

  // Open dish modal and capture before state for impact calculation
  const openDishModal = (dish) => {
    beforeVoteRef.current = {
      dish_id: dish.dish_id,
      total_votes: dish.total_votes || 0,
      percent_worth_it: dish.percent_worth_it || 0,
      rank: getDishRank(dish.dish_id, dishes)
    }
    setSelectedDish(dish)
  }

  // Auto-reopen modal after OAuth/magic link login if there's a pending vote
  useEffect(() => {
    if (!user || !dishes?.length || selectedDish) return

    // Check URL for votingDish param (from magic link redirect)
    const params = new URLSearchParams(window.location.search)
    const votingDishId = params.get('votingDish')

    // Also check localStorage as fallback
    const pending = getPendingVoteFromStorage()
    const dishIdToOpen = votingDishId || pending?.dishId

    if (!dishIdToOpen) return

    // Find the dish in current list
    const dish = dishes.find(d => d.dish_id === dishIdToOpen)
    if (!dish) return

    // Clean up the URL param first
    if (votingDishId) {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('votingDish')
      window.history.replaceState({}, '', newUrl.pathname + newUrl.search)
    }

    // Open modal immediately - dishes are guaranteed ready now
    openDishModal(dish)
  }, [user, dishes])

  // Calculate impact when dishes update after voting
  useEffect(() => {
    if (!pendingVoteData || !dishes?.length) return

    const after = dishes.find(d => d.dish_id === pendingVoteData.dish_id)
    if (!after) return

    // Check if votes actually increased (data refreshed)
    if (after.total_votes > pendingVoteData.total_votes) {
      const afterRank = getDishRank(pendingVoteData.dish_id, dishes)
      const impact = getImpactMessage(pendingVoteData, after, pendingVoteData.rank, afterRank)
      setImpactFeedback(impact)
      setPendingVoteData(null)
    }
  }, [dishes, pendingVoteData])

  const handleVote = () => {
    // Store before data and mark as pending
    if (beforeVoteRef.current) {
      setPendingVoteData(beforeVoteRef.current)
      beforeVoteRef.current = null
    }
    // Close the modal first, then refetch so toast appears on clean screen
    setSelectedDish(null)
    refetch()
  }

  const handleLoginRequired = () => {
    setLoginModalOpen(true)
  }

  const handleToggleSave = async (dishId) => {
    if (!user) {
      setLoginModalOpen(true)
      return
    }
    await toggleSave(dishId)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      {/* Header */}
      <header className="px-4 pt-4 pb-2" style={{ background: 'var(--color-bg)' }}>
        <div className="flex items-center justify-between">
          <img
            src="/logo.png"
            alt="What's Good Here"
            className="h-14 w-auto"
          />
          <button
            onClick={() => navigate('/browse')}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
            style={{
              background: 'color-mix(in srgb, var(--color-primary) 10%, white)',
              color: 'var(--color-primary)'
            }}
          >
            Browse All
          </button>
        </div>
      </header>

      {/* Location Picker */}
      <LocationPicker
        radius={radius}
        onRadiusChange={setRadius}
        location={location}
        error={locationError}
        permissionState={permissionState}
        isUsingDefault={isUsingDefault}
        onRequestLocation={requestLocation}
        onUseDefault={useDefaultLocation}
        loading={locationLoading}
      />

      {/* Main Content */}
      <main className="px-4 py-4">
        {/* Title + Ranking Explanation */}
        <div className="mb-4">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Help shape the Top 10 within {radius} {radius === 1 ? 'mile' : 'miles'}
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
            Beta — rankings unlock as dishes reach {MIN_VOTES_FOR_RANKING}+ votes · Ranked by % who would order again
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <DishRowSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg"
              style={{ background: 'var(--color-primary)', color: 'white' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Top 10 List */}
        {!loading && !error && (
          <div className="space-y-2">
            {/* Ranked dishes */}
            {topRanked.map((dish, index) => (
              <DishRow
                key={dish.dish_id}
                dish={dish}
                rank={index + 1}
                onClick={() => openDishModal(dish)}
                isRanked={true}
              />
            ))}

            {/* Divider if we have filler dishes */}
            {fillerDishes.length > 0 && topRanked.length > 0 && (
              <div className="flex items-center gap-3 py-3">
                <div className="flex-1 h-px" style={{ background: 'var(--color-divider)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                  Needs votes to rank
                </span>
                <div className="flex-1 h-px" style={{ background: 'var(--color-divider)' }} />
              </div>
            )}

            {/* Unrated filler dishes */}
            {fillerDishes.map((dish, index) => (
              <DishRow
                key={dish.dish_id}
                dish={dish}
                rank={topRanked.length + index + 1}
                onClick={() => openDishModal(dish)}
                isRanked={false}
              />
            ))}

            {/* Empty state */}
            {topRanked.length === 0 && fillerDishes.length === 0 && (
              <div className="py-12 text-center">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--color-surface)' }}
                >
                  <span className="text-2xl">🔍</span>
                </div>
                <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  No dishes found nearby
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Try increasing your search radius
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!loading && (topRanked.length > 0 || fillerDishes.length > 0) && (
          <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: 'var(--color-divider)' }}>
            <button
              onClick={() => navigate('/browse')}
              className="text-sm font-semibold"
              style={{ color: 'var(--color-primary)' }}
            >
              View all {dishes?.length || 0} dishes →
            </button>
          </div>
        )}
      </main>

      {/* Dish Detail Modal */}
      <DishModal
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        onVote={handleVote}
        onLoginRequired={handleLoginRequired}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {/* Impact feedback toast */}
      <ImpactFeedback
        impact={impactFeedback}
        onClose={() => setImpactFeedback(null)}
      />
    </div>
  )
}

// Scannable dish row: # | photo | dish + restaurant | rating | votes | distance
function DishRow({ dish, rank, onClick, isRanked }) {
  const {
    dish_name,
    restaurant_name,
    category,
    photo_url,
    percent_worth_it,
    avg_rating,
    total_votes,
    distance_miles,
  } = dish

  const imgSrc = photo_url || getCategoryImage(category)
  const votes = total_votes || 0

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2.5 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] group"
      style={{
        background: 'var(--color-bg)',
        borderColor: 'var(--color-divider)'
      }}
    >
      {/* Rank */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
        style={{
          background: rank <= 3 && isRanked ? 'var(--color-primary)' : 'var(--color-surface)',
          color: rank <= 3 && isRanked ? 'white' : 'var(--color-text-tertiary)',
          border: rank <= 3 && isRanked ? 'none' : '1px solid var(--color-divider)'
        }}
      >
        {rank}
      </div>

      {/* Photo */}
      <div
        className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
        style={{ background: 'var(--color-surface)' }}
      >
        <img
          src={imgSrc}
          alt={dish_name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      {/* Dish + Restaurant */}
      <div className="flex-1 min-w-0 text-left">
        <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
          {dish_name}
        </h3>
        <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
          {restaurant_name}
        </p>
      </div>

      {/* Rating + Votes + Distance */}
      <div className="flex-shrink-0 text-right max-w-[100px]">
        {isRanked ? (
          <>
            <div className="text-sm font-bold" style={{ color: 'var(--color-rating)' }}>
              ⭐ {avg_rating || '—'}/10
            </div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
              {votes} votes{distance_miles ? ` · ${Number(distance_miles).toFixed(1)}mi` : ''}
            </div>
          </>
        ) : (
          <>
            {/* "Needs votes" badge - subtle, not orange */}
            <div
              className="text-[10px] font-medium px-2 py-0.5 rounded-full inline-block"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-divider)'
              }}
            >
              Needs votes
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
              {votes > 0 ? `${votes} vote${votes === 1 ? '' : 's'} (need ${MIN_VOTES_FOR_RANKING})` : `0 of ${MIN_VOTES_FOR_RANKING} votes`}
              {distance_miles ? ` · ${Number(distance_miles).toFixed(1)}mi` : ''}
            </div>
          </>
        )}
      </div>

      {/* Tap indicator - neutral gray */}
      <div
        className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-all group-hover:scale-110"
        style={{
          background: 'var(--color-surface)',
          color: 'var(--color-text-tertiary)'
        }}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}
