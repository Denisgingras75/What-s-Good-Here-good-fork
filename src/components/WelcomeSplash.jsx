import { useState, useEffect } from 'react'

const STORAGE_KEY = 'wgh_has_seen_splash'

/**
 * WelcomeSplash - One-time welcome screen for first-time visitors
 * Shows logo and mission statement, dismissed by tapping anywhere
 */
export function WelcomeSplash() {
  const [isVisible, setIsVisible] = useState(false)
  const [isFading, setIsFading] = useState(false)

  // Check if user has seen splash before
  useEffect(() => {
    const hasSeenSplash = localStorage.getItem(STORAGE_KEY)
    if (!hasSeenSplash) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsFading(true)
    // Wait for fade animation to complete before hiding
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, 'true')
      setIsVisible(false)
    }, 400)
  }

  if (!isVisible) return null

  return (
    <div
      className={`welcome-splash ${isFading ? 'welcome-splash--fading' : ''}`}
      onClick={handleDismiss}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleDismiss()}
      aria-label="Welcome screen. Tap to continue."
    >
      <div className="welcome-splash__content">
        {/* Logo with entrance animation */}
        <img
          src="/logo.png"
          alt="What's Good Here"
          className="welcome-splash__logo"
        />

        {/* Welcome header */}
        <p className="welcome-splash__header">
          Welcome.
        </p>

        {/* Mission statement */}
        <p className="welcome-splash__mission">
          Find dishes worth ordering — based on real people, not hype.
        </p>

        {/* Reinforcement */}
        <p className="welcome-splash__subtext">
          Vote on what you try. Let the best rise to the top.
        </p>

        {/* Tap hint */}
        <p className="welcome-splash__hint">
          Tap anywhere to continue
        </p>
      </div>
    </div>
  )
}
