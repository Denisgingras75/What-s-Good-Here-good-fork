import { useState, useEffect, useCallback } from 'react'
import { votesApi } from '../api/votesApi'
import {
  getCategoryInfo,
  TIER_THRESHOLDS,
  MAJOR_CATEGORIES,
} from '../constants/categories'
import { logger } from '../utils/logger'

/**
 * Transform raw vote data to dish format
 */
function transformVote(vote) {
  return {
    dish_id: vote.dishes.id,
    dish_name: vote.dishes.name,
    category: vote.dishes.category,
    price: vote.dishes.price,
    photo_url: vote.dishes.photo_url,
    restaurant_name: vote.dishes.restaurants?.name,
    rating_10: vote.rating_10,
    community_avg: vote.dishes.avg_rating,
    total_votes: vote.dishes.total_votes,
    voted_at: vote.created_at,
  }
}

/**
 * Get tier for a vote count
 */
export function getTierForCount(count) {
  for (const tier of TIER_THRESHOLDS) {
    if (count >= tier.min) {
      return tier
    }
  }
  return null
}

/**
 * Get next tier info for a vote count
 */
export function getNextTierInfo(count) {
  // Find the next tier threshold above current count
  const sortedThresholds = [...TIER_THRESHOLDS].sort((a, b) => a.min - b.min)

  for (const tier of sortedThresholds) {
    if (count < tier.min) {
      return {
        nextTier: tier,
        votesNeeded: tier.min - count,
        progress: count / tier.min,
      }
    }
  }

  // Already at max tier
  return null
}

/**
 * Calculate progress towards next tier for each category
 * Only includes major categories
 */
export function calculateCategoryProgress(categoryCounts) {
  const progress = []
  if (!categoryCounts || typeof categoryCounts !== 'object') return progress

  for (const [category, count] of Object.entries(categoryCounts)) {
    // Only show major categories
    if (!MAJOR_CATEGORIES.has(category)) continue

    const nextInfo = getNextTierInfo(count)

    // Only show progress if there's a next tier to reach
    if (nextInfo) {
      const info = getCategoryInfo(category)
      const currentTier = getTierForCount(count)

      progress.push({
        category,
        count,
        ...info,
        currentTier,
        nextTier: nextInfo.nextTier,
        votesNeeded: nextInfo.votesNeeded,
        progress: nextInfo.progress,
      })
    }
  }

  // Sort by progress (closest to next tier first), then by count
  progress.sort((a, b) => {
    if (b.progress !== a.progress) return b.progress - a.progress
    return b.count - a.count
  })

  return progress
}

/**
 * Get rating personality based on average rating
 */
function getRatingPersonality(avgRating) {
  if (avgRating === null) return null

  if (avgRating < 6.0) {
    return { title: 'Tough Critic', emoji: '🧐', description: 'You have high standards' }
  } else if (avgRating < 7.5) {
    return { title: 'Fair Judge', emoji: '⚖️', description: 'You call it like you see it' }
  } else if (avgRating < 8.5) {
    return { title: 'Generous Rater', emoji: '😊', description: 'You find the good in most dishes' }
  } else {
    return { title: 'Loves Everything', emoji: '🥰', description: 'You\'re easy to please!' }
  }
}

/**
 * Calculate category tiers from vote counts
 * Only includes major categories
 */
export function calculateCategoryTiers(categoryCounts) {
  const tiers = []
  if (!categoryCounts || typeof categoryCounts !== 'object') return tiers

  for (const [category, count] of Object.entries(categoryCounts)) {
    // Only show major categories
    if (!MAJOR_CATEGORIES.has(category)) continue

    const tier = getTierForCount(count)
    if (tier) {
      const info = getCategoryInfo(category)
      tiers.push({
        category,
        count,
        ...tier,
        ...info,
      })
    }
  }

  // Sort by level (highest first), then by count
  tiers.sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level
    return b.count - a.count
  })

  return tiers
}

/**
 * Calculate stats from votes data
 */
function calculateStats(data) {
  const totalVotes = data.length
  const worthItCount = data.filter(v => v.would_order_again).length
  const avoidCount = data.filter(v => !v.would_order_again).length

  // Average rating
  const ratingsWithValue = data.filter(v => v.rating_10 != null)
  const avgRating = ratingsWithValue.length > 0
    ? ratingsWithValue.reduce((sum, v) => sum + v.rating_10, 0) / ratingsWithValue.length
    : null

  // Category counts
  const categoryCounts = {}
  data.forEach(v => {
    const cat = v.dishes.category
    if (cat) {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    }
  })
  const topCategory = Object.entries(categoryCounts).length > 0
    ? Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0]
    : null

  // Rating variance (std dev of ratings) — 0-3.5 typical range
  const ratingVariance = ratingsWithValue.length > 1
    ? Math.sqrt(
        ratingsWithValue.reduce((sum, v) => sum + Math.pow(v.rating_10 - avgRating, 2), 0) / ratingsWithValue.length
      )
    : 0

  // Category concentration (Herfindahl index) — 1.0 = all one category, ~0.07 = perfectly spread
  const catValues = Object.values(categoryCounts)
  const catTotal = catValues.reduce((a, b) => a + b, 0)
  const categoryConcentration = catTotal > 0
    ? catValues.reduce((sum, c) => sum + Math.pow(c / catTotal, 2), 0)
    : 0

  // Category tiers (only categories with 5+ votes)
  const categoryTiers = calculateCategoryTiers(categoryCounts)

  // Category progress (categories working towards next tier)
  const categoryProgress = calculateCategoryProgress(categoryCounts)

  // Rating personality
  const ratingPersonality = getRatingPersonality(avgRating)

  // Favorite restaurant (most votes)
  const restaurantCounts = {}
  data.forEach(v => {
    const name = v.dishes.restaurants?.name
    if (name) {
      restaurantCounts[name] = (restaurantCounts[name] || 0) + 1
    }
  })
  const favoriteRestaurant = Object.entries(restaurantCounts).length > 0
    ? Object.entries(restaurantCounts).sort((a, b) => b[1] - a[1])[0][0]
    : null

  // Count unique restaurants
  const uniqueRestaurants = Object.keys(restaurantCounts).length

  return {
    totalVotes,
    worthItCount,
    avoidCount,
    avgRating,
    ratingVariance,
    categoryConcentration,
    topCategory,
    favoriteRestaurant,
    uniqueRestaurants,
    categoryTiers,
    categoryProgress,
    ratingPersonality,
    categoryCounts,
  }
}

export function useUserVotes(userId) {
  const [votes, setVotes] = useState([])
  const [worthItDishes, setWorthItDishes] = useState([])
  const [avoidDishes, setAvoidDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalVotes: 0,
    worthItCount: 0,
    avoidCount: 0,
    avgRating: null,
    ratingVariance: 0,
    categoryConcentration: 0,
    topCategory: null,
    favoriteRestaurant: null,
    uniqueRestaurants: 0,
    categoryTiers: [],
    categoryProgress: [],
    ratingPersonality: null,
    categoryCounts: {},
    dishesHelpedRank: 0,
  })

  const processVotes = useCallback((data, helpedCount = 0) => {
    setVotes(data)

    // Split into worth it and avoid, then sort by rating (highest first)
    // Dishes without ratings go to the end
    const sortByRating = (a, b) => {
      if (a.rating_10 == null && b.rating_10 == null) return 0
      if (a.rating_10 == null) return 1
      if (b.rating_10 == null) return -1
      return b.rating_10 - a.rating_10
    }

    const worthIt = data.filter(v => v.would_order_again).map(transformVote).sort(sortByRating)
    const avoid = data.filter(v => !v.would_order_again).map(transformVote).sort(sortByRating)

    setWorthItDishes(worthIt)
    setAvoidDishes(avoid)
    setStats({ ...calculateStats(data), dishesHelpedRank: helpedCount })
  }, [])

  useEffect(() => {
    if (!userId) {
      setVotes([])
      setWorthItDishes([])
      setAvoidDishes([])
      setStats({
        totalVotes: 0,
        worthItCount: 0,
        avoidCount: 0,
        avgRating: null,
        topCategory: null,
        favoriteRestaurant: null,
        uniqueRestaurants: 0,
        categoryTiers: [],
        categoryProgress: [],
        ratingPersonality: null,
        categoryCounts: {},
        dishesHelpedRank: 0,
      })
      setLoading(false)
      return
    }

    async function fetchVotes() {
      setLoading(true)
      try {
        const [data, helpedCount] = await Promise.all([
          votesApi.getDetailedVotesForUser(userId),
          votesApi.getDishesHelpedRank(userId)
        ])
        processVotes(data, helpedCount)
      } catch (error) {
        logger.error('Error fetching votes:', error)
      }
      setLoading(false)
    }

    fetchVotes()
  }, [userId, processVotes])

  const refetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const [data, helpedCount] = await Promise.all([
        votesApi.getDetailedVotesForUser(userId),
        votesApi.getDishesHelpedRank(userId)
      ])
      processVotes(data, helpedCount)
    } catch (error) {
      logger.error('Error refetching votes:', error)
    }
    setLoading(false)
  }, [userId, processVotes])

  return {
    votes,
    worthItDishes,
    avoidDishes,
    stats,
    loading,
    refetch,
  }
}
