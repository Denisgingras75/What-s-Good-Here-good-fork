import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VariantPicker, VariantBadge } from '../VariantPicker'
import { CategoryIcon } from '../home/CategoryIcons'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { getRatingColor } from '../../utils/ranking'
import { HearingIcon } from '../HearingIcon'

// Compact dish card for restaurant view - shows order again % prominently
// Now supports variants with expandable list
export function TopDishCard({ dish, rank, onVote, onLoginRequired, isFavorite, onToggleFavorite, friendVotes, restaurantName, restaurantTown }) {
  const navigate = useNavigate()
  const [showVariants, setShowVariants] = useState(false)
  const {
    dish_id,
    dish_name,
    photo_url,
    price,
    total_votes,
    percent_worth_it,
    avg_rating,
    has_variants,
    variant_count,
    best_variant_name,
    best_variant_rating,
    category,
  } = dish

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
      className="rounded-xl card-press"
      style={{
        background: '#FFFFFF',
        border: '2px solid #1A1A1A',
        boxShadow: '2px 2px 0px #1A1A1A',
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="w-full flex gap-3 p-3.5 text-left cursor-pointer"
        style={{ borderRadius: '0.75rem' }}
      >
        {/* Rank */}
        {rank != null && (
          <span
            className="font-bold flex-shrink-0 mt-1"
            style={{
              fontFamily: "'aglet-sans', sans-serif",
              fontWeight: 800,
              color: rank <= 3 && isRanked ? '#E4440A' : '#BBBBBB',
              fontSize: '16px',
              minWidth: '20px',
              textAlign: 'center',
            }}
          >
            #{rank}
          </span>
        )}

        {/* Photo or Category Icon */}
        <div
          className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{
            background: photo_url ? '#F5F5F5' : '#FFF0EB',
            border: '1px solid #E0E0E0',
          }}
        >
          {photo_url ? (
            <img
              src={photo_url}
              alt={dish_name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <CategoryIcon categoryId={category} dishName={dish_name} size={40} color="#E4440A" />
          )}
        </div>

        {/* Dish Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4
                  className="font-bold truncate"
                  style={{
                    color: '#1A1A1A',
                    fontSize: '14px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {dish_name}
                </h4>
                {isRanked && percent_worth_it >= 90 && (
                  <span
                    className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: 'var(--color-accent-gold-muted, rgba(217, 167, 101, 0.15))', color: 'var(--color-accent-gold)' }}
                  >
                    GREAT
                  </span>
                )}
                {isRanked && percent_worth_it >= 80 && percent_worth_it < 90 && (
                  <span
                    className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide"
                    style={{ background: 'rgba(107, 179, 132, 0.15)', color: 'var(--color-rating)' }}
                  >
                    Good Here
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {price && (
                  <span className="font-bold" style={{ color: '#999999', fontSize: '12px' }}>
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
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                style={{ background: '#F5F5F5' }}
                aria-label={isFavorite ? 'Remove from heard list' : 'Mark as heard it was good'}
              >
                <HearingIcon size={22} active={isFavorite} />
              </button>
            )}
          </div>

          {/* Rating Info */}
          <div className="mt-2.5 flex items-center justify-between">
            {isRanked ? (
              <>
                {/* Left: Rating Score */}
                <div className="flex items-center gap-1.5">
                  <span
                    className="font-bold"
                    style={{
                      fontFamily: "'aglet-sans', sans-serif",
                      color: getRatingColor(displayRating),
                      fontSize: '18px',
                    }}
                  >
                    {displayRating}
                  </span>
                  <span className="font-medium" style={{ color: '#BBBBBB', fontSize: '10px' }}>
                    &middot; {votes} votes
                  </span>
                </div>
                {/* Right: Would Order Again % */}
                <div className="flex items-center gap-1">
                  <span className="font-bold" style={{ color: '#16A34A', fontSize: '14px' }}>
                    {Math.round(percent_worth_it)}%
                  </span>
                  <span className="font-medium" style={{ color: '#BBBBBB', fontSize: '10px' }}>
                    would order again
                  </span>
                </div>
              </>
            ) : (
              <span className="font-medium" style={{ color: '#BBBBBB', fontSize: '12px' }}>
                {votes > 0 ? `Early \u00B7 ${votes} vote${votes === 1 ? '' : 's'} so far` : 'Be first to vote'}
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
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ring-1"
                      style={{ background: '#E4440A', color: '#FFFFFF', ringColor: '#FFFFFF' }}
                    >
                      {fv.display_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  ))}
                </div>
                <span className="font-medium truncate" style={{ color: '#BBBBBB', fontSize: '11px' }}>
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
