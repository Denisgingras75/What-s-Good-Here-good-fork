import { useState, useEffect } from 'react'

const STORAGE_KEY = 'wgh-splash-seen'

export function WelcomeSplash({ onComplete }) {
  const [phase, setPhase] = useState('pre-entry')
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    // Check localStorage - only show once ever (first time only)
    try {
      const seen = localStorage.getItem(STORAGE_KEY)
      if (seen) {
        onComplete?.()
        return
      }
    } catch (error) {
      // localStorage not available, show splash anyway
    }

    setShouldShow(true)
    const timers = []

    // Animation timeline
    timers.push(setTimeout(() => setPhase('glow-in'), 300))      // Image fades in with glow
    timers.push(setTimeout(() => setPhase('glow-peak'), 1000))   // Glow intensifies
    timers.push(setTimeout(() => setPhase('settle'), 1500))      // Glow settles, slight scale
    timers.push(setTimeout(() => setPhase('tagline'), 2000))     // Tagline appears
    timers.push(setTimeout(() => setPhase('done'), 3000))        // Hold for a moment
    timers.push(setTimeout(() => setPhase('fade-out'), 3300))    // Fade out splash
    timers.push(setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, 'true')
      } catch (error) {
        // localStorage not available
      }
      setShouldShow(false)
      onComplete?.()
    }, 3800))

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  if (!shouldShow) return null

  const isVisible = phase !== 'pre-entry'
  const isGlowPeak = phase === 'glow-peak'
  const isSettled = phase === 'settle' || phase === 'tagline' || phase === 'done'
  const showTagline = phase === 'tagline' || phase === 'done'
  const isFadingOut = phase === 'fade-out'

  const handleClick = () => {
    if (isVisible && !isFadingOut) {
      try {
        localStorage.setItem(STORAGE_KEY, 'true')
      } catch (error) {
        // localStorage not available
      }
      setShouldShow(false)
      onComplete?.()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center transition-opacity duration-500 cursor-pointer"
      style={{
        background: '#121212',
        opacity: isFadingOut ? 0 : 1,
      }}
      onClick={handleClick}
    >
      {/* Main WGH Image */}
      <div
        className="transition-all ease-out"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible
            ? isSettled
              ? 'scale(0.95)'
              : 'scale(1)'
            : 'scale(0.9)',
          filter: isGlowPeak
            ? 'drop-shadow(0 0 40px rgba(244, 162, 97, 0.8)) drop-shadow(0 0 80px rgba(244, 162, 97, 0.4))'
            : isSettled
              ? 'drop-shadow(0 0 25px rgba(244, 162, 97, 0.5)) drop-shadow(0 0 50px rgba(244, 162, 97, 0.2))'
              : 'drop-shadow(0 0 30px rgba(244, 162, 97, 0.6))',
          transitionDuration: isGlowPeak ? '500ms' : '700ms',
        }}
      >
        <img
          src="/wgh-splash.png"
          alt="What's Good Here"
          className="w-[320px] md:w-[420px] lg:w-[500px] h-auto"
          draggable={false}
        />
      </div>

      {/* Tagline */}
      <p
        className="mt-6 text-sm md:text-base transition-all duration-500"
        style={{
          color: 'rgba(244, 162, 97, 0.8)',
          opacity: showTagline ? 1 : 0,
          transform: showTagline ? 'translateY(0)' : 'translateY(10px)',
        }}
      >
        Discover the best dishes on Martha's Vineyard
      </p>

      {/* Tap to continue hint */}
      <p
        className="absolute bottom-10 text-xs transition-all duration-700"
        style={{
          color: 'rgba(244, 162, 97, 0.4)',
          opacity: showTagline ? 1 : 0,
          transform: showTagline ? 'translateY(0)' : 'translateY(10px)',
        }}
      >
        Tap anywhere to continue
      </p>
    </div>
  )
}
