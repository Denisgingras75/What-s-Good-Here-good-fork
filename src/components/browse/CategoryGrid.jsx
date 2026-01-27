import { useRef, useEffect } from 'react'
import { CategoryImageCard } from '../CategoryImageCard'
import { SearchAutocomplete } from './SearchAutocomplete'
import { BROWSE_CATEGORIES } from '../../constants/categories'

const CATEGORIES = BROWSE_CATEGORIES

export function CategoryGrid({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  autocompleteSuggestions,
  autocompleteOpen,
  autocompleteIndex,
  onAutocompleteSelect,
  onSearchKeyDown,
  onSearchFocus,
  onSearchBlur,
  searchFocused,
  onClearSearch,
  onSearchSubmit,
}) {
  const searchInputRef = useRef(null)
  const autocompleteRef = useRef(null)

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(e.target) &&
        !searchInputRef.current?.contains(e.target)
      ) {
        // Signal to parent to close autocomplete
        onSearchBlur()
      }
    }
    document.addEventListener('mousedown', handleClickOutside, { passive: true })
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onSearchBlur])

  return (
    <div
      className="px-6 pt-5 pb-6 relative"
      style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 50%, #121212 100%)',
        minHeight: 'calc(100vh - 80px)',
      }}
    >
      {/* Table edge - top bevel/rim catching light */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.08) 80%, transparent 100%)',
        }}
      />

      {/* Section title - anchors the grid */}
      <div className="flex justify-center pt-4 pb-10">
        <span
          className="text-[11px] font-semibold tracking-[0.2em] uppercase"
          style={{ color: 'rgba(255, 255, 255, 0.45)' }}
        >
          Categories
        </span>
      </div>

      {/* Category grid - 12 items, 4 rows of 3, shelf-like rhythm */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-7 justify-items-center">
        {CATEGORIES.map((category) => (
          <CategoryImageCard
            key={category.id}
            category={category}
            isActive={selectedCategory === category.id}
            onClick={() => onCategoryChange(category.id)}
            size={72}
          />
        ))}
      </div>

      {/* Search bar - escape hatch, visually separate from categories */}
      <div className="mt-auto pt-10">
        <div className="relative">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
            style={{
              background: 'var(--color-bg)',
              border: `2px solid ${searchFocused ? 'var(--color-accent-cyan)' : 'var(--color-divider)'}`,
              boxShadow: searchFocused ? '0 0 20px rgba(0, 245, 212, 0.1)' : 'none',
            }}
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              style={{ color: 'var(--color-text-tertiary)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              id="category-grid-search"
              name="category-grid-search"
              type="text"
              placeholder="Find the best ___ near you"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={onSearchFocus}
              onBlur={onSearchBlur}
              onKeyDown={onSearchKeyDown}
              className="flex-1 bg-transparent outline-none border-none text-sm"
              style={{ color: 'var(--color-text-primary)', outline: 'none', border: 'none', boxShadow: 'none' }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  onClearSearch()
                  searchInputRef.current?.focus()
                }}
                className="p-1 rounded-full transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <svg
                  className="w-4 h-4"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Autocomplete dropdown */}
          <SearchAutocomplete
            ref={autocompleteRef}
            suggestions={autocompleteSuggestions}
            isOpen={autocompleteOpen}
            activeIndex={autocompleteIndex}
            onSelect={onAutocompleteSelect}
          />
        </div>
      </div>
    </div>
  )
}
