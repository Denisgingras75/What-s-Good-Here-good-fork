import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use placeholder values if env vars are missing (for development preview)
const url = supabaseUrl || 'https://placeholder.supabase.co'
const key = supabaseAnonKey || 'placeholder-key'

export const supabase = createClient(url, key, {
  auth: {
    // Session persistence - stores auth tokens in localStorage
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'whats-good-here-auth',

    // Token refresh - automatically refreshes tokens before they expire
    autoRefreshToken: true,

    // OAuth redirect handling - detects tokens in URL after OAuth redirect
    detectSessionInUrl: true,
  }
})

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)
