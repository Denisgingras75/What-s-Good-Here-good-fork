import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useProfile } from '../../hooks/useProfile'
import { CategoryPicker } from '../CategoryPicker'
import { HeartIcon } from '../HeartIcon'
import { ThumbsUpIcon } from '../ThumbsUpIcon'
import { ThumbsDownIcon } from '../ThumbsDownIcon'
import { capture } from '../../lib/analytics'

const STEPS = [
  {
    id: 'welcome',
    image: '/wgh-icon.png',
    title: 'Find the best dishes on Martha\'s Vineyard',
    subtitle: 'Real ratings from locals & visitors like you',
    description: 'No more guessing. See what\'s actually worth ordering.',
  },
  {
    id: 'how-it-works',
    emoji: null,
    icon: 'thumbsUp',
    title: 'Vote on dishes you\'ve tried',
    subtitle: 'Good Here or Not Good — it\'s that simple',
    description: 'Rate 1-10, and watch dishes climb the rankings as the community votes.',
  },
  {
    id: 'name',
    emoji: '👋',
    title: 'Enter your name',
    subtitle: 'Join the community',
    description: 'Friends can find you by your name',
  },
  {
    id: 'favorites',
    emoji: null,
    icon: 'heart',
    title: 'Choose up to 3 favorites',
    subtitle: 'See your personalized "My Top 10" on the home screen',
    description: null,
  },
]

export function WelcomeModal() {
  const { user } = useAuth()
  const { profile, updateProfile, loading } = useProfile(user?.id)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Show modal when user is logged in but hasn't completed onboarding
  useEffect(() => {
    if (user && !loading && profile) {
      // Show only if user hasn't completed onboarding
      if (!profile.has_onboarded) {
        setIsOpen(true)
        capture('onboarding_started')
      }
    }
  }, [user, profile, loading])

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  // Handle name step submission - moves to favorites
  const handleNameSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    // Save name and move to favorites step
    await updateProfile({ display_name: name.trim() })
    setStep(step + 1)
  }

  const handleSkipName = () => {
    // Move to favorites without setting name
    setStep(step + 1)
  }

  // Final submit on favorites step
  const handleFinish = async () => {
    setSaving(true)
    await updateProfile({
      has_onboarded: true,
      preferred_categories: selectedCategories,
    })
    capture('onboarding_completed', {
      name_set: !!name.trim(),
      categories_selected: selectedCategories.length,
      categories: selectedCategories,
    })
    setSaving(false)
    setIsOpen(false)
  }

  const handleSkipFavorites = async () => {
    setSaving(true)
    await updateProfile({ has_onboarded: true })
    capture('onboarding_completed', {
      name_set: !!name.trim(),
      categories_selected: 0,
    })
    setSaving(false)
    setIsOpen(false)
  }

  if (!isOpen) return null

  const currentStep = STEPS[step]
  const isNameStep = currentStep.id === 'name'
  const isFavoritesStep = currentStep.id === 'favorites'

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm pointer-events-none" />

      {/* Modal */}
      <div
        className="relative z-10 rounded-3xl max-w-md w-full shadow-xl overflow-hidden"
        style={{ animationDelay: '0.1s', background: '#1A1A1A' }}
      >
        {/* Decorative gradient header */}
        <div className="h-2" style={{ background: 'var(--color-primary)' }} />

        <div className="p-8">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => i < step && setStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step
                    ? 'w-6'
                    : i < step
                      ? 'cursor-pointer'
                      : ''
                }`}
                style={{
                  background: i === step
                    ? 'var(--color-primary)'
                    : i < step
                      ? 'var(--color-primary-muted, rgba(244, 122, 31, 0.5))'
                      : 'var(--color-divider)'
                }}
                disabled={i > step}
              />
            ))}
          </div>

          {/* Step icon */}
          {currentStep.image ? (
            <div className="w-24 h-24 mx-auto mb-6">
              <img src={currentStep.image} alt="" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg transition-all"
              style={{ background: 'var(--color-primary)' }}
            >
              {currentStep.id === 'favorites' ? <HeartIcon size={56} /> : currentStep.icon === 'thumbsUp' ? <ThumbsUpIcon size={52} /> : <span className="text-4xl">{currentStep.emoji}</span>}
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {currentStep.title}
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {currentStep.subtitle}
            </p>
            {currentStep.description && (
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                {currentStep.description}
              </p>
            )}
          </div>

          {/* How it works visual - only on step 2 */}
          {currentStep.id === 'how-it-works' && (
            <div className="flex justify-center gap-4 mb-6">
              <div className="flex flex-col items-center p-3 rounded-xl" style={{ background: 'rgba(107, 179, 132, 0.15)' }}>
                <span className="text-2xl mb-1"><ThumbsUpIcon size={32} /></span>
                <span className="text-xs font-medium" style={{ color: 'var(--color-rating)' }}>Good Here</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl" style={{ background: 'rgba(200, 90, 84, 0.15)' }}>
                <span className="text-2xl mb-1"><ThumbsDownIcon size={32} /></span>
                <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>Not Good</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                <span className="text-2xl mb-1">⭐</span>
                <span className="text-xs font-medium text-amber-400">Rate 1-10</span>
              </div>
            </div>
          )}

          {/* Name input step */}
          {isNameStep ? (
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoFocus
                maxLength={50}
                className="w-full px-4 py-4 border-2 rounded-xl text-lg text-center focus:outline-none transition-colors"
                style={{
                  background: 'var(--color-bg)',
                  borderColor: 'var(--color-divider)',
                  color: 'var(--color-text-primary)',
                }}
              />
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full px-6 py-4 text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                style={{ background: 'var(--color-primary)' }}
              >
                Continue
              </button>
              <button
                type="button"
                onClick={handleSkipName}
                className="w-full py-2 text-sm transition-colors"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Skip for now
              </button>
            </form>
          ) : isFavoritesStep ? (
            <div className="space-y-4">
              <CategoryPicker
                selectedCategories={selectedCategories}
                onSelectionChange={setSelectedCategories}
                showHeader={false}
              />
              <button
                onClick={handleFinish}
                disabled={saving}
                className="w-full px-6 py-4 font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                style={{ background: 'var(--color-primary)', color: '#1A1A1A' }}
              >
                {saving ? 'Saving...' : selectedCategories.length > 0 ? "Let's go! 🎉" : "Let's go!"}
              </button>
              <button
                type="button"
                onClick={handleSkipFavorites}
                disabled={saving}
                className="w-full py-2 text-sm transition-colors"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Skip for now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleNext}
                className="w-full px-6 py-4 font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
                style={{ background: 'var(--color-primary)', color: '#1A1A1A' }}
              >
                Next
              </button>
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="w-full py-2 text-sm transition-colors"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Back
                </button>
              )}
            </div>
          )}

          {/* Fun footer text */}
          {!isNameStep && (
            <p className="mt-6 text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              {step === 0 && "Trusted by island food lovers"}
              {step === 1 && "Dishes need 5+ votes to get ranked"}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
