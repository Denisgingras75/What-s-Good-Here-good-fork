-- T01 + T02 + T10: Drop profiles DELETE policy and clean up duplicate RLS policies
-- Run this in Supabase SQL Editor before launch
--
-- Uses DROP POLICY IF EXISTS so it's safe to run multiple times.
-- After running, verify with:
--   SELECT tablename, policyname, cmd FROM pg_policies ORDER BY tablename, policyname;

-- ============================================
-- T01: Remove profiles DELETE policy
-- Users must not delete their own profile row (orphans votes, follows, badges)
-- ============================================
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;

-- ============================================
-- T02: Drop duplicate production-only policies
-- These are old dashboard-created policies that duplicate the SQL-defined ones.
-- ============================================

-- profiles (4 duplicates of profiles_select_public_or_own, profiles_insert_own, profiles_update_own)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- follows (3 duplicates of follows_select_public, follows_insert_own, follows_delete_own)
DROP POLICY IF EXISTS "Users can view follows" ON follows;
DROP POLICY IF EXISTS "Users can insert own follows" ON follows;
DROP POLICY IF EXISTS "Users can delete own follows" ON follows;

-- dishes (2 duplicates of "Admin or manager insert/update dishes")
DROP POLICY IF EXISTS "Admins can insert dishes" ON dishes;
DROP POLICY IF EXISTS "Admins can update dishes" ON dishes;

-- specials (3 duplicates of "Read specials", "Admin or manager update/delete specials")
DROP POLICY IF EXISTS "Anyone can view active specials" ON specials;
DROP POLICY IF EXISTS "Creator can update own specials" ON specials;
DROP POLICY IF EXISTS "Creator can delete own specials" ON specials;

-- storage.objects (4 duplicates of dish_photos_* policies)
DROP POLICY IF EXISTS "Public read access for photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
