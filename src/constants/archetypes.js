// Archetype definitions — derived from actual user behavior, not chosen.
// Priority order: first match wins.

export const ARCHETYPES = [
  {
    id: 'specialist',
    emoji: '\uD83C\uDFAF',
    label: 'The Specialist',
    description: 'Deep expertise in your favorite category',
    color: '#F59E0B',
    // Triggers: high concentration in one category + at least Fan tier
    thresholds: { categoryConcentration: 0.45, minTopTierLevel: 2 },
  },
  {
    id: 'purist',
    emoji: '\uD83D\uDD2C',
    label: 'The Purist',
    description: 'High standards, consistent taste',
    color: '#3B82F6',
    // Triggers: low average rating + low variance
    thresholds: { maxAvgRating: 6.5, maxRatingVariance: 1.2 },
  },
  {
    id: 'adventurer',
    emoji: '\uD83E\uDDED',
    label: 'The Adventurer',
    description: 'Wide exploration, eclectic taste',
    color: '#10B981',
    // Triggers: low concentration + high variance
    thresholds: { maxCategoryConcentration: 0.25, minRatingVariance: 1.8 },
  },
  {
    id: 'connector',
    emoji: '\uD83D\uDD17',
    label: 'The Connector',
    description: 'Your taste draws a following',
    color: '#9333EA',
    // Triggers: social influence
    thresholds: { minFollowers: 5, minTotalVotes: 15 },
  },
  {
    id: 'consensus_builder',
    emoji: '\uD83E\uDD1D',
    label: 'The Consensus Builder',
    description: 'Reliably aligned with the community',
    color: '#E07856',
    // Triggers: low bias + many votes
    thresholds: { maxAbsRatingBias: 0.5, minTotalVotes: 20 },
  },
]

// Confidence tiers based on total votes
export const CONFIDENCE_THRESHOLDS = {
  none: 10,       // < 10 votes: no archetype shown
  emerging: 25,   // 10-24 votes: "Trending toward [Archetype]"
  established: 25, // 25+ votes: full "The [Archetype]"
}
