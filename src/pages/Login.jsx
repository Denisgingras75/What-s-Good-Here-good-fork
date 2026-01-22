import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { WelcomeSplash } from '../components/WelcomeSplash'

const REMEMBERED_EMAIL_KEY = 'whats-good-here-email'

export function Login() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [splashComplete, setSplashComplete] = useState(false)
  const [showLogin, setShowLogin] = useState(false) // Controls welcome vs login view

  // Load remembered email on mount
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY)
      if (savedEmail) {
        setEmail(savedEmail)
        setShowEmailForm(true) // Auto-expand if we have a saved email
      }
    } catch (error) {
      console.warn('Login: unable to read remembered email', error)
    }
  }, [])

  // Don't auto-redirect logged in users - let them see the welcome page
  // They can click "Get Started" to go to homepage

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      await authApi.signInWithGoogle()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
    }
  }

  const handleMagicLink = async (event) => {
    event.preventDefault()
    try {
      setLoading(true)
      // Remember the email for next time
      try {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email)
      } catch (error) {
        console.warn('Login: unable to persist remembered email', error)
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
    <>
      {/* Animated Welcome Splash */}
      <WelcomeSplash onComplete={() => setSplashComplete(true)} />

      {/* Content - fades in after splash */}
      <div
        className={`min-h-screen flex flex-col transition-opacity duration-500 ${splashComplete ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'var(--color-surface)' }}
      >
        {/* Header */}
        <header className="px-4 pt-6 pb-4">
          <button
            onClick={() => showLogin ? setShowLogin(false) : navigate('/')}
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </header>

        {!showLogin ? (
          /* ========== WELCOME / SPLASH PAGE ========== */
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
            {/* Logo */}
            <img
              src="/wgh-splash.png"
              alt="What's Good Here"
              className="w-64 md:w-72 h-auto mb-8"
            />

            {/* Goals Section */}
            <div className="w-full max-w-sm mb-8">
              <h2 className="text-xl font-bold text-center mb-6" style={{ color: 'var(--color-text-primary)' }}>
                Our Goals
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--color-primary)', color: '#1A1A1A' }}
                  >
                    <span className="font-bold">1</span>
                  </div>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Help you find <strong style={{ color: 'var(--color-text-primary)' }}>the best dishes</strong> on Martha's Vineyard
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--color-primary)', color: '#1A1A1A' }}
                  >
                    <span className="font-bold">2</span>
                  </div>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Let you <strong style={{ color: 'var(--color-text-primary)' }}>order confidently</strong> at any restaurant you're at
                  </p>
                </div>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="w-full max-w-sm mb-8 p-4 rounded-2xl" style={{ background: 'var(--color-bg)' }}>
              <h3 className="font-semibold text-center mb-4" style={{ color: 'var(--color-text-primary)' }}>
                How We Rate
              </h3>
              <div className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">👍👎</span>
                  <p><strong style={{ color: 'var(--color-text-primary)' }}>Would you order it again?</strong> Quick yes or no vote</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">⭐</span>
                  <p><strong style={{ color: 'var(--color-text-primary)' }}>Rate 1-10</strong> for more detail on how good it was</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">📸</span>
                  <p><strong style={{ color: 'var(--color-text-primary)' }}>Snap a photo</strong> — yours could become the featured image! If not, it'll still show in the community gallery.</p>
                </div>
              </div>
            </div>

            {/* Get Started Button - goes to homepage */}
            <button
              onClick={() => navigate('/')}
              className="w-full max-w-sm px-6 py-4 rounded-xl font-bold text-lg active:scale-[0.98] transition-all"
              style={{ background: 'var(--color-primary)', color: '#1A1A1A' }}
            >
              Get Started
            </button>

            {/* Sign in option */}
            <button
              onClick={() => setShowLogin(true)}
              className="mt-4 text-sm font-medium"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Already have an account? Sign in
            </button>
          </div>
        ) : (
          /* ========== LOGIN PAGE ========== */
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
            {/* Logo */}
            <img
              src="/wgh-splash.png"
              alt="What's Good Here"
              className="w-40 h-auto mb-6"
            />

            {/* Heading */}
            <h1 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Sign in to vote
            </h1>
            <p className="text-center text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
              Help others find the best dishes
            </p>

            {/* Messages */}
            {message && (
              <div
                className="w-full max-w-sm mb-4 p-4 rounded-xl text-sm font-medium"
                style={message.type === 'error'
                  ? { background: 'color-mix(in srgb, var(--color-danger) 15%, var(--color-surface-elevated))', color: 'var(--color-danger)', border: '1px solid color-mix(in srgb, var(--color-danger) 30%, transparent)' }
                  : { background: 'color-mix(in srgb, var(--color-success) 15%, var(--color-surface-elevated))', color: 'var(--color-success)', border: '1px solid color-mix(in srgb, var(--color-success) 30%, transparent)' }
                }
              >
                {message.text}
              </div>
            )}

            <div className="w-full max-w-sm space-y-3">
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold active:scale-[0.98] transition-all disabled:opacity-50"
                style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', border: '2px solid var(--color-divider)' }}
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
                <div className="flex-1 h-px" style={{ background: 'var(--color-divider)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>or</span>
                <div className="flex-1 h-px" style={{ background: 'var(--color-divider)' }} />
              </div>

              {/* Magic Link */}
              {!showEmailForm ? (
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="w-full px-6 py-4 rounded-xl font-semibold transition-all"
                  style={{ color: 'var(--color-text-secondary)', background: 'var(--color-bg)', border: '1px solid var(--color-divider)' }}
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
            <p className="mt-6 text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
              By continuing, you agree to our{' '}
              <a href="/terms" className="underline">Terms</a>
              {' '}and{' '}
              <a href="/privacy" className="underline">Privacy Policy</a>
            </p>
          </div>
        )}
      </div>
    </>
  )
}
