import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import posthog from 'posthog-js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const prevUserRef = useRef(null)

  useEffect(() => {
    // Restore session from localStorage (instant, works offline)
    // This is faster than getUser() which makes a network request
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error restoring session:', error)
      }
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      prevUserRef.current = sessionUser

      if (sessionUser) {
        // Identify user in PostHog (no PII - just auth provider for segmentation)
        posthog.identify(sessionUser.id, {
          auth_provider: sessionUser.app_metadata?.provider || 'unknown',
        })
      }
      setLoading(false)
    })

    // Listen for auth changes (handles token refresh, sign in/out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null

      // Handle different auth events
      if (event === 'SIGNED_IN' && newUser && !prevUserRef.current) {
        // User just signed in
        posthog.identify(newUser.id, {
          auth_provider: newUser.app_metadata?.provider || 'unknown',
        })
        posthog.capture('login_completed', {
          method: newUser.app_metadata?.provider || 'unknown',
        })
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        posthog.capture('logout')
        posthog.reset()
      } else if (event === 'TOKEN_REFRESHED') {
        // Token was refreshed - session is still valid, user stays logged in
        // No action needed, just update state
      }

      setUser(newUser)
      setLoading(false)
      prevUserRef.current = newUser
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
