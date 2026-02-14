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

  const currentTown = MV_TOWNS.find(t => t.value === town)

  return (
    <button
      onClick={() => onToggle(true)}
      className="flex-shrink-0 flex flex-col items-center gap-1.5 px-2 py-1 transition-all active:scale-[0.97]"
      style={{
        minWidth: '56px',
        fontSize: '11px',
        color: 'var(--color-accent-gold)',
      }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: 'var(--color-surface-elevated)' }}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      </div>
      <span className="font-semibold">{currentTown?.label || 'All Island'}</span>
    </button>
  )
}
