/**
 * CategoryImageCard - Premium image-based category selector
 *
 * Design: Plates on a table aesthetic
 * The rounded image boxes look like plates resting on a dark wood table.
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
        w-full
        transition-all duration-200
        active:scale-[0.97]
      "
    >
      {/* Plate - circular like a real plate with rim */}
      <div
        className="
          relative w-[85%] aspect-square
          rounded-full
          overflow-hidden
          transition-all duration-200
        "
        style={{
          border: '2px solid rgba(60, 60, 60, 0.8)',
          boxShadow: isActive
            ? '0 8px 24px rgba(0,0,0,0.5), 0 0 0 2px var(--color-primary), 0 0 20px rgba(244, 162, 97, 0.3), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.3)'
            : '0 8px 24px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.3)',
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
          <div className="w-full h-full" style={{ background: '#1A1A1A' }} />
        )}
      </div>

      {/* Label below image */}
      <span
        className="text-xs font-medium"
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
