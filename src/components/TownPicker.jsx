import { useState, useRef, useEffect } from 'react'
import { MV_TOWNS } from '../constants/towns'

/**
 * TownPicker - Dropdown for selecting a Martha's Vineyard town filter
 */
export function TownPicker({ town, onTownChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const currentLabel = MV_TOWNS.find(t => t.value === town)?.label || 'All Island'

  const handleSelect = (value) => {
    onTownChange(value)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs font-medium transition-colors"
        style={{ color: 'var(--color-accent-gold, #D9A765)' }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>Showing:</span>
        <span className="font-semibold underline underline-offset-2">
          {currentLabel}
        </span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute left-1/2 -translate-x-1/2 mt-2 w-44 rounded-lg shadow-lg z-50 py-1 overflow-hidden"
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-divider)',
          }}
          role="listbox"
        >
          {MV_TOWNS.map((option) => (
            <button
              key={option.label}
              onClick={() => handleSelect(option.value)}
              className="w-full px-4 py-2.5 text-left text-sm transition-colors"
              style={{
                color: option.value === town ? 'var(--color-primary)' : 'var(--color-text-primary)',
                background: option.value === town ? 'var(--color-surface)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (option.value !== town) {
                  e.currentTarget.style.background = 'var(--color-surface)'
                }
              }}
              onMouseLeave={(e) => {
                if (option.value !== town) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
              role="option"
              aria-selected={option.value === town}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
