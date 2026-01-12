import { useState, useEffect } from 'react'
import { useVote } from '../hooks/useVote'
import { supabase } from '../lib/supabase'
import { PizzaRatingSlider } from './PizzaRatingSlider'

export function ReviewFlow({ dishId, dishName, totalVotes = 0, yesVotes = 0, onVote, onLoginRequired }) {
  const { submitVote, submitting } = useVote()
  const [user, setUser] = useState(null)
  const [userVote, setUserVote] = useState(null)
  const [userRating, setUserRating] = useState(null)

  const [localTotalVotes, setLocalTotalVotes] = useState(totalVotes)
  const [localYesVotes, setLocalYesVotes] = useState(yesVotes)

  // Flow: 1 = yes/no, 2 = rating, 3 = preview/confirm
  const [step, setStep] = useState(1)
  const [pendingVote, setPendingVote] = useState(null)
  const [sliderValue, setSliderValue] = useState(0)

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationType, setConfirmationType] = useState(null)

  const noVotes = localTotalVotes - localYesVotes
  const yesPercent = localTotalVotes > 0 ? Math.round((localYesVotes / localTotalVotes) * 100) : 0
  const noPercent = localTotalVotes > 0 ? 100 - yesPercent : 0

  useEffect(() => {
    setLocalTotalVotes(totalVotes)
    setLocalYesVotes(yesVotes)
  }, [totalVotes, yesVotes])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    async function fetchUserVote() {
      if (!user) {
        setUserVote(null)
        setUserRating(null)
        return
      }
      const { data } = await supabase
        .from('votes')
        .select('would_order_again, rating_10')
        .eq('dish_id', dishId)
        .eq('user_id', user.id)
        .single()
      if (data) {
        setUserVote(data.would_order_again)
        setUserRating(data.rating_10)
        if (data.rating_10) setSliderValue(data.rating_10)
      }
    }
    fetchUserVote()
  }, [dishId, user])

  const handleVoteClick = (wouldOrderAgain) => {
    setConfirmationType(wouldOrderAgain ? 'yes' : 'no')
    setShowConfirmation(true)
    setPendingVote(wouldOrderAgain)

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
      setStep(1)
      setPendingVote(null)
      onVote?.()
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
            <span className="text-xl font-bold text-emerald-700">{Number(userRating).toFixed(1)}/10</span>
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
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-neutral-600 text-center">Would you order this again?</p>
        {localTotalVotes > 0 ? (
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span>👍</span> {localYesVotes} <span className="text-emerald-500 font-normal">({yesPercent}%)</span>
            </span>
            <span className="text-neutral-300">|</span>
            <span className="flex items-center gap-1.5 text-red-500 font-semibold">
              <span>👎</span> {noVotes} <span className="text-red-400 font-normal">({noPercent}%)</span>
            </span>
          </div>
        ) : (
          <p className="text-xs text-neutral-400 text-center">No votes yet — be the first!</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleVoteClick(true)}
            disabled={showConfirmation}
            className={`relative overflow-hidden flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ease-out focus-ring active:scale-95
              ${showConfirmation && confirmationType === 'yes'
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                : 'bg-white text-neutral-700 border-2 border-neutral-200 hover:border-emerald-400 hover:bg-emerald-50 shadow-sm'}`}
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
            className={`relative overflow-hidden flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ease-out focus-ring active:scale-95
              ${showConfirmation && confirmationType === 'no'
                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 scale-105'
                : 'bg-white text-neutral-700 border-2 border-neutral-200 hover:border-red-400 hover:bg-red-50 shadow-sm'}`}
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
          <button onClick={() => setStep(1)} className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors flex items-center gap-1">
            <span>←</span> Back
          </button>
          <p className="text-sm font-medium text-neutral-600">Rate this dish</p>
          <div className="w-12" />
        </div>

        {/* Pizza Rating Slider */}
        <PizzaRatingSlider
          value={sliderValue}
          onChange={setSliderValue}
          min={0}
          max={10}
          step={0.1}
        />

        <button
          onClick={handleRatingNext}
          className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 transition-all duration-200 ease-out focus-ring active:scale-98 hover:shadow-xl"
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
            <span className="text-sm font-bold text-neutral-700">{sliderValue.toFixed(1)}/10</span>
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
        {submitting ? 'Submitting...' : 'Submit Review'}
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
