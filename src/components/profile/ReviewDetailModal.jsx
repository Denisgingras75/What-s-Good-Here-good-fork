import { useNavigate } from 'react-router-dom'
import { DishPlaceholder } from '../DishPlaceholder'
import { getRatingColor } from '../../utils/ranking'
import { ThumbsUpIcon } from '../ThumbsUpIcon'
import { ThumbsDownIcon } from '../ThumbsDownIcon'
import { useFocusTrap } from '../../hooks/useFocusTrap'

/**
 * Modal for displaying full review details
 * Shows dish image, rating, reviewer's verdict, and full review text
 *
 * Props:
 * - review: Review data with nested dish info
 * - reviewerName: Display name of the reviewer
 * - onClose: Callback to close the modal
 */
export function ReviewDetailModal({ review, reviewerName, onClose }) {
  const navigate = useNavigate()
  const dish = review.dishes
  const modalRef = useFocusTrap(!!dish, onClose)

  if (!dish) return null

  const imgSrc = dish.photo_url

  // Format date
  const formattedDate = review.review_created_at
    ? new Date(review.review_created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
      role="presentation"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.6)' }} aria-hidden="true" />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        className="relative w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--color-bg)' }}
      >
        {/* Header with dish image */}
        <div className="relative">
          <div className="relative aspect-[16/9] w-full overflow-hidden" style={{ background: 'var(--color-surface)' }}>
            {imgSrc ? (
              <img src={imgSrc} alt={dish.name} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <DishPlaceholder restaurantName={dish.restaurants?.name} restaurantTown={dish.restaurants?.town} category={dish.category} showCTA />
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close review"
            className="absolute top-3 right-3 w-[38px] h-[38px] rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', color: '#FFFFFF' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>

          {/* Rating badge */}
          {review.rating_10 && (
            <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <span className="text-lg font-bold" style={{ color: getRatingColor(review.rating_10) }}>
                {review.rating_10 % 1 === 0 ? review.rating_10 : review.rating_10.toFixed(1)}
              </span>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>/10</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Dish info */}
          <h2 id="review-modal-title" className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {dish.restaurants?.name}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {dish.name}
          </p>

          {/* Vote indicator */}
          <div className="mt-4 flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'var(--color-surface-elevated)' }}
            >
              <span className="text-xl">{review.would_order_again ? <ThumbsUpIcon size={28} /> : <ThumbsDownIcon size={28} />}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {review.would_order_again ? 'Would order again' : 'Would not order again'}
              </span>
            </div>
          </div>

          {/* Review text */}
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
              {reviewerName}'s Review
            </h3>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
              "{review.review_text}"
            </p>
            {formattedDate && (
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                {formattedDate}
              </p>
            )}
          </div>
        </div>

        {/* Footer - View dish button */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--color-divider)' }}>
          <button
            onClick={() => navigate(`/dish/${review.dish_id}`)}
            className="w-full py-3 rounded-xl font-semibold transition-colors"
            style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
          >
            View Dish Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReviewDetailModal
