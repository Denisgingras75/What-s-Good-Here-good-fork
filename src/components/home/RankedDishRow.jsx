import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategoryImage } from '../../constants/categoryImages'
import { MIN_VOTES_FOR_RANKING } from '../../constants/app'
import { getRatingColor } from '../../utils/ranking'

// Compact dish row for homepage rankings
export const RankedDishRow = memo(function RankedDishRow({ dish, rank }) {
  const navigate = useNavigate()
  const [imageLoaded, setImageLoaded] = useState(false)
  const {
    dish_id,
    dish_name,
    restaurant_name,
    category,
    photo_url,
    avg_rating,
    total_votes,
    distance_miles,
  } = dish

  const imgSrc = photo_url || getCategoryImage(category)
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
        background: 'var(--color-bg)',
        border: '1px solid var(--color-divider)'
      }}
    >
      {/* Rank Badge */}
      <div className="relative flex-shrink-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm"
          style={{
            background: rank === 1 ? 'var(--color-primary)' : 'var(--color-surface)',
            color: rank === 1 ? 'white' : 'var(--color-text-tertiary)',
          }}
        >
          {rank}
        </div>
        {/* Winner badge for #1 with enough votes */}
        {rank === 1 && isRanked && (
          <div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-warning, #f59e0b)' }}
          >
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        )}
      </div>

      {/* Photo */}
      <div
        className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 image-placeholder"
        style={{ background: 'var(--color-surface)' }}
      >
        <img
          src={imgSrc}
          alt={dish_name}
          loading="lazy"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
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
      </div>

      {/* Dish Info */}
      <div className="flex-1 min-w-0 text-left">
        <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
          {dish_name}
        </h3>
        <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
          {restaurant_name}
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
