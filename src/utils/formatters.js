/**
 * Shared formatting utilities
 */

/**
 * Format a date string as relative time (e.g., "2h ago", "yesterday", "Jan 5")
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted relative time
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  // Guard against invalid dates
  if (isNaN(date.getTime())) return ''
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 1) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return diffMins < 1 ? 'just now' : `${diffMins}m ago`
    }
    return `${diffHours}h ago`
  }
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`

  // For older dates, show absolute date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

/**
 * Format a number with appropriate decimal places
 * @param {number} value - Number to format
 * @param {number} decimals - Max decimal places (default 1)
 * @returns {string} Formatted number
 */
export function formatNumber(value, decimals = 1) {
  if (value === null || value === undefined) return ''
  const num = Number(value)
  if (isNaN(num)) return ''
  return num % 1 === 0 ? String(num) : num.toFixed(decimals)
}
