import { useEffect } from 'react'

/**
 * RevealNotification - Toast/modal showing when a dish reaches consensus
 *
 * Shows:
 * - Dish name that was scored
 * - Consensus rating vs user's rating
 * - Deviation
 * - Updated bias
 */

export function RevealNotification({ reveal, onDismiss }) {
  // Auto-dismiss after 8 seconds (must be before early return to follow Rules of Hooks)
  useEffect(() => {
    if (!reveal) return
    const timer = setTimeout(() => {
      onDismiss()
    }, 8000)
    return () => clearTimeout(timer)
  }, [reveal, onDismiss])

  if (!reveal) return null

  const {
    dishName,
    userRating,
    consensusRating,
    deviation,
    wasEarlyVoter,
    biasBefore,
    biasAfter,
  } = reveal

  // Format numbers
  const formatNum = (n) => {
    if (n === null || n === undefined) return '0.0'
    return n > 0 ? `+${n.toFixed(1)}` : n.toFixed(1)
  }

  const formatRating = (n) => n?.toFixed(1) ?? '—'

  // Get deviation color
  const getDeviationColor = () => {
    if (Math.abs(deviation) < 0.5) return 'var(--color-text-secondary)'
    if (deviation < 0) return '#f97316' // Orange for below consensus
    return '#10b981' // Green for above consensus
  }

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up"
      style={{ maxWidth: '400px', margin: '0 auto' }}
    >
      <div
        className="rounded-2xl shadow-2xl border p-4"
        style={{
          background: 'var(--color-surface-elevated)',
          borderColor: 'var(--color-divider)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-primary)' }}>
              {wasEarlyVoter ? 'Early Voter Reveal' : 'Consensus Reached'}
            </p>
            <p className="text-base font-bold mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
              {dishName}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 -m-1 rounded-full hover:bg-black/5"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Ratings comparison */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Consensus</p>
            <p className="text-xl font-bold" style={{ color: 'var(--color-rating)' }}>
              {formatRating(consensusRating)}
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>You Rated</p>
            <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {formatRating(userRating)}
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Deviation</p>
            <p className="text-xl font-bold" style={{ color: getDeviationColor() }}>
              {formatNum(deviation)}
            </p>
          </div>
        </div>

        {/* Bias update */}
        {biasAfter !== null && (
          <div
            className="mt-3 pt-3 border-t flex items-center justify-center gap-2 text-sm"
            style={{ borderColor: 'var(--color-divider)' }}
          >
            <span style={{ color: 'var(--color-text-secondary)' }}>Your bias:</span>
            <span style={{ color: 'var(--color-text-tertiary)' }}>{formatNum(biasBefore)}</span>
            <svg className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>{formatNum(biasAfter)}</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default RevealNotification
