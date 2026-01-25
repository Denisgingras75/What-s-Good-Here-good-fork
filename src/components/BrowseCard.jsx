import { getCategoryImage } from '../constants/categoryImages'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { getRatingColor } from '../utils/ranking'
import { getResponsiveImageProps } from '../utils/images'

export function BrowseCard({ dish, onClick, isFavorite, onToggleFavorite }) {
  // Defensive: ensure dish exists
  if (!dish) {
    console.error('BrowseCard received null/undefined dish')
    return null
  }

  // Debug: log dish data to identify problematic entries
  console.log('BrowseCard rendering:', { dish_id: dish.dish_id, dish_name: dish.dish_name, photo_url: dish.photo_url, category: dish.category })

  const {
    dish_id,
    dish_name,
    restaurant_name,
    category,
    photo_url,
    price,
    avg_rating,
    total_votes,
    distance_miles,
    has_variants,
    variant_count,
    best_variant_name,
    best_variant_rating,
  } = dish

  const imgSrc = photo_url || getCategoryImage(category)
  const imageProps = getResponsiveImageProps(imgSrc, [300, 400, 600]) || { src: '' }
  const isRanked = total_votes >= MIN_VOTES_FOR_RANKING

  // For parent dishes with variants, show best variant's rating instead of aggregate
  const displayRating = (has_variants && best_variant_rating) ? best_variant_rating : avg_rating
  const votesNeeded = MIN_VOTES_FOR_RANKING - (total_votes || 0)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="w-full rounded-2xl overflow-hidden border shadow-sm transition-all duration-200 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] active:shadow-md text-left group cursor-pointer browse-card-virtualized"
      style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}
    >
      {/* Image with rating badge */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          {...imageProps}
          alt={dish_name}
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Rating badge - bottom left */}
        {isRanked ? (
          <div className="absolute bottom-3 left-3 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm flex flex-col items-center">
            <span className="text-base font-bold leading-tight" style={{ color: getRatingColor(displayRating) }}>
              {displayRating || '—'}
            </span>
            <span className="text-[10px] text-white/70">
              {has_variants && best_variant_name ? `Best: ${best_variant_name}` : `${total_votes} votes`}
            </span>
          </div>
        ) : (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
            <span className="text-xs font-medium text-white/80">
              {votesNeeded > 0 ? `Needs ${votesNeeded} more vote${votesNeeded > 1 ? 's' : ''}` : 'Needs votes'}
            </span>
          </div>
        )}

        {/* Distance - bottom right */}
        {distance_miles && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
            <span className="text-xs font-semibold text-white/90">
              {Number(distance_miles).toFixed(1)} mi
            </span>
          </div>
        )}

        {/* Favorite button - top right */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(dish_id)
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-black/50 backdrop-blur-sm text-white/70 hover:text-red-400'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Dish name */}
            <h3
              className="font-bold text-base line-clamp-2 leading-snug"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {dish_name}
            </h3>

            {/* Restaurant + price */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {restaurant_name}
              </span>
              {price && (
                <>
                  <span style={{ color: 'var(--color-divider)' }}>•</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    ${Number(price).toFixed(0)}
                  </span>
                </>
              )}
            </div>

            {/* Variant info badge */}
            {has_variants && variant_count > 0 && (
              <div className="mt-1.5">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: 'var(--color-primary-muted)',
                    color: 'var(--color-primary)'
                  }}
                >
                  {variant_count} flavor{variant_count === 1 ? '' : 's'} available
                </span>
              </div>
            )}

            {/* Rating info line */}
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
              {total_votes === 0
                ? 'Be first to vote'
                : !isRanked
                  ? `Early · ${total_votes} vote${total_votes === 1 ? '' : 's'} so far`
                  : `${total_votes} votes`
              }
            </p>
          </div>

          {/* Tap indicator - prominent affordance */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
              style={{
                background: 'var(--color-primary-muted)',
                color: 'var(--color-primary)'
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <span
              className="text-[10px] font-medium"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              View
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
