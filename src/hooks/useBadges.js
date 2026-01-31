import { useState, useEffect, useCallback, useMemo } from 'react'
import { badgesApi } from '../api/badgesApi'
import { logger } from '../utils/logger'
import {
  VOLUME_BADGE_META,
  DISCOVERY_BADGE_META,
  COMMUNITY_BADGE_META,
  CONSISTENCY_BADGE_META,
  INFLUENCE_BADGE_META,
  CATEGORY_BADGE_TIERS,
  isCategoryBadge,
  parseCategoryBadgeKey,
} from '../constants/badgeDefinitions'

/**
 * Compute progress info for a single badge based on evaluation stats.
 */
function computeBadgeProgress(badge, evalStats) {
  if (!evalStats) return { progress: 0, target: 1, accuracyStatus: null }

  const family = badge.family || 'volume'

  // Volume badges
  if (family === 'volume' && VOLUME_BADGE_META[badge.key]) {
    const meta = VOLUME_BADGE_META[badge.key]
    const value = evalStats[meta.stat] || 0
    return { progress: Math.min(value, meta.threshold), target: meta.threshold }
  }

  // Category mastery badges
  if (family === 'category' && isCategoryBadge(badge.key)) {
    const parsed = parseCategoryBadgeKey(badge.key)
    if (!parsed) return { progress: 0, target: 1 }

    const tierMeta = CATEGORY_BADGE_TIERS[parsed.tier]
    if (!tierMeta) return { progress: 0, target: 1 }

    // Find category stats
    const catStats = (evalStats.categoryStats || []).find(
      c => c.category === parsed.categoryId
    )
    const consensusRatings = catStats?.consensus_ratings || catStats?.consensusRatings || 0
    const bias = catStats?.bias
    const absBias = bias != null ? Math.abs(bias) : null

    return {
      progress: Math.min(consensusRatings, tierMeta.volumeThreshold),
      target: tierMeta.volumeThreshold,
      accuracyStatus: absBias != null
        ? { met: absBias <= tierMeta.maxAbsBias, currentBias: bias, maxBias: tierMeta.maxAbsBias }
        : null,
    }
  }

  // Discovery badges
  if (family === 'discovery' && DISCOVERY_BADGE_META[badge.key]) {
    const meta = DISCOVERY_BADGE_META[badge.key]
    const value = evalStats.dishesHelpedEstablish || 0
    return { progress: Math.min(value, meta.threshold), target: meta.threshold }
  }

  // Community badges
  if (family === 'community' && COMMUNITY_BADGE_META[badge.key]) {
    const meta = COMMUNITY_BADGE_META[badge.key]
    const value = evalStats.dishesHelpedEstablish || 0
    return { progress: Math.min(value, meta.threshold), target: meta.threshold }
  }

  // Consistency badges
  if (family === 'consistency' && CONSISTENCY_BADGE_META[badge.key]) {
    const meta = CONSISTENCY_BADGE_META[badge.key]
    const votes = evalStats.votesWithConsensus || 0
    const bias = evalStats.globalBias || 0

    // Volume progress toward 20 consensus votes
    const volumeProgress = Math.min(votes, meta.minVotes)

    let accuracyMet = false
    if (meta.check === 'steady') {
      accuracyMet = Math.abs(bias) <= meta.maxAbsBias
    } else if (meta.check === 'low') {
      accuracyMet = bias <= meta.maxBias
    } else if (meta.check === 'high') {
      accuracyMet = bias >= meta.minBias
    }

    return {
      progress: volumeProgress,
      target: meta.minVotes,
      accuracyStatus: { met: accuracyMet, currentBias: bias },
    }
  }

  // Influence badges
  if (family === 'influence' && INFLUENCE_BADGE_META[badge.key]) {
    const meta = INFLUENCE_BADGE_META[badge.key]
    const value = evalStats.followerCount || 0
    return { progress: Math.min(value, meta.threshold), target: meta.threshold }
  }

  // Fallback for unknown badges
  return { progress: 0, target: 1 }
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
      const { progress, target, accuracyStatus } = computeBadgeProgress(badge, evalStats)

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
