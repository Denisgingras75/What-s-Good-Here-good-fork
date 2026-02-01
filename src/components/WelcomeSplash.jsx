import { useState, useEffect } from 'react'
import { logger } from '../utils/logger'

// Module-level flag - persists across re-renders, resets on app reload
let hasShownThisSession = false

export function WelcomeSplash({ onComplete }) {
  const [phase, setPhase] = useState('pre-entry')
  const [shouldShow, setShouldShow] = useState(() => !hasShownThisSession)

  useEffect(() => {
    // Already shown this session, skip
    if (hasShownThisSession) {
      onComplete?.()
      return
    }

    hasShownThisSession = true
    const timers = []

    // Animation timeline: fade in (300ms) → hold (1.9s) → fade out (300ms) = 2.5s total
    timers.push(setTimeout(() => setPhase('visible'), 50))       // Start fade in
    timers.push(setTimeout(() => setPhase('fade-out'), 2200))    // Start fade out
    timers.push(setTimeout(() => {
      setShouldShow(false)
      onComplete?.()
    }, 2500))

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  const handleSkip = () => {
    if (phase !== 'pre-entry' && phase !== 'fade-out') {
      hasShownThisSession = true
      setShouldShow(false)
      onComplete?.()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSkip()
    }
  }

  if (!shouldShow) return null

  const isVisible = phase !== 'pre-entry'
  const isFadingOut = phase === 'fade-out'

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center cursor-pointer"
      style={{
        background: '#0D1B22',
        opacity: isFadingOut ? 0 : isVisible ? 1 : 0,
        transition: isFadingOut ? 'opacity 300ms ease-out' : 'opacity 300ms ease-in',
        pointerEvents: (isFadingOut || !isVisible) ? 'none' : 'auto',
      }}
      onClick={handleSkip}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Welcome splash screen. Press Enter or tap to skip."
    >
      {/* Main WGH Image */}
      <div
        className="transition-all duration-300 ease-out"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
        }}
      >
        <img
          src="/logo.png"
          alt="What's Good Here"
          className="w-[336px] md:w-[432px] lg:w-[504px] h-auto"
          draggable={false}
          onError={(e) => logger.error('Splash image failed to load:', e)}
        />
      </div>

      {/* Tap to skip hint */}
      <p
        className="absolute bottom-10 text-xs transition-opacity duration-300"
        style={{
          color: 'rgba(255, 255, 255, 0.4)',
          opacity: isVisible && !isFadingOut ? 1 : 0,
        }}
      >
        Tap anywhere to skip
      </p>
    </div>
  )
}
