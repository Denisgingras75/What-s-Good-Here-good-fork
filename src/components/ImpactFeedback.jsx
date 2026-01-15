import { useEffect, useState } from 'react'

/**
 * Calculate impact message based on before/after vote data
 */
export function getImpactMessage(before, after, beforeRank, afterRank) {
  // Just became ranked (hit 5 votes)
  if (before.total_votes < 5 && after.total_votes >= 5) {
    return {
      message: "This dish is now ranked!",
      emoji: "🎉",
      type: "milestone"
    }
  }

  // Entered top 10
  if (beforeRank > 10 && afterRank <= 10) {
    return {
      message: "Just entered the Top 10!",
      emoji: "🏆",
      type: "milestone"
    }
  }

  // Moved up significantly (3+ spots)
  if (afterRank < beforeRank && beforeRank - afterRank >= 3) {
    return {
      message: `Moved up ${beforeRank - afterRank} spots!`,
      emoji: "🚀",
      type: "movement"
    }
  }

  // Moved up
  if (afterRank < beforeRank) {
    const spots = beforeRank - afterRank
    return {
      message: `Moved up ${spots} spot${spots > 1 ? 's' : ''}!`,
      emoji: "📈",
      type: "movement"
    }
  }

  // Still needs votes to qualify
  if (after.total_votes < 5) {
    const needed = 5 - after.total_votes
    return {
      message: `${needed} more vote${needed > 1 ? 's' : ''} to qualify`,
      emoji: "👍",
      type: "progress"
    }
  }

  // Default for ranked dishes - show rating
  return {
    message: `Now rated ${after.avg_rating || '—'}/10`,
    emoji: "✓",
    type: "update"
  }
}

/**
 * Impact feedback toast shown after voting
 * Made prominent so users FEEL their impact
 */
export function ImpactFeedback({ impact, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (impact) {
      // Animate in
      requestAnimationFrame(() => setVisible(true))

      // Auto-close after 4 seconds (longer so user can read it)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onClose, 400) // Wait for fade out
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [impact, onClose])

  if (!impact) return null

  const bgColor = impact.type === 'milestone'
    ? 'from-emerald-500 to-teal-600'
    : impact.type === 'movement'
    ? 'from-blue-500 to-indigo-600'
    : 'from-amber-500 to-orange-600'

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[9999] flex items-start justify-center pt-6 px-4 transition-all duration-400 ease-out ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-8 scale-95'
      }`}
    >
      <div
        className={`bg-gradient-to-r ${bgColor} rounded-2xl shadow-2xl p-5 w-full max-w-md border-2 border-white/20`}
        style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
      >
        <div className="flex items-center gap-4 text-white">
          <div className="text-5xl animate-bounce">{impact.emoji}</div>
          <div className="flex-1">
            <p className="font-bold text-xl">{impact.message}</p>
            <p className="text-base text-white/90 mt-1">Your vote made a difference!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
