import { useState, useEffect } from 'react'
import { hapticSuccess } from '../utils/haptics'

/**
 * Inline badge unlock celebration shown in the post-vote card.
 * Animates in with scale + glow. Shows badge name and description.
 *
 * @param {Object[]} badges - Array of { badge_key, name, subtitle, icon }
 * @param {Function} onShare - Optional callback to share badge
 */
export function BadgeUnlockCelebration({ badges, onShare }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (badges && badges.length > 0) {
      // Delay slightly for dramatic effect
      const timer = setTimeout(() => {
        setVisible(true)
        hapticSuccess()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [badges])

  if (!badges || badges.length === 0) return null

  // Show first badge (most significant unlock)
  const badge = badges[0]
  const extraCount = badges.length - 1

  return (
    <div
      className={`rounded-xl p-4 text-center transition-all duration-500 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`}
      style={{
        background: 'linear-gradient(135deg, rgba(217, 167, 101, 0.15) 0%, rgba(200, 90, 84, 0.1) 100%)',
        border: '1px solid rgba(217, 167, 101, 0.3)',
        boxShadow: visible ? '0 0 20px rgba(217, 167, 101, 0.15)' : 'none',
      }}
    >
      {/* Badge icon with glow */}
      <div
        className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-2"
        style={{
          background: 'rgba(217, 167, 101, 0.2)',
          boxShadow: '0 0 12px rgba(217, 167, 101, 0.3)',
          fontSize: '24px',
        }}
      >
        {badge.icon || '\uD83C\uDFC5'}
      </div>

      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-accent-gold)' }}>
        Badge Unlocked
      </p>

      <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {badge.name}
      </p>

      {badge.subtitle && (
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          {badge.subtitle}
        </p>
      )}

      {extraCount > 0 && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-accent-gold)' }}>
          +{extraCount} more badge{extraCount > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
