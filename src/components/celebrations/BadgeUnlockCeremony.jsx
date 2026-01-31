import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Confetti } from './Confetti'
import { playBadgeSound } from '../../lib/sounds'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { hapticSuccess } from '../../utils/haptics'
import { CELEBRATION_TIER_MAP, getRarityColor, RARITY_LABELS } from '../../constants/badgeDefinitions'

/**
 * Determine celebration tier for a badge based on rarity.
 * - common/uncommon -> 'standard' (toast)
 * - rare -> 'rare' (full-screen overlay)
 * - epic/legendary -> 'major' (full-screen + confetti)
 */
function getCelebrationTier(badge) {
  if (badge.celebrationTier) return badge.celebrationTier
  const rarity = badge.rarity || 'common'
  return CELEBRATION_TIER_MAP[rarity] || 'standard'
}

/**
 * Show an enhanced toast for standard-tier badges (common/uncommon)
 */
function showStandardCeremony(badge) {
  playBadgeSound()
  hapticSuccess()

  const rarityColor = getRarityColor(badge.rarity)
  const rarityLabel = RARITY_LABELS[badge.rarity] || 'Common'

  toast.success(
    <div className="flex items-center gap-3">
      <div className="text-3xl flex-shrink-0 animate-badge-bounce-in">{badge.icon}</div>
      <div className="min-w-0">
        <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>Badge Unlocked!</p>
        <p className="font-semibold" style={{ color: rarityColor }}>{badge.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className="text-[9px] px-1.5 py-0 font-semibold uppercase tracking-wide rounded-full"
            style={{ background: `${rarityColor}20`, color: rarityColor, border: `1px solid ${rarityColor}40` }}
          >
            {rarityLabel}
          </span>
        </div>
        {badge.description && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{badge.description}</p>
        )}
      </div>
    </div>,
    { duration: 4000 }
  )
}

/**
 * Full-screen badge ceremony with rarity-based effects
 */
export function BadgeUnlockCeremony({ badges, onDone }) {
  const prefersReducedMotion = useReducedMotion()
  const [showOverlay, setShowOverlay] = useState(false)
  const [canDismiss, setCanDismiss] = useState(false)

  // Find the highest-tier badge for the ceremony
  const majorBadges = badges.filter(b => {
    const tier = getCelebrationTier(b)
    return tier === 'major' || tier === 'rare'
  })
  const standardBadges = badges.filter(b => getCelebrationTier(b) === 'standard')
  const heroBadge = majorBadges[0] || null
  const otherBadges = [
    ...majorBadges.slice(1),
    ...standardBadges,
  ]

  // Determine confetti variant from hero badge rarity
  const heroRarity = heroBadge?.rarity || 'rare'
  const confettiVariant = heroRarity === 'legendary' ? 'legendary'
    : heroRarity === 'epic' ? 'epic'
    : 'badge'

  useEffect(() => {
    // If no major/rare badges, show standard toasts for all and finish
    if (!heroBadge) {
      badges.forEach((badge, i) => {
        setTimeout(() => showStandardCeremony(badge), i * 600)
      })
      setTimeout(() => onDone?.(), badges.length * 600 + 200)
      return
    }

    // Major/rare ceremony
    playBadgeSound()
    hapticSuccess()
    setShowOverlay(true)

    const dismissDelay = heroRarity === 'legendary' ? 2000
      : heroRarity === 'epic' ? 1500
      : prefersReducedMotion ? 0 : 1500

    const timer = setTimeout(() => setCanDismiss(true), dismissDelay)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDismiss = () => {
    if (!canDismiss) return
    setShowOverlay(false)

    // Show standard toasts for any remaining badges
    standardBadges.forEach((badge, i) => {
      setTimeout(() => showStandardCeremony(badge), i * 600)
    })

    setTimeout(() => onDone?.(), standardBadges.length * 600 + 200)
  }

  if (!showOverlay) return null

  const heroRarityColor = getRarityColor(heroBadge.rarity)
  const heroRarityLabel = RARITY_LABELS[heroBadge.rarity] || 'Rare'

  return (
    <>
      <Confetti variant={confettiVariant} count={heroRarity === 'legendary' ? 60 : heroRarity === 'epic' ? 50 : 40} />
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{
          zIndex: 10001,
          background: 'rgba(13, 27, 34, 0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={handleDismiss}
        role="dialog"
        aria-label="Badge unlocked"
      >
        <div className="text-center px-8 max-w-sm">
          {/* Hero badge icon with rarity glow */}
          <div
            className={`text-7xl mb-6 animate-badge-bounce-in ${heroBadge.rarity === 'legendary' ? 'animate-legendary-shimmer' : heroBadge.rarity === 'epic' ? 'animate-rarity-glow' : ''}`}
            style={{ filter: `drop-shadow(0 4px 20px ${heroRarityColor}60)` }}
          >
            {heroBadge.icon}
          </div>

          {/* Rarity pill */}
          <span
            className="inline-flex items-center text-xs px-3 py-1 font-semibold uppercase tracking-wide rounded-full mb-3"
            style={{ background: `${heroRarityColor}20`, color: heroRarityColor, border: `1px solid ${heroRarityColor}40` }}
          >
            {heroRarityLabel}
          </span>

          {/* Badge name */}
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'var(--color-accent-gold)' }}
          >
            Badge Unlocked
          </p>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {heroBadge.name}
          </h2>
          {heroBadge.description && (
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              {heroBadge.description}
            </p>
          )}

          {/* Other badges unlocked */}
          {otherBadges.length > 0 && (
            <div className="mb-6">
              <p className="text-xs mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
                Also unlocked
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {otherBadges.map((badge) => {
                  const badgeColor = getRarityColor(badge.rarity)
                  return (
                    <div
                      key={badge.key || badge.name}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: `1px solid ${badgeColor}40`,
                      }}
                    >
                      <span className="text-lg">{badge.icon}</span>
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                        {badge.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Dismiss hint */}
          <p
            className="text-sm transition-opacity duration-500"
            style={{
              color: 'var(--color-text-tertiary)',
              opacity: canDismiss ? 1 : 0,
            }}
          >
            Tap to continue
          </p>
        </div>
      </div>
    </>
  )
}
