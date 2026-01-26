/**
 * RatingIdentityCard - Shows user's rating bias and personality
 *
 * Displays:
 * - Rating bias number (e.g., -1.3)
 * - Bias label (e.g., "Tough Critic")
 * - Stats: votes with consensus, pending votes, dishes helped establish
 */

export function RatingIdentityCard({
  ratingBias,
  biasLabel,
  votesWithConsensus,
  votesPending,
  dishesHelpedEstablish,
  loading,
}) {
  if (loading) {
    return (
      <div className="p-4 rounded-2xl animate-pulse" style={{ background: 'var(--color-surface-elevated)' }}>
        <div className="h-6 w-32 rounded" style={{ background: 'var(--color-divider)' }} />
        <div className="h-12 w-20 mt-2 rounded" style={{ background: 'var(--color-divider)' }} />
        <div className="h-4 w-48 mt-2 rounded" style={{ background: 'var(--color-divider)' }} />
      </div>
    )
  }

  // Format bias number with + for positive
  const formatBias = (bias) => {
    if (bias === 0 || bias === null || bias === undefined) return '0.0'
    return bias > 0 ? `+${bias.toFixed(1)}` : bias.toFixed(1)
  }

  // Get color based on bias direction
  const getBiasColor = (bias) => {
    if (bias === null || bias === undefined || bias === 0) return 'var(--color-text-secondary)'
    if (bias < -1) return '#ef4444' // Red for harsh critics
    if (bias < 0) return '#f97316' // Orange for somewhat harsh
    if (bias > 1) return '#10b981' // Green for generous
    if (bias > 0) return '#22c55e' // Light green for somewhat generous
    return 'var(--color-text-primary)'
  }

  const hasNoVotes = votesWithConsensus === 0

  return (
    <div
      className="p-4 rounded-2xl border"
      style={{
        background: 'var(--color-surface-elevated)',
        borderColor: 'var(--color-divider)',
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        Your Rating Style
      </p>

      {hasNoVotes ? (
        <div className="mt-3">
          <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {biasLabel}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Rate dishes to discover your voting personality
          </p>
          {votesPending > 0 && (
            <p className="text-sm mt-2" style={{ color: 'var(--color-primary)' }}>
              {votesPending} vote{votesPending === 1 ? '' : 's'} waiting for consensus
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Big bias number */}
          <div className="mt-2 flex items-baseline gap-3">
            <span
              className="text-4xl font-bold tabular-nums"
              style={{ color: getBiasColor(ratingBias) }}
            >
              {formatBias(ratingBias)}
            </span>
            <span
              className="text-lg font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {biasLabel}
            </span>
          </div>

          {/* Stats row */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Based on <span style={{ color: 'var(--color-text-primary)' }}>{votesWithConsensus}</span> dish{votesWithConsensus === 1 ? '' : 'es'}
            </span>

            {votesPending > 0 && (
              <span style={{ color: 'var(--color-primary)' }}>
                {votesPending} pending
              </span>
            )}

            {dishesHelpedEstablish > 0 && (
              <span style={{ color: 'var(--color-text-tertiary)' }}>
                Helped establish {dishesHelpedEstablish}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default RatingIdentityCard
