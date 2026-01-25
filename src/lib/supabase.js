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

// Create client - require real config (no silent placeholders)
//
// SECURITY NOTE: Session tokens stored in localStorage
// =====================================================
// Supabase SDK stores auth tokens in localStorage for session persistence.
// This is accessible to JavaScript - an XSS attack could steal tokens.
//
// Why not in-memory storage?
// - Would require re-login on every page load/refresh
// - Breaks user experience for a food discovery app
//
// Required mitigations (configure in Vercel/hosting):
// 1. Content Security Policy (CSP) headers:
//    - script-src 'self' - block inline scripts and external scripts
//    - style-src 'self' 'unsafe-inline' - allow Tailwind
//    - connect-src 'self' https://*.supabase.co - restrict API calls
//    - frame-ancestors 'none' - prevent clickjacking
//
// 2. Other security headers:
//    - X-Content-Type-Options: nosniff
//    - X-Frame-Options: DENY
//    - Referrer-Policy: strict-origin-when-cross-origin
//
// 3. App-level protections (already implemented):
//    - Input sanitization (src/utils/sanitize.js)
//    - autoRefreshToken: true (short-lived tokens)
//    - No PII stored in localStorage (email removed from login forms)
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
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
