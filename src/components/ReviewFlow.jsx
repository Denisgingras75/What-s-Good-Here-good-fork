/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react'
import posthog from 'posthog-js'
import { useAuth } from '../context/AuthContext'
import { useVote } from '../hooks/useVote'
import { authApi, badgesApi } from '../api'
import { FoodRatingSlider } from './FoodRatingSlider'
import { showBadgeUnlockToasts } from './BadgeUnlockToast'

// Helper to get/set pending vote from localStorage (survives OAuth redirect)
const PENDING_VOTE_KEY = 'whats_good_here_pending_vote'

export function getPendingVoteFromStorage() {
  try {
    const stored = localStorage.getItem(PENDING_VOTE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Check if it's recent (within 5 minutes) to avoid stale data
      if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
        return parsed
      }
      localStorage.removeItem(PENDING_VOTE_KEY)
    }
  } catch (error) {
    console.warn('Unable to read pending vote from storage', error)
  }
  return null
}

export function setPendingVoteToStorage(dishId, vote) {
  try {
    localStorage.setItem(PENDING_VOTE_KEY, JSON.stringify({
      dishId,
      vote,
      timestamp: Date.now()
    }))
  } catch (error) {
    console.warn('Unable to persist pending vote to storage', error)
  }
}

export function clearPendingVoteStorage() {
  try {
    localStorage.removeItem(PENDING_VOTE_KEY)
  } catch (error) {
    console.warn('Unable to clear pending vote from storage', error)
  }
}

export function ReviewFlow({ dishId, dishName, restaurantId, restaurantName, category, price, totalVotes = 0, yesVotes = 0, onVote, onLoginRequired }) {
  const { user } = useAuth()
  const { submitVote, submitting } = useVote()
  const [userVote, setUserVote] = useState(null)
  const [userRating, setUserRating] = useState(null)

  const [localTotalVotes, setLocalTotalVotes] = useState(totalVotes)
  const [localYesVotes, setLocalYesVotes] = useState(yesVotes)

  // Flow: 1 = yes/no, 2 = rating, 3 = preview/confirm
  // Initialize from localStorage if there's a pending vote for this dish (survives page reload after magic link)
  const [step, setStep] = useState(() => {
    const stored = getPendingVoteFromStorage()
    return (stored && stored.dishId === dishId) ? 2 : 1
  })
  const [pendingVote, setPendingVote] = useState(() => {
    const stored = getPendingVoteFromStorage()
    return (stored && stored.dishId === dishId) ? stored.vote : null
  })
  const [sliderValue, setSliderValue] = useState(0)

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationType, setConfirmationType] = useState(null)
  const [awaitingLogin, setAwaitingLogin] = useState(false)

  const noVotes = localTotalVotes - localYesVotes
  const yesPercent = localTotalVotes > 0 ? Math.round((localYesVotes / localTotalVotes) * 100) : 0
  const noPercent = localTotalVotes > 0 ? 100 - yesPercent : 0

  useEffect(() => {
    setLocalTotalVotes(totalVotes)
    setLocalYesVotes(yesVotes)
  }, [totalVotes, yesVotes])

  useEffect(() => {
    async function fetchUserVote() {
      if (!user) {
        setUserVote(null)
        setUserRating(null)
        return
      }
      try {
        const vote = await authApi.getUserVoteForDish(dishId, user.id)
        if (vote) {
          setUserVote(vote.would_order_again)
          setUserRating(vote.rating_10)
          if (vote.rating_10) setSliderValue(vote.rating_10)
        }
      } catch (error) {
        console.error('Error fetching user vote:', error)
      }
    }
    fetchUserVote()
  }, [dishId, user])

  // Continue flow after successful login (including OAuth redirect)
  useEffect(() => {
    if (user && awaitingLogin && pendingVote !== null) {
      // User just logged in and we have a pending vote - continue to rating step
      setAwaitingLogin(false)
      setStep(2)
      clearPendingVoteStorage()
    }
  }, [user, awaitingLogin, pendingVote])

  // Check for pending vote in localStorage after OAuth redirect
  useEffect(() => {
    if (user && step === 1 && pendingVote === null) {
      const stored = getPendingVoteFromStorage()
      if (stored && stored.dishId === dishId) {
        // User just logged in after OAuth redirect - restore their vote and continue
        setPendingVote(stored.vote)  // Set the pending vote BEFORE changing step
        setStep(2)
        clearPendingVoteStorage()
      }
    }
  }, [user, dishId, step, pendingVote])

  // Auth guard: if on step 2+ without auth, kick back to step 1
  useEffect(() => {
    if ((step === 2 || step === 3) && !user) {
      setStep(1)
      setAwaitingLogin(true)
      onLoginRequired?.()
    }
  }, [step, user, onLoginRequired])

  const handleVoteClick = (wouldOrderAgain) => {
    setPendingVote(wouldOrderAgain)

    // Auth gate: check if user is logged in BEFORE showing confirmation
    if (!user) {
      // Save to localStorage so it survives OAuth redirect
      setPendingVoteToStorage(dishId, wouldOrderAgain)
      setAwaitingLogin(true)
      onLoginRequired?.()
      // Don't show confirmation animation - go straight to login
      return
    }

    // User is authenticated - show confirmation then proceed to rating
    setConfirmationType(wouldOrderAgain ? 'yes' : 'no')
    setShowConfirmation(true)

    setTimeout(() => {
      setShowConfirmation(false)
      setStep(2)
    }, 350)
  }

  const handleRatingNext = () => {
    setStep(3) // Go to preview
  }

  const handleSubmit = async () => {
    if (pendingVote === null) return

    if (!user) {
      onLoginRequired?.()
      return
    }

    const previousVote = userVote
    const previousRating = userRating

    if (previousVote === null) {
      setLocalTotalVotes(prev => prev + 1)
      if (pendingVote) setLocalYesVotes(prev => prev + 1)
    } else if (previousVote !== pendingVote) {
      if (pendingVote) {
        setLocalYesVotes(prev => prev + 1)
      } else {
        setLocalYesVotes(prev => prev - 1)
      }
    }

    setUserVote(pendingVote)
    setUserRating(sliderValue)

    const result = await submitVote(dishId, pendingVote, sliderValue)

    if (result.success) {
      // Track vote submission - the core conversion event
      posthog.capture('vote_cast', {
        dish_id: dishId,
        dish_name: dishName,
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
        category: category,
        price: price != null ? Number(price) : null,
        would_order_again: pendingVote,
        rating: sliderValue,
        is_update: previousVote !== null,
      })

      clearPendingVoteStorage()
      setStep(1)
      setPendingVote(null)
      onVote?.()

      // Evaluate badges after successful vote
      try {
        const newlyUnlocked = await badgesApi.evaluateBadges(user.id)
        if (newlyUnlocked.length > 0) {
          showBadgeUnlockToasts(newlyUnlocked)
        }
      } catch (badgeError) {
        console.error('Error evaluating badges:', badgeError)
        // Don't block the vote flow on badge errors
      }
    } else {
      setUserVote(previousVote)
      setUserRating(previousRating)
      setLocalTotalVotes(totalVotes)
      setLocalYesVotes(yesVotes)
    }
  }

  // Already voted - show summary
  if (userVote !== null && userRating !== null && step === 1) {
    return (
      <div className="space-y-3">
        <div className="p-4 rounded-xl" style={{ background: 'color-mix(in srgb, var(--color-success) 15%, var(--color-surface-elevated))', border: '1px solid color-mix(in srgb, var(--color-success) 30%, transparent)' }}>
          <p className="text-sm font-medium text-center mb-2" style={{ color: 'var(--color-success)' }}>Your review</p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-2xl">{userVote ? '👍' : '👎'}</span>
            <span className="text-xl font-bold" style={{ color: 'var(--color-success)' }}>{Number(userRating).toFixed(1)}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--color-success)' }}>
            <span>👍</span> {localYesVotes} <span className="font-normal opacity-80">({yesPercent}%)</span>
          </span>
          <span style={{ color: 'var(--color-divider)' }}>|</span>
          <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--color-danger)' }}>
            <span>👎</span> {noVotes} <span className="font-normal opacity-80">({noPercent}%)</span>
          </span>
        </div>
        <button
          onClick={() => {
            setPendingVote(userVote)
            setSliderValue(userRating)
            setUserVote(null)
            setUserRating(null)
            setStep(1)
          }}
          className="w-full py-2 text-sm transition-colors"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Update your review
        </button>
      </div>
    )
  }

  // Step 1: Yes/No
  if (step === 1) {
    // Show pending selection state when awaiting login
    const showPendingYes = awaitingLogin && pendingVote === true
    const showPendingNo = awaitingLogin && pendingVote === false

    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-center" style={{ color: 'var(--color-text-secondary)' }}>Would you order this again?</p>

        {/* Show "sign in to continue" note when awaiting login */}
        {awaitingLogin && pendingVote !== null && (
          <div className="p-3 rounded-xl text-center" style={{ background: 'var(--color-primary-muted)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
              {pendingVote ? '👍' : '👎'} Vote selected — sign in to save it
            </p>
          </div>
        )}

        {localTotalVotes > 0 && !awaitingLogin ? (
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--color-success)' }}>
              <span>👍</span> {localYesVotes} <span className="font-normal opacity-80">({yesPercent}%)</span>
            </span>
            <span style={{ color: 'var(--color-divider)' }}>|</span>
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--color-danger)' }}>
              <span>👎</span> {noVotes} <span className="font-normal opacity-80">({noPercent}%)</span>
            </span>
          </div>
        ) : !awaitingLogin ? (
          <p className="text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>Help rank this dish — be first to vote!</p>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleVoteClick(true)}
            disabled={showConfirmation}
            className="relative overflow-hidden flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ease-out focus-ring active:scale-95"
            style={(showConfirmation && confirmationType === 'yes') || showPendingYes
              ? { background: 'linear-gradient(to bottom right, #10B981, #059669)', color: 'white', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)', transform: 'scale(1.05)' }
              : { background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '2px solid var(--color-divider)' }}
          >
            {showConfirmation && confirmationType === 'yes' ? (
              <span className="text-2xl text-white animate-pulse">✓</span>
            ) : (
              <><span className="text-xl">👍</span><span>Yes</span></>
            )}
          </button>
          <button
            onClick={() => handleVoteClick(false)}
            disabled={showConfirmation}
            className="relative overflow-hidden flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ease-out focus-ring active:scale-95"
            style={(showConfirmation && confirmationType === 'no') || showPendingNo
              ? { background: 'linear-gradient(to bottom right, #EF4444, #DC2626)', color: 'white', boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)', transform: 'scale(1.05)' }
              : { background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '2px solid var(--color-divider)' }}
          >
            {showConfirmation && confirmationType === 'no' ? (
              <span className="text-2xl text-white animate-pulse">✓</span>
            ) : (
              <><span className="text-xl">👎</span><span>No</span></>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Step 2: Rating with Pizza Animation
  if (step === 2) {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between">
          <button onClick={() => setStep(1)} className="text-sm transition-colors flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
            <span>←</span> Back
          </button>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>How good was it?</p>
          <div className="w-12" />
        </div>

        {/* Food Rating Slider */}
        <FoodRatingSlider
          value={sliderValue}
          onChange={setSliderValue}
          min={0}
          max={10}
          step={0.1}
          category={category}
        />

        <button
          onClick={handleRatingNext}
          className="w-full py-4 px-6 rounded-xl font-semibold shadow-lg transition-all duration-200 ease-out focus-ring active:scale-98 hover:shadow-xl hover:opacity-90"
          style={{ background: 'var(--color-primary)', color: '#1A1A1A' }}
        >
          Next
        </button>
      </div>
    )
  }

  // Step 3: Preview & Confirm
  return (
    <div className="space-y-4 animate-fadeIn">
      <p className="text-sm font-medium text-center" style={{ color: 'var(--color-text-secondary)' }}>Review your answers</p>

      {/* Preview card */}
      <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
        {/* Yes/No answer */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Would order again?</span>
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-divider)' }}
          >
            <span className="text-lg">{pendingVote ? '👍' : '👎'}</span>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{pendingVote ? 'Yes' : 'No'}</span>
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Edit</span>
          </button>
        </div>

        {/* Rating answer */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Rating</span>
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-divider)' }}
          >
            <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{sliderValue.toFixed(1)}</span>
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Edit</span>
          </button>
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className={`w-full py-4 px-6 rounded-xl font-semibold shadow-lg transition-all duration-200 ease-out focus-ring
          ${submitting ? 'opacity-50 cursor-not-allowed' : 'active:scale-98 hover:shadow-xl'}`}
        style={{ background: 'linear-gradient(to right, #10B981, #14B8A6)', color: 'white', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}
      >
        {submitting ? 'Adding vote...' : 'Add Your Vote'}
      </button>

      {/* Back button */}
      <button
        onClick={() => setStep(2)}
        className="w-full py-2 text-sm transition-colors"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        ← Go back
      </button>
    </div>
  )
}
