import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { useAuth } from '../context/AuthContext'

const REMEMBERED_EMAIL_KEY = 'whats-good-here-email'

export function Login() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [showEmailForm, setShowEmailForm] = useState(false)

  // Load remembered email on mount
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY)
      if (savedEmail) {
        setEmail(savedEmail)
        setShowEmailForm(true) // Auto-expand if we have a saved email
      }
    } catch (e) {
      // localStorage not available
    }
  }, [])

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      await authApi.signInWithGoogle()
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
      } catch (e) {
        // localStorage not available
      }
      await authApi.signInWithMagicLink(email)
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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-surface)' }}>
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {/* Logo */}
        <img
          src="/logo.png"
          alt="What's Good Here"
          className="h-20 w-auto mb-8"
        />

        {/* Heading */}
        <h1 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Sign in to vote
        </h1>
        <p className="text-center mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          Help others discover the best dishes on Martha's Vineyard
        </p>

        {/* Messages */}
        {message && (
          <div
            className={`w-full max-w-sm mb-6 p-4 rounded-xl text-sm font-medium ${
              message.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="w-full max-w-sm space-y-4">
          {/* Google Sign In - Primary */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-neutral-200 rounded-xl font-semibold text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98] transition-all disabled:opacity-50"
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
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
              or
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-divider)' }} />
          </div>

          {/* Magic Link Option */}
          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full px-6 py-4 rounded-xl font-semibold transition-all hover:bg-neutral-100"
              style={{
                color: 'var(--color-text-secondary)',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-divider)'
              }}
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
                className="w-full px-4 py-3 bg-white border-2 border-neutral-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors placeholder:text-neutral-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                style={{ background: 'var(--color-primary)' }}
              >
                {loading ? 'Sending...' : 'Send magic link'}
              </button>
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="w-full text-sm py-2"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
          By continuing, you agree to our{' '}
          <a href="/terms" className="underline hover:text-neutral-600">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="underline hover:text-neutral-600">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
