/**
 * Calculate "% Worth It" rating (reorder percentage)
 * @param {number} yesVotes - Number of "Would order again" votes
 * @param {number} totalVotes - Total number of votes
 * @returns {number} Percentage (0-100)
 */
export function calculatePercentWorthIt(yesVotes, totalVotes) {
  if (totalVotes === 0) return 0
  return Math.round((yesVotes / totalVotes) * 100)
}

/**
 * Calculate Worth-It Score on 1-10 scale (derived from reorder %)
 * @param {number} reorderPercent - Percentage who would reorder (0-100)
 * @returns {number} Score on 1-10 scale
 */
export function calculateWorthItScore10(reorderPercent) {
  return reorderPercent / 10
}

/**
 * Format a score to one decimal place
 * @param {number} score - The score to format
 * @returns {string} Formatted score (e.g., "8.4", "9.0", "7.1")
 */
export function formatScore10(score) {
  if (score === null || score === undefined) return '—'
  return Number(score).toFixed(1)
}

/**
 * Get Worth-It badge based on score and vote count
 * @param {number} worthItScore10 - Worth-It score on 1-10 scale
 * @param {number} totalVotes - Total number of votes
 * @returns {Object} { show: boolean, emoji: string, label: string }
 */
export function getWorthItBadge(worthItScore10, totalVotes) {
  // Not enough votes
  if (totalVotes < 10) {
    return {
      show: false,
      emoji: '📊',
      label: 'Not enough votes yet',
    }
  }

  // Determine emoji and label based on score
  if (worthItScore10 >= 9.5) {
    return { show: true, emoji: '🏆', label: 'The Best' }
  }
  if (worthItScore10 >= 9.0) {
    return { show: true, emoji: '⭐', label: 'Exceptional' }
  }
  if (worthItScore10 >= 8.5) {
    return { show: true, emoji: '🔥', label: 'Great Here' }
  }
  if (worthItScore10 >= 8.0) {
    return { show: true, emoji: '✅', label: 'Good Here' }
  }
  if (worthItScore10 >= 7.0) {
    return { show: true, emoji: '👍', label: 'Decent Here' }
  }
  if (worthItScore10 >= 6.0) {
    return { show: true, emoji: '😐', label: 'Not Bad' }
  }
  if (worthItScore10 >= 5.0) {
    return { show: true, emoji: '🤷', label: 'Iffy' }
  }
  return { show: true, emoji: '❌', label: 'Skip This' }
}

/**
 * Get confidence level based on vote count
 * @param {number} totalVotes - Total number of votes
 * @returns {'none' | 'low' | 'medium' | 'high'}
 */
export function getConfidenceLevel(totalVotes) {
  if (totalVotes === 0) return 'none'
  if (totalVotes < 10) return 'low'
  if (totalVotes < 20) return 'medium'
  return 'high'
}

/**
 * Get confidence indicator text and styling
 * @param {number} totalVotes - Total number of votes
 * @returns {Object} Confidence info object
 */
export function getConfidenceIndicator(totalVotes) {
  const level = getConfidenceLevel(totalVotes)

  const indicators = {
    none: {
      level: 'none',
      text: 'No votes yet — be the first!',
      icon: null,
      color: 'gray',
      className: 'text-neutral-500',
    },
    low: {
      level: 'low',
      text: `Not enough votes yet (${totalVotes} ${totalVotes === 1 ? 'vote' : 'votes'})`,
      icon: '📊',
      color: 'yellow',
      className: 'text-yellow-600 border-yellow-300 bg-yellow-50',
    },
    medium: {
      level: 'medium',
      text: `${totalVotes} votes`,
      icon: null,
      color: 'gray',
      className: 'text-gray-600',
    },
    high: {
      level: 'high',
      text: `${totalVotes} votes`,
      icon: '✓',
      color: 'green',
      className: 'text-green-600 border-green-300 bg-green-50',
    },
  }

  return indicators[level]
}
