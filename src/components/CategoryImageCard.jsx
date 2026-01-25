/**
 * CategoryImageCard - Category selector using PlateIcon
 *
 * Design Philosophy:
 * - PlateIcon provides the realistic matte ceramic plate
 * - Food image glows (alive), plate stays quiet (neutral)
 * - Consistent grid spacing with centered labels
 */

import { PlateIcon } from './PlateIcon'

// Category image mappings
const CATEGORY_IMAGES = {
  pizza: '/categories/pizza.webp',
  burger: '/categories/burgers.webp',
  taco: '/categories/tacos.webp',
  wings: '/categories/wings.webp',
  sushi: '/categories/sushi.webp',
  breakfast: '/categories/breakfast.webp',
  'lobster roll': '/categories/lobster-rolls.webp',
  seafood: '/categories/seafood.webp',
  chowder: '/categories/chowder.webp',
  pasta: '/categories/pasta.webp',
  steak: '/categories/steak.webp',
  sandwich: '/categories/sandwiches.webp',
  salad: '/categories/salads.webp',
  tendys: '/categories/tendys.webp',
}

export function CategoryImageCard({
  category,
  isActive = false,
  onClick,
  size = 80,
}) {
  const imageSrc = CATEGORY_IMAGES[category.id] || null

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
              // Food glow - the "alive" element
              // Neon glow ONLY on the food, not the plate
              boxShadow: isActive
                ? '0 0 14px rgba(244, 162, 97, 0.45), 0 0 6px rgba(244, 162, 97, 0.25)'
                : '0 0 8px rgba(244, 162, 97, 0.12)',
            }}
          >
            <img
              src={imageSrc}
              alt={category.label}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        ) : (
          <div
            className="w-full h-full rounded-full"
            style={{ background: '#141414' }}
          />
        )}
      </PlateIcon>

      {/* Label - secondary to plate */}
      <span
        className="text-[12px] font-medium text-center leading-none"
        style={{
          color: isActive ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.5)',
        }}
      >
        {category.label}
      </span>
    </button>
  )
}

export default CategoryImageCard
