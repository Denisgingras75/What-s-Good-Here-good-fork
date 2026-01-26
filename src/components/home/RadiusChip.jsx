/**
 * Compact radius filter chip for the hero section
 * Triggers the RadiusSheet bottom sheet when clicked
 * Styled to match the search bar height (48px)
 */
export function RadiusChip({ radius, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={`Search radius: ${radius} miles. Tap to change`}
      className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
      style={{
        background: 'var(--color-bg)',
        border: '1.5px solid var(--color-divider)',
        color: 'var(--color-text-primary)',
        minHeight: '48px',
      }}
    >
      <span>{radius} mi</span>
      <svg
        aria-hidden="true"
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}
