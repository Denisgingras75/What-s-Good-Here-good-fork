/**
 * CategoryImageCard - Premium image-based category selector
 *
 * Design: Pronounced scalloped dinner plate
 * - 10 dramatic, clearly visible scallops
 * - Visible rim with depth and dimension
 * - Subtle drop shadow to ground on table
 * - Instantly recognizable as a plate
 */

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

// 12-point scalloped plate - visible curves, soft china feel
const PLATE_CLIP_PATH = `polygon(
  50% 0%,
  65% 2%, 77% 8%,
  88% 18%, 95% 32%,
  100% 50%,
  95% 68%, 88% 82%,
  77% 92%, 65% 98%,
  50% 100%,
  35% 98%, 23% 92%,
  12% 82%, 5% 68%,
  0% 50%,
  5% 32%, 12% 18%,
  23% 8%, 35% 2%
)`

export function CategoryImageCard({
  category,
  isActive = false,
  onClick,
}) {
  const imageSrc = CATEGORY_IMAGES[category.id] || null

  return (
    <button
      onClick={onClick}
      className="
        flex flex-col items-center gap-2
        w-full py-1
        transition-all duration-200
        active:scale-[0.97]
      "
    >
      {/* Plate container with drop shadow */}
      <div
        className="relative aspect-square w-[85%]"
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
        }}
      >
        {/* Outer plate edge - the scalloped rim */}
        <div
          className="absolute inset-0"
          style={{
            background: isActive
              ? 'linear-gradient(145deg, var(--color-primary) 0%, #c87f4a 100%)'
              : 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #252525 100%)',
            clipPath: PLATE_CLIP_PATH,
          }}
        />

        {/* Inner rim highlight - creates depth */}
        <div
          className="absolute inset-[4%]"
          style={{
            background: isActive
              ? 'linear-gradient(145deg, #d4956a 0%, var(--color-primary) 100%)'
              : 'linear-gradient(145deg, #333 0%, #222 100%)',
            clipPath: PLATE_CLIP_PATH,
          }}
        />

        {/* Plate well - where food sits */}
        <div
          className="absolute inset-[8%] overflow-hidden"
          style={{
            background: '#0f0f0f',
            clipPath: PLATE_CLIP_PATH,
          }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={category.label}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full" style={{ background: '#0f0f0f' }} />
          )}
        </div>
      </div>

      {/* Label below plate */}
      <span
        className="text-[11px] font-medium"
        style={{
          color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'
        }}
      >
        {category.label}
      </span>
    </button>
  )
}

export default CategoryImageCard
