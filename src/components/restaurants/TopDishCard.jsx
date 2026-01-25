import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VariantPicker, VariantBadge } from '../VariantPicker'
import { getCategoryImage } from '../../constants/categoryImages'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { getRatingColor } from '../../utils/ranking'

// Compact dish card for restaurant view - shows order again % prominently
// Now supports variants with expandable list
export function TopDishCard({ dish, rank, onVote, onLoginRequired, isFavorite, onToggleFavorite }) {
  const navigate = useNavigate()
  const [showVariants, setShowVariants] = useState(false)
  const {
    dish_id,
    dish_name,
    category,
    photo_url,
    price,
    total_votes,
    percent_worth_it,
    avg_rating,
    has_variants,
    variant_count,
    best_variant_name,
    best_variant_rating,
  } = dish

  const imgSrc = photo_url || getCategoryImage(category)
  const isRanked = (total_votes || 0) >= MIN_VOTES_FOR_RANKING
  const votes = total_votes || 0

  // For parent dishes with variants, show best variant's rating instead of aggregate
  const displayRating = (has_variants && best_variant_rating) ? best_variant_rating : avg_rating

  const handleClick = () => {
    // If has variants and they're not shown, expand to show variants first
    if (has_variants && !showVariants) {
      setShowVariants(true)
      return
    }
    // If it's a parent with variants, clicking the card doesn't navigate
    // User must select a specific variant
    if (!has_variants) {
      navigate(`/dish/${dish_id}`)
    }
  }

  const handleVariantSelect = (variant) => {
    navigate(`/dish/${variant.dish_id}`)
  }

  const handleToggleVariants = (e) => {
    e.stopPropagation()
    setShowVariants(!showVariants)
  }

  return (
    <div
      className="rounded-xl transition-all"
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-divider)'
      }}
    >
      <button
        onClick={handleClick}
        className="w-full flex gap-3 p-3 text-left transition-all hover:shadow-md"
      >
        {/* Rank Badge */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1"
          style={{
            background: rank <= 3 && isRanked ? 'var(--color-primary)' : 'var(--color-surface)',
            color: rank <= 3 && isRanked ? 'white' : 'var(--color-text-tertiary)',
          }}
        >
          {rank}
        </div>

        {/* Photo */}
        <div
          className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
          style={{ background: 'var(--color-surface)' }}
        >
          <img
            src={imgSrc}
            alt={dish_name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Dish Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                {dish_name}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                {price && (
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    ${Number(price).toFixed(0)}
                  </span>
                )}
                {/* Variant Badge */}
                {has_variants && variant_count > 0 && (
                  <VariantBadge
                    variantCount={variant_count}
                    bestVariantName={best_variant_name}
                    bestVariantRating={best_variant_rating}
                    onClick={handleToggleVariants}
                  />
                )}
              </div>
            </div>

            {/* Favorite Button */}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite(dish_id)
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-neutral-100 text-neutral-400 hover:text-red-500'
                }`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={isFavorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-4 h-4"
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

          {/* Rating Info */}
          <div className="mt-2">
            {isRanked ? (
              <div className="flex items-center gap-3">
                {/* Rating block - stacked vertically */}
                <div className="flex flex-col items-center px-3 py-1.5 rounded-lg" style={{ background: 'var(--color-surface)' }}>
                  <span className="text-lg font-bold leading-none" style={{ color: getRatingColor(displayRating) }}>
                    {displayRating || '—'}
                  </span>
                  <span className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                    {has_variants && best_variant_name ? `Best: ${best_variant_name}` : `${votes} votes`}
                  </span>
                </div>
                {/* Order again badge */}
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  {Math.round(percent_worth_it)}% say it's good here
                </span>
              </div>
            ) : (
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {votes > 0 ? `Early · ${votes} vote${votes === 1 ? '' : 's'} so far` : 'Be first to vote'}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Expandable Variant List */}
      {has_variants && showVariants && (
        <div className="px-3 pb-3">
          <VariantPicker
            parentDishId={dish_id}
            parentDishName={dish_name}
            onVariantSelect={handleVariantSelect}
            initiallyExpanded={true}
          />
        </div>
      )}
    </div>
  )
}
