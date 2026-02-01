import { VALUE_BADGE_THRESHOLD } from '../../constants/app'

export function ValueBadge({ valuePercentile }) {
  if (valuePercentile == null || valuePercentile < VALUE_BADGE_THRESHOLD) {
    return null
  }

  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide"
      style={{
        fontSize: '10px',
        lineHeight: '14px',
        color: '#059669',
        background: 'rgba(16, 185, 129, 0.15)',
      }}
    >
      Best Value
    </span>
  )
}
