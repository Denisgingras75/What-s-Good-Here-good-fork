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
        color: 'var(--color-text-tertiary)',
      }}
    >
      <div
        className="rounded-full relative overflow-hidden"
        style={{
          width: '56px',
          height: '56px',
          background: 'var(--color-surface-elevated)',
        }}
      >
        {/* Ocean waves */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 52 28"
          fill="none"
        >
          <path
            d="M0 14 C6 10, 12 18, 18 14 S30 10, 36 14 S48 18, 52 14 L52 28 L0 28 Z"
            fill="#3d8b9e"
            opacity="0.4"
          />
          <path
            d="M0 18 C7 14, 14 22, 20 18 S32 14, 38 18 S50 22, 52 18 L52 28 L0 28 Z"
            fill="#4a9fb3"
            opacity="0.3"
          />
          <path
            d="M0 22 C8 18, 16 26, 24 22 S36 18, 44 22 S52 26, 52 22 L52 28 L0 28 Z"
            fill="#5bb5c7"
            opacity="0.25"
          />
        </svg>
        {/* Location pin — bold filled to match food icon weight */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: '-4px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--color-accent-gold)" opacity="0.7">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
          </svg>
        </div>
      </div>
      <span className="font-medium" style={{ letterSpacing: '0.01em' }}>{currentTown?.label || 'All Island'}</span>
    </button>
  )
}
