import { useNavigate } from 'react-router-dom'
import { RANKS, getRankForBadgeCount } from '../../constants/ranks'
import { TIER_DESCRIPTIONS } from '../../constants/categories'
import { calculateArchetype, getArchetypeById } from '../../utils/calculateArchetype'

/**
 * Hero Identity Card for the Profile page
 * Shows user avatar, name, follow stats, primary title, and near-term goal
 *
 * Props:
 * - user: Auth user object
 * - profile: User profile data
 * - stats: User statistics (categoryTiers, categoryProgress, totalVotes, ratingPersonality)
 * - badges: User badges array
 * - followCounts: { followers, following }
 * - editingName: Boolean for name edit mode
 * - newName: Current value in name edit input
 * - nameStatus: 'checking' | 'available' | 'taken' | 'same' | null
 * - setEditingName: Setter for edit mode
 * - setNewName: Setter for name value
 * - setNameStatus: Setter for name status
 * - handleSaveName: Callback to save name
 * - setFollowListModal: Setter to open follow list modal
 */
export function HeroIdentityCard({
  user,
  profile,
  stats,
  badges,
  followCounts,
  ratingIdentity,
  editingName,
  newName,
  nameStatus,
  setEditingName,
  setNewName,
  setNameStatus,
  handleSaveName,
  setFollowListModal,
}) {
  const navigate = useNavigate()

  // Derive primary identity title from highest tier or rating personality
  const getPrimaryTitle = () => {
    if (stats.categoryTiers.length > 0) {
      const highestTier = stats.categoryTiers[0]
      return `${highestTier.label} ${highestTier.title}`
    }
    if (stats.ratingPersonality) {
      return stats.ratingPersonality.title
    }
    return 'Food Explorer'
  }

  // Calculate badges earned
  const unlockedBadges = badges?.filter(b => b.unlocked) || []
  const badgeCount = unlockedBadges.length

  // Calculate rank
  const currentRank = getRankForBadgeCount(badgeCount)

  // Calculate archetype
  const archetypeResult = calculateArchetype(stats, ratingIdentity, followCounts)
  const archetype = archetypeResult.id ? getArchetypeById(archetypeResult.id) : null

  // Top category for expertise progress
  const topProgress = stats.categoryProgress.length > 0 ? stats.categoryProgress[0] : null
  const topTier = stats.categoryTiers.length > 0 ? stats.categoryTiers[0] : null
  const expertiseCategory = topProgress || topTier
  const isCloseToNextTier = topProgress && topProgress.votesNeeded <= 3

  return (
    <div
      className="relative px-4 pt-8 pb-6 overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 90% 50% at 20% 0%, ${currentRank.color}08 0%, transparent 70%),
          radial-gradient(ellipse 70% 60% at 80% 100%, rgba(217, 167, 101, 0.04) 0%, transparent 70%),
          var(--color-bg)
        `,
      }}
    >
      {/* Bottom divider */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px"
        style={{
          width: '90%',
          background: 'linear-gradient(90deg, transparent, var(--color-divider), transparent)',
        }}
      />

      {/* Avatar + Name row */}
      <div className="flex items-center gap-4">
        {/* Avatar with rank-colored ring */}
        <div className="relative flex-shrink-0">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
            style={{
              background: 'var(--color-primary)',
              boxShadow: `0 4px 20px -4px ${currentRank.color}60, 0 0 0 ${badgeCount >= 5 ? '4px' : badgeCount >= 1 ? '3px' : '2px'} ${currentRank.color}30`,
            }}
          >
            {profile?.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
          </div>
          {/* Rank emoji badge */}
          {badgeCount >= 1 && (
            <div
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-md"
              style={{ background: currentRank.color, border: '2px solid var(--color-bg)' }}
            >
              {currentRank.emoji}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Display Name */}
          {editingName ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value.replace(/\s/g, ''))}
                    className="w-full px-3 py-1.5 border rounded-lg text-lg font-bold focus:outline-none pr-8"
                    style={{
                      background: 'var(--color-surface-elevated)',
                      borderColor: nameStatus === 'taken' ? '#ef4444' : nameStatus === 'available' ? '#10b981' : 'var(--color-divider)',
                      color: 'var(--color-text-primary)'
                    }}
                    autoFocus
                    maxLength={30}
                  />
                  {nameStatus && nameStatus !== 'same' && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm">
                      {nameStatus === 'checking' && '\u23F3'}
                      {nameStatus === 'available' && '\u2713'}
                      {nameStatus === 'taken' && '\u2717'}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSaveName}
                  disabled={nameStatus === 'taken' || nameStatus === 'checking'}
                  className="px-3 py-1.5 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  style={{ background: 'var(--color-primary)' }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingName(false)
                    setNewName(profile?.display_name || '')
                    setNameStatus(null)
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Cancel
                </button>
              </div>
              {nameStatus === 'taken' && (
                <p className="text-xs" style={{ color: '#ef4444' }}>This username is already taken</p>
              )}
              {nameStatus === 'available' && (
                <p className="text-xs" style={{ color: '#10b981' }}>Username available!</p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="font-bold transition-colors flex items-center gap-2"
              style={{
                color: 'var(--color-text-primary)',
                fontSize: '22px',
                letterSpacing: '-0.02em',
                lineHeight: '1.2',
              }}
            >
              {profile?.display_name || 'Set your name'}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0 text-[color:var(--color-text-tertiary)]">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>
            </button>
          )}

          {/* Follow Stats */}
          <div className="flex items-center gap-2 mt-1.5" style={{ fontSize: '13px' }}>
            <button
              onClick={() => setFollowListModal('followers')}
              className="hover:underline transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {followCounts.followers}
              </span> followers
            </button>
            <span style={{ color: 'var(--color-text-tertiary)' }}>&middot;</span>
            <button
              onClick={() => setFollowListModal('following')}
              className="hover:underline transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {followCounts.following}
              </span> following
            </button>
          </div>
        </div>
      </div>

      {/* Rank Title + Archetype */}
      <div className="mt-5">
        {/* Rank name */}
        <h2
          className="font-bold"
          style={{
            color: currentRank.color,
            fontSize: '17px',
            letterSpacing: '-0.01em',
          }}
        >
          {currentRank.emoji} {currentRank.title}
        </h2>

        {/* Category title */}
        <p
          className="font-bold mt-0.5"
          style={{
            color: 'var(--color-primary)',
            fontSize: '15px',
          }}
        >
          {getPrimaryTitle()}
        </p>

        {/* Archetype subtitle */}
        {archetype && archetypeResult.confidence === 'established' && (
          <p className="mt-1 font-medium" style={{ color: archetype.color, fontSize: '13px' }}>
            {archetype.emoji} {archetype.label}
          </p>
        )}
        {archetype && archetypeResult.confidence === 'emerging' && (
          <p className="mt-1" style={{ color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
            trending toward {archetype.label.replace('The ', '')}
          </p>
        )}
      </div>

      {/* Compact Stats Row */}
      <div className="flex items-center gap-4 mt-3" style={{ fontSize: '13px' }}>
        {badgeCount > 0 && (
          <span className="flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
            <span style={{ color: currentRank.color }}>{currentRank.emoji}</span>
            <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{badgeCount}</span>
          </span>
        )}
        {stats.totalVotes > 0 && (
          <span className="flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
            <span>🍴</span>
            <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{stats.totalVotes}</span>
          </span>
        )}
        {stats.uniqueRestaurants > 0 && (
          <span className="flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
            <span>🏠</span>
            <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{stats.uniqueRestaurants}</span>
          </span>
        )}
      </div>

      {/* Expertise Progress */}
      {topProgress && (
        <button
          onClick={() => navigate('/badges')}
          className="mt-4 w-full text-left p-3.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.99]"
          style={{
            background: 'var(--color-surface-elevated)',
            border: `1px solid ${isCloseToNextTier ? 'rgba(245, 158, 11, 0.4)' : 'var(--color-divider)'}`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {topProgress.emoji} {topProgress.label}: {topProgress.currentTier?.title || 'Newcomer'} → {topProgress.nextTier.title}
            </span>
            <span className="text-xs font-bold" style={{ color: isCloseToNextTier ? '#F59E0B' : 'var(--color-text-tertiary)' }}>
              {topProgress.count}/{topProgress.nextTier.min}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-divider)' }}>
            <div
              className={`h-full rounded-full transition-all duration-1000 ${isCloseToNextTier ? 'animate-glow-breathe' : ''}`}
              style={{
                width: `${Math.min(topProgress.progress * 100, 100)}%`,
                background: isCloseToNextTier
                  ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                  : 'var(--color-primary)',
              }}
            />
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-tertiary)' }}>
            {TIER_DESCRIPTIONS[topProgress.nextTier.title] || ''}
          </p>
        </button>
      )}
    </div>
  )
}

export default HeroIdentityCard
