import { useState, useEffect } from 'react'
import { BROWSE_CATEGORIES } from '../../constants/categories'
import { restaurantsApi } from '../../api/restaurantsApi'

/**
 * Food Map — exploration progress in a single rounded box
 */
export function FoodMap({ stats, title }) {
  const [totalRestaurants, setTotalRestaurants] = useState(null)

  useEffect(() => {
    restaurantsApi.getCount().then(setTotalRestaurants)
  }, [])

  const categoryCounts = stats.categoryCounts || {}
  const exploredCategories = BROWSE_CATEGORIES.filter(c => categoryCounts[c.id] > 0)
  const topCategories = exploredCategories.slice().sort((a, b) => (categoryCounts[b.id] || 0) - (categoryCounts[a.id] || 0)).slice(0, 3)

  return (
    <div
      className="rounded-2xl px-4 py-4"
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-divider)',
      }}
    >
      <h2
        className="font-bold mb-3"
        style={{
          color: 'var(--color-text-primary)',
          fontSize: '15px',
          letterSpacing: '-0.01em',
        }}
      >
        {title || 'Your Food Map'}
      </h2>

      <div className="space-y-2">
        <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="w-5 text-center">{'\uD83C\uDF7D\uFE0F'}</span>
          <span>
            <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{stats.totalVotes}</span> dishes rated
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="w-5 text-center">{'\uD83C\uDFE0'}</span>
          <span>
            <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{stats.uniqueRestaurants}</span>
            {totalRestaurants ? ` of ${totalRestaurants}` : ''} restaurants visited
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="w-5 text-center">{'\uD83D\uDCCB'}</span>
          <span>
            <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{exploredCategories.length}</span> of {BROWSE_CATEGORIES.length} categories explored
          </span>
        </div>
      </div>

      {topCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {topCategories.map(function (cat) {
            return (
              <span
                key={cat.id}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  background: 'var(--color-primary-muted)',
                  color: 'var(--color-primary)',
                }}
              >
                {cat.emoji} {cat.label}
                <span style={{ opacity: 0.6 }}>{categoryCounts[cat.id]}</span>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FoodMap
