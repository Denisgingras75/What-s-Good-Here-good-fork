// Feature flags for gradual rollouts

export const FEATURES = {
  // Rating Identity System - tracks user rating bias and pending votes
  RATING_IDENTITY_ENABLED: import.meta.env.VITE_RATING_IDENTITY_ENABLED === 'true',
}
