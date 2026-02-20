import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { capture } from '../lib/analytics'
import { useAuth } from '../context/AuthContext'
import { useVote } from '../hooks/useVote'
import { usePurityTracker } from '../hooks/usePurityTracker'
import { badgesApi } from '../api/badgesApi'
import { authApi } from '../api/authApi'
import { FoodRatingSlider } from './FoodRatingSlider'
import { BadgeUnlockCelebration } from './BadgeUnlockCelebration'
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
import { shareOrCopy, buildPostVoteShareData } from '../utils/share'
import { setBackButtonInterceptor, clearBackButtonInterceptor } from '../utils/backButtonInterceptor'

export function ReviewFlow({ dishId, dishName, restaurantId, restaurantName, category, price, totalVotes = 0, yesVotes = 0, avgRating = null, onVote, onLoginRequired }) {
  const { user } = useAuth()
  const { submitVote, submitting } = useVote()
  const { getPurity, attachToTextarea, reset: resetPurity } = usePurityTracker()
  const [userVote, setUserVote] = useState(null)
  const [userRating, setUserRating] = useState(null)
  const [userReviewText, setUserReviewText] = useState(null)

  const [localTotalVotes, setLocalTotalVotes] = useState(totalVotes)
  const [localYesVotes, setLocalYesVotes] = useState(yesVotes)

  // Flow: 1 = slider rating, 2 = review prompt, 3 = write review
  // Initialize from localStorage if there's a pending vote for this dish (survives page reload after magic link)
  const [step, setStep] = useState(() => {
    const stored = getPendingVoteFromStorage()
    return (stored && stored.dishId === dishId) ? 1 : 1
  })
  const [sliderValue, setSliderValue] = useState(() => {
    const stored = getPendingVoteFromStorage()
    return (stored && stored.dishId === dishId && stored.sliderValue != null) ? stored.sliderValue : 5.0
  })
  const [reviewText, setReviewText] = useState('')
  const [reviewError, setReviewError] = useState(null)

  const [showPostVote, setShowPostVote] = useState(false)
  const [lastSubmission, setLastSubmission] = useState(null)
  const [postVoteInsight, setPostVoteInsight] = useState(null) // { newBadges, nearestBadge }
  const [awaitingLogin, setAwaitingLogin] = useState(false)
  const [announcement, setAnnouncement] = useState('') // For screen reader announcements

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
    if (user && awaitingLogin) {
      setAwaitingLogin(false)
      // Restore slider value from storage if available
      const stored = getPendingVoteFromStorage()
      if (stored && stored.dishId === dishId && stored.sliderValue != null) {
        setSliderValue(stored.sliderValue)
      }
      setStep(2) // Go to review prompt after login
      clearPendingVoteStorage()
    }
  }, [user, awaitingLogin, dishId])

  // Check for pending vote in localStorage after OAuth redirect
  useEffect(() => {
    if (user && step === 1 && !awaitingLogin) {
      const stored = getPendingVoteFromStorage()
      if (stored && stored.dishId === dishId && stored.sliderValue != null) {
        setSliderValue(stored.sliderValue)
        setStep(2) // Continue to review prompt
        clearPendingVoteStorage()
      }
    }
  }, [user, dishId, step, awaitingLogin])

  const handleRatingNext = () => {
    hapticLight()

    // Auth gate: check if user is logged in before proceeding
    if (!user) {
      // Save slider value to localStorage so it survives OAuth redirect
      setPendingVoteToStorage(dishId, sliderValue)
      setAwaitingLogin(true)
      onLoginRequired?.()
      return
    }

    setStep(2) // Go to review prompt
  }

  const handleSkipReview = async () => {
    await doSubmit(null)
  }

  const handleWriteReview = () => {
    setStep(3) // Go to review input
  }

  const handleSubmitWithReview = async () => {
    if (reviewText.length > MAX_REVIEW_LENGTH) {
      setReviewError(`${reviewText.length - MAX_REVIEW_LENGTH} characters over limit`)
      return
    }
    setReviewError(null)
    await doSubmit(reviewText.trim() || null)
  }

  const doSubmit = async (reviewTextToSubmit) => {
    if (submitting) return

    if (!user) {
      onLoginRequired?.()
      return
    }

    if (sliderValue < 0 || sliderValue > 10) {
      logger.error('Invalid rating value:', sliderValue)
      return
    }

    // Auto-derive would_order_again from slider value
    const wouldOrderAgain = sliderValue >= 5.0

    const previousVote = userVote
    const previousRating = userRating
    const previousReview = userReviewText

    if (previousVote === null) {
      setLocalTotalVotes(prev => prev + 1)
      if (wouldOrderAgain) setLocalYesVotes(prev => prev + 1)
    } else if (previousVote !== wouldOrderAgain) {
      if (wouldOrderAgain) {
        setLocalYesVotes(prev => prev + 1)
      } else {
        setLocalYesVotes(prev => prev - 1)
      }
    }

    setUserVote(wouldOrderAgain)
    setUserRating(sliderValue)
    if (reviewTextToSubmit) setUserReviewText(reviewTextToSubmit)

    capture('vote_cast', {
      dish_id: dishId,
      dish_name: dishName,
      restaurant_id: restaurantId,
      restaurant_name: restaurantName,
      category: category,
      price: price != null ? Number(price) : null,
      would_order_again: wouldOrderAgain,
      rating: sliderValue,
      has_review: !!reviewTextToSubmit,
      is_update: previousVote !== null,
    })

    setLastSubmission({ wouldOrderAgain, rating: sliderValue })

    // Capture purity before clearing state
    const purityData = reviewTextToSubmit ? getPurity() : null

    clearPendingVoteStorage()
    setStep(1)
    setSliderValue(5.0)
    setReviewText('')
    setReviewError(null)
    resetPurity()

    hapticSuccess()

    // Show post-vote card immediately (optimistic)
    setShowPostVote(true)
    setPostVoteInsight(null) // Will be filled when badge evaluation completes

    setAnnouncement('Vote submitted successfully')
    setTimeout(() => setAnnouncement(''), 1000)

    // Submit vote + evaluate badges in background
    submitVote(dishId, wouldOrderAgain, sliderValue, reviewTextToSubmit, purityData)
      .then((result) => {
        if (result.success) {
          // Build insight data for the post-vote card
          const insight = { newBadges: [], nearestBadge: null }

          if (result.newBadges && result.newBadges.length > 0) {
            insight.newBadges = result.newBadges
          }

          if (result.badgeProgress) {
            const nearest = badgesApi.computeNearestBadge(
              result.badgeProgress.stats,
              result.badgeProgress.earnedKeys,
              category
            )
            insight.nearestBadge = nearest
          }

          setPostVoteInsight(insight)
        } else {
          logger.error('Vote submission failed:', result.error)
        }
      })
      .catch((err) => {
        logger.error('Vote submission error:', err)
      })
  }

  // Intercept browser back button during vote flow
  useEffect(() => {
    if (step <= 1 && !showPostVote) {
      clearBackButtonInterceptor()
      return
    }

    const currentUrl = window.location.href
    const currentState = window.history.state

    setBackButtonInterceptor(() => {
      window.history.pushState(currentState, '', currentUrl)

      if (showPostVote) {
        setShowPostVote(false)
        setLastSubmission(null)
        setPostVoteInsight(null)
        onVote?.()
      } else if (step > 1) {
        setStep(step - 1)
      }
    })

    return () => clearBackButtonInterceptor()
  }, [step, showPostVote, onVote])

  const handleShareDish = async () => {
    if (!lastSubmission) return
    const shareData = buildPostVoteShareData(
      { dish_id: dishId, dish_name: dishName, restaurant_name: restaurantName },
      lastSubmission.wouldOrderAgain,
      lastSubmission.rating
    )
    const result = await shareOrCopy(shareData)

    capture('dish_shared', {
      dish_id: dishId,
      dish_name: dishName,
      restaurant_name: restaurantName,
      context: 'post_vote',
      method: result.method,
      success: result.success,
    })

    if (result.success && result.method !== 'native') {
      toast.success('Link copied!', { duration: 2000 })
    }

    setShowPostVote(false)
    setLastSubmission(null)
    setPostVoteInsight(null)
    onVote?.()
  }

  const handleDismiss = () => {
    capture('share_dismissed', { context: 'post_vote', dish_id: dishId })
    setShowPostVote(false)
    setLastSubmission(null)
    setPostVoteInsight(null)
    onVote?.()
  }

  // ═══════════════════════════════════════════
  // POST-VOTE EXPERIENCE — the dopamine moment
  // ═══════════════════════════════════════════
  if (showPostVote && lastSubmission) {
    const hasConsensus = avgRating != null && totalVotes >= 5
    const ratingDiff = hasConsensus ? lastSubmission.rating - avgRating : 0
    const newBadges = postVoteInsight?.newBadges || []
    const nearestBadge = postVoteInsight?.nearestBadge || null

    return (
      <div className="space-y-3 animate-fadeIn">
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>

        {/* Vote confirmed */}
        <div className="text-center">
          <div className="mb-2">
            {lastSubmission.wouldOrderAgain ? <ThumbsUpIcon size={40} /> : <ThumbsDownIcon size={40} />}
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Vote saved!
          </p>
        </div>

        {/* Consensus comparison — "You vs The Crowd" */}
        {hasConsensus && (
          <div
            className="rounded-xl p-3 animate-fadeIn"
            style={{
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-divider)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-center flex-1">
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>You</p>
                <p className="text-lg font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                  {lastSubmission.rating.toFixed(1)}
                </p>
              </div>
              <div className="px-3">
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>vs</span>
              </div>
              <div className="text-center flex-1">
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>Crowd</p>
                <p className="text-lg font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                  {Number(avgRating).toFixed(1)}
                </p>
              </div>
            </div>
            {/* Personality nudge */}
            <p className="text-xs text-center" style={{ color: getComparisonColor(ratingDiff) }}>
              {getComparisonText(ratingDiff)}
            </p>
          </div>
        )}

        {/* Badge unlock celebration */}
        {newBadges.length > 0 && (
          <BadgeUnlockCelebration badges={newBadges} />
        )}

        {/* Progress nudge — "X more → Badge Name" */}
        {nearestBadge && newBadges.length === 0 && (
          <div
            className="rounded-xl px-3 py-2.5 flex items-center gap-3 animate-fadeIn"
            style={{
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-divider)',
            }}
          >
            <div className="flex-shrink-0 text-base" style={{ opacity: 0.7 }}>
              {'\uD83C\uDFC5'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-secondary)' }}>
                  {nearestBadge.remaining} more {nearestBadge.category} vote{nearestBadge.remaining !== 1 ? 's' : ''}
                </p>
                <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color: 'var(--color-accent-gold)' }}>
                  {nearestBadge.badgeName}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min((nearestBadge.current / nearestBadge.target) * 100, 100)}%`,
                    background: 'linear-gradient(90deg, var(--color-accent-gold), var(--color-primary))',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Share CTA */}
        <p className="text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
          Let friends know what's good here
        </p>
        <button
          onClick={handleShareDish}
          className="w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
          style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share this dish
        </button>
        <button
          onClick={handleDismiss}
          className="w-full py-2 text-sm transition-colors"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Not now
        </button>
      </div>
    )
  }

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
            setSliderValue(userRating)
            if (userReviewText) setReviewText(userReviewText)
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

  // Step 1: Rating Slider (slider-first, like Untappd)
  if (step === 1) {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>

        <p className="text-sm font-medium text-center" style={{ color: 'var(--color-text-secondary)' }}>How good was it?</p>

        {localTotalVotes > 0 && (
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--color-success)' }}>
              <ThumbsUpIcon size={22} /> {localYesVotes} <span className="font-normal opacity-80">({yesPercent}%)</span>
            </span>
            <span style={{ color: 'var(--color-divider)' }}>|</span>
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--color-danger)' }}>
              <ThumbsDownIcon size={18} /> {noVotes} <span className="font-normal opacity-80">({noPercent}%)</span>
            </span>
          </div>
        )}

        {localTotalVotes === 0 && (
          <p className="text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>Be the first to rate this dish!</p>
        )}

        {/* Food Rating Slider */}
        <FoodRatingSlider
          value={sliderValue}
          onChange={setSliderValue}
          min={0}
          max={10}
          step={0.1}
          category={category}
        />

        {/* Sign in note when awaiting login */}
        {awaitingLogin && (
          <div className="p-3 rounded-xl text-center" style={{ background: 'var(--color-primary-muted)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
              Sign in to save your rating
            </p>
          </div>
        )}

        <button
          onClick={handleRatingNext}
          className="w-full py-4 px-6 rounded-xl font-semibold shadow-lg transition-all duration-200 ease-out focus-ring active:scale-98 hover:shadow-xl hover:opacity-90"
          style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
        >
          Next
        </button>
      </div>
    )
  }

  // Step 2: Review Prompt
  if (step === 2) {
    const wouldOrderAgain = sliderValue >= 5.0
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between">
          <button onClick={() => setStep(1)} className="text-sm transition-colors flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
            <span>←</span> Back
          </button>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Almost done!</p>
          <div className="w-12" />
        </div>

        {/* Summary of vote */}
        <div className="p-3 rounded-xl flex items-center justify-center gap-4" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
          {wouldOrderAgain ? <ThumbsUpIcon size={28} /> : <ThumbsDownIcon size={28} />}
          <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{sliderValue.toFixed(1)}</span>
        </div>

        <p className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Add a quick review
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleSkipReview}
            disabled={submitting}
            className="py-4 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ease-out focus-ring active:scale-95"
            style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '2px solid var(--color-divider)' }}
          >
            {submitting ? 'Saving...' : 'Skip'}
          </button>
          <button
            onClick={handleWriteReview}
            disabled={submitting}
            className="py-4 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ease-out focus-ring active:scale-95"
            style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
          >
            Write Review
          </button>
        </div>
      </div>
    )
  }

  // Step 3: Write Review
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button onClick={() => setStep(2)} className="text-sm transition-colors flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
          <span>←</span> Back
        </button>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Write your review</p>
        <div className="w-12" />
      </div>

      {/* Review text input */}
      <div className="relative">
        <label htmlFor="review-text" className="sr-only">Your review</label>
        <textarea
          ref={attachToTextarea}
          id="review-text"
          value={reviewText}
          onChange={(e) => {
            setReviewText(e.target.value)
            if (reviewError) setReviewError(null)
          }}
          placeholder="What made this dish great (or not)?"
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
        <div id="review-char-count" className="absolute bottom-2 right-3 text-xs" style={{ color: reviewText.length > MAX_REVIEW_LENGTH ? 'var(--color-danger)' : 'var(--color-text-tertiary)' }}>
          {reviewText.length}/{MAX_REVIEW_LENGTH}
        </div>
      </div>

      {reviewError && (
        <p id="review-error" role="alert" className="text-sm text-center" style={{ color: 'var(--color-danger)' }}>
          {reviewError}
        </p>
      )}

      <button
        onClick={handleSubmitWithReview}
        disabled={submitting || reviewText.length > MAX_REVIEW_LENGTH}
        className={`w-full py-4 px-6 rounded-xl font-semibold shadow-lg transition-all duration-200 ease-out focus-ring
          ${submitting || reviewText.length > MAX_REVIEW_LENGTH ? 'opacity-50 cursor-not-allowed' : 'active:scale-98 hover:shadow-xl'}`}
        style={{ background: 'var(--color-primary)', color: 'white', boxShadow: '0 10px 15px -3px rgba(200, 90, 84, 0.3)' }}
      >
        {submitting ? 'Saving...' : 'Submit Review'}
      </button>

      <button
        onClick={handleSkipReview}
        disabled={submitting}
        className="w-full py-2 text-sm transition-colors"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        Skip and submit without review
      </button>
    </div>
  )
}

// ═══════════════════════════════════════
// Helper: Consensus comparison text
// ═══════════════════════════════════════

function getComparisonText(diff) {
  const absDiff = Math.abs(diff)
  if (absDiff < 0.3) return 'Right with the crowd'
  if (diff > 2.0) return 'Way more generous than most'
  if (diff > 1.0) return 'You rate this higher than most'
  if (diff > 0.3) return 'Slightly above the crowd'
  if (diff < -2.0) return 'Tougher critic than most'
  if (diff < -1.0) return 'You rate this lower than most'
  return 'Slightly below the crowd'
}

function getComparisonColor(diff) {
  const absDiff = Math.abs(diff)
  if (absDiff < 0.3) return 'var(--color-rating)'
  if (diff > 0) return 'var(--color-accent-gold)'
  return 'var(--color-primary)'
}
