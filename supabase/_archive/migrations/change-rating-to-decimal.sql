-- Migration: Change rating_10 from INTEGER to DECIMAL to support granular ratings (e.g., 7.5)
-- This allows users to rate dishes with decimal precision

-- Alter the votes table to change rating_10 from INTEGER to DECIMAL(3,1)
ALTER TABLE votes
ALTER COLUMN rating_10 TYPE DECIMAL(3,1);

-- Add a comment explaining the column
COMMENT ON COLUMN votes.rating_10 IS 'User rating from 1-10, supports decimals (e.g., 7.5)';
