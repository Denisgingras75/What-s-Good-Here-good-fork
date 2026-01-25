import { createClient } from '@supabase/supabase-js'
import { logger } from '../utils/logger'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Throw in production if not configured - don't mask the error
if (!isSupabaseConfigured) {
  const message = 'Supabase not configured: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required'
  if (import.meta.env.PROD) {
    throw new Error(`[CRITICAL] ${message}`)
  } else {
    logger.error(`[DEV] ${message} - App will not function correctly!`)
  }
}

// SECURITY: In-memory storage for auth tokens
// ===========================================
// Tokens are stored in memory only, not localStorage/sessionStorage.
// This prevents XSS attacks from stealing auth tokens.
//
// Trade-off: Users must re-login after page refresh or closing the tab.
// This is acceptable for a food discovery app where security > convenience.
//
// The in-memory store implements the Web Storage API interface.
const inMemoryStorage = (() => {
  const store = new Map()
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  }
})()

// Create client with in-memory auth storage
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      storage: inMemoryStorage,
      storageKey: 'whats-good-here-auth',
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
)
