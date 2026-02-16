import { useState, useEffect } from 'react'
import { WghLogo } from './WghLogo'

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
        background: 'var(--color-bg)',
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
      {/* Brand mark + logotype */}
      <div
        className="transition-all duration-300 ease-out text-center px-8"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
        }}
      >
        <div className="flex justify-center" style={{ marginBottom: '-18px', position: 'relative', zIndex: 2 }}>
          <WghLogo size={72} />
        </div>
        <h1
          style={{
            fontFamily: "'aglet-sans', sans-serif",
            fontSize: '42px',
            fontWeight: 700,
            color: 'var(--color-primary)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            position: 'relative',
            zIndex: 1,
          }}
        >
          What's Good Here
        </h1>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            opacity: 0.7,
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginTop: '14px',
          }}
        >
          Martha's Vineyard
        </p>
      </div>

      {/* Tap to skip hint */}
      <p
        className="absolute bottom-10 text-xs transition-opacity duration-300"
        style={{
          color: 'var(--color-text-tertiary)',
          opacity: isVisible && !isFadingOut ? 1 : 0,
        }}
      >
        Tap anywhere to skip
      </p>
    </div>
  )
}
