import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BROWSE_CATEGORIES } from '../../constants/categories'
import { restaurantsApi } from '../../api/restaurantsApi'

/**
 * Food Map — exploration progress card
 * Shows how much of the island's food scene the user has explored
 */
export function FoodMap({ stats, title }) {
  const navigate = useNavigate()
  const [totalRestaurants, setTotalRestaurants] = useState(null)

  useEffect(() => {
    restaurantsApi.getCount().then(setTotalRestaurants)
  }, [])

  const categoryCounts = stats.categoryCounts || {}
  const exploredCategories = BROWSE_CATEGORIES.filter(c => categoryCounts[c.id] > 0)
  // Top 3 by vote count
  const topCategories = exploredCategories.slice().sort((a, b) => (categoryCounts[b.id] || 0) - (categoryCounts[a.id] || 0)).slice(0, 3)

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
        <h2
          className="font-bold"
          style={{
            color: 'var(--color-text-primary)',
            fontSize: '15px',
            letterSpacing: '-0.01em',
          }}
        >
          {title || 'Your MV Food Map'}
        </h2>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Stats */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <span className="w-5 text-center">&#127860;</span>
            <span>
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{stats.totalVotes}</span> dishes rated
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <span className="w-5 text-center">&#127968;</span>
            <span>
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{stats.uniqueRestaurants}</span>
              {totalRestaurants ? ` of ${totalRestaurants}` : ''} restaurants visited
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <span className="w-5 text-center">&#128203;</span>
            <span>
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{exploredCategories.length}</span> of {BROWSE_CATEGORIES.length} categories explored
            </span>
          </div>
        </div>

        {/* Top 3 categories */}
        {topCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {topCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(`/browse?category=${encodeURIComponent(cat.id)}`)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80"
                style={{
                  background: 'var(--color-primary-muted)',
                  color: 'var(--color-primary)',
                }}
              >
                {cat.emoji} {cat.label}
                <span className="opacity-60">{categoryCounts[cat.id]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
