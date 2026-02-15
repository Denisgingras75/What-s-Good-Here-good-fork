/**
 * Simple content moderation for reviews.
 * Uses a blocklist approach to catch obvious inappropriate content.
 */

// Common profanity, slurs, and spam phrases
// Based on commonly used profanity lists - includes variations and common misspellings
const BLOCKED_WORDS = [
  // Profanity
  'fuck', 'fucking', 'fucked', 'fucker', 'fck', 'f*ck',
  'shit', 'shitty', 'bullshit', 'sh*t',
  'ass', 'asshole', 'a**hole',
  'bitch', 'b*tch',
  'damn', 'dammit',
  'crap',
  'bastard',
  'dick', 'd*ck',
  'piss', 'pissed',
  'cunt', 'c*nt',

  // Slurs (racial, ethnic, sexual orientation, disability)
  'nigger', 'nigga', 'n*gger', 'n*gga',
  'faggot', 'fag', 'f*ggot', 'f*g',
  'retard', 'retarded', 'r*tard',
  'spic', 'sp*c',
  'chink', 'ch*nk',
  'kike', 'k*ke',
  'wetback',
  'beaner',
  'cracker',
  'honky',
  'dyke', 'd*ke',
  'tranny', 'tr*nny',

  // Hate speech
  'nazi', 'hitler',
  'kkk',

  // Spam/scam phrases
  'buy now', 'click here', 'free money',
  'make money fast', 'work from home',
  'bitcoin', 'crypto', 'nft',
  'www.', 'http://', 'https://',
  '.com', '.net', '.org',

  // Sexual content
  'porn', 'p*rn',
  'sex', 's*x',
  'nude', 'naked',
  'xxx',
];

/**
 * Check if review text contains blocked content.
 * @param {string} text - The review text to check
 * @returns {boolean} - True if blocked content found
 */
export function containsBlockedContent(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const lower = text.toLowerCase();

  // Check for exact word matches (with word boundaries to avoid false positives)
  // e.g., "class" shouldn't match "ass"
  return BLOCKED_WORDS.some(word => {
    // For short words (3 chars or less), require word boundaries
    if (word.length <= 3) {
      const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i');
      return regex.test(lower);
    }
    // For longer words, simple includes is fine
    return lower.includes(word);
  });
}

/**
 * Validate any user-generated text for blocked content.
 * Returns an error message string if blocked, or null if clean.
 * @param {string} text - Text to validate
 * @param {string} fieldName - Human-readable field name for error message
 * @returns {string|null} Error message or null
 */
export function validateUserContent(text, fieldName = 'Content') {
  if (!text?.trim()) return null;
  if (containsBlockedContent(text)) {
    return `${fieldName} contains inappropriate content. Please revise.`;
  }
  return null;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
