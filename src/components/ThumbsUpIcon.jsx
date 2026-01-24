/**
 * ThumbsUpIcon - Neon thumbs up icon to replace emoji
 */

export function ThumbsUpIcon({ size = 20, className = '' }) {
  return (
    <img
      src="/thumbs-up.png"
      alt="thumbs up"
      className={`inline-block object-contain ${className}`}
      style={{
        width: size,
        height: size,
      }}
    />
  )
}

export default ThumbsUpIcon
