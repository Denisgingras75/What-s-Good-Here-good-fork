/**
 * PlateIcon - Simplified matte ceramic plate container
 *
 * Design: Single element with layered box-shadows
 * 1. Outer rim: 2px solid #232323
 * 2. Inner lip: inset box-shadow (subtle highlight)
 * 3. Concavity: inset shadow for depth
 * 4. Outer lift: drop shadow
 */

export function PlateIcon({
  size = 96,
  children,
  className = ''
}) {
  // Content inset (20% from edge for food area)
  const contentInset = Math.round(size * 0.18)

  return (
    <div
      className={`relative flex-shrink-0 rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: '#0D1B22',
        border: '2px solid rgba(255, 255, 255, 0.08)',
        boxShadow: `
          0 10px 20px rgba(0, 0, 0, 0.6),
          inset 0 0 0 1px rgba(255, 255, 255, 0.04),
          inset 0 6px 10px rgba(0, 0, 0, 0.5)
        `,
      }}
    >
      {/* Content container - centers children */}
      <div
        className="absolute flex items-center justify-center rounded-full overflow-hidden"
        style={{
          inset: contentInset,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default PlateIcon
