/**
 * HearingIcon - Neon hearing icon for "Heard Good Here" section
 */

export function HearingIcon({ size = 20, className = '', active = false }) {
  return (
    <img
      src="/hearing.png"
      alt="heard good here"
      className={`inline-block object-contain transition-all duration-200 ${className}`}
      style={{
        width: size,
        height: size,
        filter: active
          ? 'brightness(1.4) drop-shadow(0 0 6px rgba(246, 173, 85, 0.8)) drop-shadow(0 0 12px rgba(246, 173, 85, 0.4))'
          : 'brightness(0.9) opacity(0.85)',
      }}
    />
  )
}

export default HearingIcon
