import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { getRatingColor } from '../../utils/ranking'
import { ValueBadge } from '../browse/ValueBadge'

const PODIUM_STYLE = {
  1: { color: '#E4440A', rankSize: '25px', nameSize: '16px', ratingSize: '16px' },
  2: { color: '#1A1A1A', rankSize: '22px', nameSize: '15px', ratingSize: '15px' },
  3: { color: '#1A1A1A', rankSize: '20px', nameSize: '14px', ratingSize: '14px' },
}

// Compact dish row for browse/homepage rankings — photo-left card when photo exists
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

  const accessibleLabel = isRanked
    ? `Rank ${rank}: ${dish_name} at ${restaurant_name}, rated ${avg_rating} out of 10 with ${total_votes} votes${distance_miles ? `, ${Number(distance_miles).toFixed(1)} miles away` : ''}`
    : `Rank ${rank}: ${dish_name} at ${restaurant_name}, ${total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'no votes yet'}${distance_miles ? `, ${Number(distance_miles).toFixed(1)} miles away` : ''}`

  const rankColor = podium?.color || 'var(--color-text-secondary)'
  const nameSize = podium?.nameSize || '14px'

  // Photo-left card layout
  if (photo_url) {
    return (
      <button
        onClick={handleClick}
        aria-label={accessibleLabel}
        className="w-full flex items-stretch rounded-xl overflow-hidden transition-all text-left active:scale-[0.98]"
        style={{
          background: '#FFFFFF',
          border: '2px solid #1A1A1A',
          marginBottom: '8px',
        }}
      >
        <div className="flex-shrink-0" style={{ width: '110px' }}>
          <img
            src={photo_url}
            alt={dish_name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0 py-3 px-3 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span
              className="font-bold flex-shrink-0"
              style={{
                color: rankColor,
                fontSize: podium?.rankSize || '16px',
                lineHeight: 1,
              }}
            >
              {rank}
            </span>
            <p
              className="font-bold truncate"
              style={{
                color: rankColor,
                fontSize: nameSize,
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              {dish_name}
            </p>
          </div>
          <div className="flex items-center gap-1.5" style={{ marginTop: '4px' }}>
            <p
              className="truncate font-medium"
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '11px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {restaurant_name}
              {sortBy === 'best_value' && price != null && ` · $${Number(price).toFixed(0)}`}
              {distance_miles && ` · ${Number(distance_miles).toFixed(1)} mi`}
            </p>
            <ValueBadge valuePercentile={value_percentile} />
          </div>
          <p style={{ marginTop: '6px', fontSize: '13px' }}>
            {isRanked ? (
              <>
                <span className="font-bold" style={{ color: getRatingColor(avg_rating) }}>
                  {avg_rating}
                </span>
                <span style={{ color: 'var(--color-text-tertiary)' }}> · {total_votes} votes</span>
              </>
            ) : (
              <span style={{ color: 'var(--color-text-tertiary)' }}>
                {total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'New'}
              </span>
            )}
          </p>
        </div>
      </button>
    )
  }

  // Podium rows without photo
  if (podium) {
    return (
      <button
        onClick={handleClick}
        aria-label={accessibleLabel}
        className="w-full flex items-center gap-3 py-3 px-3 rounded-xl transition-colors text-left"
        style={{
          background: '#FFFFFF',
          border: '2px solid #1A1A1A',
        }}
      >
        <span
          className="font-bold flex-shrink-0"
          style={{
            color: podium.color,
            fontSize: podium.rankSize,
            lineHeight: 1,
            minWidth: '24px',
            textAlign: 'center',
          }}
        >
          {rank}
        </span>
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
                color: '#555555',
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
        <div className="flex-shrink-0 text-right">
          {isRanked ? (
            <span
              className="font-bold"
              style={{
                color: '#E4440A',
                fontSize: podium.ratingSize,
              }}
            >
              {avg_rating}
            </span>
          ) : (
            <span className="text-xs" style={{ color: '#999999' }}>
              {total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'New'}
            </span>
          )}
        </div>
      </button>
    )
  }

  // Finalist rows without photo
  return (
    <button
      onClick={handleClick}
      aria-label={accessibleLabel}
      className="w-full flex items-center gap-3 py-3.5 px-3 transition-colors text-left active:scale-[0.99]"
      style={{
        background: '#FFFFFF',
        borderBottom: isLast ? 'none' : '1px solid #1A1A1A',
      }}
    >
      <span
        className="font-bold flex-shrink-0"
        style={{
          color: '#1A1A1A',
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
          style={{ color: '#1A1A1A' }}
        >
          {restaurant_name}
        </p>
        <div className="flex items-center gap-1.5" style={{ marginTop: '1px' }}>
          <p
            className="truncate font-medium"
            style={{
              color: '#999999',
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
          <span className="text-sm font-bold" style={{ color: '#E4440A' }}>
            {avg_rating}
          </span>
        ) : (
          <span className="text-xs" style={{ color: '#999999' }}>
            {total_votes ? `${total_votes} vote${total_votes === 1 ? '' : 's'}` : 'New'}
          </span>
        )}
      </div>
      <svg
        className="w-4 h-4 flex-shrink-0"
        style={{ color: '#999999' }}
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
