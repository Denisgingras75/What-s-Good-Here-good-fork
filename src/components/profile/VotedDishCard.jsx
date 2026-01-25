import { useNavigate } from 'react-router-dom'
import { getCategoryImage } from '../../constants/categoryImages'
import { getRatingColor } from '../../utils/ranking'
import { ThumbsUpIcon } from '../ThumbsUpIcon'
import { ThumbsDownIcon } from '../ThumbsDownIcon'

/**
 * Unified dish card for profile views
 * Used in both user's own Profile page and viewing other UserProfiles
 *
 * Props:
 * - dish: The dish data object
 * - variant: 'own-profile' | 'other-profile' - determines display style
 * - tab: For own-profile variant - 'worth-it' | 'avoid' | 'saved'
 * - onUnsave: Callback for removing saved dish
 * - reviewText: Optional inline review text to display
 * - myRating: For other-profile variant - current user's rating for comparison
 * - wouldOrderAgain: For other-profile variant - the user's would_order_again boolean
 * - theirRating: For other-profile variant - the profile owner's rating
 */
export function VotedDishCard({
  dish,
  variant = 'own-profile',
  tab,
  onUnsave,
  reviewText,
  myRating,
  wouldOrderAgain,
  theirRating,
}) {
  const navigate = useNavigate()

  // Handle different data shapes between the two use cases
  const imageUrl = dish.photo_url || getCategoryImage(dish.category)
  const dishName = dish.dish_name || dish.name
  const restaurantName = dish.restaurant_name || dish.restaurants?.name
  const dishId = dish.dish_id || dish.id

  // For own-profile: compare user rating to community
  const hasOwnComparison = variant === 'own-profile' && dish.rating_10 && dish.community_avg && dish.total_votes >= 2
  const ownRatingDiff = hasOwnComparison ? dish.rating_10 - dish.community_avg : null

  // For other-profile: their rating with optional comparison
  const theirRatingNum = Number(theirRating) || 0
  const myRatingNum = Number(myRating) || 0
  const hasMyRating = myRating !== undefined && myRating !== null && myRatingNum >= 1 && myRatingNum <= 10
  const communityAvg = dish.avg_rating ? Number(dish.avg_rating) : null

  const handleClick = () => {
    if (variant === 'other-profile' && dishId) {
      navigate(`/dish/${dishId}`)
    }
  }

  const CardWrapper = variant === 'other-profile' ? 'button' : 'div'
  const cardProps = variant === 'other-profile'
    ? { onClick: handleClick, className: "w-full" }
    : {}

  return (
    <CardWrapper
      {...cardProps}
      className={`rounded-xl border overflow-hidden ${variant === 'other-profile' ? 'text-left hover:shadow-md transition-shadow active:scale-[0.99]' : ''}`}
      style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}
    >
      <div className="flex">
        {/* Image */}
        <div
          className={`${variant === 'other-profile' ? 'w-14 h-14 rounded-lg m-3' : 'w-24 h-24'} flex-shrink-0 overflow-hidden`}
          style={{ background: 'var(--color-surface-elevated)' }}
        >
          <img
            src={imageUrl}
            alt={dishName}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className={`flex-1 ${variant === 'other-profile' ? 'py-3 pr-3' : 'p-3'} flex flex-col justify-between min-w-0`}>
          <div>
            <h3 className={`font-semibold text-[color:var(--color-text-primary)] truncate ${variant === 'other-profile' ? 'text-sm' : ''}`}>
              {dishName}
            </h3>
            <p className={`text-[color:var(--color-text-secondary)] truncate ${variant === 'other-profile' ? 'text-xs' : 'text-sm'}`}>
              {restaurantName}
            </p>
          </div>

          {/* Own Profile Rating Display */}
          {variant === 'own-profile' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {dish.rating_10 && (
                  <span className="text-sm font-semibold" style={{ color: getRatingColor(dish.rating_10) }}>
                    {dish.rating_10 % 1 === 0 ? dish.rating_10 : dish.rating_10.toFixed(1)}
                  </span>
                )}
                {hasOwnComparison && (
                  <span className="text-xs text-[color:var(--color-text-tertiary)]">
                    · avg {dish.community_avg.toFixed(1)}
                    {ownRatingDiff !== 0 && (
                      <span className={ownRatingDiff > 0 ? 'text-emerald-500' : 'text-red-400'}>
                        {' '}({ownRatingDiff > 0 ? '+' : ''}{ownRatingDiff.toFixed(1)})
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Tab-specific indicator */}
              {tab === 'worth-it' && <ThumbsUpIcon size={28} />}
              {tab === 'avoid' && <ThumbsDownIcon size={28} />}
              {tab === 'saved' && onUnsave && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onUnsave()
                  }}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Other Profile Rating Display */}
          {variant === 'other-profile' && (
            <>
              {/* Community average */}
              {communityAvg && (
                <p className="text-xs mt-0.5">
                  <span style={{ color: 'var(--color-text-tertiary)' }}>Community: </span>
                  <span style={{ color: getRatingColor(communityAvg) }}>{communityAvg.toFixed(1)}</span>
                </p>
              )}
              {/* Show if you also rated this */}
              {hasMyRating && (
                <p className="text-xs mt-0.5">
                  <span style={{ color: 'var(--color-text-tertiary)' }}>You: </span>
                  <span style={{ color: getRatingColor(myRatingNum) }}>
                    {myRatingNum % 1 === 0 ? myRatingNum : myRatingNum.toFixed(1)}
                  </span>
                </p>
              )}
            </>
          )}
        </div>

        {/* Their Rating (other-profile only) */}
        {variant === 'other-profile' && (
          <div className="flex-shrink-0 text-right pr-3 py-3">
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold" style={{ color: getRatingColor(theirRatingNum) }}>
                {theirRatingNum % 1 === 0 ? theirRatingNum : theirRatingNum.toFixed(1)}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>/10</span>
            </div>
            <div className="mt-1">
              <span className="text-xs">
                {wouldOrderAgain ? <ThumbsUpIcon size={20} /> : <ThumbsDownIcon size={20} />}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Inline Review (own-profile only) */}
      {variant === 'own-profile' && reviewText && (
        <div className="px-3 pb-3 pt-0">
          <p className="text-sm text-[color:var(--color-text-secondary)] line-clamp-2 italic">
            "{reviewText}"
          </p>
        </div>
      )}
    </CardWrapper>
  )
}

export default VotedDishCard
