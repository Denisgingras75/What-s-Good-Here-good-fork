-- Migration: Fix RLS Policy Performance
-- Wraps auth.uid() in SELECT so it's evaluated once, not per-row
-- Impact: 10-100x faster on large tables

-- ============================================
-- STEP 1: Drop existing vote policies
-- ============================================
DROP POLICY IF EXISTS "Users can insert own votes" ON votes;
DROP POLICY IF EXISTS "Users can update own votes" ON votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON votes;

-- ============================================
-- STEP 2: Recreate with optimized auth.uid()
-- ============================================

-- Wrap auth.uid() in (select ...) so it's called once and cached
CREATE POLICY "Users can insert own votes" ON votes
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own votes" ON votes
  FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own votes" ON votes
  FOR DELETE USING ((select auth.uid()) = user_id);

-- ============================================
-- STEP 3: Fix other tables with user-based RLS
-- ============================================

-- Profiles table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

    CREATE POLICY "Users can view own profile" ON profiles
      FOR SELECT USING (true);  -- Public profiles

    CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE USING ((select auth.uid()) = id);

    CREATE POLICY "Users can insert own profile" ON profiles
      FOR INSERT WITH CHECK ((select auth.uid()) = id);
  END IF;
END $$;

-- Saved dishes table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_dishes') THEN
    DROP POLICY IF EXISTS "Users can manage own saved dishes" ON saved_dishes;
    DROP POLICY IF EXISTS "Users can view own saved dishes" ON saved_dishes;
    DROP POLICY IF EXISTS "Users can insert own saved dishes" ON saved_dishes;
    DROP POLICY IF EXISTS "Users can delete own saved dishes" ON saved_dishes;

    CREATE POLICY "Users can view own saved dishes" ON saved_dishes
      FOR SELECT USING ((select auth.uid()) = user_id);

    CREATE POLICY "Users can insert own saved dishes" ON saved_dishes
      FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

    CREATE POLICY "Users can delete own saved dishes" ON saved_dishes
      FOR DELETE USING ((select auth.uid()) = user_id);
  END IF;
END $$;

-- Follows table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'follows') THEN
    DROP POLICY IF EXISTS "Users can manage own follows" ON follows;
    DROP POLICY IF EXISTS "Users can view follows" ON follows;
    DROP POLICY IF EXISTS "Users can insert own follows" ON follows;
    DROP POLICY IF EXISTS "Users can delete own follows" ON follows;

    CREATE POLICY "Users can view follows" ON follows
      FOR SELECT USING (true);  -- Public follow relationships

    CREATE POLICY "Users can insert own follows" ON follows
      FOR INSERT WITH CHECK ((select auth.uid()) = follower_id);

    CREATE POLICY "Users can delete own follows" ON follows
      FOR DELETE USING ((select auth.uid()) = follower_id);
  END IF;
END $$;

-- ============================================
-- STEP 4: Add missing performance indexes
-- ============================================

-- Ensure parent_dish_id index exists (for variants)
CREATE INDEX IF NOT EXISTS idx_dishes_parent ON dishes(parent_dish_id);

-- Index for time-based vote queries
CREATE INDEX IF NOT EXISTS idx_votes_created ON votes(created_at);

-- Composite index for restaurant dishes by category
CREATE INDEX IF NOT EXISTS idx_dishes_restaurant_category ON dishes(restaurant_id, category);
