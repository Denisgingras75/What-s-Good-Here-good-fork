import { useState } from 'react'
import { getCategoryImage } from '../constants/categoryImages'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { getRatingColor } from '../utils/ranking'
import { getResponsiveImageProps } from '../utils/images'
import { HearingIcon } from './HearingIcon'

export function BrowseCard({ dish, onClick, isFavorite, onToggleFavorite }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  if (!dish) return null

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
      style={{
        background: 'var(--color-card)',
        borderColor: 'rgba(0, 245, 212, 0.2)',
        boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* Image with rating badge */}
      <div className="relative aspect-[16/10] overflow-hidden image-placeholder">
        <img
          {...imageProps}
          alt={dish_name}
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            // Fall back to category image if photo_url fails to load
            const fallback = getCategoryImage(category)
            if (e.target.src !== fallback) {
              e.target.src = fallback
            }
            setImageLoaded(true)
          }}
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

        {/* "Heard it was Good Here" button - top right */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(dish_id)
            }}
            aria-label={isFavorite ? 'Remove from heard list' : 'Mark as heard it was good'}
            className={`absolute top-3 right-3 w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-150 active:scale-90 ${
              isFavorite
                ? 'bg-black/90 backdrop-blur-sm ring-2 ring-[var(--color-primary)]/50'
                : 'bg-black/60 backdrop-blur-sm hover:bg-black/80'
            }`}
          >
            <HearingIcon size={26} className="md:w-7 md:h-7" active={isFavorite} />
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
