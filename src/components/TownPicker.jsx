import { ALL_TOWNS, MV_TOWNS, NANTUCKET_TOWNS, CAPE_COD_TOWNS } from '../constants/towns'

/**
 * TownPicker - Zine-style town filter button
 * Closed: bordered card with pin icon + town name
 * Open: horizontal scroll of town pills with thick borders
 * Supports multi-region: Martha's Vineyard, Nantucket, Cape Cod
 */
export function TownPicker({ town, onTownChange, isOpen, onToggle }) {
  const currentTown = ALL_TOWNS.find(t => t.value === town)
  const currentLabel = currentTown?.label || 'All Areas'

  const handleSelect = (value) => {
    onTownChange(value)
    onToggle(false)
  }

  // Build grouped town lists (skip the "All X" entries from sub-regions)
  const mvTowns = MV_TOWNS.slice(1)
  const nackTowns = NANTUCKET_TOWNS.slice(1)
  const capeTowns = CAPE_COD_TOWNS.slice(1)

  if (isOpen) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        <button
          onClick={() => onToggle(false)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs card-press"
          style={{
            background: '#E4440A',
            color: '#FFFFFF',
            border: '3px solid #1A1A1A',
            boxShadow: '2px 2px 0px #1A1A1A',
          }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Close
        </button>

        {/* All Areas */}
        <button
          onClick={() => handleSelect(null)}
          className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold card-press"
          style={{
            background: town === null ? '#E4440A' : '#FFFFFF',
            color: town === null ? '#FFFFFF' : '#1A1A1A',
            border: '3px solid #1A1A1A',
            boxShadow: '2px 2px 0px #1A1A1A',
            whiteSpace: 'nowrap',
          }}
        >
          All Areas
        </button>

        {/* Vineyard group label */}
        <span
          className="flex-shrink-0 pl-2 pr-1 py-1.5 text-[10px] font-bold uppercase tracking-wider self-center"
          style={{ color: '#999999' }}
        >
          Vineyard
        </span>

        {mvTowns.map((option) => {
          const isActive = option.value === town
          return (
            <button
              key={option.label}
              onClick={() => handleSelect(option.value)}
              className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold card-press"
              style={{
                background: isActive ? '#E4440A' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#1A1A1A',
                border: '3px solid #1A1A1A',
                boxShadow: '2px 2px 0px #1A1A1A',
                whiteSpace: 'nowrap',
              }}
            >
              {option.label}
            </button>
          )
        })}

        {/* Nantucket group label */}
        <span
          className="flex-shrink-0 pl-2 pr-1 py-1.5 text-[10px] font-bold uppercase tracking-wider self-center"
          style={{ color: '#999999' }}
        >
          Nantucket
        </span>

        {nackTowns.map((option) => {
          const isActive = option.value === town
          return (
            <button
              key={option.label}
              onClick={() => handleSelect(option.value)}
              className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold card-press"
              style={{
                background: isActive ? '#E4440A' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#1A1A1A',
                border: '3px solid #1A1A1A',
                boxShadow: '2px 2px 0px #1A1A1A',
                whiteSpace: 'nowrap',
              }}
            >
              {option.label}
            </button>
          )
        })}

        {/* Cape Cod group label */}
        <span
          className="flex-shrink-0 pl-2 pr-1 py-1.5 text-[10px] font-bold uppercase tracking-wider self-center"
          style={{ color: '#999999' }}
        >
          Cape
        </span>

        {capeTowns.map((option) => {
          const isActive = option.value === town
          return (
            <button
              key={option.label}
              onClick={() => handleSelect(option.value)}
              className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold card-press"
              style={{
                background: isActive ? '#E4440A' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#1A1A1A',
                border: '3px solid #1A1A1A',
                boxShadow: '2px 2px 0px #1A1A1A',
                whiteSpace: 'nowrap',
              }}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <button
      onClick={() => onToggle(true)}
      className="flex items-center gap-2 px-3 py-2 rounded-lg card-press"
      style={{
        background: '#FFFFFF',
        border: '3px solid #1A1A1A',
        boxShadow: '3px 3px 0px #1A1A1A',
      }}
    >
      {/* Location pin */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#E4440A">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
      </svg>
      <span
        style={{
          fontSize: '12px',
          fontWeight: 800,
          color: '#1A1A1A',
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
        }}
      >
        {currentLabel}
      </span>
      {/* Dropdown arrow */}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}
