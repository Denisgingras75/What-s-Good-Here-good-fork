import { useState, useEffect, useCallback, useMemo } from 'react'
import { badgesApi } from '../api/badgesApi'
import { logger } from '../utils/logger'
import {
  CATEGORY_BADGE_TIERS,
  isCategoryBadge,
  parseCategoryBadgeKey,
} from '../constants/badgeDefinitions'
import { CATEGORY_INFO } from '../constants/categories'

/**
 * Compute progress info for a single badge based on evaluation stats.
 * Only category mastery badges have meaningful progress tracking.
 * Returns { progress, target, accuracyStatus, requirementText }
 */
function computeBadgeProgress(badge, evalStats) {
  if (!evalStats) return { progress: 0, target: 1, accuracyStatus: null, requirementText: null }

  const family = badge.family || 'volume'

  // Category mastery badges
  if (family === 'category' && isCategoryBadge(badge.key)) {
    const parsed = parseCategoryBadgeKey(badge.key)
    if (!parsed) return { progress: 0, target: 1, requirementText: null }

    const tierMeta = CATEGORY_BADGE_TIERS[parsed.tier]
    if (!tierMeta) return { progress: 0, target: 1, requirementText: null }

    const catInfo = CATEGORY_INFO[parsed.categoryId] || { label: parsed.categoryId }
    const catStats = (evalStats.categoryStats || []).find(
      c => c.category === parsed.categoryId
    )
    const consensusRatings = catStats?.consensus_ratings || catStats?.consensusRatings || 0
    const bias = catStats?.bias
    const absBias = bias != null ? Math.abs(bias) : null

    const accuracyStatus = absBias != null
      ? { met: absBias <= tierMeta.maxAbsBias, currentBias: bias, maxBias: tierMeta.maxAbsBias }
      : null

    const volumeRemaining = tierMeta.volumeThreshold - consensusRatings
    const parts = []
    if (volumeRemaining > 0) {
      parts.push(`Rate ${volumeRemaining} more consensus-rated ${catInfo.label.toLowerCase()}${volumeRemaining === 1 ? '' : ' dishes'}`)
    }
    if (accuracyStatus && !accuracyStatus.met) {
      parts.push('Improve accuracy to within range')
    }
    const requirementText = parts.length > 0 ? parts.join(', ') : null

    return {
      progress: Math.min(consensusRatings, tierMeta.volumeThreshold),
      target: tierMeta.volumeThreshold,
      accuracyStatus,
      requirementText,
    }
  }

  // Fallback for non-category badges (still awarded by SQL, just no progress UI)
  return { progress: 0, target: 1, requirementText: null }
}

export function useBadges(userId, { evaluateOnMount = false } = {}) {
  const [badges, setBadges] = useState([])
  const [allBadges, setAllBadges] = useState([])
  const [evalStats, setEvalStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch user's badges, badge definitions, and evaluation stats
  useEffect(() => {
    if (!userId) {
      setBadges([])
      setAllBadges([])
      setEvalStats(null)
      setLoading(false)
      return
    }

    async function fetchBadges() {
      setLoading(true)
      try {
        const [userBadges, badgeDefs, stats] = await Promise.all([
          badgesApi.getUserBadges(userId),
          badgesApi.getAllBadges(),
          badgesApi.getBadgeEvaluationStats(userId),
        ])
        setBadges(userBadges)
        setAllBadges(badgeDefs)
        setEvalStats(stats)
      } catch (error) {
        logger.error('Error fetching badges:', error)
        setBadges([])
        setAllBadges([])
        setEvalStats(null)
      }
      setLoading(false)
    }

    fetchBadges()
  }, [userId])

  // Evaluate on mount (Badges page uses this to catch consensus changes)
  useEffect(() => {
    if (!evaluateOnMount || !userId || loading) return

    async function runEvaluation() {
      try {
        const newlyUnlocked = await badgesApi.evaluateBadges(userId)
        if (newlyUnlocked.length > 0) {
          // Refresh all data after new unlocks
          const [userBadges, stats] = await Promise.all([
            badgesApi.getUserBadges(userId),
            badgesApi.getBadgeEvaluationStats(userId),
          ])
          setBadges(userBadges)
          setEvalStats(stats)
        }
      } catch (error) {
        logger.error('Error evaluating badges on mount:', error)
      }
    }

    runEvaluation()
  }, [evaluateOnMount, userId, loading])

  // Refresh badges
  const refreshBadges = useCallback(async () => {
    if (!userId) return

    try {
      const [userBadges, stats] = await Promise.all([
        badgesApi.getUserBadges(userId),
        badgesApi.getBadgeEvaluationStats(userId),
      ])
      setBadges(userBadges)
      setEvalStats(stats)
    } catch (error) {
      logger.error('Error refreshing badges:', error)
    }
  }, [userId])

  // Evaluate badges and return newly unlocked ones
  const evaluateBadges = useCallback(async () => {
    if (!userId) return []

    try {
      const newlyUnlocked = await badgesApi.evaluateBadges(userId)

      if (newlyUnlocked.length > 0) {
        await refreshBadges()
      }

      return newlyUnlocked
    } catch (error) {
      logger.error('Error evaluating badges:', error)
      return []
    }
  }, [userId, refreshBadges])

  // Compute progress for each badge
  const badgesWithProgress = useMemo(() => {
    return allBadges.map(badge => {
      const unlocked = badges.find(b => b.badge_key === badge.key)
      const { progress, target, accuracyStatus, requirementText } = computeBadgeProgress(badge, evalStats)

      return {
        ...badge,
        unlocked: !!unlocked,
        unlocked_at: unlocked?.unlocked_at,
        progress,
        target,
        percentage: target > 0 ? Math.round((progress / target) * 100) : 0,
        rarity: badge.rarity || 'common',
        family: badge.family || 'volume',
        category: badge.category || null,
        accuracyStatus: accuracyStatus || null,
        requirementText: requirementText || null,
      }
    })
  }, [allBadges, badges, evalStats])

  return {
    badges: badgesWithProgress,
    unlockedBadges: badges,
    evalStats,
    loading,
    refreshBadges,
    evaluateBadges,
  }
}
