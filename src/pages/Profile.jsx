import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { isSoundMuted, toggleSoundMute } from '../lib/sounds'

export function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [votes, setVotes] = useState([])
  const [votesLoading, setVotesLoading] = useState(false)
  const [soundMuted, setSoundMuted] = useState(isSoundMuted())
  const [authLoading, setAuthLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)

  // Check auth state
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch user's votes when logged in
  useEffect(() => {
    if (!user) {
      setVotes([])
      return
    }

    async function fetchVotes() {
      setVotesLoading(true)
      const { data, error } = await supabase
        .from('votes')
        .select(`
          id,
          would_order_again,
          rating_10,
          created_at,
          dishes (
            id,
            dish_name,
            restaurants (name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        setVotes(data)
      }
      setVotesLoading(false)
    }

    fetchVotes()
  }, [user])

  const handleToggleSound = () => {
    const newMutedState = toggleSoundMute()
    setSoundMuted(newMutedState)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleGoogleSignIn = async () => {
    setAuthLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) {
      setMessage({ type: 'error', text: error.message })
    }
    setAuthLoading(false)
  }

  const handleEmailSignIn = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    })
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Check your email for a magic link!' })
      setEmail('')
    }
    setAuthLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-4">
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="What's Good Here" className="h-20 w-auto" />
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* User Info or Sign In */}
        {user ? (
          <>
            {/* User Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xl font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 truncate">
                    {user.email}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {votes.length} votes
                  </p>
                </div>
              </div>
            </div>

            {/* My Votes */}
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-100">
                <h2 className="font-semibold text-neutral-900">My Votes</h2>
              </div>

              {votesLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-neutral-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : votes.length > 0 ? (
                <div className="divide-y divide-neutral-100">
                  {votes.map((vote) => (
                    <div key={vote.id} className="px-4 py-3 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        vote.would_order_again
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {vote.would_order_again ? '👍' : '👎'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">
                          {vote.dishes?.dish_name}
                        </p>
                        <p className="text-sm text-neutral-500 truncate">
                          {vote.dishes?.restaurants?.name}
                        </p>
                      </div>
                      {vote.rating_10 && (
                        <div className="text-sm font-semibold text-orange-500">
                          {vote.rating_10}/10
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-neutral-500">
                  <p>No votes yet</p>
                  <p className="text-sm mt-1">Rate some dishes to see them here!</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Sign In Card */
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-neutral-900">Sign in to vote</h2>
              <p className="text-sm text-neutral-500 mt-1">
                Track your votes and help others find great food
              </p>
            </div>

            {message && (
              <div className={`p-3 rounded-lg mb-4 text-sm ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}>
                {message.text}
              </div>
            )}

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-neutral-200 rounded-xl font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-neutral-500">or</span>
              </div>
            </div>

            {/* Email Magic Link */}
            <form onSubmit={handleEmailSignIn}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-xl focus:border-orange-400 focus:bg-white focus:outline-none transition-all mb-3"
              />
              <button
                type="submit"
                disabled={authLoading}
                className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50"
              >
                {authLoading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>
          </div>
        )}

        {/* Settings */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-900">Settings</h2>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                {soundMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-neutral-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                )}
              </div>
              <span className="font-medium text-neutral-900">Bite Sounds</span>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors ${soundMuted ? 'bg-neutral-200' : 'bg-orange-500'}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform mt-1 ${soundMuted ? 'ml-1' : 'ml-6'}`} />
            </div>
          </button>

          {/* Sign Out */}
          {user && (
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors border-t border-neutral-100"
            >
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                </svg>
              </div>
              <span className="font-medium text-red-600">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
