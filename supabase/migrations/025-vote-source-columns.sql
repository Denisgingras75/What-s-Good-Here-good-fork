-- Add source tracking to votes
ALTER TABLE votes ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'user';
ALTER TABLE votes ADD CONSTRAINT votes_source_check CHECK (source IN ('user', 'ai_estimated'));
ALTER TABLE votes ADD COLUMN IF NOT EXISTS source_metadata JSONB;

-- Drop the existing UNIQUE constraint and replace with partial unique index
-- This allows multiple ai_estimated votes per dish while keeping user votes unique
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_dish_id_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS votes_user_unique ON votes (dish_id, user_id) WHERE source = 'user';

-- Index for filtering by source
CREATE INDEX IF NOT EXISTS idx_votes_source ON votes (source);
