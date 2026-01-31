import { ARCHETYPES, CONFIDENCE_THRESHOLDS } from '../constants/archetypes'

/**
 * Pure function to determine a user's archetype from their stats.
 *
 * @param {Object} stats - From useUserVotes: totalVotes, avgRating, ratingVariance,
 *                         categoryConcentration, categoryTiers
 * @param {Object} ratingIdentity - From useRatingIdentity: ratingBias
 * @param {Object} followCounts - { followers, following }
 * @returns {{ id: string, confidence: 'none'|'emerging'|'established' } | null}
 */
export function calculateArchetype(stats, ratingIdentity, followCounts) {
  if (!stats) return { id: null, confidence: 'none' }

  const totalVotes = stats.totalVotes || 0

  // Not enough data for any archetype
  if (totalVotes < CONFIDENCE_THRESHOLDS.none) {
    return { id: null, confidence: 'none' }
  }

  const confidence = totalVotes >= CONFIDENCE_THRESHOLDS.established ? 'established' : 'emerging'

  // Find the top category tier level
  const topTierLevel = stats.categoryTiers && stats.categoryTiers.length > 0
    ? stats.categoryTiers[0].level || 0
    : 0

  // Try each archetype in priority order
  for (const archetype of ARCHETYPES) {
    const t = archetype.thresholds

    switch (archetype.id) {
      case 'specialist':
        if (
          (stats.categoryConcentration || 0) > t.categoryConcentration &&
          topTierLevel >= t.minTopTierLevel
        ) {
          return { id: archetype.id, confidence }
        }
        break

      case 'purist':
        if (
          stats.avgRating != null &&
          stats.avgRating < t.maxAvgRating &&
          (stats.ratingVariance || 0) < t.maxRatingVariance
        ) {
          return { id: archetype.id, confidence }
        }
        break

      case 'adventurer':
        if (
          (stats.categoryConcentration || 0) < t.maxCategoryConcentration &&
          (stats.ratingVariance || 0) > t.minRatingVariance
        ) {
          return { id: archetype.id, confidence }
        }
        break

      case 'connector':
        if (
          (followCounts?.followers || 0) >= t.minFollowers &&
          totalVotes >= t.minTotalVotes
        ) {
          return { id: archetype.id, confidence }
        }
        break

      case 'consensus_builder': {
        const bias = ratingIdentity?.ratingBias ?? null
        if (
          bias !== null &&
          Math.abs(bias) < t.maxAbsRatingBias &&
          totalVotes >= t.minTotalVotes
        ) {
          return { id: archetype.id, confidence }
        }
        break
      }
    }
  }

  // No archetype matched
  return { id: null, confidence }
}

/**
 * Get archetype definition by id
 */
export function getArchetypeById(id) {
  return ARCHETYPES.find(a => a.id === id) || null
}
