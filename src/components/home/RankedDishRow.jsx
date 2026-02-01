import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { getRatingColor } from '../../utils/ranking'
import { RestaurantAvatar } from '../RestaurantAvatar'
import { ValueBadge } from '../browse/ValueBadge'

// Compact dish row for homepage rankings
export const RankedDishRow = memo(function RankedDishRow({ dish, rank, sortBy }) {
  const navigate = useNavigate()
  const {
    dish_id,
    dish_name,
    restaurant_name,
    restaurant_town,
    avg_rating,
    total_votes,
    distance_miles,
    price,
    value_percentile,
  } = dish

  const isRanked = (total_votes || 0) >= MIN_VOTES_FOR_RANKING

  const handleClick = () => {
    navigate(`/dish/${dish_id}`)
  }

  // Build accessible label for screen readers
  const accessibleLabel = isRanked
    ? `Rank ${rank}: ${dish_name} at ${restaurant_name}, rated ${avg_rating} out of 10 with ${total_votes} votes${distance_miles ? `, ${Number(distance_miles).toFixed(1)} miles away` : ''}`
    : `Rank ${rank}: ${dish_name} at ${restaurant_name}, ${total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'no votes yet'}${distance_miles ? `, ${Number(distance_miles).toFixed(1)} miles away` : ''}`

  return (
    <button
      onClick={handleClick}
      aria-label={accessibleLabel}
      className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.99] group stagger-item"
      style={{
        background: rank <= 3 ? 'rgba(244, 122, 31, 0.04)' : 'var(--color-bg)',
        border: '1px solid var(--color-divider)',
        borderLeft: rank <= 3 ? '3px solid var(--color-primary)' : '1px solid var(--color-divider)'
      }}
    >
      {/* Rank Badge - Medals for top 3 */}
      <div className="relative flex-shrink-0">
        {rank <= 3 ? (
          <span className="text-xl" aria-label={`Rank ${rank}`}>
            {rank === 1 && '🥇'}
            {rank === 2 && '🥈'}
            {rank === 3 && '🥉'}
          </span>
        ) : (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-text-tertiary)',
            }}
          >
            {rank}
          </div>
        )}
      </div>

      {/* Restaurant Avatar */}
      <RestaurantAvatar
        name={restaurant_name}
        town={restaurant_town}
        size={48}
      />

      {/* Dish Info */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
            {dish_name}
          </h3>
          <ValueBadge valuePercentile={value_percentile} />
        </div>
        <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
          {restaurant_name}
          {sortBy === 'best_value' && price != null && ` · $${Number(price).toFixed(0)}`}
          {distance_miles && ` · ${Number(distance_miles).toFixed(1)} mi`}
        </p>
      </div>

      {/* Rating */}
      <div className="flex-shrink-0 text-right">
        {isRanked ? (
          <div className="flex flex-col items-end">
            <span className="text-base font-bold leading-tight" style={{ color: getRatingColor(avg_rating) }}>
              {avg_rating || '—'}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
              {total_votes} votes
            </span>
          </div>
        ) : (
          <div
            className="text-[10px] font-medium px-2 py-1 rounded-full"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-text-tertiary)',
            }}
          >
            {total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'Be first to vote'}
          </div>
        )}
      </div>

      {/* Chevron */}
      <svg
        className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5"
        style={{ color: 'var(--color-text-tertiary)' }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
})
