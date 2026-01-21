/**
 * CategoryImageCard - Premium image-based category selector
 *
 * Design: Scalloped dinner plate silhouette
 * - 12 shallow, soft scallops (classic porcelain)
 * - Subtle inner rim, slightly lighter than plate body
 * - No shadows, highlights, bevels, or gradients
 * - Reads as plate via silhouette + rim only
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
        w-full py-1
        transition-all duration-200
        active:scale-[0.97]
      "
    >
      {/* Scalloped dinner plate silhouette */}
      <div
        className="
          relative aspect-square
          overflow-hidden
          transition-all duration-200
          w-[85%]
        "
        style={{
          background: '#0f0f0f',
          /* 12 shallow, soft scallops - classic porcelain plate */
          clipPath: `polygon(
            50% 0%,
            58% 0.5%, 66% 2%, 73% 4.5%,
            79% 8%, 85% 13%, 90% 19%,
            94% 27%, 97% 35%, 99% 43%,
            100% 50%,
            99% 57%, 97% 65%, 94% 73%,
            90% 81%, 85% 87%, 79% 92%,
            73% 95.5%, 66% 98%, 58% 99.5%,
            50% 100%,
            42% 99.5%, 34% 98%, 27% 95.5%,
            21% 92%, 15% 87%, 10% 81%,
            6% 73%, 3% 65%, 1% 57%,
            0% 50%,
            1% 43%, 3% 35%, 6% 27%,
            10% 19%, 15% 13%, 21% 8%,
            27% 4.5%, 34% 2%, 42% 0.5%
          )`,
        }}
      >
        {/* Inner rim - follows scalloped contour, 6% inset */}
        <div
          className="absolute inset-[6%] pointer-events-none"
          style={{
            background: isActive ? 'var(--color-primary)' : '#1c1c1c',
            clipPath: 'inherit',
            opacity: isActive ? 0.3 : 1,
          }}
        />

        {/* Plate interior - where food icon sits */}
        <div
          className="absolute inset-[8%] overflow-hidden"
          style={{
            background: '#0f0f0f',
            clipPath: 'inherit',
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
