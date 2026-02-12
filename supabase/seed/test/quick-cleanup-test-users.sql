-- Quick cleanup: Remove any test users from previous attempts

-- Delete votes from test users
DELETE FROM votes WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE 'testuser%@ratingtest.local'
);

-- Delete bias events
DELETE FROM bias_events WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE 'testuser%@ratingtest.local'
);

-- Delete user rating stats
DELETE FROM user_rating_stats WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE 'testuser%@ratingtest.local'
);

-- Delete profiles
DELETE FROM profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email LIKE 'testuser%@ratingtest.local'
);

-- Delete test users
DELETE FROM auth.users WHERE email LIKE 'testuser%@ratingtest.local';

-- Also cleanup any with the old pattern
DELETE FROM votes WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE 'testuser%@test.local'
);
DELETE FROM bias_events WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE 'testuser%@test.local'
);
DELETE FROM user_rating_stats WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE 'testuser%@test.local'
);
DELETE FROM profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email LIKE 'testuser%@test.local'
);
DELETE FROM auth.users WHERE email LIKE 'testuser%@test.local';

SELECT 'Cleanup done' as status;
