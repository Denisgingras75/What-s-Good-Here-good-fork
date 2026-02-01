-- =============================================
-- GAMIFICATION TEST SEED DATA
-- =============================================
-- Creates test scenarios for all 6 gamification features.
-- Run in Supabase SQL Editor.
--
-- BEFORE RUNNING: Replace YOUR_USER_ID below with your actual auth.users id.
-- Find it in Supabase → Authentication → Users → copy your user's UUID.
--
-- This script creates:
-- 1. Test users (friends) with profiles
-- 2. Restaurants and dishes
-- 3. Votes from you and test users (overlapping for taste compatibility)
-- 4. Follows (you follow them)
-- 5. Badges for test users (to test expert social proof)
-- 6. Your votes set up so you're close to earning badges (to test nudges)

-- =============================================
-- STEP 0: SET YOUR USER ID
-- =============================================
-- Replace this with your actual user ID from Supabase Auth
DO $$
DECLARE
  my_id UUID := '00000000-0000-0000-0000-000000000000'; -- ⚠️ REPLACE THIS

  -- Test user IDs (fixed UUIDs for consistency)
  sarah_id UUID := 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa';
  mike_id UUID := 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb';
  lisa_id UUID := 'cccccccc-3333-3333-3333-cccccccccccc';
  jake_id UUID := 'dddddddd-4444-4444-4444-dddddddddddd';
  emma_id UUID := 'eeeeeeee-5555-5555-5555-eeeeeeeeeeee';

  -- Restaurant IDs
  r_nancys UUID := '11111111-aaaa-aaaa-aaaa-111111111111';
  r_atria UUID := '22222222-bbbb-bbbb-bbbb-222222222222';
  r_offshore UUID := '33333333-cccc-cccc-cccc-333333333333';
  r_larsen UUID := '44444444-dddd-dddd-dddd-444444444444';

  -- Dish IDs (pizza)
  d_margherita UUID := 'dd000001-0000-0000-0000-000000000001';
  d_pepperoni UUID := 'dd000002-0000-0000-0000-000000000002';
  d_hawaiian UUID := 'dd000003-0000-0000-0000-000000000003';
  d_bbq_chicken UUID := 'dd000004-0000-0000-0000-000000000004';
  d_white_pizza UUID := 'dd000005-0000-0000-0000-000000000005';
  d_truffle UUID := 'dd000006-0000-0000-0000-000000000006';
  d_veggie UUID := 'dd000007-0000-0000-0000-000000000007';
  d_buffalo UUID := 'dd000008-0000-0000-0000-000000000008';
  d_meat_lovers UUID := 'dd000009-0000-0000-0000-000000000009';
  d_fig UUID := 'dd00000a-0000-0000-0000-000000000010';

  -- Dish IDs (seafood)
  d_lobster_roll UUID := 'dd000011-0000-0000-0000-000000000011';
  d_clam_chowder UUID := 'dd000012-0000-0000-0000-000000000012';
  d_fish_tacos UUID := 'dd000013-0000-0000-0000-000000000013';
  d_oysters UUID := 'dd000014-0000-0000-0000-000000000014';
  d_shrimp_scampi UUID := 'dd000015-0000-0000-0000-000000000015';

  -- Dish IDs (burger)
  d_classic_burger UUID := 'dd000021-0000-0000-0000-000000000021';
  d_bacon_burger UUID := 'dd000022-0000-0000-0000-000000000022';
  d_mushroom_burger UUID := 'dd000023-0000-0000-0000-000000000023';

BEGIN

-- =============================================
-- STEP 1: CREATE TEST USERS IN auth.users
-- =============================================
-- Note: We insert directly into auth.users for test data.
-- These won't have real auth credentials — they're display-only.

INSERT INTO auth.users (id, email, role, instance_id, aud, created_at, updated_at)
VALUES
  (sarah_id, 'sarah.test@wgh.local', 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated', NOW(), NOW()),
  (mike_id, 'mike.test@wgh.local', 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated', NOW(), NOW()),
  (lisa_id, 'lisa.test@wgh.local', 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated', NOW(), NOW()),
  (jake_id, 'jake.test@wgh.local', 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated', NOW(), NOW()),
  (emma_id, 'emma.test@wgh.local', 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STEP 2: CREATE PROFILES
-- =============================================
INSERT INTO profiles (id, display_name, created_at, has_onboarded, follower_count, following_count)
VALUES
  (sarah_id, 'Sarah M', NOW() - INTERVAL '3 months', true, 12, 5),
  (mike_id, 'Mike T', NOW() - INTERVAL '2 months', true, 8, 3),
  (lisa_id, 'Lisa K', NOW() - INTERVAL '4 months', true, 15, 7),
  (jake_id, 'Jake R', NOW() - INTERVAL '1 month', true, 3, 2),
  (emma_id, 'Emma W', NOW() - INTERVAL '5 months', true, 20, 10)
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  follower_count = EXCLUDED.follower_count,
  following_count = EXCLUDED.following_count;

-- =============================================
-- STEP 3: CREATE RESTAURANTS
-- =============================================
-- Martha's Vineyard locations
INSERT INTO restaurants (id, name, address, lat, lng)
VALUES
  (r_nancys, 'Nancy''s Restaurant', '29 Lake Ave, Oak Bluffs, MA', 41.4549, -70.5623),
  (r_atria, 'Atria', '137 Main St, Edgartown, MA', 41.3884, -70.5130),
  (r_offshore, 'Offshore Ale', '30 Kennebec Ave, Oak Bluffs, MA', 41.4553, -70.5589),
  (r_larsen, 'Larsen''s Fish Market', '56 Basin Rd, Chilmark, MA', 41.3456, -70.7234)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STEP 4: CREATE DISHES
-- =============================================

-- Pizza dishes (10 — you'll rate 8 of these to be close to Specialist at 10)
INSERT INTO dishes (id, restaurant_id, name, category, price)
VALUES
  (d_margherita, r_nancys, 'Margherita Pizza', 'pizza', 18.00),
  (d_pepperoni, r_nancys, 'Pepperoni Pizza', 'pizza', 19.00),
  (d_hawaiian, r_offshore, 'Hawaiian Pizza', 'pizza', 20.00),
  (d_bbq_chicken, r_offshore, 'BBQ Chicken Pizza', 'pizza', 21.00),
  (d_white_pizza, r_atria, 'White Truffle Pizza', 'pizza', 24.00),
  (d_truffle, r_atria, 'Black Truffle & Honey', 'pizza', 26.00),
  (d_veggie, r_nancys, 'Veggie Supreme', 'pizza', 19.00),
  (d_buffalo, r_offshore, 'Buffalo Chicken Pizza', 'pizza', 20.00),
  (d_meat_lovers, r_nancys, 'Meat Lovers Pizza', 'pizza', 22.00),
  (d_fig, r_atria, 'Fig & Prosciutto Pizza', 'pizza', 25.00)
ON CONFLICT (id) DO NOTHING;

-- Seafood dishes (5)
INSERT INTO dishes (id, restaurant_id, name, category, price)
VALUES
  (d_lobster_roll, r_larsen, 'Classic Lobster Roll', 'seafood', 32.00),
  (d_clam_chowder, r_larsen, 'New England Clam Chowder', 'seafood', 14.00),
  (d_fish_tacos, r_offshore, 'Fish Tacos', 'seafood', 18.00),
  (d_oysters, r_larsen, 'Raw Oysters (dozen)', 'seafood', 28.00),
  (d_shrimp_scampi, r_atria, 'Shrimp Scampi', 'seafood', 26.00)
ON CONFLICT (id) DO NOTHING;

-- Burger dishes (3)
INSERT INTO dishes (id, restaurant_id, name, category, price)
VALUES
  (d_classic_burger, r_offshore, 'Classic Burger', 'burger', 16.00),
  (d_bacon_burger, r_offshore, 'Bacon Smash Burger', 'burger', 18.00),
  (d_mushroom_burger, r_nancys, 'Mushroom Swiss Burger', 'burger', 17.00)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STEP 5: YOUR VOTES
-- =============================================
-- 8 pizza votes (2 away from Specialist threshold of 10)
-- This tests: near-badge nudge on Browse, progress nudge after voting

INSERT INTO votes (dish_id, user_id, would_order_again, rating_10, category_snapshot, created_at)
VALUES
  (d_margherita, my_id, true, 8.5, 'pizza', NOW() - INTERVAL '30 days'),
  (d_pepperoni, my_id, true, 7.0, 'pizza', NOW() - INTERVAL '28 days'),
  (d_hawaiian, my_id, false, 5.0, 'pizza', NOW() - INTERVAL '25 days'),
  (d_bbq_chicken, my_id, true, 8.0, 'pizza', NOW() - INTERVAL '22 days'),
  (d_white_pizza, my_id, true, 9.0, 'pizza', NOW() - INTERVAL '18 days'),
  (d_truffle, my_id, true, 9.5, 'pizza', NOW() - INTERVAL '15 days'),
  (d_veggie, my_id, true, 7.5, 'pizza', NOW() - INTERVAL '10 days'),
  (d_buffalo, my_id, true, 8.0, 'pizza', NOW() - INTERVAL '5 days'),
  -- 3 seafood votes (overlaps with friends for taste compatibility)
  (d_lobster_roll, my_id, true, 9.0, 'seafood', NOW() - INTERVAL '20 days'),
  (d_clam_chowder, my_id, true, 8.0, 'seafood', NOW() - INTERVAL '17 days'),
  (d_fish_tacos, my_id, true, 7.5, 'seafood', NOW() - INTERVAL '12 days'),
  -- 2 burger votes
  (d_classic_burger, my_id, true, 7.0, 'burger', NOW() - INTERVAL '8 days'),
  (d_bacon_burger, my_id, true, 8.5, 'burger', NOW() - INTERVAL '3 days')
ON CONFLICT (dish_id, user_id) DO NOTHING;

-- =============================================
-- STEP 6: TEST USERS' VOTES
-- =============================================

-- SARAH: Heavy pizza voter, rates similarly to you (taste match ~85%)
INSERT INTO votes (dish_id, user_id, would_order_again, rating_10, category_snapshot, created_at)
VALUES
  (d_margherita, sarah_id, true, 8.0, 'pizza', NOW() - INTERVAL '29 days'),
  (d_pepperoni, sarah_id, true, 7.5, 'pizza', NOW() - INTERVAL '27 days'),
  (d_hawaiian, sarah_id, false, 4.5, 'pizza', NOW() - INTERVAL '24 days'),
  (d_bbq_chicken, sarah_id, true, 8.5, 'pizza', NOW() - INTERVAL '21 days'),
  (d_white_pizza, sarah_id, true, 9.0, 'pizza', NOW() - INTERVAL '17 days'),
  (d_truffle, sarah_id, true, 9.0, 'pizza', NOW() - INTERVAL '14 days'),
  (d_veggie, sarah_id, true, 7.0, 'pizza', NOW() - INTERVAL '11 days'),
  (d_buffalo, sarah_id, true, 7.5, 'pizza', NOW() - INTERVAL '7 days'),
  (d_meat_lovers, sarah_id, true, 8.0, 'pizza', NOW() - INTERVAL '4 days'),
  (d_fig, sarah_id, true, 8.5, 'pizza', NOW() - INTERVAL '2 days'),
  -- Seafood overlap with you
  (d_lobster_roll, sarah_id, true, 9.5, 'seafood', NOW() - INTERVAL '19 days'),
  (d_clam_chowder, sarah_id, true, 8.5, 'seafood', NOW() - INTERVAL '16 days'),
  (d_fish_tacos, sarah_id, true, 7.0, 'seafood', NOW() - INTERVAL '11 days')
ON CONFLICT (dish_id, user_id) DO NOTHING;

-- MIKE: Seafood specialist, some pizza overlap, rates differently (taste match ~60%)
INSERT INTO votes (dish_id, user_id, would_order_again, rating_10, category_snapshot, created_at)
VALUES
  (d_margherita, mike_id, true, 6.0, 'pizza', NOW() - INTERVAL '28 days'),
  (d_pepperoni, mike_id, false, 5.0, 'pizza', NOW() - INTERVAL '26 days'),
  (d_bbq_chicken, mike_id, true, 6.5, 'pizza', NOW() - INTERVAL '20 days'),
  (d_lobster_roll, mike_id, true, 9.5, 'seafood', NOW() - INTERVAL '25 days'),
  (d_clam_chowder, mike_id, true, 9.0, 'seafood', NOW() - INTERVAL '23 days'),
  (d_fish_tacos, mike_id, true, 8.5, 'seafood', NOW() - INTERVAL '20 days'),
  (d_oysters, mike_id, true, 9.0, 'seafood', NOW() - INTERVAL '18 days'),
  (d_shrimp_scampi, mike_id, true, 8.5, 'seafood', NOW() - INTERVAL '15 days'),
  (d_classic_burger, mike_id, true, 7.0, 'burger', NOW() - INTERVAL '10 days'),
  (d_bacon_burger, mike_id, true, 8.0, 'burger', NOW() - INTERVAL '6 days')
ON CONFLICT (dish_id, user_id) DO NOTHING;

-- LISA: Pizza authority, lots of votes, very aligned with consensus
INSERT INTO votes (dish_id, user_id, would_order_again, rating_10, category_snapshot, created_at)
VALUES
  (d_margherita, lisa_id, true, 8.0, 'pizza', NOW() - INTERVAL '90 days'),
  (d_pepperoni, lisa_id, true, 7.0, 'pizza', NOW() - INTERVAL '85 days'),
  (d_hawaiian, lisa_id, false, 5.0, 'pizza', NOW() - INTERVAL '80 days'),
  (d_bbq_chicken, lisa_id, true, 8.0, 'pizza', NOW() - INTERVAL '75 days'),
  (d_white_pizza, lisa_id, true, 9.0, 'pizza', NOW() - INTERVAL '70 days'),
  (d_truffle, lisa_id, true, 9.5, 'pizza', NOW() - INTERVAL '65 days'),
  (d_veggie, lisa_id, true, 7.5, 'pizza', NOW() - INTERVAL '60 days'),
  (d_buffalo, lisa_id, true, 8.0, 'pizza', NOW() - INTERVAL '55 days'),
  (d_meat_lovers, lisa_id, true, 8.0, 'pizza', NOW() - INTERVAL '50 days'),
  (d_fig, lisa_id, true, 9.0, 'pizza', NOW() - INTERVAL '45 days'),
  -- Seafood overlap
  (d_lobster_roll, lisa_id, true, 9.0, 'seafood', NOW() - INTERVAL '40 days'),
  (d_clam_chowder, lisa_id, true, 7.5, 'seafood', NOW() - INTERVAL '35 days')
ON CONFLICT (dish_id, user_id) DO NOTHING;

-- JAKE: New user, few votes, overlaps with you on burgers
INSERT INTO votes (dish_id, user_id, would_order_again, rating_10, category_snapshot, created_at)
VALUES
  (d_classic_burger, jake_id, true, 7.5, 'burger', NOW() - INTERVAL '10 days'),
  (d_bacon_burger, jake_id, true, 9.0, 'burger', NOW() - INTERVAL '7 days'),
  (d_mushroom_burger, jake_id, true, 8.0, 'burger', NOW() - INTERVAL '4 days'),
  (d_margherita, jake_id, true, 8.0, 'pizza', NOW() - INTERVAL '3 days')
ON CONFLICT (dish_id, user_id) DO NOTHING;

-- EMMA: Doesn't follow you (for Similar Taste discovery)
-- Rates very similarly to you but isn't followed
INSERT INTO votes (dish_id, user_id, would_order_again, rating_10, category_snapshot, created_at)
VALUES
  (d_margherita, emma_id, true, 8.5, 'pizza', NOW() - INTERVAL '60 days'),
  (d_pepperoni, emma_id, true, 7.0, 'pizza', NOW() - INTERVAL '55 days'),
  (d_hawaiian, emma_id, false, 5.5, 'pizza', NOW() - INTERVAL '50 days'),
  (d_bbq_chicken, emma_id, true, 8.0, 'pizza', NOW() - INTERVAL '45 days'),
  (d_white_pizza, emma_id, true, 9.0, 'pizza', NOW() - INTERVAL '40 days'),
  (d_lobster_roll, emma_id, true, 9.0, 'seafood', NOW() - INTERVAL '35 days'),
  (d_clam_chowder, emma_id, true, 8.0, 'seafood', NOW() - INTERVAL '30 days'),
  (d_fish_tacos, emma_id, true, 7.0, 'seafood', NOW() - INTERVAL '25 days'),
  (d_classic_burger, emma_id, true, 7.5, 'burger', NOW() - INTERVAL '20 days'),
  (d_bacon_burger, emma_id, true, 8.5, 'burger', NOW() - INTERVAL '15 days')
ON CONFLICT (dish_id, user_id) DO NOTHING;

-- =============================================
-- STEP 7: FOLLOWS (you follow Sarah, Mike, Lisa, Jake — NOT Emma)
-- =============================================
INSERT INTO follows (follower_id, followed_id)
VALUES
  (my_id, sarah_id),
  (my_id, mike_id),
  (my_id, lisa_id),
  (my_id, jake_id),
  -- Sarah and Mike follow you back
  (sarah_id, my_id),
  (mike_id, my_id)
ON CONFLICT (follower_id, followed_id) DO NOTHING;

-- =============================================
-- STEP 8: BADGES FOR TEST USERS
-- =============================================
-- Sarah: Pizza Specialist (she has 10 consensus pizza votes)
-- Lisa: Pizza Authority (she has 10 consensus pizza votes + long history)
-- Mike: Seafood Specialist (he has 5 consensus seafood votes)

INSERT INTO user_badges (user_id, badge_key, unlocked_at)
VALUES
  (sarah_id, 'specialist_pizza', NOW() - INTERVAL '7 days'),
  (lisa_id, 'specialist_pizza', NOW() - INTERVAL '45 days'),
  (lisa_id, 'authority_pizza', NOW() - INTERVAL '10 days'),
  (mike_id, 'specialist_seafood', NOW() - INTERVAL '14 days'),
  -- Emma gets influence badge (for variety)
  (emma_id, 'taste_maker', NOW() - INTERVAL '20 days')
ON CONFLICT (user_id, badge_key) DO NOTHING;

-- =============================================
-- STEP 9: UPDATE DISH STATS
-- =============================================
-- Set consensus_ready and vote counts so dishes show as ranked

UPDATE dishes SET
  consensus_ready = true,
  consensus_votes = sub.cnt,
  consensus_rating = sub.avg_r
FROM (
  SELECT dish_id, COUNT(*) as cnt, ROUND(AVG(rating_10), 1) as avg_r
  FROM votes
  GROUP BY dish_id
) sub
WHERE dishes.id = sub.dish_id;

-- =============================================
-- DONE! Here's what you can test:
-- =============================================
--
-- FEATURE 1: Progress nudge after voting
-- → Go to Browse → Pizza → vote on Meat Lovers or Fig pizza
-- → After voting, toast should show "🍕 9/10 toward Pizza Specialist"
--
-- FEATURE 2: Badge unlock celebration
-- → Vote on your 10th pizza (you have 8, need 2 more)
-- → On the 10th, you should see the Specialist unlock overlay
-- → (Note: also needs consensus-rated votes + low bias — may need to adjust)
--
-- FEATURE 3: Near-badge nudge on Browse
-- → Go to Browse → select Pizza category
-- → Should see banner: "You're 2 ratings away from Pizza Specialist"
--
-- FEATURE 4: Expert social proof on restaurant pages
-- → Go to Nancy's or Atria restaurant page
-- → Pizza dishes should show "✨ Rated by 1 Authority + 1 Specialist" (Lisa + Sarah)
-- → Larsen's seafood dishes should show "✨ Expert-rated" (Mike)
--
-- FEATURE 5: Similar taste discovery
-- → Go to your Profile page
-- → Should see "Similar Taste" section with Emma (~90% match)
-- → Emma is NOT followed, so she appears as a discovery suggestion
--
-- FEATURE 6: Friends' badge context on Dish page
-- → Open Margherita Pizza dish page
-- → Friends section should show:
--   Sarah 🔵 Pizza Specialist — 👍 Would order again — 8.0/10
--   Lisa 🟣 Pizza Authority — 👍 Would order again — 8.0/10
--   Mike (no badge) — 👍 Would order again — 6.0/10

END $$;
