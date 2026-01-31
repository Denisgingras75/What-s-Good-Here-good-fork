import { useMemo } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const BADGE_COLORS = ['#C85A54', '#D9A765', '#E07856', '#F59E0B', '#C85A54']
const RANK_COLORS = ['#9333EA', '#D9A765', '#10B981', '#3B82F6', '#F59E0B']
const EPIC_COLORS = ['#9333EA', '#A855F7', '#C084FC', '#D9A765', '#F59E0B']
const LEGENDARY_COLORS = ['#F59E0B', '#FBBF24', '#FCD34D', '#D9A765', '#EAB308']

/**
 * CSS-based confetti particle burst.
 * @param {string} variant - 'badge' (red+gold), 'rank' (purple+gold+green), 'epic' (purple), 'legendary' (gold)
 * @param {number} count - Number of particles (30-60)
 */
export function Confetti({ variant = 'badge', count = 40 }) {
  const prefersReducedMotion = useReducedMotion()

  const colors = variant === 'legendary' ? LEGENDARY_COLORS
    : variant === 'epic' ? EPIC_COLORS
    : variant === 'rank' ? RANK_COLORS
    : BADGE_COLORS

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const color = colors[i % colors.length]
      const left = Math.random() * 100
      const delay = Math.random() * 0.6
      const duration = 1.5 + Math.random() * 1.5
      const drift = (Math.random() - 0.5) * 120
      const spin = 360 + Math.random() * 720
      const size = 6 + Math.random() * 6
      const shape = Math.random() > 0.5 ? 'circle' : 'rect'

      return { color, left, delay, duration, drift, spin, size, shape, id: i }
    })
  }, [count, colors])

  if (prefersReducedMotion) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 10002 }}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: p.shape === 'circle' ? `${p.size}px` : `${p.size}px`,
            height: p.shape === 'circle' ? `${p.size}px` : `${p.size * 0.6}px`,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            background: p.color,
            '--confetti-delay': `${p.delay}s`,
            '--confetti-duration': `${p.duration}s`,
            '--confetti-drift': `${p.drift}px`,
            '--confetti-spin': `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  )
}
