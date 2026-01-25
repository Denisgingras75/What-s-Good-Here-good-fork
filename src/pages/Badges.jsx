import { useState, useMemo, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBadges } from '../hooks/useBadges'

// Rank definitions matching the Profile achievements section
const RANKS = [
  { title: 'Newcomer', emoji: '🌱', color: '#6B7280', minBadges: 0, description: 'Just getting started' },
  { title: 'Explorer', emoji: '🧭', color: '#3B82F6', minBadges: 1, description: 'Beginning the journey' },
  { title: 'Rising Star', emoji: '🌟', color: '#10B981', minBadges: 3, description: 'Making your mark' },
  { title: 'Expert', emoji: '⭐', color: '#F59E0B', minBadges: 5, description: 'Trusted contributor' },
  { title: 'Legend', emoji: '👑', color: '#9333EA', minBadges: 8, description: 'Elite status achieved' },
]

export function Badges() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { badges, loading } = useBadges(user?.id)
  const [activeTab, setActiveTab] = useState('journey') // 'journey' | 'all'

  // Split badges - memoized for performance
  const { unlockedBadges, lockedBadges, privateBadges, publicBadges } = useMemo(() => ({
    unlockedBadges: badges.filter(b => b.unlocked),
    lockedBadges: badges.filter(b => !b.unlocked).sort((a, b) => b.percentage - a.percentage),
    privateBadges: badges.filter(b => !b.is_public_eligible),
    publicBadges: badges.filter(b => b.is_public_eligible),
  }), [badges])

  // Calculate user's current rank - memoized
  const currentRank = useMemo(() => {
    const count = unlockedBadges.length
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (count >= RANKS[i].minBadges) return { ...RANKS[i], index: i }
    }
    return { ...RANKS[0], index: 0 }
  }, [unlockedBadges.length])

  const nextRank = RANKS[currentRank.index + 1] || null

  // Calculate progress to next rank - memoized
  const nextRankProgress = useMemo(() => {
    if (!nextRank) return 100
    const current = unlockedBadges.length
    const needed = nextRank.minBadges
    const prevNeeded = currentRank.minBadges
    return Math.round(((current - prevNeeded) / (needed - prevNeeded)) * 100)
  }, [nextRank, unlockedBadges.length, currentRank.minBadges])

  // Get closest badge to unlock
  const nextBadge = lockedBadges[0] || null

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <h1 className="sr-only">Your Badges and Achievements</h1>
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
            Badges & Rewards
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Your Rank Hero Card */}
        {user && !loading && (
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${currentRank.color}15 0%, ${currentRank.color}30 100%)`,
              border: `2px solid ${currentRank.color}50`,
            }}
          >
            {/* Decorative background circles */}
            <div
              className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
              style={{ background: currentRank.color }}
            />
            <div
              className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10"
              style={{ background: currentRank.color }}
            />

            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg"
                  style={{ background: currentRank.color }}
                >
                  {currentRank.emoji}
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: currentRank.color }}>
                    Your Rank
                  </p>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {currentRank.title}
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {unlockedBadges.length} of {badges.length} badges earned
                  </p>
                </div>
              </div>

              {/* Progress to next rank */}
              {nextRank && (
                <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.5)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      Progress to {nextRank.emoji} {nextRank.title}
                    </span>
                    <span className="text-sm font-bold" style={{ color: nextRank.color }}>
                      {nextRank.minBadges - unlockedBadges.length} badges away
                    </span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-divider)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${nextRankProgress}%`,
                        background: `linear-gradient(90deg, ${currentRank.color}, ${nextRank.color})`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Max rank celebration */}
              {!nextRank && (
                <div className="mt-4 p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.5)' }}>
                  <span className="text-lg">🎉</span>
                  <p className="font-semibold" style={{ color: currentRank.color }}>
                    You've reached the highest rank!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rank Journey Map */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            🗺️ Rank Journey
          </h2>
          <div className="relative">
            {/* Connection line */}
            <div
              className="absolute left-6 top-8 bottom-8 w-0.5"
              style={{ background: 'var(--color-divider)' }}
            />

            <div className="space-y-4">
              {RANKS.map((rank, index) => {
                const isCurrentRank = currentRank.index === index
                const isAchieved = currentRank.index >= index
                const isNext = currentRank.index + 1 === index

                return (
                  <div
                    key={rank.title}
                    className={`flex items-center gap-4 p-3 rounded-xl relative transition-all ${
                      isCurrentRank ? 'scale-[1.02]' : ''
                    }`}
                    style={{
                      background: isCurrentRank
                        ? `linear-gradient(135deg, ${rank.color}20 0%, ${rank.color}10 100%)`
                        : isNext
                          ? 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)'
                          : 'transparent',
                      border: isCurrentRank
                        ? `2px solid ${rank.color}`
                        : isNext
                          ? '2px dashed #F59E0B'
                          : '2px solid transparent',
                    }}
                  >
                    {/* Rank icon */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 ${
                        isAchieved ? 'shadow-md' : ''
                      }`}
                      style={{
                        background: isAchieved ? rank.color : 'var(--color-surface)',
                        border: isAchieved ? 'none' : '2px solid var(--color-divider)',
                        opacity: isAchieved ? 1 : 0.5,
                      }}
                    >
                      {isAchieved ? rank.emoji : '🔒'}
                    </div>

                    {/* Rank info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold"
                          style={{ color: isAchieved ? rank.color : 'var(--color-text-tertiary)' }}
                        >
                          {rank.title}
                        </span>
                        {isCurrentRank && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                            style={{ background: rank.color }}
                          >
                            YOU
                          </span>
                        )}
                        {isNext && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                            NEXT
                          </span>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        {rank.minBadges} badges required
                      </p>
                    </div>

                    {/* Checkmark for achieved */}
                    {isAchieved && !isCurrentRank && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#10B981' }}>
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Next Badge Focus (if user is logged in and has progress) */}
        {user && nextBadge && !loading && (
          <div
            className={`rounded-2xl p-5 relative overflow-hidden ${
              nextBadge.percentage >= 70 ? 'animate-pulse-subtle' : ''
            }`}
            style={{
              background: nextBadge.percentage >= 70
                ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)'
                : 'var(--color-surface-elevated)',
              border: nextBadge.percentage >= 70
                ? '2px solid #F59E0B'
                : '1px solid var(--color-divider)',
            }}
          >
            {nextBadge.percentage >= 70 && (
              <div className="absolute top-0 right-0 px-3 py-1 text-xs font-bold text-amber-800 bg-amber-200 rounded-bl-xl">
                🔥 ALMOST THERE
              </div>
            )}

            <div className="flex items-center gap-4">
              {/* Circular progress */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40" cy="40" r="34"
                    stroke="var(--color-divider)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="40" cy="40" r="34"
                    stroke={nextBadge.percentage >= 70 ? '#F59E0B' : 'var(--color-primary)'}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${nextBadge.percentage * 2.14} 214`}
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-3xl">
                  {nextBadge.icon}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{
                  color: nextBadge.percentage >= 70 ? '#92400E' : 'var(--color-text-tertiary)'
                }}>
                  Closest to Unlock
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {nextBadge.name}
                </p>
                <p className="text-sm" style={{
                  color: nextBadge.percentage >= 70 ? '#B45309' : 'var(--color-text-secondary)'
                }}>
                  {nextBadge.percentage >= 90
                    ? `🔥 Just ${nextBadge.target - nextBadge.progress} more!`
                    : nextBadge.percentage >= 70
                      ? `⚡ Only ${nextBadge.target - nextBadge.progress} to go!`
                      : `${nextBadge.target - nextBadge.progress} more to unlock`
                  }
                </p>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold" style={{
                  color: nextBadge.percentage >= 70 ? '#F59E0B' : 'var(--color-primary)'
                }}>
                  {nextBadge.percentage}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* How It Works - Expandable */}
        <details className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
          <summary className="px-5 py-4 cursor-pointer flex items-center justify-between list-none">
            <div className="flex items-center gap-2">
              <span className="text-lg">📖</span>
              <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>How It Works</span>
            </div>
            <svg className="w-5 h-5 transition-transform" style={{ color: 'var(--color-text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-5 pb-5 space-y-4">
            {/* Rank System */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
              <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <span>🏆</span> The Rank System
              </h4>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                As you earn badges, you climb through 5 ranks. Each rank requires unlocking more badges:
              </p>
              <div className="flex flex-wrap gap-2">
                {RANKS.map((rank) => (
                  <div key={rank.title} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ background: `${rank.color}20`, color: rank.color }}>
                    <span>{rank.emoji}</span>
                    <span className="font-medium">{rank.title}</span>
                    <span className="opacity-70">({rank.minBadges}+)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Earn */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
              <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <span>⭐</span> How to Earn Badges
              </h4>
              <ul className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                <li className="flex gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span><strong>Rate dishes</strong> — Each vote counts toward dish-based badges</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span><strong>Try new restaurants</strong> — Explore different spots to unlock explorer badges</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span><strong>One vote = multiple badges</strong> — A single rating can unlock several badges at once!</span>
                </li>
              </ul>
            </div>

            {/* Golden Badges */}
            <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)', border: '1px solid #F59E0B' }}>
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-900">
                <span>🔥</span> "Almost There" Badges
              </h4>
              <p className="text-sm text-amber-800">
                When you're <strong>70% or closer</strong> to unlocking a badge, it lights up gold! These are your quick wins — just a few more ratings to unlock them.
              </p>
            </div>

            {/* Badge Types */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
              <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <span>🎖️</span> Badge Types
              </h4>
              <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>Personal</span>
                  <span>Celebrate your journey — visible only to you on your profile</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#F5F3FF', color: '#7C3AED' }}>Prestigious</span>
                  <span>Elite achievements displayed publicly for everyone to see</span>
                </div>
              </div>
            </div>
          </div>
        </details>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--color-surface-elevated)' }}>
          <button
            onClick={() => setActiveTab('journey')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'journey' ? 'shadow-md' : ''
            }`}
            style={{
              background: activeTab === 'journey' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'journey' ? 'white' : 'var(--color-text-secondary)',
            }}
          >
            🎯 Your Progress
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'all' ? 'shadow-md' : ''
            }`}
            style={{
              background: activeTab === 'all' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'all' ? 'white' : 'var(--color-text-secondary)',
            }}
          >
            🏆 All Badges
          </button>
        </div>

        {/* Your Progress Tab */}
        {activeTab === 'journey' && (
          <div className="space-y-6">
            {/* Earned Badges */}
            {unlockedBadges.length > 0 && (
              <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">✨</span>
                  <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Earned ({unlockedBadges.length})
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {unlockedBadges.map((badge) => (
                    <div
                      key={badge.key}
                      className="p-3 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, var(--color-primary-muted) 0%, white 100%)',
                        border: '2px solid var(--color-primary)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{badge.icon}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>
                            {badge.name}
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                            {badge.unlocked_at && new Date(badge.unlocked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* In Progress Badges */}
            {lockedBadges.length > 0 && (
              <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🔒</span>
                  <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    In Progress ({lockedBadges.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {lockedBadges.map((badge) => {
                    const isClose = badge.percentage >= 70
                    const remaining = badge.target - badge.progress

                    return (
                      <div
                        key={badge.key}
                        className="p-4 rounded-xl relative"
                        style={{
                          background: isClose
                            ? 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)'
                            : 'var(--color-bg)',
                          border: isClose ? '2px solid #F59E0B' : '1px solid var(--color-divider)',
                        }}
                      >
                        {isClose && (
                          <span className="absolute top-2 right-2 text-sm">🔥</span>
                        )}
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl ${isClose ? '' : 'opacity-50'}`}>{badge.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold ${isClose ? 'text-amber-900' : 'text-[color:var(--color-text-secondary)]'}`}>
                              {badge.name}
                            </p>
                            <p className={`text-xs ${isClose ? 'text-amber-700' : 'text-[color:var(--color-text-tertiary)]'}`}>
                              {isClose ? `Just ${remaining} more!` : badge.description}
                            </p>
                            <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-divider)' }}>
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${badge.percentage}%`,
                                  background: isClose ? '#F59E0B' : 'var(--color-primary)',
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${isClose ? 'text-amber-600' : 'text-[color:var(--color-text-secondary)]'}`}>
                              {badge.progress}/{badge.target}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Empty state for logged out users */}
            {!user && (
              <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
                <span className="text-4xl">🔐</span>
                <h3 className="mt-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Sign in to track your progress
                </h3>
                <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Create an account to start earning badges and climbing the ranks!
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-4 px-6 py-2 rounded-xl font-semibold text-white"
                  style={{ background: 'var(--color-primary)' }}
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        )}

        {/* All Badges Tab */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {/* Personal Milestones */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎖️</span>
                <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Personal Milestones
                </h3>
              </div>
              <p className="text-xs mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
                Celebrate your journey — visible only to you
              </p>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--color-bg)' }} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {privateBadges.map((badge) => (
                    <BadgeRow key={badge.key} badge={badge} />
                  ))}
                </div>
              )}
            </div>

            {/* Prestigious Badges */}
            <div className="rounded-2xl p-5" style={{
              background: 'linear-gradient(135deg, #FDF4FF 0%, #FAF5FF 100%)',
              border: '2px solid #C084FC',
            }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">👑</span>
                <h3 className="font-semibold" style={{ color: '#7C3AED' }}>
                  Prestigious Badges
                </h3>
              </div>
              <p className="text-xs mb-4" style={{ color: '#8B5CF6' }}>
                Elite achievements displayed on your public profile
              </p>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.5)' }} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {publicBadges.map((badge) => (
                    <BadgeRow key={badge.key} badge={badge} isPublic />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Category Expertise */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🍕</span>
            <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Category Expertise
            </h3>
          </div>
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
            Rate dishes in a category to earn expertise titles
          </p>

          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              { emoji: '🌱', title: 'Explorer', votes: '5+', color: '#6B7280' },
              { emoji: '🔥', title: 'Fan', votes: '10+', color: '#F97316' },
              { emoji: '💎', title: 'Connoisseur', votes: '20+', color: '#3B82F6' },
              { emoji: '⭐', title: 'Expert', votes: '30+', color: '#F59E0B' },
              { emoji: '👑', title: 'Master', votes: '50+', color: '#9333EA' },
            ].map((level) => (
              <div key={level.title} className="p-2">
                <div
                  className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-lg mb-1"
                  style={{ background: `${level.color}20` }}
                >
                  {level.emoji}
                </div>
                <p className="text-xs font-semibold" style={{ color: level.color }}>{level.title}</p>
                <p className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>{level.votes}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tips */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-muted) 0%, white 100%)',
            border: '1px solid var(--color-primary)',
          }}
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
            <span>💡</span> Pro Tips
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex gap-2">
              <span>⚡</span>
              <span>One vote can unlock multiple badges at once!</span>
            </li>
            <li className="flex gap-2">
              <span>🍽️</span>
              <span>Try new restaurants to unlock explorer badges faster</span>
            </li>
            <li className="flex gap-2">
              <span>🎯</span>
              <span>Focus on badges at 70%+ for quick wins</span>
            </li>
            <li className="flex gap-2">
              <span>👑</span>
              <span>Prestigious badges show on your public profile</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Badge row component with gamified styling - memoized for list performance
const BadgeRow = memo(function BadgeRow({ badge, isPublic }) {
  const isUnlocked = badge.unlocked
  const isClose = !isUnlocked && badge.percentage >= 70

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl transition-all"
      style={{
        background: isUnlocked
          ? isPublic
            ? 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)'
            : 'linear-gradient(135deg, var(--color-primary-muted) 0%, white 100%)'
          : isClose
            ? 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)'
            : 'var(--color-bg)',
        border: isUnlocked
          ? isPublic
            ? '2px solid #A78BFA'
            : '2px solid var(--color-primary)'
          : isClose
            ? '2px solid #F59E0B'
            : '1px solid var(--color-divider)',
      }}
    >
      {/* Icon */}
      <div className={`text-2xl ${!isUnlocked && !isClose && 'opacity-40'}`}>
        {badge.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className="font-semibold text-sm"
            style={{
              color: isUnlocked
                ? isPublic ? '#7C3AED' : 'var(--color-primary)'
                : isClose
                  ? '#92400E'
                  : 'var(--color-text-tertiary)'
            }}
          >
            {badge.name}
          </h3>
          {isUnlocked && (
            <span className="text-xs">✓</span>
          )}
          {isClose && (
            <span className="text-xs">🔥</span>
          )}
        </div>
        <p className="text-xs" style={{
          color: isClose ? '#B45309' : 'var(--color-text-tertiary)'
        }}>
          {badge.description}
        </p>

        {/* Progress bar for locked badges */}
        {!isUnlocked && badge.target > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-divider)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${badge.percentage}%`,
                  background: isClose ? '#F59E0B' : 'var(--color-primary)',
                }}
              />
            </div>
            <span className="text-xs font-medium" style={{
              color: isClose ? '#F59E0B' : 'var(--color-text-tertiary)'
            }}>
              {badge.progress}/{badge.target}
            </span>
          </div>
        )}
      </div>
    </div>
  )
})
