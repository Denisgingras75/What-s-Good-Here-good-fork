-- Profiles RLS Policies
-- Run in Supabase SQL Editor

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile; public can read profiles with display_name set
DROP POLICY IF EXISTS "profiles_select_public_or_own" ON profiles;
CREATE POLICY "profiles_select_public_or_own" ON profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR display_name IS NOT NULL
  );

-- Users can insert their own profile row
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile row
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile row (optional)
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE
  USING (auth.uid() = id);
