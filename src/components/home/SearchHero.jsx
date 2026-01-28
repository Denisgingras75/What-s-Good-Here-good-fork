import { useState } from 'react'
import { DishSearch } from '../DishSearch'
import { RadiusSheet } from '../LocationPicker'

/**
 * SearchHero - Hero section with value proposition and prominent search
 *
 * Design Philosophy:
 * - Clear value proposition headline
 * - Prominent search bar as primary CTA
 * - Radius selector tucked away as subtle link
 */
export function SearchHero({ radius, onRadiusChange, loading }) {
  const [showRadiusSheet, setShowRadiusSheet] = useState(false)

  return (
    <section className="px-4 pt-6 pb-6" style={{ background: 'var(--color-bg)' }}>
      {/* Value proposition */}
      <div className="mb-4 text-center">
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          What are the best dishes on
          <br />
          Martha's Vineyard?
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Crowd-ranked by locals and visitors
        </p>
      </div>

      {/* Search - hero element */}
      <DishSearch loading={loading} placeholder="Search dishes or categories" />

      {/* Subtle radius link */}
      <div className="mt-3 text-center">
        <button
          onClick={() => setShowRadiusSheet(true)}
          className="text-xs font-medium transition-colors"
          style={{ color: 'var(--color-text-tertiary)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
        >
          Showing dishes within {radius} mi
        </button>
      </div>

      {/* Radius selection sheet */}
      <RadiusSheet
        isOpen={showRadiusSheet}
        onClose={() => setShowRadiusSheet(false)}
        radius={radius}
        onRadiusChange={onRadiusChange}
      />
    </section>
  )
}
