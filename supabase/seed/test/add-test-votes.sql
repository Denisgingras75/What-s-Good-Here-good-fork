-- Add 5 test votes to Pickles from Mo's Lunch to see the rating display
DO $$
DECLARE
  test_dish_id UUID;
  test_user_id UUID;
BEGIN
  -- Get the Pickles dish (or first dish if not found)
  SELECT id INTO test_dish_id FROM dishes WHERE name ILIKE '%pickles%' LIMIT 1;

  IF test_dish_id IS NULL THEN
    SELECT id INTO test_dish_id FROM dishes LIMIT 1;
  END IF;

  -- Get an existing user from public.users
  SELECT id INTO test_user_id FROM users LIMIT 1;

  -- Insert 5 test votes with varied ratings (all from same user for simplicity)
  INSERT INTO votes (dish_id, user_id, rating_10, would_order_again)
  VALUES
    (test_dish_id, test_user_id, 8, true),
    (test_dish_id, test_user_id, 7, true),
    (test_dish_id, test_user_id, 9, true),
    (test_dish_id, test_user_id, 6, false),
    (test_dish_id, test_user_id, 8, true);
END $$;
