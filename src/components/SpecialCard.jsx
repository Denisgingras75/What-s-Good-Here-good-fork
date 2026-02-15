import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { RestaurantAvatar } from './RestaurantAvatar'

/**
 * Card displaying a restaurant special/deal
 */
export const SpecialCard = memo(function SpecialCard({ special, promoted }) {
  const navigate = useNavigate()
  const {
    deal_name,
    description,
    price,
    restaurants: restaurant
  } = special

  const handleClick = () => {
    if (restaurant?.id) {
      navigate(`/restaurants/${restaurant.id}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-xl p-4 text-left transition-all hover:shadow-lg active:scale-[0.99]"
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-divider)',
        borderLeft: promoted ? '3px solid var(--color-accent-gold)' : '1px solid var(--color-divider)',
      }}
    >
      <div className="flex gap-3">
        {/* Restaurant Avatar */}
        <RestaurantAvatar
          name={restaurant?.name}
          town={restaurant?.town}
          size={48}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Featured badge */}
          {promoted && (
            <span
              className="text-xs font-medium mb-1 inline-block"
              style={{ color: 'var(--color-accent-gold)' }}
            >
              Featured
            </span>
          )}

          {/* Deal Name */}
          <h3 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
            {deal_name}
          </h3>

          {/* Restaurant Name */}
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-accent-gold)' }}>
            {restaurant?.name}
            {restaurant?.town && ` · ${restaurant.town}`}
          </p>

          {/* Description */}
          {description && (
            <p
              className="text-sm mt-2 line-clamp-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {description}
            </p>
          )}

          {/* Price */}
          {price && (
            <div className="mt-2">
              <span
                className="inline-block px-2 py-1 rounded-md text-sm font-semibold"
                style={{
                  background: 'var(--color-primary-muted)',
                  color: 'var(--color-primary)'
                }}
              >
                ${Number(price).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Chevron */}
        <svg
          className="w-5 h-5 flex-shrink-0 mt-1"
          style={{ color: 'var(--color-text-tertiary)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
})
