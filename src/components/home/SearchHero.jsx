import { useState } from 'react'
import { DishSearch } from '../DishSearch'
import { RadiusChip } from './RadiusChip'
import { RadiusSheet } from '../LocationPicker'

/**
 * Unified hero section combining:
 * - Centered logo
 * - Greeting + subtitle (centered)
 * - Search input + radius chip (inline row)
 */
export function SearchHero({ name, radius, onRadiusChange, loading }) {
  const [showRadiusSheet, setShowRadiusSheet] = useState(false)

  return (
    <section className="px-4 pt-8 pb-6" style={{ background: 'var(--color-bg)' }}>
      {/* Logo - centered */}
      <div className="flex justify-center mb-6">
        <img
          src="/logo.png"
          alt="What's Good Here"
          className="h-[100px] md:h-[120px] lg:h-[140px] w-auto object-contain"
        />
      </div>

      {/* Greeting - centered */}
      <h1
        className="text-2xl font-bold text-center mb-1"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Hello{name ? `, ${name}` : ''}!
      </h1>
      <p
        className="text-sm text-center mb-4"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        What do you want to eat today?
      </p>

      {/* Search + Radius inline row */}
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <DishSearch loading={loading} />
        </div>
        <RadiusChip radius={radius} onClick={() => setShowRadiusSheet(true)} />
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
