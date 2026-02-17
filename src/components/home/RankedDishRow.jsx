import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { getRatingColor } from '../../utils/ranking'
import { ValueBadge } from '../browse/ValueBadge'

const PODIUM_STYLE = {
  1: { color: 'var(--color-medal-gold)', glow: '#E9A115', rankSize: '25px', nameSize: '16px', ratingSize: '16px' },
  2: { color: 'var(--color-medal-silver)', glow: '#A8B5BF', rankSize: '22px', nameSize: '15px', ratingSize: '15px' },
  3: { color: 'var(--color-medal-bronze)', glow: '#C4855C', rankSize: '20px', nameSize: '14px', ratingSize: '14px' },
}

// Compact dish row for browse/homepage rankings — matches Top10 style
export const RankedDishRow = memo(function RankedDishRow({ dish, rank, sortBy, isLast }) {
  const navigate = useNavigate()
  const {
    dish_id,
    dish_name,
    restaurant_name,
    avg_rating,
    total_votes,
    distance_miles,
    price,
    photo_url,
    value_percentile,
  } = dish

  const isRanked = (total_votes || 0) >= MIN_VOTES_FOR_RANKING
  const podium = PODIUM_STYLE[rank]

  const handleClick = () => {
    navigate(`/dish/${dish_id}`)
  }

  // Build accessible label for screen readers
  const accessibleLabel = isRanked
    ? `Rank ${rank}: ${dish_name} at ${restaurant_name}, rated ${avg_rating} out of 10 with ${total_votes} votes${distance_miles ? `, ${Number(distance_miles).toFixed(1)} miles away` : ''}`
    : `Rank ${rank}: ${dish_name} at ${restaurant_name}, ${total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'no votes yet'}${distance_miles ? `, ${Number(distance_miles).toFixed(1)} miles away` : ''}`

  // Podium layout for ranks 1-3
  if (podium) {
    return (
      <button
        onClick={handleClick}
        aria-label={accessibleLabel}
        className="w-full flex items-center gap-3 py-3 px-3 rounded-lg transition-colors text-left"
        style={{
          background: 'var(--color-surface-elevated)',
          borderLeft: `2px solid ${podium.glow}`,
        }}
      >
        {/* Large rank number with glow */}
        <span
          className="font-bold flex-shrink-0"
          style={{
            color: podium.color,
            fontSize: podium.rankSize,
            lineHeight: 1,
            minWidth: '24px',
            textAlign: 'center',
            textShadow: `0 0 6px ${podium.glow}20, 0 0 12px ${podium.glow}10`,
          }}
        >
          {rank}
        </span>

        {/* Restaurant + dish info */}
        <div className="flex-1 min-w-0">
          <p
            className="font-bold truncate"
            style={{
              color: podium.color,
              fontSize: podium.nameSize,
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            {restaurant_name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p
              className="truncate font-medium"
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '11px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {dish_name}
              {sortBy === 'best_value' && price != null && ` · $${Number(price).toFixed(0)}`}
              {distance_miles && ` · ${Number(distance_miles).toFixed(1)} mi`}
            </p>
            <ValueBadge valuePercentile={value_percentile} />
          </div>
        </div>

        {/* Rating */}
        <div className="flex-shrink-0 text-right">
          {isRanked ? (
            <span
              className="font-bold"
              style={{
                color: getRatingColor(avg_rating),
                fontSize: podium.ratingSize,
              }}
            >
              {avg_rating}
            </span>
          ) : (
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'New'}
            </span>
          )}
        </div>

        {/* Photo thumbnail */}
        {photo_url && (
          <img
            src={photo_url}
            alt=""
            loading="lazy"
            className="flex-shrink-0 rounded-full object-cover"
            style={{ width: '64px', height: '64px' }}
          />
        )}
      </button>
    )
  }

  // Respected finalists for ranks 4+
  return (
    <button
      onClick={handleClick}
      aria-label={accessibleLabel}
      className="w-full flex items-center gap-3 py-3.5 px-3 transition-colors text-left active:scale-[0.99]"
      style={{
        background: 'var(--color-surface)',
        borderBottom: isLast ? 'none' : '1px solid var(--color-divider)',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface)'}
    >
      <span
        className="font-bold flex-shrink-0"
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: '15px',
          minWidth: '24px',
          textAlign: 'center',
        }}
      >
        {rank}
      </span>

      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-sm truncate"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {restaurant_name}
        </p>
        <div className="flex items-center gap-1.5" style={{ marginTop: '1px' }}>
          <p
            className="truncate font-medium"
            style={{
              color: 'var(--color-text-tertiary)',
              fontSize: '11px',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}
          >
            {dish_name}
            {sortBy === 'best_value' && price != null && ` · $${Number(price).toFixed(0)}`}
            {distance_miles && ` · ${Number(distance_miles).toFixed(1)} mi`}
          </p>
          <ValueBadge valuePercentile={value_percentile} />
        </div>
      </div>

      <div className="flex-shrink-0 text-right">
        {isRanked ? (
          <span className="text-sm font-bold" style={{ color: getRatingColor(avg_rating) }}>
            {avg_rating}
          </span>
        ) : (
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'New'}
          </span>
        )}
      </div>

      {/* Photo thumbnail */}
      {photo_url && (
        <img
          src={photo_url}
          alt=""
          loading="lazy"
          className="flex-shrink-0 rounded-full object-cover"
          style={{ width: '56px', height: '56px' }}
        />
      )}

      {/* Chevron — tappable affordance */}
      <svg
        className="w-4 h-4 flex-shrink-0"
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
