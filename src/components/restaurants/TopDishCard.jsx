import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VariantPicker, VariantBadge } from '../VariantPicker'
import { getCategoryImage } from '../../constants/categoryImages'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { getRatingColor } from '../../utils/ranking'
import { HearingIcon } from '../HearingIcon'

// Compact dish card for restaurant view - shows order again % prominently
// Now supports variants with expandable list
export function TopDishCard({ dish, rank, onVote, onLoginRequired, isFavorite, onToggleFavorite, friendVotes }) {
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      className="rounded-xl transition-all"
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-divider)',
        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(217, 167, 101, 0.04)',
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="w-full flex gap-3 p-3.5 text-left transition-all cursor-pointer hover:bg-[#0F2028]"
        style={{ borderRadius: '0.75rem' }}
      >
        {/* Rank Badge */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-1"
          style={{
            background: rank <= 3 && isRanked ? 'var(--color-primary)' : 'var(--color-surface)',
            color: rank <= 3 && isRanked ? 'white' : 'var(--color-text-tertiary)',
            fontSize: '13px',
            ...(rank <= 3 && isRanked ? { boxShadow: '0 2px 8px -2px rgba(200, 90, 84, 0.4)' } : { border: '1px solid rgba(217, 167, 101, 0.12)' }),
          }}
        >
          {rank}
        </div>

        {/* Photo */}
        <div
          className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
          style={{ background: 'var(--color-surface)', boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)' }}
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
              <h4
                className="font-bold truncate"
                style={{
                  color: 'var(--color-text-primary)',
                  fontSize: '14px',
                  letterSpacing: '-0.01em',
                }}
              >
                {dish_name}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                {price && (
                  <span className="font-medium" style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
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

            {/* Heard it was Good Here Button */}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite(dish_id)
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95 ${
                  isFavorite
                    ? 'ring-2 ring-[var(--color-primary)]/50'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ background: 'var(--color-surface)' }}
                aria-label={isFavorite ? 'Remove from heard list' : 'Mark as heard it was good'}
              >
                <HearingIcon size={22} active={isFavorite} />
              </button>
            )}
          </div>

          {/* Rating Info - Score on left, % would order again on right */}
          <div className="mt-2.5 flex items-center justify-between">
            {isRanked ? (
              <>
                {/* Left: Rating Score */}
                <div className="flex items-center gap-1.5">
                  <span
                    className="font-bold"
                    style={{ color: getRatingColor(displayRating), fontSize: '18px' }}
                  >
                    {displayRating}
                  </span>
                  <span className="font-medium" style={{ color: 'var(--color-text-tertiary)', fontSize: '10px' }}>
                    &middot; {votes} votes
                  </span>
                </div>
                {/* Right: Would Order Again % */}
                <div className="flex items-center gap-1">
                  <span className="font-bold" style={{ color: 'var(--color-success)', fontSize: '14px' }}>
                    {Math.round(percent_worth_it)}%
                  </span>
                  <span className="font-medium" style={{ color: 'var(--color-text-tertiary)', fontSize: '10px' }}>
                    would order again
                  </span>
                </div>
              </>
            ) : (
              <span className="font-medium" style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
                {votes > 0 ? `Early · ${votes} vote${votes === 1 ? '' : 's'} so far` : 'Be first to vote'}
              </span>
            )}
          </div>

          {/* Friend votes indicator */}
          {friendVotes && friendVotes.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {friendVotes.slice(0, 3).map((fv) => (
                    <div
                      key={fv.user_id}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold ring-1"
                      style={{ background: 'var(--color-primary)', ringColor: 'var(--color-bg)' }}
                    >
                      {fv.display_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  ))}
                </div>
                <span className="font-medium truncate" style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>
                  {friendVotes.slice(0, 2).map(fv => {
                    const name = fv.display_name?.split(' ')[0] || 'Friend'
                    return `${name}: ${fv.rating_10}`
                  }).join(', ')}
                  {friendVotes.length > 2 && ` +${friendVotes.length - 2}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

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
