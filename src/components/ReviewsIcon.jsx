/**
 * ReviewsIcon - Illustrated reviews icon for "Reviews" section
 */

export function ReviewsIcon({ size = 20, className = '', active = false }) {
  const scaledSize = Math.round(size * 1.6)
  return (
    <img
      src="/reviews.png"
      alt="reviews"
      className={`inline-block object-contain ${className}`}
      style={{
        width: scaledSize,
        height: scaledSize,
        margin: -Math.round(size * 0.3),
        filter: active ? 'brightness(1.15) drop-shadow(0 0 4px rgba(232, 102, 60, 0.4))' : 'none',
      }}
    />
  )
}

export default ReviewsIcon
