import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { getRatingColor } from '../utils/ranking'
import { CategoryIcon } from './home/CategoryIcons'
import { RestaurantAvatar } from './RestaurantAvatar'
import { ThumbsUpIcon } from './ThumbsUpIcon'
import { ThumbsDownIcon } from './ThumbsDownIcon'
import { HearingIcon } from './HearingIcon'
import { ValueBadge } from './browse/ValueBadge'

/**
 * DishListItem — the ONE component for showing a dish in any list.
 *
 * Props:
 *   dish        - dish data object
 *   rank        - optional rank number (1, 2, 3...)
 *   variant     - 'ranked' | 'voted' | 'compact' (default: 'ranked')
 *   showPhoto   - show photo thumbnail (default: false)
 *   showDistance - show distance badge (default: false)
 *   sortBy      - sort mode for value badge display
 *   tab         - for voted variant: 'worth-it' | 'avoid' | 'saved'
 *   onUnsave    - callback for saved tab unsave action
 *   reviewText  - optional inline review text (voted variant)
 *   myRating    - current user's rating for comparison (voted other-profile)
 *   wouldOrderAgain - the user's would_order_again boolean (voted other-profile)
 *   theirRating - the profile owner's rating (voted other-profile)
 *   voteVariant - 'own-profile' | 'other-profile' (voted variant)
 *   highlighted - gold background flash for map pin interactions
 *   onClick     - click handler (default: navigate to /dish/:id)
 *   isLast      - suppress bottom border on last item
 */
export const DishListItem = memo(function DishListItem({
  dish,
  rank,
  variant = 'ranked',
  showPhoto = false,
  showDistance = false,
  sortBy,
  tab,
  onUnsave,
  reviewText,
  myRating,
  wouldOrderAgain,
  theirRating,
  voteVariant = 'own-profile',
  highlighted = false,
  onClick,
  isLast = false,
}) {
  const navigate = useNavigate()

  // Normalize data shapes between different sources
  const dishName = dish.dish_name || dish.name
  const restaurantName = dish.restaurant_name || (dish.restaurants && dish.restaurants.name)
  const restaurantTown = dish.restaurant_town || (dish.restaurants && dish.restaurants.town)
  const dishId = dish.dish_id || dish.id
  const avgRating = dish.avg_rating
  const totalVotes = dish.total_votes || 0
  const isRanked = totalVotes >= MIN_VOTES_FOR_RANKING
  const distanceMiles = dish.distance_miles
  const price = dish.price
  const photoUrl = dish.photo_url
  const valuePercentile = dish.value_percentile
  const category = dish.category

  var handleClick = onClick || function () { navigate('/dish/' + dishId) }

  // --- VOTED VARIANT (profile pages) ---
  if (variant === 'voted') {
    return renderVotedCard()
  }

  // --- RANKED VARIANT (home, browse, restaurant detail) ---
  var isPodium = rank != null && rank <= 3

  return (
    <button
      data-dish-id={dishId}
      onClick={handleClick}
      className={'w-full flex items-center gap-3 py-3 px-3 text-left active:scale-[0.98]' + (isPodium ? ' rounded-xl' : '')}
      style={{
        background: highlighted
          ? 'var(--color-accent-gold-muted)'
          : isPodium
            ? 'var(--color-surface)'
            : 'transparent',
        minHeight: '48px',
        cursor: 'pointer',
        transition: 'background 1s ease-out',
        borderBottom: !isPodium && !isLast ? '1.5px solid var(--color-divider)' : 'none',
      }}
    >
      {/* Rank number */}
      {rank != null && (
        <span
          className="flex-shrink-0 font-bold"
          style={{
            width: '28px',
            textAlign: 'center',
            fontSize: isPodium ? '18px' : '14px',
            fontWeight: 800,
            color: rank === 1
              ? 'var(--color-accent-gold)'
              : rank <= 3
                ? 'var(--color-text-primary)'
                : 'var(--color-text-tertiary)',
          }}
        >
          {rank}
        </span>
      )}

      {/* Category icon */}
      {!showPhoto && (
        <span className="flex-shrink-0">
          <CategoryIcon categoryId={category} dishName={dishName} size={64} />
        </span>
      )}

      {/* Photo thumbnail */}
      {showPhoto && photoUrl && (
        <div
          className="flex-shrink-0 rounded-lg overflow-hidden"
          style={{ width: '48px', height: '48px', background: 'var(--color-surface)' }}
        >
          <img src={photoUrl} alt={dishName} loading="lazy" className="w-full h-full object-cover" />
        </div>
      )}
      {showPhoto && !photoUrl && (
        <div
          className="flex-shrink-0 rounded-lg overflow-hidden relative"
          style={{ width: '48px', height: '48px' }}
        >
          <RestaurantAvatar name={restaurantName} town={restaurantTown} fill />
        </div>
      )}

      {/* Name + restaurant + distance */}
      <div className="flex-1 min-w-0">
        <p
          className="font-bold truncate"
          style={{
            fontSize: isPodium ? '15px' : '15px',
            color: 'var(--color-text-primary)',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}
        >
          {dishName}
        </p>
        <div className="flex items-center gap-1.5" style={{ marginTop: '1px' }}>
          <p
            className="truncate"
            style={{
              fontSize: '12px',
              color: 'var(--color-text-tertiary)',
            }}
          >
            {restaurantName}
            {sortBy === 'best_value' && price != null && ' \u00b7 $' + Number(price).toFixed(0)}
            {showDistance && distanceMiles != null && ' \u00b7 ' + Number(distanceMiles).toFixed(1) + ' mi'}
          </p>
          {valuePercentile != null && <ValueBadge valuePercentile={valuePercentile} />}
        </div>
      </div>

      {/* Rating */}
      <div className="flex-shrink-0 text-right">
        {isRanked ? (
          <span
            className="font-bold"
            style={{
              fontSize: isPodium ? '17px' : '15px',
              color: getRatingColor(avgRating),
            }}
          >
            {avgRating}
          </span>
        ) : (
          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-text-tertiary)',
              fontWeight: 500,
            }}
          >
            {totalVotes ? totalVotes + ' vote' + (totalVotes === 1 ? '' : 's') : 'New'}
          </span>
        )}
      </div>
    </button>
  )

  // --- VOTED CARD RENDERER ---
  function renderVotedCard() {
    var isOtherProfile = voteVariant === 'other-profile'
    var hasOwnComparison = !isOtherProfile && dish.rating_10 && dish.community_avg && totalVotes >= 2
    var ownRatingDiff = hasOwnComparison ? dish.rating_10 - dish.community_avg : null
    var theirRatingNum = Number(theirRating) || 0
    var myRatingNum = Number(myRating) || 0
    var hasMyRating = myRating !== undefined && myRating !== null && myRatingNum >= 1 && myRatingNum <= 10
    var communityAvg = avgRating ? Number(avgRating) : null

    var CardTag = isOtherProfile ? 'button' : 'div'
    var cardProps = isOtherProfile ? { onClick: handleClick } : {}

    return (
      <CardTag
        {...cardProps}
        className={'rounded-xl border overflow-hidden' + (isOtherProfile ? ' w-full text-left hover:shadow-md transition-all active:scale-[0.99]' : ' transition-all')}
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-divider)',
        }}
      >
        <div className="flex">
          {/* Image */}
          <div
            className="relative w-24 h-24 rounded-l-xl flex-shrink-0 overflow-hidden"
            style={{ background: 'var(--color-surface-elevated)' }}
          >
            {photoUrl ? (
              <img src={photoUrl} alt={dishName} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <RestaurantAvatar name={restaurantName} town={restaurantTown} fill className="absolute inset-0" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                {restaurantName}
              </h3>
              <p className="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>
                {dishName}
              </p>
            </div>

            {/* Own Profile Rating */}
            {!isOtherProfile && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {dish.rating_10 && (
                    <span className="text-sm font-semibold" style={{ color: getRatingColor(dish.rating_10) }}>
                      {dish.rating_10 % 1 === 0 ? dish.rating_10 : dish.rating_10.toFixed(1)}
                    </span>
                  )}
                  {hasOwnComparison && (
                    <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      · avg {dish.community_avg.toFixed(1)}
                      {ownRatingDiff !== 0 && (
                        <span style={{ color: ownRatingDiff > 0 ? 'var(--color-emerald)' : 'var(--color-red)' }}>
                          {' '}({ownRatingDiff > 0 ? '+' : ''}{ownRatingDiff.toFixed(1)})
                        </span>
                      )}
                    </span>
                  )}
                </div>
                {tab === 'worth-it' && <ThumbsUpIcon size={28} />}
                {tab === 'avoid' && <ThumbsDownIcon size={28} />}
                {tab === 'saved' && onUnsave && (
                  <button
                    onClick={function (e) { e.stopPropagation(); onUnsave() }}
                    className="transition-colors"
                  >
                    <HearingIcon size={24} active={true} />
                  </button>
                )}
              </div>
            )}

            {/* Other Profile Rating */}
            {isOtherProfile && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theirRatingNum >= 1 && (
                    <span className="text-sm font-semibold" style={{ color: getRatingColor(theirRatingNum) }}>
                      {theirRatingNum % 1 === 0 ? theirRatingNum : theirRatingNum.toFixed(1)}
                    </span>
                  )}
                  {hasMyRating && (
                    <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
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
                    <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>avg</span>
                  </div>
                ) : (
                  wouldOrderAgain ? <ThumbsUpIcon size={28} /> : <ThumbsDownIcon size={28} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Inline Review (own-profile only) */}
        {!isOtherProfile && reviewText && (
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
      </CardTag>
    )
  }
})

export default DishListItem
