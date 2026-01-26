import { getCategoryInfo } from '../../constants/categories'

/**
 * CategoryBiasBreakdown - Shows user's rating bias per category
 *
 * Displays per-category biases with labels like:
 * Pizza: -0.4 (Fair)
 * Burgers: -2.1 (Brutal)
 */

// Get label for a bias value
function getBiasLabel(bias) {
  if (bias === null || bias === undefined) return 'New'
  if (bias <= -2.5) return 'Brutal'
  if (bias <= -1.5) return 'Tough'
  if (bias <= -0.5) return 'Discerning'
  if (bias <= 0.5) return 'Fair'
  if (bias <= 1.5) return 'Generous'
  if (bias <= 2.5) return 'Easy'
  return 'Easy'
}

// Get color for a bias value
function getBiasColor(bias) {
  if (bias === null || bias === undefined) return 'var(--color-text-tertiary)'
  if (bias < -1) return '#ef4444'
  if (bias < 0) return '#f97316'
  if (bias > 1) return '#10b981'
  if (bias > 0) return '#22c55e'
  return 'var(--color-text-secondary)'
}

// Format bias number
function formatBias(bias) {
  if (bias === null || bias === undefined) return '—'
  return bias > 0 ? `+${bias.toFixed(1)}` : bias.toFixed(1)
}

export function CategoryBiasBreakdown({ categoryBiases, className = '' }) {
  // Convert object to array and sort by absolute bias (most extreme first)
  const biasEntries = Object.entries(categoryBiases || {})
    .map(([category, bias]) => ({ category, bias: Number(bias) }))
    .sort((a, b) => Math.abs(b.bias) - Math.abs(a.bias))

  if (biasEntries.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <p
        className="text-xs font-semibold uppercase tracking-wide mb-2"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        Your Taste by Category
      </p>

      <div className="space-y-1.5">
        {biasEntries.map(({ category, bias }) => {
          const catInfo = getCategoryInfo(category)
          const label = getBiasLabel(bias)

          return (
            <div
              key={category}
              className="flex items-center justify-between text-sm"
            >
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {catInfo.emoji && <span className="mr-1.5">{catInfo.emoji}</span>}
                {catInfo.label}
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="font-semibold tabular-nums"
                  style={{ color: getBiasColor(bias) }}
                >
                  {formatBias(bias)}
                </span>
                <span
                  className="text-xs"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  ({label})
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CategoryBiasBreakdown
