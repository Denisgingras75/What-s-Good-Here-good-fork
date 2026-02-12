-- Drop orphaned streak/leaderboard objects from production
-- These were removed from schema.sql in commit a4287b9 but never dropped in production.
-- The streak trigger fires on every vote, writing to a table nothing reads.
--
-- Run in Supabase SQL Editor. DONE 2026-02-12.
-- Note: user_streaks table/policies/indexes were already absent in production.

DROP TRIGGER IF EXISTS trigger_update_streak_on_vote ON votes;
DROP FUNCTION IF EXISTS update_user_streak_on_vote();
DROP FUNCTION IF EXISTS get_user_streak_info(UUID);
DROP FUNCTION IF EXISTS get_friends_leaderboard(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_weekly_reset_countdown();
ALTER TABLE dishes DROP COLUMN IF EXISTS yes_votes;
