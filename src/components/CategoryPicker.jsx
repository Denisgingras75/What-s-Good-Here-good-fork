import { useState, useMemo } from 'react'
import { MAIN_CATEGORIES, matchCategories, getCategoryById } from '../constants/categories'

const MAX_SELECTIONS = 3

export function CategoryPicker({
  selectedCategories = [],
  onSelectionChange,
  showHeader = true,
  compact = false,
}) {
  const [searchTerm, setSearchTerm] = useState('')

  // Get matching categories from search
  const searchMatches = useMemo(() => {
    return matchCategories(searchTerm)
  }, [searchTerm])

  // Toggle a category selection
  const toggleCategory = (categoryId) => {
    const isSelected = selectedCategories.includes(categoryId)

    if (isSelected) {
      // Remove from selection
      onSelectionChange(selectedCategories.filter(id => id !== categoryId))
    } else if (selectedCategories.length < MAX_SELECTIONS) {
      // Add to selection
      onSelectionChange([...selectedCategories, categoryId])
    }
  }

  // Check if a category is selected
  const isSelected = (categoryId) => selectedCategories.includes(categoryId)

  // Can add more categories
  const canAddMore = selectedCategories.length < MAX_SELECTIONS

  return (
    <div className={compact ? '' : 'space-y-4'}>
      {/* Header with selection count */}
      {showHeader && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            What do you love to eat?
          </p>
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{
              background: selectedCategories.length === MAX_SELECTIONS
                ? 'var(--color-primary-muted)'
                : 'var(--color-surface-elevated)',
              color: selectedCategories.length === MAX_SELECTIONS
                ? 'var(--color-primary)'
                : 'var(--color-text-tertiary)',
            }}
          >
            {selectedCategories.length}/{MAX_SELECTIONS} selected
          </span>
        </div>
      )}

      {/* Main category chips */}
      <div className="flex flex-wrap gap-2">
        {MAIN_CATEGORIES.map((category) => {
          const selected = isSelected(category.id)
          const disabled = !selected && !canAddMore

          return (
            <button
              key={category.id}
              onClick={() => !disabled && toggleCategory(category.id)}
              disabled={disabled}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                transition-all duration-200
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}
              `}
              style={{
                background: selected ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                color: selected ? 'white' : 'var(--color-text-primary)',
                border: selected ? '2px solid var(--color-primary)' : '2px solid var(--color-divider)',
              }}
            >
              <span>{category.emoji}</span>
              <span>{category.label}</span>
              {selected && (
                <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          )
        })}
      </div>

      {/* Custom search input */}
      <div className="mt-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Don't see yours? Type it in..."
            className="w-full px-4 py-3 pr-10 rounded-xl text-sm transition-colors focus:outline-none"
            style={{
              background: 'var(--color-surface-elevated)',
              border: '2px solid var(--color-divider)',
              color: 'var(--color-text-primary)',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search results */}
        {searchTerm && searchMatches.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {searchMatches.map((category) => {
              const selected = isSelected(category.id)
              const disabled = !selected && !canAddMore
              // Don't show if already in main categories display
              const isMainCategory = MAIN_CATEGORIES.some(c => c.id === category.id)

              if (isMainCategory) return null

              return (
                <button
                  key={category.id}
                  onClick={() => !disabled && toggleCategory(category.id)}
                  disabled={disabled}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                    transition-all duration-200 animate-fade-in-up
                    ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}
                  `}
                  style={{
                    background: selected ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                    color: selected ? 'white' : 'var(--color-text-primary)',
                    border: selected ? '2px solid var(--color-primary)' : '2px solid var(--color-primary-muted)',
                  }}
                >
                  <span>{category.emoji}</span>
                  <span>{category.label}</span>
                  {selected && (
                    <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* No matches message */}
        {searchTerm && searchTerm.length >= 2 && searchMatches.length === 0 && (
          <p className="mt-2 text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
            No matching categories found. Try a different term!
          </p>
        )}
      </div>

      {/* Selected categories summary (when compact) */}
      {compact && selectedCategories.length > 0 && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-divider)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
            Your picks:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map(catId => {
              const category = getCategoryById(catId)
              if (!category) return null
              return (
                <span
                  key={catId}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                  style={{
                    background: 'var(--color-primary-muted)',
                    color: 'var(--color-primary)',
                  }}
                >
                  {category.emoji} {category.label}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
