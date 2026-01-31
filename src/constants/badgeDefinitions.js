// Badge system definitions — rarity tiers, families, category badge helpers
import { CATEGORY_INFO, MAJOR_CATEGORIES } from './categories'

// Rarity tiers (RPG-style)
export const RARITY = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
}

// Colors per rarity tier
export const RARITY_COLORS = {
  [RARITY.COMMON]: '#6B7280',
  [RARITY.UNCOMMON]: '#10B981',
  [RARITY.RARE]: '#3B82F6',
  [RARITY.EPIC]: '#9333EA',
  [RARITY.LEGENDARY]: '#F59E0B',
}

// Display labels per rarity
export const RARITY_LABELS = {
  [RARITY.COMMON]: 'Common',
  [RARITY.UNCOMMON]: 'Uncommon',
  [RARITY.RARE]: 'Rare',
  [RARITY.EPIC]: 'Epic',
  [RARITY.LEGENDARY]: 'Legendary',
}

// Badge families
export const BADGE_FAMILY = {
  VOLUME: 'volume',
  CATEGORY: 'category',
  DISCOVERY: 'discovery',
  CONSISTENCY: 'consistency',
  COMMUNITY: 'community',
  INFLUENCE: 'influence',
}

// Family display info
export const FAMILY_INFO = {
  [BADGE_FAMILY.VOLUME]: { emoji: '🍽️', label: 'Volume' },
  [BADGE_FAMILY.CATEGORY]: { emoji: '🏅', label: 'Category Mastery' },
  [BADGE_FAMILY.DISCOVERY]: { emoji: '🔭', label: 'Discovery' },
  [BADGE_FAMILY.CONSISTENCY]: { emoji: '🎯', label: 'Consistency' },
  [BADGE_FAMILY.COMMUNITY]: { emoji: '🤝', label: 'Community' },
  [BADGE_FAMILY.INFLUENCE]: { emoji: '📣', label: 'Influence' },
}

// Maps rarity to celebration tier
// common/uncommon -> 'standard' (toast), rare -> 'rare' (overlay), epic/legendary -> 'major' (overlay + confetti)
export const CELEBRATION_TIER_MAP = {
  [RARITY.COMMON]: 'standard',
  [RARITY.UNCOMMON]: 'standard',
  [RARITY.RARE]: 'rare',
  [RARITY.EPIC]: 'major',
  [RARITY.LEGENDARY]: 'major',
}

// Volume badge metadata (key -> { stat, threshold })
// 'stat' is which field from evaluation stats to check
export const VOLUME_BADGE_META = {
  first_bite: { stat: 'totalDishes', threshold: 1 },
  food_explorer: { stat: 'totalDishes', threshold: 10 },
  taste_tester: { stat: 'totalDishes', threshold: 25 },
  super_reviewer: { stat: 'totalDishes', threshold: 100 },
  top_1_percent_reviewer: { stat: 'totalDishes', threshold: 125 },
  neighborhood_explorer: { stat: 'totalRestaurants', threshold: 3 },
  city_taster: { stat: 'totalRestaurants', threshold: 5 },
  local_food_scout: { stat: 'totalRestaurants', threshold: 10 },
  restaurant_trailblazer: { stat: 'totalRestaurants', threshold: 20 },
  ultimate_explorer: { stat: 'totalRestaurants', threshold: 50 },
}

// Discovery/Community badge metadata (key -> threshold on dishesHelpedEstablish)
export const DISCOVERY_BADGE_META = {
  first_to_find: { threshold: 1 },
  trailblazer: { threshold: 5 },
  pioneer: { threshold: 15 },
}

export const COMMUNITY_BADGE_META = {
  helping_hand: { threshold: 3 },
  community_builder: { threshold: 10 },
  cornerstone: { threshold: 25 },
}

// Consistency badge metadata
export const CONSISTENCY_BADGE_META = {
  steady_hand: { check: 'steady', minVotes: 20, maxAbsBias: 0.5 },
  tough_critic: { check: 'low', minVotes: 20, maxBias: -1.5 },
  generous_spirit: { check: 'high', minVotes: 20, minBias: 1.5 },
}

// Influence badge metadata
export const INFLUENCE_BADGE_META = {
  taste_maker: { threshold: 5 },
  trusted_voice: { threshold: 15 },
  taste_authority: { threshold: 30 },
}

// Category badge tiers
export const CATEGORY_BADGE_TIERS = {
  specialist: { volumeThreshold: 15, maxAbsBias: 1.5 },
  authority: { volumeThreshold: 30, maxAbsBias: 1.0 },
}

// Generate a category badge key from category id and tier
export function generateCategoryBadgeKey(categoryId, tier) {
  const normalized = categoryId.replace(/\s+/g, '_')
  return `${tier}_${normalized}`
}

// Parse a category badge key back into { tier, categoryId }
export function parseCategoryBadgeKey(key) {
  const match = key.match(/^(specialist|authority)_(.+)$/)
  if (!match) return null
  return {
    tier: match[1],
    categoryId: match[2].replace(/_/g, ' '),
  }
}

// Check if a badge key is a category badge
export function isCategoryBadge(key) {
  return parseCategoryBadgeKey(key) !== null
}

// Get the rarity color for a given rarity string
export function getRarityColor(rarity) {
  return RARITY_COLORS[rarity] || RARITY_COLORS[RARITY.COMMON]
}

// Get display name for a category badge
export function getCategoryBadgeName(key) {
  const parsed = parseCategoryBadgeKey(key)
  if (!parsed) return key
  const info = CATEGORY_INFO[parsed.categoryId] || { label: parsed.categoryId }
  const tierLabel = parsed.tier === 'authority' ? 'Authority' : 'Specialist'
  return `${info.label} ${tierLabel}`
}

// Get all major category IDs as an array (for iteration)
export function getMajorCategoryIds() {
  return Array.from(MAJOR_CATEGORIES)
}
