import { useState, useEffect } from 'react'
import { profileApi } from '../../api/profileApi'
import { CATEGORY_INFO } from '../../constants/categories'
import { logger } from '../../utils/logger'

const MIN_VOTES_FOR_TASTE = 5

/**
 * Generate a plain-English taste description from per-category bias stats.
 * Positive bias = rates higher than consensus ("loves"), negative = lower ("tough on").
 */
function describeTaste(categoryStats) {
  // Filter to categories with enough signal
  const meaningful = categoryStats.filter(
    c => c.total_ratings >= MIN_VOTES_FOR_TASTE && c.bias != null
  )

  if (meaningful.length === 0) return null

  // Sort by absolute bias — strongest opinions first
  const sorted = meaningful.slice().sort((a, b) => Math.abs(b.bias) - Math.abs(a.bias))

  const phrases = []
  let neutralCount = 0

  for (const cat of sorted) {
    const info = CATEGORY_INFO[cat.category]
    const label = info?.label || cat.category
    const bias = Number(cat.bias)

    if (bias >= 0.8) {
      phrases.push(`Loves ${label.toLowerCase()}`)
    } else if (bias <= -0.8) {
      phrases.push(`Tough on ${label.toLowerCase()}`)
    } else {
      neutralCount++
    }
  }

  if (neutralCount > 0 && phrases.length > 0) {
    phrases.push('fair on everything else')
  }

  return phrases.length > 0 ? phrases : null
}

function formatBias(bias) {
  if (bias === 0 || bias == null) return '0.0'
  return bias > 0 ? `+${bias.toFixed(1)}` : bias.toFixed(1)
}

function getBiasColor(bias) {
  if (bias == null || bias === 0) return 'var(--color-text-secondary)'
  if (bias < -1) return '#ef4444'
  if (bias < 0) return '#f97316'
  if (bias > 1) return '#10b981'
  if (bias > 0) return '#22c55e'
  return 'var(--color-text-primary)'
}

/**
 * TasteProfile — overall rating deviation + plain-English taste description
 */
export function TasteProfile({ userId }) {
  const [categoryStats, setCategoryStats] = useState([])
  const [ratingBias, setRatingBias] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showExplainer, setShowExplainer] = useState(false)

  useEffect(() => {
    if (!userId) return

    let cancelled = false
    setLoading(true)

    Promise.all([
      profileApi.getTasteStats(userId),
      profileApi.getRatingBias(userId),
    ])
      .then(([stats, bias]) => {
        if (!cancelled) {
          setCategoryStats(stats)
          setRatingBias(bias)
        }
      })
      .catch(err => {
        logger.error('Failed to fetch taste stats:', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [userId])

  if (loading) return null

  const phrases = describeTaste(categoryStats)
  const totalRatings = categoryStats.reduce((sum, c) => sum + (c.total_ratings || 0), 0)
  const categoriesWithVotes = categoryStats.filter(c => c.total_ratings >= MIN_VOTES_FOR_TASTE).length
  const hasRatingData = ratingBias && ratingBias.votesWithConsensus > 0

  // Not enough data yet
  if (!phrases && !hasRatingData) {
    return (
      <div
        className="rounded-2xl border p-4"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-divider)',
          boxShadow: '0 2px 12px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(217, 167, 101, 0.04)',
        }}
      >
        <h2
          className="font-bold mb-1.5"
          style={{
            color: 'var(--color-text-primary)',
            fontSize: '15px',
            letterSpacing: '-0.01em',
          }}
        >
          Your Taste
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          Still exploring — rate more dishes to see your taste profile
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: 'var(--color-card)',
        borderColor: 'var(--color-divider)',
        boxShadow: '0 2px 12px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(217, 167, 101, 0.04)',
      }}
    >
      <div className="px-4 py-3.5 border-b" style={{ borderColor: 'var(--color-divider)' }}>
        <div className="flex items-center justify-between">
          <h2
            className="font-bold"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: '15px',
              letterSpacing: '-0.01em',
            }}
          >
            Your Taste
          </h2>
          {hasRatingData && (
            <button
              onClick={() => setShowExplainer(!showExplainer)}
              className="flex items-center justify-center w-6 h-6 rounded-full transition-colors hover:bg-white/10"
              aria-label="How is this calculated?"
            >
              <svg className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Overall deviation score */}
        {hasRatingData && (
          <div className="flex items-baseline gap-3 mb-3">
            <span
              className="text-3xl font-bold tabular-nums"
              style={{ color: getBiasColor(ratingBias.ratingBias) }}
            >
              {formatBias(ratingBias.ratingBias)}
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {ratingBias.biasLabel}
            </span>
          </div>
        )}

        {/* Explainer */}
        {showExplainer && hasRatingData && (
          <div
            className="rounded-lg p-3 mb-3 text-xs leading-relaxed"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <p>
              Your score of <strong style={{ color: 'var(--color-text-primary)' }}>{formatBias(ratingBias.ratingBias)}</strong> means
              you rate dishes an average of {Math.abs(ratingBias.ratingBias).toFixed(1)} points{' '}
              {ratingBias.ratingBias < 0 ? 'lower' : 'higher'} than the crowd consensus.
            </p>
            <p className="mt-1.5">
              We compare your rating on each dish to its average score once it has enough votes.
              A negative number means you're a tougher critic; positive means you're more generous.
            </p>
            <p className="mt-1.5" style={{ color: 'var(--color-text-tertiary)' }}>
              Based on {ratingBias.votesWithConsensus} dish{ratingBias.votesWithConsensus === 1 ? '' : 'es'} with enough votes to compare.
            </p>
          </div>
        )}

        {/* Per-category taste phrases */}
        {phrases && (
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {phrases.join(' \u00B7 ')}
          </p>
        )}
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
          {phrases
            ? `Based on ${totalRatings} ratings across ${categoriesWithVotes} ${categoriesWithVotes === 1 ? 'category' : 'categories'}`
            : `${ratingBias.votesWithConsensus} dishes compared to consensus`
          }
        </p>
      </div>
    </div>
  )
}
