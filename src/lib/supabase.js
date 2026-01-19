import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Warn in development, error in production if not configured
if (!isSupabaseConfigured) {
  const message = 'Supabase not configured: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required'
  if (import.meta.env.PROD) {
    console.error(`[CRITICAL] ${message}`)
  } else {
    console.warn(`[DEV] ${message} - Some features will not work`)
  }
}

// Create client (will fail gracefully if not configured)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'whats-good-here-auth',
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
)
