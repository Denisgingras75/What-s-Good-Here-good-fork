/**
 * Analytics wrapper for PostHog
 *
 * Provides a safe interface that:
 * - No-ops in development (unless VITE_PUBLIC_POSTHOG_KEY is set)
 * - No-ops if PostHog hasn't loaded yet
 * - Avoids static imports that would bundle PostHog into page chunks
 */

// PostHog is initialized in main.jsx and attaches to window
function getPostHog() {
  if (typeof window !== 'undefined' && window.posthog) {
    return window.posthog
  }
  return null
}

/**
 * Capture a custom event
 * @param {string} eventName - Event name (e.g., 'dish_voted')
 * @param {Object} properties - Event properties
 */
export function capture(eventName, properties = {}) {
  const ph = getPostHog()
  if (ph) {
    ph.capture(eventName, properties)
  }
}

/**
 * Identify a user
 * @param {string} userId - Unique user ID
 * @param {Object} properties - User properties
 */
export function identify(userId, properties = {}) {
  const ph = getPostHog()
  if (ph) {
    ph.identify(userId, properties)
  }
}

/**
 * Reset user identity (on logout)
 */
export function reset() {
  const ph = getPostHog()
  if (ph) {
    ph.reset()
  }
}

/**
 * Set user properties without identifying
 * @param {Object} properties - Properties to set
 */
export function setPersonProperties(properties) {
  const ph = getPostHog()
  if (ph) {
    ph.people?.set(properties)
  }
}

/**
 * Check if a feature flag is enabled
 * @param {string} flagName - Feature flag name
 * @returns {boolean} Whether the flag is enabled
 */
export function isFeatureEnabled(flagName) {
  const ph = getPostHog()
  if (ph) {
    return ph.isFeatureEnabled(flagName)
  }
  return false
}
