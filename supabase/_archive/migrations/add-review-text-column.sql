-- Add review text column to votes table
-- Allows users to write text reviews along with their vote and rating

-- Add the review_text column
ALTER TABLE votes ADD COLUMN IF NOT EXISTS review_text TEXT;

-- Add timestamp for when the review was written/updated
-- Separate from created_at since user may add review later
ALTER TABLE votes ADD COLUMN IF NOT EXISTS review_created_at TIMESTAMP WITH TIME ZONE;

-- Add constraint to limit review length to 200 characters
ALTER TABLE votes ADD CONSTRAINT review_text_max_length CHECK (
  review_text IS NULL OR length(review_text) <= 200
);

-- Add index for efficient querying of dishes with reviews
CREATE INDEX IF NOT EXISTS idx_votes_review_text ON votes (dish_id)
WHERE review_text IS NOT NULL AND review_text != '';

COMMENT ON COLUMN votes.review_text IS 'Optional text review (max 200 chars)';
COMMENT ON COLUMN votes.review_created_at IS 'Timestamp when review was written/updated';
