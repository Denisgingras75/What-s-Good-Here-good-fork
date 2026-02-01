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

// MAD is always positive — lower = closer to consensus
function getSpreadColor(mad) {
  if (mad == null) return 'var(--color-text-secondary)'
  if (mad < 0.5) return '#10b981'   // Green — consensus voter
  if (mad < 1.0) return '#22c55e'   // Light green — has opinions
  if (mad < 2.0) return '#f97316'   // Orange — strong opinions
  return '#ef4444'                   // Red — wild card
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
              style={{ color: getSpreadColor(ratingBias.ratingBias) }}
            >
              {ratingBias.ratingBias.toFixed(1)}
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
              When you rate a dish, we compare your score to the crowd average.
              Your number is how far off you typically are — in either direction.
            </p>
            <p className="mt-1.5">
              You average <strong style={{ color: 'var(--color-text-primary)' }}>{ratingBias.ratingBias.toFixed(1)} points</strong> away
              from the crowd on each dish.
            </p>

            <div className="mt-2.5 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold tabular-nums w-10 text-right" style={{ color: '#10b981' }}>0–0.5</span>
                <span style={{ color: 'var(--color-text-primary)' }}>Consensus Voter</span>
                <span style={{ color: 'var(--color-text-tertiary)' }}>— you and the crowd mostly agree</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold tabular-nums w-10 text-right" style={{ color: '#22c55e' }}>0.5–1</span>
                <span style={{ color: 'var(--color-text-primary)' }}>Has Opinions</span>
                <span style={{ color: 'var(--color-text-tertiary)' }}>— slight disagreements here and there</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold tabular-nums w-10 text-right" style={{ color: '#f97316' }}>1–2</span>
                <span style={{ color: 'var(--color-text-primary)' }}>Strong Opinions</span>
                <span style={{ color: 'var(--color-text-tertiary)' }}>— you often see things differently</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold tabular-nums w-10 text-right" style={{ color: '#ef4444' }}>2+</span>
                <span style={{ color: 'var(--color-text-primary)' }}>Wild Card</span>
                <span style={{ color: 'var(--color-text-tertiary)' }}>— your taste is uniquely your own</span>
              </div>
            </div>

            <p className="mt-2.5" style={{ color: 'var(--color-text-tertiary)' }}>
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
