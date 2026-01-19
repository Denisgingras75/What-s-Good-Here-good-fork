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

export function ReviewFlow({ dishId, dishName, category, totalVotes = 0, yesVotes = 0, onVote, onLoginRequired }) {
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
    setConfirmationType(wouldOrderAgain ? 'yes' : 'no')
    setShowConfirmation(true)
    setPendingVote(wouldOrderAgain)

    setTimeout(() => {
      setShowConfirmation(false)

      // Auth gate: check if user is logged in BEFORE going to rating step
      if (!user) {
        // Save to localStorage so it survives OAuth redirect
        setPendingVoteToStorage(dishId, wouldOrderAgain)
        setAwaitingLogin(true)
        onLoginRequired?.()
        // Don't advance to step 2 - wait for login
        return
      }

      // User is authenticated - proceed to rating
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
        category: category,
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
        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
          <p className="text-sm text-emerald-800 font-medium text-center mb-2">Your review</p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-2xl">{userVote ? '👍' : '👎'}</span>
            <span className="text-xl font-bold text-emerald-700">{Number(userRating).toFixed(1)}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <span>👍</span> {localYesVotes} <span className="text-emerald-500 font-normal">({yesPercent}%)</span>
          </span>
          <span className="text-neutral-300">|</span>
          <span className="flex items-center gap-1.5 text-red-500 font-semibold">
            <span>👎</span> {noVotes} <span className="text-red-400 font-normal">({noPercent}%)</span>
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
          className="w-full py-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
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
        <p className="text-sm font-medium text-neutral-600 text-center">Would you order this again?</p>

        {/* Show "sign in to continue" note when awaiting login */}
        {awaitingLogin && pendingVote !== null && (
          <p className="text-xs text-center" style={{ color: 'var(--color-primary)' }}>
            Sign in to continue rating
          </p>
        )}

        {localTotalVotes > 0 && !awaitingLogin ? (
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span>👍</span> {localYesVotes} <span className="text-emerald-500 font-normal">({yesPercent}%)</span>
            </span>
            <span className="text-neutral-300">|</span>
            <span className="flex items-center gap-1.5 text-red-500 font-semibold">
              <span>👎</span> {noVotes} <span className="text-red-400 font-normal">({noPercent}%)</span>
            </span>
          </div>
        ) : !awaitingLogin ? (
          <p className="text-xs text-neutral-400 text-center">Help rank this dish — be first to vote!</p>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleVoteClick(true)}
            disabled={showConfirmation}
            className={`relative overflow-hidden flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ease-out focus-ring active:scale-95
              ${(showConfirmation && confirmationType === 'yes') || showPendingYes
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                : 'bg-white text-neutral-700 border-2 border-neutral-200 hover:border-emerald-400 hover:bg-emerald-50 shadow-sm'}`}
          >
            {showConfirmation && confirmationType === 'yes' ? (
              <span className="text-2xl text-white animate-pulse">✓</span>
            ) : showPendingYes ? (
              <><span className="text-xl">👍</span><span>Yes</span></>
            ) : (
              <><span className="text-xl">👍</span><span>Yes</span></>
            )}
          </button>
          <button
            onClick={() => handleVoteClick(false)}
            disabled={showConfirmation}
            className={`relative overflow-hidden flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ease-out focus-ring active:scale-95
              ${(showConfirmation && confirmationType === 'no') || showPendingNo
                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 scale-105'
                : 'bg-white text-neutral-700 border-2 border-neutral-200 hover:border-red-400 hover:bg-red-50 shadow-sm'}`}
          >
            {showConfirmation && confirmationType === 'no' ? (
              <span className="text-2xl text-white animate-pulse">✓</span>
            ) : showPendingNo ? (
              <><span className="text-xl">👎</span><span>No</span></>
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
          <button onClick={() => setStep(1)} className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors flex items-center gap-1">
            <span>←</span> Back
          </button>
          <p className="text-sm font-medium text-neutral-600">How good was it?</p>
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
          className="w-full py-4 px-6 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 ease-out focus-ring active:scale-98 hover:shadow-xl hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}
        >
          Next
        </button>
      </div>
    )
  }

  // Step 3: Preview & Confirm
  return (
    <div className="space-y-4 animate-fadeIn">
      <p className="text-sm font-medium text-neutral-600 text-center">Review your answers</p>

      {/* Preview card */}
      <div className="p-4 bg-gradient-to-br from-neutral-50 to-stone-100 rounded-xl border border-neutral-200 space-y-3">
        {/* Yes/No answer */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Would order again?</span>
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-neutral-300 transition-colors"
          >
            <span className="text-lg">{pendingVote ? '👍' : '👎'}</span>
            <span className="text-sm font-medium text-neutral-700">{pendingVote ? 'Yes' : 'No'}</span>
            <span className="text-xs text-neutral-400">Edit</span>
          </button>
        </div>

        {/* Rating answer */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Rating</span>
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-neutral-300 transition-colors"
          >
            <span className="text-sm font-bold text-neutral-700">{sliderValue.toFixed(1)}</span>
            <span className="text-xs text-neutral-400">Edit</span>
          </button>
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30 transition-all duration-200 ease-out focus-ring
          ${submitting ? 'opacity-50 cursor-not-allowed' : 'active:scale-98 hover:shadow-xl'}`}
      >
        {submitting ? 'Adding vote...' : 'Add Your Vote'}
      </button>

      {/* Back button */}
      <button
        onClick={() => setStep(2)}
        className="w-full py-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        ← Go back
      </button>
    </div>
  )
}
