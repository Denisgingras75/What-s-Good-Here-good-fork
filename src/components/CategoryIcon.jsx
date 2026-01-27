/**
 * CategoryIcon - Small inline neon category icon
 * Used to replace emojis with neon category images
 */

import { getCategoryNeonImage } from '../constants/categories'

export function CategoryIcon({ category, size = 20, className = '' }) {
  const imageSrc = getCategoryNeonImage(category)

  if (!imageSrc) {
    // Fallback to a generic plate icon
    return (
      <span
        className={`inline-block rounded-full ${className}`}
        style={{
          width: size,
          height: size,
          background: 'var(--color-surface-elevated)',
        }}
      />
    )
  }

  return (
    <img
      src={imageSrc}
      alt={category}
      className={`inline-block rounded-full object-cover ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: '0 0 6px rgba(246, 173, 85, 0.3)',
      }}
    />
  )
}

export default CategoryIcon
