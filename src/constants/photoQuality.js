/**
 * Photo Quality Constants
 * Single source of truth for all photo validation thresholds and scoring weights
 */

export const PHOTO_QUALITY = {
  // Hard gates (reject if fail)
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  MIN_RESOLUTION_PX: 800, // shortest side must be at least this

  // Brightness thresholds (0-255 scale)
  // Loosened in v1.1 to reduce false rejections in dim restaurants
  BRIGHTNESS: {
    MIN_AVG: 20, // reject if average brightness is darker than this (was 30)
    MAX_AVG: 245, // reject if average brightness is brighter than this (was 240)
    DARK_PIXEL_THRESHOLD: 10, // pixel luminance below this = "dark"
    BRIGHT_PIXEL_THRESHOLD: 245, // pixel luminance above this = "bright"
    MAX_DARK_PCT: 85, // reject if >85% of pixels are dark (was 70%)
    MAX_BRIGHT_PCT: 85, // reject if >85% of pixels are bright/blown out (was 70%)
  },

  // Quality scoring weights (must sum to 100)
  SCORING: {
    RESOLUTION_WEIGHT: 40,
    BRIGHTNESS_WEIGHT: 30,
    COMPRESSION_WEIGHT: 20,
    ASPECT_RATIO_WEIGHT: 10,
  },

  // Aspect ratio scoring thresholds
  // v1.1: No longer penalizes portrait photos (4:3, 3:4, 16:9 all get full score)
  ASPECT_RATIO: {
    NO_PENALTY_MAX: 1.5, // ratio <= 1.5 gets full score (covers 4:3 and most portrait)
    MILD_PENALTY_MAX: 2.0, // ratio 1.5-2.0 gets mild penalty
    // ratio > 2.0 gets strong penalty (panoramas/screenshots)
  },

  // Placement thresholds
  PLACEMENT: {
    FEATURED_MIN_SCORE: 90, // score >= 90 = featured
    COMMUNITY_MIN_SCORE: 70, // score >= 70 = community
    // score < 70 = hidden
  },

  // Ideal values for scoring
  IDEAL: {
    BRIGHTNESS: 128, // perfect middle brightness
    RESOLUTION: 2000, // 2000px = 100% resolution score
    BYTES_PER_PIXEL: 0.5, // good compression ratio
  },
}

// User-friendly rejection messages with actionable advice
export const REJECTION_MESSAGES = {
  INVALID_TYPE: 'Please upload a JPEG, PNG, or WebP image',
  FILE_TOO_LARGE: 'Image must be under 10MB',
  TOO_SMALL: 'Too small — zoom in or use a higher-res photo.',
  TOO_DARK: 'Too dark — try brighter light or move closer to the dish.',
  TOO_BRIGHT: 'Too bright — avoid flash glare or tilt the phone slightly.',
}
