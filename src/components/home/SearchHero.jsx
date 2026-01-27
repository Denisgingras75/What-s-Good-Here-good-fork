import { useState } from 'react'
import { DishSearch } from '../DishSearch'
import { RadiusChip } from './RadiusChip'
import { RadiusSheet } from '../LocationPicker'

/**
 * Unified hero section combining:
 * - Brand mark + greeting
 * - Radius filter chip (inline)
 * - Search input (prominent, primary action)
 */
export function SearchHero({ name, radius, onRadiusChange, loading }) {
  const [showRadiusSheet, setShowRadiusSheet] = useState(false)

  return (
    <section className="px-4 pt-4 pb-6" style={{ background: 'var(--color-bg)' }}>
      {/* Greeting row with radius filter */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Hello{name ? `, ${name}` : ''}!
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)', opacity: 0.9 }}>
            What's good today?
          </p>
        </div>
        <RadiusChip radius={radius} onClick={() => setShowRadiusSheet(true)} />
      </div>

      {/* Search - hero element */}
      <DishSearch loading={loading} />

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
