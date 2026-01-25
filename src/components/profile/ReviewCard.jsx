import { Link } from 'react-router-dom'
import { getCategoryImage } from '../../constants/categoryImages'
import { getRatingColor } from '../../utils/ranking'

/**
 * Card for displaying a user's review
 * Used in both Profile (own reviews) and UserProfile (viewing others' reviews)
 *
 * Props:
 * - review: Review data with nested dish info
 * - onClick: Optional click handler (for opening modal). If not provided, links to dish page.
 */
export function ReviewCard({ review, onClick }) {
  const dish = review.dishes
  const imageUrl = dish?.photo_url || getCategoryImage(dish?.category)
  const dishName = dish?.name
  const restaurantName = dish?.restaurants?.name

  // Format date
  const formattedDate = review.review_created_at
    ? new Date(review.review_created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  const cardContent = (
    <>
      <div className="flex">
        {/* Image */}
        <div
          className={`${onClick ? 'w-14 h-14 rounded-lg m-3' : 'w-20 h-20'} flex-shrink-0 overflow-hidden`}
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
        <div className={`flex-1 ${onClick ? 'py-3 pr-3' : 'p-3'} min-w-0`}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className={`font-semibold text-[color:var(--color-text-primary)] truncate ${onClick ? 'text-sm' : 'text-sm'}`}>
                {dishName}
              </h3>
              <p className="text-xs text-[color:var(--color-text-secondary)] truncate">
                {restaurantName}
              </p>
            </div>
            {review.rating_10 && (
              <div className="flex-shrink-0">
                <span className="text-sm font-bold" style={{ color: getRatingColor(review.rating_10) }}>
                  {review.rating_10 % 1 === 0 ? review.rating_10 : review.rating_10.toFixed(1)}
                </span>
                {onClick && (
                  <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>/10</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review text */}
      <div className="px-3 pb-3">
        <p className="text-sm text-[color:var(--color-text-secondary)] line-clamp-2 italic">
          "{review.review_text}"
        </p>
        {formattedDate && (
          <p className="text-xs text-[color:var(--color-text-tertiary)] mt-1">{formattedDate}</p>
        )}
      </div>
    </>
  )

  // If onClick provided, render as button; otherwise render as Link
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left rounded-xl transition-all active:scale-[0.99] overflow-hidden"
        style={{ background: 'var(--color-bg)', border: '1px solid var(--color-divider)' }}
      >
        {cardContent}
      </button>
    )
  }

  return (
    <Link
      to={`/dish/${review.dish_id}`}
      className="block rounded-xl border overflow-hidden"
      style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}
    >
      {cardContent}
    </Link>
  )
}

export default ReviewCard
