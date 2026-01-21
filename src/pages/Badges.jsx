import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBadges } from '../hooks/useBadges'

export function Badges() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { badges, loading } = useBadges(user?.id)

  // Split badges into private and public
  const privateBadges = badges.filter(b => !b.is_public_eligible)
  const publicBadges = badges.filter(b => b.is_public_eligible)

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      {/* Header */}
      <header className="px-4 py-4" style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-divider)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: 'var(--color-primary)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            How Badges Work
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Intro Card */}
        <div
          className="rounded-2xl p-6 overflow-hidden"
          style={{
            background: 'var(--color-primary-muted)',
            border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-primary)' }}
            >
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Earn Badges
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Every vote brings you closer to new achievements
              </p>
            </div>
          </div>
          <p style={{ color: 'var(--color-text-secondary)' }} className="leading-relaxed">
            As you rate dishes and explore restaurants, you'll unlock badges that celebrate your
            contributions to the community. Some badges are personal milestones, while others
            are prestigious achievements that display on your public profile.
          </p>
        </div>

        {/* How It Works */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            How It Works
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-primary-muted)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>1</span>
              </div>
              <div>
                <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Rate dishes</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Vote on dishes you've tried and rate them honestly</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-primary-muted)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>2</span>
              </div>
              <div>
                <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Build progress</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Each vote counts toward multiple badge goals</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-primary-muted)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>3</span>
              </div>
              <div>
                <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Unlock badges</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Get notified when you earn a new achievement</p>
              </div>
            </div>
          </div>
        </div>

        {/* Private Badges */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🔒</span>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Personal Milestones
            </h2>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
            These badges celebrate your journey and are visible only to you.
          </p>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--color-bg)' }} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {privateBadges.map((badge) => (
                <BadgeRow key={badge.key} badge={badge} />
              ))}
            </div>
          )}
        </div>

        {/* Public Badges */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">⭐</span>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Prestigious Badges
            </h2>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
            These elite achievements are displayed on your public profile for everyone to see.
          </p>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--color-bg)' }} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {publicBadges.map((badge) => (
                <BadgeRow key={badge.key} badge={badge} isPublic />
              ))}
            </div>
          )}
        </div>

        {/* Category Expertise */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🍕</span>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Category Expertise
            </h2>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Beyond badges, you also earn expertise titles in specific food categories. Rate enough
            dishes in a category and you'll become recognized as an expert in that cuisine.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--color-bg)' }}>
              <span className="text-xl">🌱</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Explorer</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-divider)', color: 'var(--color-text-secondary)' }}>5+ votes</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--color-bg)' }}>
              <span className="text-xl">🔥</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Fan</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-divider)', color: 'var(--color-text-secondary)' }}>10+ votes</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--color-bg)' }}>
              <span className="text-xl">💎</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Connoisseur</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-divider)', color: 'var(--color-text-secondary)' }}>20+ votes</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--color-bg)' }}>
              <span className="text-xl">⭐</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Expert</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-divider)', color: 'var(--color-text-secondary)' }}>30+ votes</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--color-bg)' }}>
              <span className="text-xl">👑</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Master</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-divider)', color: 'var(--color-text-secondary)' }}>50+ votes</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs mt-4 text-center" style={{ color: 'var(--color-text-tertiary)' }}>
            Your category titles are displayed on your profile as you earn them.
          </p>
        </div>

        {/* Tips */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Tips for Earning Badges
          </h2>
          <ul className="space-y-3" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex gap-3">
              <span>🍽️</span>
              <span>Rate dishes at new restaurants to unlock explorer badges faster</span>
            </li>
            <li className="flex gap-3">
              <span>📍</span>
              <span>Try different spots around the island to maximize your restaurant count</span>
            </li>
            <li className="flex gap-3">
              <span>⚡</span>
              <span>One vote can unlock multiple badges at once!</span>
            </li>
            <li className="flex gap-3">
              <span>🎯</span>
              <span>Check your profile to see how close you are to your next badge</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Badge row component
function BadgeRow({ badge, isPublic }) {
  const isUnlocked = badge.unlocked

  const getBackgroundStyle = () => {
    if (isUnlocked) {
      if (isPublic) {
        return { background: 'color-mix(in srgb, var(--color-primary) 15%, var(--color-bg))', border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)' }
      }
      return { background: 'color-mix(in srgb, var(--color-success) 15%, var(--color-bg))', border: '1px solid color-mix(in srgb, var(--color-success) 30%, transparent)' }
    }
    return { background: 'var(--color-bg)', border: '1px solid var(--color-divider)' }
  }

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl transition-all"
      style={getBackgroundStyle()}
    >
      {/* Icon */}
      <div className={`text-2xl ${!isUnlocked && 'opacity-40'}`}>
        {badge.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className="font-semibold"
            style={{ color: isUnlocked ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}
          >
            {badge.name}
          </h3>
          {isUnlocked && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'color-mix(in srgb, var(--color-success) 20%, transparent)', color: 'var(--color-success)' }}>
              Unlocked
            </span>
          )}
        </div>
        <p className="text-sm" style={{ color: isUnlocked ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)' }}>
          {badge.description}
        </p>

        {/* Progress bar for locked badges */}
        {!isUnlocked && badge.target > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-tertiary)' }}>
              <span>{badge.progress}/{badge.target}</span>
              <span>{badge.percentage}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-divider)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${badge.percentage}%`,
                  background: 'var(--color-primary)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
