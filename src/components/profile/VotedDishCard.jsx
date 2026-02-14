import { useNavigate } from 'react-router-dom'
import { RestaurantAvatar } from '../RestaurantAvatar'
import { getRatingColor } from '../../utils/ranking'
import { ThumbsUpIcon } from '../ThumbsUpIcon'
import { ThumbsDownIcon } from '../ThumbsDownIcon'
import { HearingIcon } from '../HearingIcon'

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
  const dishName = dish.dish_name || dish.name
  const restaurantName = dish.restaurant_name || dish.restaurants?.name
  const restaurantTown = dish.restaurant_town || dish.restaurants?.town
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
    ? { onClick: handleClick }
    : {}

  return (
    <CardWrapper
      {...cardProps}
      className={`rounded-xl border overflow-hidden ${variant === 'other-profile' ? 'w-full text-left hover:shadow-md transition-all active:scale-[0.99]' : 'transition-all'}`}
      style={{
        background: 'var(--color-card)',
        borderColor: 'var(--color-divider)',
        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className="flex">
        {/* Image */}
        <div
          className="relative w-24 h-24 rounded-l-xl flex-shrink-0 overflow-hidden"
          style={{ background: 'var(--color-surface-elevated)' }}
        >
          {dish.photo_url ? (
            <img
              src={dish.photo_url}
              alt={dishName}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <RestaurantAvatar name={restaurantName} town={restaurantTown} fill />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="font-semibold text-[color:var(--color-text-primary)] truncate">
              {dishName}
            </h3>
            <p className="text-sm text-[color:var(--color-text-secondary)] truncate">
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
                      <span style={{ color: ownRatingDiff > 0 ? 'var(--color-emerald)' : 'var(--color-red)' }}>
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
                  className="transition-colors"
                >
                  <HearingIcon size={24} active={true} />
                </button>
              )}
            </div>
          )}

          {/* Other Profile Rating Display */}
          {variant === 'other-profile' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {theirRatingNum >= 1 && (
                  <span className="text-sm font-semibold" style={{ color: getRatingColor(theirRatingNum) }}>
                    {theirRatingNum % 1 === 0 ? theirRatingNum : theirRatingNum.toFixed(1)}
                  </span>
                )}
                {hasMyRating && (
                  <span className="text-xs text-[color:var(--color-text-tertiary)]">
                    · you: <span style={{ color: getRatingColor(myRatingNum) }}>
                      {myRatingNum % 1 === 0 ? myRatingNum : myRatingNum.toFixed(1)}
                    </span>
                  </span>
                )}
              </div>
              {communityAvg ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-sm font-bold" style={{ color: getRatingColor(communityAvg) }}>
                    {communityAvg.toFixed(1)}
                  </span>
                  <span className="text-xs text-[color:var(--color-text-tertiary)]">avg</span>
                </div>
              ) : (
                wouldOrderAgain ? <ThumbsUpIcon size={28} /> : <ThumbsDownIcon size={28} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inline Review (own-profile only) */}
      {variant === 'own-profile' && reviewText && (
        <div className="px-3 pb-3 pt-0">
          <p
            className="line-clamp-2 italic"
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '13px',
              lineHeight: '1.5',
            }}
          >
            &ldquo;{reviewText}&rdquo;
          </p>
        </div>
      )}
    </CardWrapper>
  )
}

export default VotedDishCard
