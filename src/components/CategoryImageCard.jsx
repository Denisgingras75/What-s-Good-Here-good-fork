/**
 * CategoryImageCard - Category selector using PlateIcon
 *
 * Design Philosophy:
 * - PlateIcon provides the realistic matte ceramic plate
 * - Food image glows (alive), plate stays quiet (neutral)
 * - Consistent grid spacing with centered labels
 * - Images load eagerly (above fold) with smooth fade-in
 */

import { useState } from 'react'
import { PlateIcon } from './PlateIcon'
import { getCategoryNeonImage } from '../constants/categories'

export function CategoryImageCard({
  category,
  isActive = false,
  onClick,
  size = 80,
}) {
  const imageSrc = getCategoryNeonImage(category.id)
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center transition-all duration-200 active:scale-[0.97]"
      style={{ gap: '18px' }}
    >
      {/* Plate with food icon */}
      <PlateIcon size={size}>
        {imageSrc ? (
          <div
            className="w-full h-full rounded-full overflow-hidden"
            style={{
              // Food glow - warm gold glow for appetite appeal
              boxShadow: isActive
                ? '0 0 14px rgba(217, 167, 101, 0.5), 0 0 6px rgba(217, 167, 101, 0.3)'
                : '0 0 8px rgba(217, 167, 101, 0.15)',
            }}
          >
            <img
              src={imageSrc}
              alt={category.label}
              // No lazy loading - these are above the fold
              className="w-full h-full object-cover transition-opacity duration-300"
              style={{
                opacity: imageLoaded ? 1 : 0,
                transform: category.id === 'breakfast' ? 'scale(1.15)' : category.id === 'pizza' ? 'scale(1.15)' : 'none',
              }}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        ) : (
          <div
            className="w-full h-full rounded-full"
            style={{ background: '#0D1B22' }}
          />
        )}
      </PlateIcon>

      {/* Label - secondary to plate */}
      <span
        className="text-[12px] font-medium text-center leading-none"
        style={{
          color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        }}
      >
        {category.label}
      </span>
    </button>
  )
}

export default CategoryImageCard
