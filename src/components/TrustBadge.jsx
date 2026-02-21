/**
 * Displays trust indicators on reviews and profiles.
 *
 * Types:
 * - 'human_verified': Green check — reviewer has consistent jitter profile (5+ reviews)
 * - 'trusted_reviewer': Solid green — high-confidence jitter (15+ reviews)
 * - 'ai_estimated': Blue info — AI-estimated from Google reviews
 * - 'building': Gray — new reviewer, building verification
 * - null: No badge shown
 */
export function TrustBadge({ type, size = 'sm' }) {
  if (!type) return null

  const configs = {
    human_verified: {
      label: 'Verified Human',
      icon: '\u2713',
      bg: 'rgba(34, 197, 94, 0.12)',
      color: 'var(--color-rating)',
      border: 'rgba(34, 197, 94, 0.3)',
    },
    trusted_reviewer: {
      label: 'Trusted Reviewer',
      icon: '\u2713\u2713',
      bg: 'rgba(34, 197, 94, 0.18)',
      color: 'var(--color-rating)',
      border: 'rgba(34, 197, 94, 0.4)',
    },
    ai_estimated: {
      label: 'Estimated from public reviews',
      icon: '\u2139',
      bg: 'rgba(59, 130, 246, 0.1)',
      color: '#3b82f6',
      border: 'rgba(59, 130, 246, 0.25)',
    },
    building: {
      label: 'Building verification...',
      icon: '\u25CC',
      bg: 'rgba(156, 163, 175, 0.1)',
      color: 'var(--color-text-tertiary)',
      border: 'rgba(156, 163, 175, 0.25)',
    },
  }

  const config = configs[type]
  if (!config) return null

  const fontSize = size === 'sm' ? '11px' : '12px'
  const padding = size === 'sm' ? '2px 6px' : '3px 8px'

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap"
      style={{
        fontSize,
        padding,
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}
      title={config.label}
    >
      <span style={{ fontSize: size === 'sm' ? '10px' : '11px' }}>{config.icon}</span>
      {config.label}
    </span>
  )
}

/**
 * Review trust summary for restaurant pages.
 * Shows "12 verified reviews, 8 AI-estimated"
 */
export function TrustSummary({ verifiedCount, aiCount }) {
  if (!verifiedCount && !aiCount) return null

  return (
    <div className="flex items-center gap-2 flex-wrap" style={{ fontSize: '12px' }}>
      {verifiedCount > 0 && (
        <span className="flex items-center gap-1" style={{ color: 'var(--color-rating)' }}>
          <span>{'\u2713'}</span>
          <span>{verifiedCount} verified review{verifiedCount !== 1 ? 's' : ''}</span>
        </span>
      )}
      {aiCount > 0 && (
        <span className="flex items-center gap-1" style={{ color: '#3b82f6' }}>
          <span>{'\u2139'}</span>
          <span>{aiCount} AI-estimated</span>
        </span>
      )}
    </div>
  )
}
