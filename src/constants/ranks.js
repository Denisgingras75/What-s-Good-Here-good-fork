// Rank definitions — shared by Badges page, Profile hero, and celebration ceremonies
export const RANKS = [
  { title: 'Newcomer', emoji: '\uD83C\uDF31', color: '#6B7280', minBadges: 0, description: 'Just getting started' },
  { title: 'Explorer', emoji: '\uD83E\uDDED', color: '#3B82F6', minBadges: 3, description: 'Beginning the journey' },
  { title: 'Rising Star', emoji: '\uD83C\uDF1F', color: '#10B981', minBadges: 7, description: 'Making your mark' },
  { title: 'Expert', emoji: '\u2B50', color: '#F59E0B', minBadges: 12, description: 'Trusted contributor' },
  { title: 'Legend', emoji: '\uD83D\uDC51', color: '#9333EA', minBadges: 20, description: 'Elite status achieved' },
]

/**
 * Get the rank for a given badge count.
 * Returns the highest rank where badgeCount >= minBadges.
 */
export function getRankForBadgeCount(badgeCount) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (badgeCount >= RANKS[i].minBadges) return RANKS[i]
  }
  return RANKS[0]
}
