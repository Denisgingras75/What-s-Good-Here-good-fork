import { useState, useEffect, useRef } from 'react'
import { capture } from '../lib/analytics'
import { useAuth } from '../context/AuthContext'
import { useVote } from '../hooks/useVote'
import { authApi } from '../api/authApi'
import { FoodRatingSlider } from './FoodRatingSlider'
import { ThumbsUpIcon } from './ThumbsUpIcon'
import { ThumbsDownIcon } from './ThumbsDownIcon'
import { MAX_REVIEW_LENGTH } from '../constants/app'
import {
  getPendingVoteFromStorage,
  setPendingVoteToStorage,
  clearPendingVoteStorage,
} from '../lib/storage'
import { logger } from '../utils/logger'
import { hapticLight, hapticSuccess } from '../utils/haptics'
import { PhotoUploadButton } from './PhotoUploadButton'
import { setBackButtonInterceptor, clearBackButtonInterceptor } from '../utils/backButtonInterceptor'

export function ReviewFlow({ dishId, dishName, restaurantId, restaurantName, category, price, totalVotes = 0, yesVotes = 0, onVote, onLoginRequired, onPhotoUploaded }) {
  const { user } = useAuth()
  const { submitVote, submitting } = useVote()
  const [userVote, setUserVote] = useState(null)
  const [userRating, setUserRating] = useState(null)
  const [userReviewText, setUserReviewText] = useState(null)

  const [localTotalVotes, setLocalTotalVotes] = useState(totalVotes)
  const [localYesVotes, setLocalYesVotes] = useState(yesVotes)

  // Flow: 1 = yes/no, 2 = rate + extras (review + photo)
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
  const [reviewText, setReviewText] = useState('')
  const [reviewError, setReviewError] = useState(null)

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationType, setConfirmationType] = useState(null)
  const [awaitingLogin, setAwaitingLogin] = useState(false)
  const [announcement, setAnnouncement] = useState('') // For screen reader announcements
  const [photoAdded, setPhotoAdded] = useState(false)
  const [reviewExpanded, setReviewExpanded] = useState(false)
  const reviewTextareaRef = useRef(null)
  const confirmationTimerRef = useRef(null)

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
        setUserReviewText(null)
        return
      }
      try {
        const vote = await authApi.getUserVoteForDish(dishId, user.id)
        if (vote) {
          setUserVote(vote.would_order_again)
          setUserRating(vote.rating_10)
          setUserReviewText(vote.review_text || null)
          if (vote.rating_10) setSliderValue(vote.rating_10)
          if (vote.review_text) setReviewText(vote.review_text)
        }
      } catch (error) {
        logger.error('Error fetching user vote:', error)
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

  // Auth guard: if on step 2 without auth, kick back to step 1
  useEffect(() => {
    if (step === 2 && !user) {
      setStep(1)
      setAwaitingLogin(true)
      onLoginRequired?.()
    }
  }, [step, user, onLoginRequired])

  // Cleanup confirmation timer on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (confirmationTimerRef.current) {
        clearTimeout(confirmationTimerRef.current)
      }
    }
  }, [])

  const handleVoteClick = (wouldOrderAgain) => {
    setPendingVote(wouldOrderAgain)
    hapticLight() // Tactile feedback on selection

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

    confirmationTimerRef.current = setTimeout(() => {
      setShowConfirmation(false)
      setStep(2)
    }, 350)
  }

  const handleSubmit = async () => {
    // Validate review length if they wrote something
    if (reviewText.length > MAX_REVIEW_LENGTH) {
      setReviewError(`${reviewText.length - MAX_REVIEW_LENGTH} characters over limit`)
      return
    }
    setReviewError(null)
    await doSubmit(reviewText.trim() || null)
  }

  const doSubmit = async (reviewTextToSubmit) => {
    // Prevent double submission
    if (submitting) return
    if (pendingVote === null) return

    if (!user) {
      onLoginRequired?.()
      return
    }

    // Validate rating is within acceptable range
    if (sliderValue < 0 || sliderValue > 10) {
      logger.error('Invalid rating value:', sliderValue)
      return
    }

    const previousVote = userVote

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
    if (reviewTextToSubmit) setUserReviewText(reviewTextToSubmit)

    // Track vote immediately for snappy analytics
    capture('vote_cast', {
      dish_id: dishId,
      dish_name: dishName,
      restaurant_id: restaurantId,
      restaurant_name: restaurantName,
      category: category,
      price: price != null ? Number(price) : null,
      would_order_again: pendingVote,
      rating: sliderValue,
      has_review: !!reviewTextToSubmit,
      has_photo: photoAdded,
      is_update: previousVote !== null,
    })

    // Clear UI state immediately - instant feedback
    clearPendingVoteStorage()
    setStep(1)
    setPendingVote(null)
    setReviewText('')
    setReviewError(null)
    setPhotoAdded(false)
    setReviewExpanded(false)

    // Haptic success feedback
    hapticSuccess()

    // Announce for screen readers
    setAnnouncement('Vote submitted successfully')
    setTimeout(() => setAnnouncement(''), 1000)

    // Notify parent to refresh data
    onVote?.()

    // Submit to server in background (non-blocking)
    submitVote(dishId, pendingVote, sliderValue, reviewTextToSubmit)
      .then((result) => {
        if (!result.success) {
          logger.error('Vote submission failed:', result.error)
        }
      })
      .catch((err) => {
        logger.error('Vote submission error:', err)
      })
  }

  // Intercept browser back button during vote flow — navigate between steps instead of leaving.
  // The interceptor was registered in main.jsx BEFORE React Router, so its popstate listener
  // fires first (AT_TARGET phase = registration order). It calls stopImmediatePropagation to
  // prevent React Router from processing the navigation, then pushes the dish URL back.
  useEffect(() => {
    if (step <= 1) {
      clearBackButtonInterceptor()
      return
    }

    // Save the dish page URL/state now — by the time popstate fires, the browser
    // has already changed the URL to the previous page
    const currentUrl = window.location.href
    const currentState = window.history.state

    setBackButtonInterceptor(() => {
      // Restore the dish page in the history stack
      window.history.pushState(currentState, '', currentUrl)
      setStep(1)
    })

    return () => clearBackButtonInterceptor()
  }, [step])

  // Already voted - show summary
  if (userVote !== null && userRating !== null && step === 1) {
    return (
      <div className="space-y-3">
        <div className="p-4 rounded-xl" style={{ background: 'color-mix(in srgb, var(--color-success) 15%, var(--color-surface-elevated))', border: '1px solid color-mix(in srgb, var(--color-success) 30%, transparent)' }}>
          <p className="text-sm font-medium text-center mb-2" style={{ color: 'var(--color-success)' }}>Your review</p>
          <div className="flex items-center justify-center gap-4">
            {userVote ? <ThumbsUpIcon size={32} /> : <ThumbsDownIcon size={32} />}
            <span className="text-xl font-bold" style={{ color: 'var(--color-success)' }}>{Number(userRating).toFixed(1)}</span>
          </div>
          {userReviewText && (
            <p className="mt-3 text-sm text-center italic" style={{ color: 'var(--color-text-secondary)' }}>
              "{userReviewText}"
            </p>
          )}
        </div>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--color-success)' }}>
            <ThumbsUpIcon size={22} /> {localYesVotes} <span className="font-normal opacity-80">({yesPercent}%)</span>
          </span>
          <span style={{ color: 'var(--color-divider)' }}>|</span>
          <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--color-danger)' }}>
            <ThumbsDownIcon size={18} /> {noVotes} <span className="font-normal opacity-80">({noPercent}%)</span>
          </span>
        </div>
        <button
          onClick={() => {
            setPendingVote(userVote)
            setSliderValue(userRating)
            if (userReviewText) {
              setReviewText(userReviewText)
              setReviewExpanded(true)
            }
            setUserVote(null)
            setUserRating(null)
            setUserReviewText(null)
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
        {/* Screen reader announcement region */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>
        <p className="text-sm font-medium text-center" style={{ color: 'var(--color-text-secondary)' }}>Worth ordering again?</p>

        {/* Show "sign in to continue" note when awaiting login */}
        {awaitingLogin && pendingVote !== null && (
          <div className="p-3 rounded-xl text-center" style={{ background: 'var(--color-primary-muted)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
              {pendingVote ? <ThumbsUpIcon size={22} /> : <ThumbsDownIcon size={22} />} Vote selected — sign in to save it
            </p>
          </div>
        )}

        {localTotalVotes > 0 && !awaitingLogin ? (
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--color-success)' }}>
              <ThumbsUpIcon size={22} /> {localYesVotes} <span className="font-normal opacity-80">({yesPercent}%)</span>
            </span>
            <span style={{ color: 'var(--color-divider)' }}>|</span>
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--color-danger)' }}>
              <ThumbsDownIcon size={18} /> {noVotes} <span className="font-normal opacity-80">({noPercent}%)</span>
            </span>
          </div>
        ) : !awaitingLogin ? (
          <p className="text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>Be the first to rank this dish!</p>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleVoteClick(true)}
            disabled={showConfirmation}
            className="relative overflow-hidden flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ease-out focus-ring active:scale-95"
            style={(showConfirmation && confirmationType === 'yes') || showPendingYes
              ? { background: 'linear-gradient(to bottom right, var(--color-rating), #5A9E72)', color: 'var(--color-text-on-primary)', boxShadow: '0 10px 15px -3px rgba(107, 179, 132, 0.3)', transform: 'scale(1.05)' }
              : { background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '2px solid var(--color-divider)' }}
          >
            {showConfirmation && confirmationType === 'yes' ? (
              <span className="text-2xl animate-pulse" style={{ color: 'var(--color-text-on-primary)' }}>✓</span>
            ) : (
              <><ThumbsUpIcon size={30} /><span>Yes</span></>
            )}
          </button>
          <button
            onClick={() => handleVoteClick(false)}
            disabled={showConfirmation}
            className="relative overflow-hidden flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ease-out focus-ring active:scale-95"
            style={(showConfirmation && confirmationType === 'no') || showPendingNo
              ? { background: 'linear-gradient(to bottom right, var(--color-primary), #C8502E)', color: 'var(--color-text-on-primary)', boxShadow: '0 10px 15px -3px rgba(232, 102, 60, 0.3)', transform: 'scale(1.05)' }
              : { background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '2px solid var(--color-divider)' }}
          >
            {showConfirmation && confirmationType === 'no' ? (
              <span className="text-2xl animate-pulse" style={{ color: 'var(--color-text-on-primary)' }}>✓</span>
            ) : (
              <><ThumbsDownIcon size={30} /><span>No</span></>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Step 2: Rate + extras (review + photo) — all on one screen
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

      {/* Review — tap to expand */}
      {reviewExpanded ? (
        <div className="relative">
          <label htmlFor="review-text" className="sr-only">Your review</label>
          <textarea
            ref={reviewTextareaRef}
            id="review-text"
            value={reviewText}
            onChange={(e) => {
              setReviewText(e.target.value)
              if (reviewError) setReviewError(null)
            }}
            placeholder="What stood out?"
            aria-label="Write your review"
            aria-describedby={reviewError ? 'review-error' : 'review-char-count'}
            aria-invalid={!!reviewError}
            maxLength={MAX_REVIEW_LENGTH + 50}
            rows={3}
            className="w-full p-4 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            style={{
              background: 'var(--color-surface-elevated)',
              border: reviewError ? '2px solid var(--color-danger)' : '1px solid var(--color-divider)',
              color: 'var(--color-text-primary)',
            }}
          />
          {reviewText.length > 0 && (
            <div id="review-char-count" className="absolute bottom-2 right-3 text-xs" style={{ color: reviewText.length > MAX_REVIEW_LENGTH ? 'var(--color-danger)' : 'var(--color-text-tertiary)' }}>
              {reviewText.length}/{MAX_REVIEW_LENGTH}
            </div>
          )}
          {reviewError && (
            <p id="review-error" role="alert" className="text-sm text-center mt-1" style={{ color: 'var(--color-danger)' }}>
              {reviewError}
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={() => {
            setReviewExpanded(true)
            // Focus the textarea after it renders
            setTimeout(() => reviewTextareaRef.current?.focus(), 50)
          }}
          className="w-full p-4 rounded-xl text-sm text-left transition-colors"
          style={{
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-divider)',
            color: 'var(--color-text-tertiary)',
          }}
        >
          What stood out?
        </button>
      )}

      {/* Photo upload — inline */}
      {photoAdded ? (
        <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'color-mix(in srgb, var(--color-success) 10%, var(--color-surface-elevated))', border: '1px solid color-mix(in srgb, var(--color-success) 30%, transparent)' }}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--color-success)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>Photo added</span>
        </div>
      ) : (
        <PhotoUploadButton
          dishId={dishId}
          onPhotoUploaded={(photo) => {
            setPhotoAdded(true)
            onPhotoUploaded?.(photo)
          }}
          onLoginRequired={onLoginRequired}
        />
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={submitting || reviewText.length > MAX_REVIEW_LENGTH}
        className={`w-full py-4 px-6 rounded-xl font-semibold shadow-lg transition-all duration-200 ease-out focus-ring
          ${submitting || reviewText.length > MAX_REVIEW_LENGTH ? 'opacity-50 cursor-not-allowed' : 'active:scale-98 hover:shadow-xl'}`}
        style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
      >
        {submitting ? 'Saving...' : (reviewText.trim() || photoAdded) ? 'Submit' : 'Submit Rating'}
      </button>
    </div>
  )
}
