-- Add attestation fields to votes table
-- badge_hash links to JITTEr attestation server verification page
-- war_score stores the WAR (Writing Authenticity Rating) at time of review

ALTER TABLE votes ADD COLUMN IF NOT EXISTS war_score DECIMAL(4, 3);
ALTER TABLE votes ADD COLUMN IF NOT EXISTS badge_hash TEXT;

-- Index for looking up votes by badge hash (verification page links)
CREATE INDEX IF NOT EXISTS idx_votes_badge_hash ON votes(badge_hash) WHERE badge_hash IS NOT NULL;
