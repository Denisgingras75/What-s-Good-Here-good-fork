import { useState, useMemo, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBadges } from '../hooks/useBadges'
import { RANKS } from '../constants/ranks'
import {
  RARITY_LABELS,
  BADGE_FAMILY,
  FAMILY_INFO,
  CATEGORY_BADGE_TIERS,
  getRarityColor,
  parseCategoryBadgeKey,
} from '../constants/badgeDefinitions'
import { CATEGORY_INFO, MAJOR_CATEGORIES } from '../constants/categories'

export function Badges() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { badges, loading } = useBadges(user?.id, { evaluateOnMount: true })
  const [expandedFamilies, setExpandedFamilies] = useState({})

  // Group badges by family
  const badgesByFamily = useMemo(() => {
    const groups = {}
    badges.forEach(b => {
      const fam = b.family || 'volume'
      if (!groups[fam]) groups[fam] = []
      groups[fam].push(b)
    })
    return groups
  }, [badges])

  // Unlocked counts
  const unlockedBadges = useMemo(() => badges.filter(b => b.unlocked), [badges])

  // Current rank
  const currentRank = useMemo(() => {
    const count = unlockedBadges.length
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (count >= RANKS[i].minBadges) return { ...RANKS[i], index: i }
    }
    return { ...RANKS[0], index: 0 }
  }, [unlockedBadges.length])

  const nextRank = RANKS[currentRank.index + 1] || null

  // 3 closest-to-unlock badges
  const pathForward = useMemo(() => {
    return badges
      .filter(b => !b.unlocked)
      .slice()
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)
  }, [badges])

  // Toggle family expansion
  const toggleFamily = (family) => {
    setExpandedFamilies(prev => ({ ...prev, [family]: !prev[family] }))
  }

  // Only category mastery badges are displayed
  const familyOrder = [BADGE_FAMILY.CATEGORY]

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <h1 className="sr-only">Your Progression</h1>
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
            Your Progression
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Section 1: Your Rank (transparent) */}
        {user && !loading && (
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${currentRank.color}15 0%, ${currentRank.color}30 100%)`,
              border: `2px solid ${currentRank.color}50`,
            }}
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20" style={{ background: currentRank.color }} />
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10" style={{ background: currentRank.color }} />

            <div className="relative">
              {/* Rank header with arrow to next */}
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
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {currentRank.title}
                    </h2>
                    {nextRank && (
                      <>
                        <svg className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-lg font-semibold" style={{ color: nextRank.color }}>
                          {nextRank.emoji} {nextRank.title}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Badge count and what's needed */}
              {nextRank && (
                <div className="mt-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
                    You have {unlockedBadges.length} badge{unlockedBadges.length === 1 ? '' : 's'}. {nextRank.title} needs {nextRank.minBadges}.
                  </p>

                  {/* Path forward — 3 closest badges */}
                  {pathForward.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
                        Your path forward
                      </p>
                      <div className="space-y-2">
                        {pathForward.map(badge => (
                          <div key={badge.key} className="flex items-center gap-2.5">
                            <span className="text-lg flex-shrink-0">{badge.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                                  {badge.name}
                                </span>
                                <span className="text-xs font-medium" style={{ color: getRarityColor(badge.rarity) }}>
                                  {badge.percentage}%
                                </span>
                              </div>
                              {badge.requirementText && (
                                <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                                  {badge.requirementText}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!nextRank && (
                <div className="mt-4 p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.5)' }}>
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
            Rank Journey
          </h2>
          <div className="relative">
            <div className="absolute left-6 top-8 bottom-8 w-0.5 transition-all duration-1000" style={{ background: 'var(--color-divider)' }} />
            <div className="space-y-4">
              {RANKS.map((rank, index) => {
                const isCurrentRank = currentRank.index === index
                const isAchieved = currentRank.index >= index
                const isNext = currentRank.index + 1 === index

                return (
                  <div
                    key={rank.title}
                    className={`flex items-center gap-4 p-3 rounded-xl relative transition-all ${isCurrentRank ? 'scale-[1.02]' : ''}`}
                    style={{
                      background: isCurrentRank
                        ? `linear-gradient(135deg, ${rank.color}20 0%, ${rank.color}10 100%)`
                        : isNext ? 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)' : 'transparent',
                      border: isCurrentRank
                        ? `2px solid ${rank.color}`
                        : isNext ? '2px dashed #F59E0B' : '2px solid transparent',
                    }}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 ${isAchieved ? 'shadow-md' : ''}`}
                      style={{
                        background: isAchieved ? rank.color : 'var(--color-surface)',
                        border: isAchieved ? 'none' : '2px solid var(--color-divider)',
                        opacity: isAchieved ? 1 : 0.5,
                      }}
                    >
                      {isAchieved ? rank.emoji : '\uD83D\uDD12'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: isAchieved ? rank.color : 'var(--color-text-tertiary)' }}>
                          {rank.title}
                        </span>
                        {isCurrentRank && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ background: rank.color }}>YOU</span>
                        )}
                        {isNext && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">NEXT</span>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        {rank.minBadges} badges required
                      </p>
                    </div>
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

        {/* How It Works */}
        <details className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
          <summary className="px-5 py-4 cursor-pointer flex items-center justify-between list-none">
            <div className="flex items-center gap-2">
              <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>How It Works</span>
            </div>
            <svg className="w-5 h-5 transition-transform" style={{ color: 'var(--color-text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-5 pb-5 space-y-4">
            <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Category Mastery</h4>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                34 badges across 17 food categories, each with two tiers: <strong>Specialist</strong> and <strong>Authority</strong>. Earn them by rating dishes with both volume and accuracy.
              </p>
            </div>

            <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Rarity Tiers</h4>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Each badge has a rarity tier. Higher rarity = bigger celebration when you unlock it.
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(RARITY_LABELS).map(([rarity]) => (
                  <RarityPill key={rarity} rarity={rarity} />
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Ranks</h4>
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
          </div>
        </details>

        {/* Sign-in prompt for logged-out users */}
        {!user && (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
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

        {/* Badge Families */}
        {familyOrder.map(family => {
          const familyBadges = badgesByFamily[family]
          if (!familyBadges || familyBadges.length === 0) return null

          const info = FAMILY_INFO[family]
          if (!info) return null
          const earned = familyBadges.filter(b => b.unlocked).length
          const isExpanded = expandedFamilies[family] !== false // default open

          return (
            <CategoryMasterySection
              key={family}
              badges={familyBadges}
              info={info}
              earned={earned}
              isExpanded={isExpanded}
              onToggle={() => toggleFamily(family)}
              loading={loading}
            />
          )
        })}

        {/* Pro Tips */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-muted) 0%, white 100%)',
            border: '1px solid var(--color-primary)',
          }}
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
            Pro Tips
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex gap-2">
              <span>*</span>
              <span>Category mastery requires both volume AND accuracy</span>
            </li>
            <li className="flex gap-2">
              <span>*</span>
              <span>Rate honestly - your ratings are compared to community consensus</span>
            </li>
            <li className="flex gap-2">
              <span>*</span>
              <span>Experts get featured on dish and category pages</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Category Mastery section with transparent requirement breakdowns
const CategoryMasterySection = memo(function CategoryMasterySection({ badges, info, earned, isExpanded, onToggle, loading }) {
  // Group by category
  const categorized = useMemo(() => {
    const map = {}
    badges.forEach(b => {
      const parsed = parseCategoryBadgeKey(b.key)
      if (!parsed) return
      if (!map[parsed.categoryId]) map[parsed.categoryId] = {}
      map[parsed.categoryId][parsed.tier] = b
    })
    return map
  }, [badges])

  const categoryIds = Array.from(MAJOR_CATEGORIES)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
      <button onClick={onToggle} className="w-full px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{info.emoji}</span>
          <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{info.label}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: earned > 0 ? 'var(--color-primary-muted)' : 'var(--color-divider)', color: earned > 0 ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
            {earned}/{badges.length}
          </span>
        </div>
        <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} style={{ color: 'var(--color-text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5">
          {loading ? (
            <div className="grid grid-cols-1 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: 'var(--color-bg)' }} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {categoryIds.map(catId => {
                const catInfo = CATEGORY_INFO[catId] || { emoji: '\uD83C\uDF7D\uFE0F', label: catId }
                const specialist = categorized[catId]?.specialist
                const authority = categorized[catId]?.authority
                if (!specialist && !authority) return null

                const highestUnlocked = authority?.unlocked ? 'authority' : specialist?.unlocked ? 'specialist' : null

                return (
                  <CategoryCard
                    key={catId}
                    catInfo={catInfo}
                    specialist={specialist}
                    authority={authority}
                    highestUnlocked={highestUnlocked}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
})

// Individual category card with full requirement breakdown
const CategoryCard = memo(function CategoryCard({ catInfo, specialist, authority, highestUnlocked }) {
  const rarityColor = highestUnlocked
    ? getRarityColor(highestUnlocked === 'authority' ? 'epic' : 'rare')
    : 'var(--color-divider)'

  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: highestUnlocked ? `${rarityColor}08` : 'var(--color-bg)',
        border: `1px solid ${highestUnlocked ? `${rarityColor}30` : 'var(--color-divider)'}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{catInfo.emoji}</span>
        <span className="font-bold text-sm" style={{ color: highestUnlocked ? rarityColor : 'var(--color-text-primary)' }}>
          {catInfo.label}
        </span>
        {highestUnlocked && (
          <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ background: `${rarityColor}20`, color: rarityColor }}>
            {highestUnlocked === 'authority' ? 'Authority' : 'Specialist'}
          </span>
        )}
      </div>

      {/* Specialist tier */}
      {specialist && (
        <CategoryTierBreakdown
          badge={specialist}
          tierLabel="Specialist"
          tierMeta={CATEGORY_BADGE_TIERS.specialist}
          catLabel={catInfo.label}
        />
      )}

      {/* Authority tier */}
      {authority && (
        <CategoryTierBreakdown
          badge={authority}
          tierLabel="Authority"
          tierMeta={CATEGORY_BADGE_TIERS.authority}
          catLabel={catInfo.label}
        />
      )}
    </div>
  )
})

// Tier breakdown showing volume + accuracy as separate lines
const CategoryTierBreakdown = memo(function CategoryTierBreakdown({ badge, tierLabel, tierMeta, catLabel }) {
  const rarityColor = getRarityColor(badge.rarity)
  const volumeMet = badge.progress >= badge.target
  const accuracyMet = badge.accuracyStatus?.met
  const reqsMet = (volumeMet ? 1 : 0) + (accuracyMet ? 1 : 0)

  if (badge.unlocked) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <span className="text-xs text-emerald-500">&#10003;</span>
        <span className="text-sm font-medium" style={{ color: rarityColor }}>
          {tierLabel}
        </span>
        <RarityPill rarity={badge.rarity} small />
      </div>
    )
  }

  return (
    <div className="mt-2 first:mt-0">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
          {tierLabel}
        </span>
        <RarityPill rarity={badge.rarity} small />
        <span className="text-[10px] ml-auto" style={{ color: 'var(--color-text-tertiary)' }}>
          {reqsMet}/2 requirements met
        </span>
      </div>

      {/* Volume requirement */}
      <div className="flex items-start gap-1.5 mb-1">
        <span className="text-[10px] mt-0.5" style={{ color: volumeMet ? '#10B981' : '#F59E0B' }}>
          {volumeMet ? '\u2713' : '\u26A0'}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Volume: {badge.progress} / {badge.target} consensus-rated dishes
            </span>
          </div>
          {!volumeMet && (
            <p className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
              Rate {badge.target - badge.progress} more consensus-rated {catLabel.toLowerCase()} dishes
            </p>
          )}
          {/* Progress bar */}
          <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-divider)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${badge.percentage}%`, background: rarityColor }}
            />
          </div>
        </div>
      </div>

      {/* Accuracy requirement */}
      {badge.accuracyStatus && (
        <div className="flex items-start gap-1.5 mt-1.5">
          <span className="text-[10px] mt-0.5" style={{ color: accuracyMet ? '#10B981' : '#F59E0B' }}>
            {accuracyMet ? '\u2713' : '\u26A0'}
          </span>
          <div className="flex-1">
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Accuracy: |bias| {Math.abs(badge.accuracyStatus.currentBias).toFixed(1)} (needs &le; {badge.accuracyStatus.maxBias?.toFixed(1)})
            </span>
            {!accuracyMet && (
              <p className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                Your {catLabel.toLowerCase()} ratings average {Math.abs(badge.accuracyStatus.currentBias).toFixed(1)} from consensus
              </p>
            )}
          </div>
        </div>
      )}
      {!badge.accuracyStatus && (
        <div className="flex items-start gap-1.5 mt-1.5">
          <span className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>-</span>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Accuracy: rate more dishes to calculate
          </span>
        </div>
      )}
    </div>
  )
})

// Rarity pill component
function RarityPill({ rarity, small = false }) {
  const color = getRarityColor(rarity)
  const label = RARITY_LABELS[rarity] || 'Common'

  return (
    <span
      className={`inline-flex items-center font-semibold uppercase tracking-wide rounded-full ${small ? 'text-[9px] px-1.5 py-0' : 'text-[10px] px-2 py-0.5'}`}
      style={{
        background: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  )
}

