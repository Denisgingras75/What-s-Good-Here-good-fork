-- ============================================================
-- Killer Lists Depth Seeder
-- ============================================================
-- Seeds 6 key categories with enough AI votes (10 per dish)
-- to make Top 10 lists rank-ready for MV launch.
--
-- Categories: Lobster Rolls, Chowder & Clams, Pizza,
--             Burgers, Breakfast, Ice Cream
--
-- Cost: $0 (pure DB inserts, no external API calls)
-- Target: ~999 new votes across ~103 MV dishes
--
-- Safe to re-run: skips dishes that already have 10+ AI votes.
-- ============================================================

DO $$
DECLARE
  v_dish RECORD;
  v_existing_count INT;
  v_votes_needed INT;
  v_base_rating DECIMAL;
  v_rating DECIMAL;
  v_i INT;
  v_total_inserted INT := 0;
  v_total_dishes INT := 0;
  v_category_hint TEXT;
  v_mv_towns TEXT[] := ARRAY[
    'Oak Bluffs', 'Edgartown', 'West Tisbury',
    'Vineyard Haven', 'Chilmark', 'Aquinnah', 'Tisbury'
  ];
BEGIN
  RAISE NOTICE '=== Killer Lists Depth Seeder ===';
  RAISE NOTICE 'Starting at %', NOW();

  FOR v_dish IN
    SELECT d.id AS dish_id, d.name AS dish_name,
           r.name AS restaurant_name, r.town
    FROM dishes d
    JOIN restaurants r ON d.restaurant_id = r.id
    WHERE d.parent_dish_id IS NULL
      AND r.town = ANY(v_mv_towns)
      AND (
        -- Lobster
        LOWER(d.name) LIKE '%lobster%'
        -- Chowder & Clams
        OR LOWER(d.name) LIKE '%chowder%'
        OR LOWER(d.name) LIKE '%clam%'
        OR LOWER(d.name) LIKE '%steamers%'
        OR LOWER(d.name) LIKE '%littleneck%'
        OR LOWER(d.name) LIKE '%quahog%'
        -- Pizza
        OR LOWER(d.name) LIKE '%pizza%'
        -- Burgers
        OR LOWER(d.name) LIKE '%burger%'
        -- Breakfast
        OR LOWER(d.name) LIKE '%pancake%'
        OR LOWER(d.name) LIKE '%waffle%'
        OR LOWER(d.name) LIKE '%eggs benedict%'
        OR LOWER(d.name) LIKE '%omelet%'
        OR LOWER(d.name) LIKE '%omelette%'
        OR LOWER(d.name) LIKE '%french toast%'
        OR LOWER(d.name) LIKE '%breakfast%'
        -- Ice Cream
        OR LOWER(d.name) LIKE '%ice cream%'
        OR LOWER(d.name) LIKE '%gelato%'
        OR LOWER(d.name) LIKE '%sundae%'
        OR LOWER(d.name) LIKE '%milkshake%'
        OR LOWER(d.name) LIKE '%frappe%'
        OR LOWER(d.name) LIKE '%soft serve%'
      )
    ORDER BY r.town, d.name
  LOOP
    -- Count existing AI votes
    SELECT COUNT(*) INTO v_existing_count
    FROM votes
    WHERE dish_id = v_dish.dish_id
      AND source = 'ai_estimated';

    v_votes_needed := 10 - v_existing_count;
    IF v_votes_needed <= 0 THEN CONTINUE; END IF;

    v_total_dishes := v_total_dishes + 1;

    -- Determine category hint and base rating range
    -- Each category gets a realistic MV-appropriate rating distribution
    IF LOWER(v_dish.dish_name) LIKE '%lobster%' THEN
      v_category_hint := 'lobster';
      v_base_rating := 7.5 + random() * 1.5;      -- 7.5-9.0
    ELSIF LOWER(v_dish.dish_name) LIKE '%chowder%'
       OR LOWER(v_dish.dish_name) LIKE '%clam%'
       OR LOWER(v_dish.dish_name) LIKE '%quahog%'
       OR LOWER(v_dish.dish_name) LIKE '%littleneck%'
       OR LOWER(v_dish.dish_name) LIKE '%steamers%' THEN
      v_category_hint := 'chowder_clams';
      v_base_rating := 7.0 + random() * 1.5;      -- 7.0-8.5
    ELSIF LOWER(v_dish.dish_name) LIKE '%pizza%' THEN
      v_category_hint := 'pizza';
      v_base_rating := 6.5 + random() * 1.5;      -- 6.5-8.0
    ELSIF LOWER(v_dish.dish_name) LIKE '%burger%' THEN
      v_category_hint := 'burgers';
      v_base_rating := 6.5 + random() * 1.5;      -- 6.5-8.0
    ELSIF LOWER(v_dish.dish_name) LIKE '%ice cream%'
       OR LOWER(v_dish.dish_name) LIKE '%gelato%'
       OR LOWER(v_dish.dish_name) LIKE '%sundae%'
       OR LOWER(v_dish.dish_name) LIKE '%milkshake%'
       OR LOWER(v_dish.dish_name) LIKE '%frappe%'
       OR LOWER(v_dish.dish_name) LIKE '%soft serve%' THEN
      v_category_hint := 'ice_cream';
      v_base_rating := 7.0 + random() * 2.0;      -- 7.0-9.0
    ELSE
      -- Breakfast (remaining matches)
      v_category_hint := 'breakfast';
      v_base_rating := 6.5 + random() * 2.0;      -- 6.5-8.5
    END IF;

    -- If dish has existing AI votes, anchor to their average
    IF v_existing_count > 0 THEN
      SELECT AVG(rating_10) INTO v_base_rating
      FROM votes
      WHERE dish_id = v_dish.dish_id
        AND source = 'ai_estimated'
        AND rating_10 IS NOT NULL;
    END IF;

    -- Insert votes with realistic variance around base
    FOR v_i IN 1..v_votes_needed LOOP
      -- Each vote varies ±1.0 from base, clamped to [1.0, 10.0]
      v_rating := ROUND(
        GREATEST(1.0, LEAST(10.0,
          v_base_rating + (random() - 0.5) * 2.0
        ))::NUMERIC, 1
      );

      INSERT INTO votes (
        dish_id, user_id, would_order_again,
        rating_10, source, source_metadata
      ) VALUES (
        v_dish.dish_id,
        '00000000-0000-0000-0000-000000000000',
        v_rating >= 5.0,
        v_rating,
        'ai_estimated',
        jsonb_build_object(
          'method', 'category_depth_seeder',
          'generated_at', NOW()::TEXT,
          'base_rating', ROUND(v_base_rating::NUMERIC, 1),
          'category_hint', v_category_hint
        )
      );

      v_total_inserted := v_total_inserted + 1;
    END LOOP;

    RAISE NOTICE '  [%] % +% votes @ % (%)',
      v_category_hint, v_dish.dish_name, v_votes_needed,
      v_dish.restaurant_name, v_dish.town;
  END LOOP;

  RAISE NOTICE '================================';
  RAISE NOTICE 'Dishes seeded: %', v_total_dishes;
  RAISE NOTICE 'Votes inserted: %', v_total_inserted;
  RAISE NOTICE 'Completed at %', NOW();
END $$;
