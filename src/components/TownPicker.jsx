import { MV_TOWNS } from '../constants/towns'

/**
 * TownPicker - Inline pill that expands town options into the scroll strip
 */
export function TownPicker({ town, onTownChange, isOpen, onToggle }) {
  const currentLabel = MV_TOWNS.find(t => t.value === town)?.label || 'All Island'

  const handleSelect = (value) => {
    onTownChange(value)
    onToggle(false)
  }

  if (isOpen) {
    return (
      <>
        <button
          onClick={() => onToggle(false)}
          className="flex-shrink-0 flex items-center gap-1.5 pl-3 pr-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-[0.97]"
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-text-on-primary)',
          }}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Close</span>
        </button>
        {MV_TOWNS.map((option) => (
          <button
            key={option.label}
            onClick={() => handleSelect(option.value)}
            className="flex-shrink-0 pl-3 pr-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-[0.97]"
            style={{
              background: option.value === town
                ? 'var(--color-primary)'
                : 'var(--color-surface-elevated)',
              color: option.value === town
                ? 'white'
                : 'var(--color-text-secondary)',
            }}
          >
            {option.label}
          </button>
        ))}
      </>
    )
  }

  return (
    <button
      onClick={() => onToggle(true)}
      className="flex-shrink-0 flex items-center gap-1.5 pl-3 pr-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-[0.97]"
      style={{
        background: 'var(--color-surface-elevated)',
        color: 'var(--color-text-secondary)',
      }}
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span>{currentLabel}</span>
    </button>
  )
}
