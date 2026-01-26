/**
 * PendingVotesIndicator - Small badge showing pending votes count
 *
 * Displays "X pending" for votes waiting for consensus
 */

export function PendingVotesIndicator({ count, className = '' }) {
  if (!count || count <= 0) return null

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        background: 'var(--color-primary-muted)',
        color: 'var(--color-primary)',
      }}
    >
      <svg
        className="w-3 h-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
      </svg>
      {count} pending
    </span>
  )
}

export default PendingVotesIndicator
