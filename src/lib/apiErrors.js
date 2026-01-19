/**
 * API Error Handling Policy
 *
 * ERROR HANDLING RULES:
 * 1. Missing input (no userId, empty query) → Return empty/null early (avoid API call)
 * 2. Database/network errors → THROW (let caller handle with try-catch)
 * 3. "Not found" (PGRST116) → Return null (not an error, just no data)
 * 4. Non-critical reads (counts, optional data) → May return fallback on error
 *
 * CALLERS MUST:
 * - Wrap API calls in try-catch
 * - Show user-friendly error messages
 * - Log errors for debugging
 */

/**
 * Check if an error is a "not found" error (PGRST116)
 * These are not real errors - just empty results
 */
export function isNotFoundError(error) {
  return error?.code === 'PGRST116'
}

/**
 * Check if Supabase is configured
 * Use this to guard API calls that would fail without config
 */
export { isSupabaseConfigured } from './supabase'

/**
 * Standard error wrapper for API calls
 * Logs error and rethrows with consistent format
 */
export function handleApiError(error, context) {
  console.error(`[API Error] ${context}:`, error)

  // Rethrow with context
  const enhancedError = new Error(`${context}: ${error.message || 'Unknown error'}`)
  enhancedError.originalError = error
  enhancedError.code = error.code
  throw enhancedError
}
