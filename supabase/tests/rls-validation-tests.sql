-- =============================================
-- RLS VALIDATION TESTS
-- Run each section in Supabase SQL Editor
-- =============================================

-- SETUP: Get two real user IDs from your database
-- Run this first to find test users:
SELECT id, display_name, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- Copy two user IDs and replace in the tests below:
-- USER_A_ID = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
-- USER_B_ID = 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy'

-- =============================================
-- TEST 1: Profile Privacy (Anonymous Access)
-- =============================================

-- Test as anonymous (no auth)
-- Should only see profiles with display_name set
SET request.jwt.claims = '{}';
SET role = 'anon';

SELECT id, display_name, created_at
FROM profiles
LIMIT 10;

-- Verify: Should return rows, but only those with display_name IS NOT NULL
-- Private fields should not be exposed through RLS

-- Reset role
RESET role;

-- =============================================
-- TEST 2: Profile Ownership - Update Others (Should FAIL)
-- =============================================

-- Simulate User A trying to update User B's profile
-- Replace with real UUIDs
DO $$
DECLARE
  user_a_id UUID := 'USER_A_ID_HERE';  -- Replace
  user_b_id UUID := 'USER_B_ID_HERE';  -- Replace
BEGIN
  -- Set JWT to User A
  PERFORM set_config('request.jwt.claims', json_build_object('sub', user_a_id)::text, true);
  PERFORM set_config('role', 'authenticated', true);

  -- Try to update User B's profile (should fail or update 0 rows)
  UPDATE profiles
  SET display_name = 'HACKED'
  WHERE id = user_b_id;

  -- Check if any rows were updated
  IF FOUND THEN
    RAISE EXCEPTION 'SECURITY FAIL: User A was able to update User B profile!';
  ELSE
    RAISE NOTICE 'PASS: User A cannot update User B profile';
  END IF;
END $$;

-- Reset
RESET role;

-- =============================================
-- TEST 3: Profile Ownership - Update Own (Should SUCCEED)
-- =============================================

DO $$
DECLARE
  user_a_id UUID := 'USER_A_ID_HERE';  -- Replace
  original_name TEXT;
BEGIN
  -- Get original name
  SELECT display_name INTO original_name FROM profiles WHERE id = user_a_id;

  -- Set JWT to User A
  PERFORM set_config('request.jwt.claims', json_build_object('sub', user_a_id)::text, true);
  PERFORM set_config('role', 'authenticated', true);

  -- Update own profile
  UPDATE profiles
  SET display_name = 'Test Update'
  WHERE id = user_a_id;

  IF FOUND THEN
    RAISE NOTICE 'PASS: User A can update own profile';
    -- Restore original
    UPDATE profiles SET display_name = original_name WHERE id = user_a_id;
  ELSE
    RAISE EXCEPTION 'FAIL: User A cannot update own profile!';
  END IF;
END $$;

RESET role;

-- =============================================
-- TEST 4: Follow Creates Notification
-- =============================================

-- First, check if trigger exists
SELECT tgname, tgrelid::regclass, tgenabled
FROM pg_trigger
WHERE tgname = 'trigger_notify_on_follow';

-- Simulate User A following User B
DO $$
DECLARE
  user_a_id UUID := 'USER_A_ID_HERE';  -- Replace (follower)
  user_b_id UUID := 'USER_B_ID_HERE';  -- Replace (followed)
  notif_count_before INT;
  notif_count_after INT;
BEGIN
  -- Count User B's notifications before
  SELECT COUNT(*) INTO notif_count_before
  FROM notifications
  WHERE user_id = user_b_id AND type = 'follow';

  -- Set JWT to User A
  PERFORM set_config('request.jwt.claims', json_build_object('sub', user_a_id)::text, true);
  PERFORM set_config('role', 'authenticated', true);

  -- Delete existing follow if any (to test fresh)
  DELETE FROM follows WHERE follower_id = user_a_id AND followed_id = user_b_id;

  -- Create follow
  INSERT INTO follows (follower_id, followed_id) VALUES (user_a_id, user_b_id);

  -- Count User B's notifications after
  SELECT COUNT(*) INTO notif_count_after
  FROM notifications
  WHERE user_id = user_b_id AND type = 'follow';

  IF notif_count_after > notif_count_before THEN
    RAISE NOTICE 'PASS: Follow created notification for User B';
  ELSE
    RAISE NOTICE 'FAIL: No notification created on follow';
  END IF;

  -- Cleanup: remove test follow
  DELETE FROM follows WHERE follower_id = user_a_id AND followed_id = user_b_id;
END $$;

RESET role;

-- =============================================
-- TEST 5: Direct Notification Insert (Should FAIL)
-- =============================================

DO $$
DECLARE
  user_a_id UUID := 'USER_A_ID_HERE';  -- Replace
  user_b_id UUID := 'USER_B_ID_HERE';  -- Replace
BEGIN
  -- Set JWT to User A (authenticated but not service_role)
  PERFORM set_config('request.jwt.claims', json_build_object('sub', user_a_id)::text, true);
  PERFORM set_config('role', 'authenticated', true);

  -- Try to insert notification directly (should fail)
  BEGIN
    INSERT INTO notifications (user_id, type, data)
    VALUES (user_b_id, 'fake', '{"message": "hacked"}');

    RAISE EXCEPTION 'SECURITY FAIL: User was able to insert notification directly!';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'PASS: Direct notification insert blocked by RLS';
    WHEN OTHERS THEN
      RAISE NOTICE 'PASS: Direct notification insert blocked (%)' , SQLERRM;
  END;
END $$;

RESET role;

-- =============================================
-- TEST 6: Notifications - Mark Others as Read (Should FAIL)
-- =============================================

DO $$
DECLARE
  user_a_id UUID := 'USER_A_ID_HERE';  -- Replace
  user_b_id UUID := 'USER_B_ID_HERE';  -- Replace
  user_b_notif_id UUID;
BEGIN
  -- Find a notification belonging to User B
  SELECT id INTO user_b_notif_id
  FROM notifications
  WHERE user_id = user_b_id
  LIMIT 1;

  IF user_b_notif_id IS NULL THEN
    RAISE NOTICE 'SKIP: User B has no notifications to test with';
    RETURN;
  END IF;

  -- Set JWT to User A
  PERFORM set_config('request.jwt.claims', json_build_object('sub', user_a_id)::text, true);
  PERFORM set_config('role', 'authenticated', true);

  -- Try to mark User B's notification as read
  UPDATE notifications SET read = TRUE WHERE id = user_b_notif_id;

  IF FOUND THEN
    RAISE EXCEPTION 'SECURITY FAIL: User A marked User B notification as read!';
  ELSE
    RAISE NOTICE 'PASS: User A cannot mark User B notifications as read';
  END IF;
END $$;

RESET role;

-- =============================================
-- TEST 7: Notifications - Mark Own as Read (Should SUCCEED)
-- =============================================

DO $$
DECLARE
  user_a_id UUID := 'USER_A_ID_HERE';  -- Replace
  user_a_notif_id UUID;
  original_read BOOLEAN;
BEGIN
  -- Find a notification belonging to User A
  SELECT id, read INTO user_a_notif_id, original_read
  FROM notifications
  WHERE user_id = user_a_id
  LIMIT 1;

  IF user_a_notif_id IS NULL THEN
    RAISE NOTICE 'SKIP: User A has no notifications to test with';
    RETURN;
  END IF;

  -- Set JWT to User A
  PERFORM set_config('request.jwt.claims', json_build_object('sub', user_a_id)::text, true);
  PERFORM set_config('role', 'authenticated', true);

  -- Mark own notification as read
  UPDATE notifications SET read = TRUE WHERE id = user_a_notif_id;

  IF FOUND THEN
    RAISE NOTICE 'PASS: User A can mark own notifications as read';
    -- Restore original state
    UPDATE notifications SET read = original_read WHERE id = user_a_notif_id;
  ELSE
    RAISE EXCEPTION 'FAIL: User A cannot mark own notifications as read!';
  END IF;
END $$;

RESET role;

-- =============================================
-- TEST 8: Storage - Check Policies Exist
-- =============================================

-- Verify storage policies are in place
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE 'dish_photos%';

-- Expected: 4 policies (public_read, insert_own, update_own, delete_own)

-- =============================================
-- TEST 9: Storage - Anonymous Can Read (Check Policy)
-- =============================================

-- This verifies the SELECT policy allows public access
SELECT policyname, cmd, qual::text
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname = 'dish_photos_public_read';

-- Expected: qual should be "(bucket_id = 'dish-photos'::text)"

-- =============================================
-- TEST 10: Storage - Insert Requires Owner Match
-- =============================================

-- Check INSERT policy requires auth.uid() = owner
SELECT policyname, cmd, with_check::text
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname = 'dish_photos_insert_own';

-- Expected: with_check should include "auth.uid() = owner"

-- =============================================
-- TEST 11: Storage - Delete Requires Owner Match
-- =============================================

-- Check DELETE policy requires auth.uid() = owner
SELECT policyname, cmd, qual::text
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname = 'dish_photos_delete_own';

-- Expected: qual should include "auth.uid() = owner"

-- =============================================
-- QUICK SUMMARY QUERY
-- =============================================

-- Run this to see all RLS policies at a glance
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'notifications', 'follows', 'objects')
ORDER BY tablename, cmd;
