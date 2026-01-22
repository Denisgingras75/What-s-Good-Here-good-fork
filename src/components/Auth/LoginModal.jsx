import { useState, useEffect } from 'react'
import { authApi } from '../../api'
import { getPendingVoteFromStorage } from '../ReviewFlow'

const REMEMBERED_EMAIL_KEY = 'whats-good-here-email'

export function LoginModal({ isOpen, onClose, pendingAction = null }) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [showEmailForm, setShowEmailForm] = useState(false)

  // Check for pending vote from storage
  const pendingVote = getPendingVoteFromStorage()
  const hasPendingVote = pendingVote !== null

  // Load remembered email when modal opens
  useEffect(() => {
    if (isOpen) {
      try {
        const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY)
        if (savedEmail) {
          setEmail(savedEmail)
          setShowEmailForm(true) // Auto-expand if we have a saved email
        }
      } catch (error) {
        // localStorage not available
        console.warn('LoginModal: unable to read remembered email', error)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)

      // Build redirect URL with pending dish ID
      const redirectUrl = new URL(window.location.href)
      const pending = getPendingVoteFromStorage()
      if (pending?.dishId) {
        redirectUrl.searchParams.set('votingDish', pending.dishId)
      }

      await authApi.signInWithGoogle(redirectUrl.toString())
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
    }
  }

  const handleMagicLink = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)

      // Remember the email for next time
      try {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email)
      } catch (error) {
        // localStorage not available
        console.warn('LoginModal: unable to persist remembered email', error)
      }

      // Build redirect URL with pending dish ID so we can reopen the modal after login
      const redirectUrl = new URL(window.location.href)
      const pending = getPendingVoteFromStorage()
      if (pending?.dishId) {
        redirectUrl.searchParams.set('votingDish', pending.dishId)
      }

      await authApi.signInWithMagicLink(email, redirectUrl.toString())

      setMessage({
        type: 'success',
        text: 'Check your email for the login link!',
      })
      // Don't clear email - keep it visible so they know where to check
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fade-in-up"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative rounded-3xl max-w-md w-full shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animationDelay: '0.1s', background: 'var(--color-surface-elevated)' }}
      >
        {/* Decorative gradient header */}
        <div className="h-2" style={{ background: 'var(--color-primary)' }} />

        <div className="p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center transition-colors focus-ring"
            style={{ background: 'var(--color-divider)', color: 'var(--color-text-secondary)' }}
            aria-label="Close"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          {/* Icon - shows pending vote if exists */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: hasPendingVote ? (pendingVote.vote ? '#10b981' : '#ef4444') : 'var(--color-primary)' }}>
            <span className="text-3xl">{hasPendingVote ? (pendingVote.vote ? '👍' : '👎') : '🍽️'}</span>
          </div>

          {/* Header - contextual based on pending action */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {hasPendingVote ? 'Sign in to save your vote' : 'Sign in to vote'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {hasPendingVote
                ? `Your ${pendingVote.vote ? '"Yes"' : '"No"'} vote is ready — just sign in to record it`
                : 'Join the community and help others discover the best dishes'
              }
            </p>
          </div>

          {/* Messages */}
          {message && (
            <div
              className="mb-6 p-4 rounded-xl text-sm font-medium"
              style={message.type === 'error'
                ? { background: 'color-mix(in srgb, var(--color-danger) 15%, var(--color-bg))', color: 'var(--color-danger)' }
                : { background: 'color-mix(in srgb, var(--color-success) 15%, var(--color-bg))', color: 'var(--color-success)' }
              }
            >
              {message.text}
            </div>
          )}

          {/* Auth Options */}
          <div className="space-y-4">
            {/* Google Sign In - Primary */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold active:scale-[0.98] transition-all disabled:opacity-50"
              style={{ background: 'var(--color-bg)', border: '2px solid var(--color-divider)', color: 'var(--color-text-primary)' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px" style={{ background: 'var(--color-divider)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'var(--color-divider)' }} />
            </div>

            {/* Magic Link Option */}
            {!showEmailForm ? (
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full px-6 py-4 rounded-xl font-semibold active:scale-[0.98] transition-all"
                style={{ background: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}
              >
                Sign in with email
              </button>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl focus:outline-none transition-colors"
                  style={{ background: 'var(--color-bg)', border: '2px solid var(--color-divider)', color: 'var(--color-text-primary)' }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                  style={{ background: 'var(--color-primary)', color: '#1A1A1A' }}
                >
                  {loading ? 'Sending...' : 'Send magic link'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailForm(false)
                    setMessage(null)
                  }}
                  className="w-full text-sm py-2"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <p className="mt-6 text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
            By continuing, you agree to our{' '}
            <a href="/terms" className="underline" style={{ color: 'var(--color-text-secondary)' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="underline" style={{ color: 'var(--color-text-secondary)' }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}
