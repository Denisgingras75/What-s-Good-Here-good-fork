import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dishesApi } from '../api/dishesApi'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { getRatingColor } from '../utils/ranking'
import { logger } from '../utils/logger'

/**
 * VariantPicker - Shows expandable list of dish variants
 * Used when a parent dish has multiple flavor/style options
 */
export function VariantPicker({ parentDishId, parentDishName, onVariantSelect, initiallyExpanded = false }) {
  const navigate = useNavigate()
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(initiallyExpanded)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!parentDishId) return

    async function fetchVariants() {
      setLoading(true)
      setError(null)
      try {
        const data = await dishesApi.getVariants(parentDishId)
        setVariants(data)
      } catch (err) {
        logger.error('Error fetching variants:', err)
        setError('Unable to load variants')
      } finally {
        setLoading(false)
      }
    }

    // Only fetch when expanded or initially expanded
    if (expanded || initiallyExpanded) {
      fetchVariants()
    }
  }, [parentDishId, expanded, initiallyExpanded])

  const handleExpand = (e) => {
    e.stopPropagation()
    setExpanded(!expanded)
  }

  const handleVariantClick = (e, variant) => {
    e.stopPropagation()
    if (onVariantSelect) {
      onVariantSelect(variant)
    } else {
      navigate(`/dish/${variant.dish_id}`)
    }
  }

  if (!parentDishId) return null

  return (
    <div className="mt-2">
      {/* Expand/Collapse Button */}
      <button
        onClick={handleExpand}
        className="flex items-center gap-1 text-xs font-medium transition-colors"
        style={{ color: 'var(--color-primary)' }}
      >
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        {expanded ? 'Hide flavors' : 'Show all flavors'}
      </button>

      {/* Variant List */}
      {expanded && (
        <div
          className="mt-2 rounded-lg overflow-hidden"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)' }}
        >
          {loading ? (
            <div className="p-3 space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 rounded animate-pulse" style={{ background: 'var(--color-divider)' }} />
              ))}
            </div>
          ) : error ? (
            <div className="p-3 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {error}
            </div>
          ) : variants.length === 0 ? (
            <div className="p-3 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              No variants found
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--color-divider)' }}>
              {variants.map((variant) => {
                const isRanked = (variant.total_votes || 0) >= MIN_VOTES_FOR_RANKING
                return (
                  <button
                    key={variant.dish_id}
                    onClick={(e) => handleVariantClick(e, variant)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-black/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block" style={{ color: 'var(--color-text-primary)' }}>
                        {variant.dish_name}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        {variant.total_votes > 0
                          ? `${variant.total_votes} vote${variant.total_votes === 1 ? '' : 's'}`
                          : 'No votes yet'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {isRanked && variant.avg_rating && (
                        <span
                          className="text-sm font-bold"
                          style={{ color: getRatingColor(variant.avg_rating) }}
                        >
                          {variant.avg_rating}
                        </span>
                      )}
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * VariantBadge - Compact badge showing variant count
 * Used in cards to indicate a dish has variants
 */
export function VariantBadge({ variantCount, bestVariantName, bestVariantRating, onClick }) {
  if (!variantCount || variantCount === 0) return null

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors hover:opacity-80"
      style={{
        background: 'var(--color-primary-muted)',
        color: 'var(--color-primary)'
      }}
    >
      <span>{variantCount} flavor{variantCount === 1 ? '' : 's'}</span>
      {bestVariantName && (
        <>
          <span style={{ color: 'var(--color-divider)' }}>·</span>
          <span className="truncate max-w-[80px]">Best: {bestVariantName}</span>
          {bestVariantRating && (
            <span className="font-bold" style={{ color: getRatingColor(bestVariantRating) }}>
              {bestVariantRating}
            </span>
          )}
        </>
      )}
    </button>
  )
}

/**
 * VariantSelector - Horizontal pill selector for variants
 * Used on dish detail page to switch between variants
 */
export function VariantSelector({ variants, currentDishId, onSelect }) {
  if (!variants || variants.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => {
        const isActive = variant.dish_id === currentDishId
        return (
          <button
            key={variant.dish_id}
            onClick={() => onSelect(variant)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isActive ? 'ring-2 ring-offset-1' : 'hover:opacity-80'
            }`}
            style={{
              background: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
              color: isActive ? 'var(--color-text-on-primary)' : 'var(--color-text-secondary)',
              borderColor: 'var(--color-divider)',
              border: isActive ? 'none' : '1px solid var(--color-divider)',
              '--tw-ring-color': 'var(--color-primary)',
            }}
          >
            {variant.dish_name}
            {variant.avg_rating && (
              <span className="ml-1 opacity-80">
                ({variant.avg_rating})
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
