-- ============================================================
-- Broader MV Restaurant Seeder
-- ============================================================
-- Seeds top dishes at EVERY MV restaurant that has dishes but
-- fewer than 10 AI votes on any dish. Ensures no restaurant
-- page shows all "Early" dishes to tourists.
--
-- Strategy:
--   1. For each MV restaurant, pick up to 5 "signature" dishes
--      (prioritizes category keywords, falls back to first dishes)
--   2. Seed each with 10 AI votes using moderate rating range
--   3. Skips dishes that already have 10+ AI votes
--
-- Cost: $0 (pure DB inserts, no external API calls)
-- Safe to re-run: idempotent (skips already-seeded dishes)
-- ============================================================

DO $$
DECLARE
  v_restaurant RECORD;
  v_dish RECORD;
  v_existing_count INT;
  v_votes_needed INT;
  v_base_rating DECIMAL;
  v_rating DECIMAL;
  v_i INT;
  v_dish_count INT;
  v_total_inserted INT := 0;
  v_total_dishes INT := 0;
  v_total_restaurants INT := 0;
  v_mv_towns TEXT[] := ARRAY[
    'Oak Bluffs', 'Edgartown', 'West Tisbury',
    'Vineyard Haven', 'Chilmark', 'Aquinnah', 'Tisbury'
  ];
BEGIN
  RAISE NOTICE '=== Broader MV Restaurant Seeder ===';
  RAISE NOTICE 'Starting at %', NOW();

  -- Loop through every open MV restaurant that has dishes
  FOR v_restaurant IN
    SELECT r.id AS restaurant_id, r.name AS restaurant_name, r.town,
           COUNT(d.id) AS dish_count
    FROM restaurants r
    JOIN dishes d ON d.restaurant_id = r.id AND d.parent_dish_id IS NULL
    WHERE r.town = ANY(v_mv_towns)
      AND r.is_open = true
    GROUP BY r.id, r.name, r.town
    ORDER BY r.name
  LOOP
    v_dish_count := 0;

    -- Pick up to 5 dishes per restaurant, prioritizing "signature" items
    -- Priority: seafood/mains first, then by name
    FOR v_dish IN
      SELECT d.id AS dish_id, d.name AS dish_name, d.category, d.price
      FROM dishes d
      WHERE d.restaurant_id = v_restaurant.restaurant_id
        AND d.parent_dish_id IS NULL
      ORDER BY
        -- Prioritize signature dish categories
        CASE
          WHEN LOWER(d.category) IN ('seafood', 'entrees', 'mains', 'specialties', 'signatures') THEN 1
          WHEN LOWER(d.category) IN ('sandwiches', 'burgers', 'pizza', 'pasta') THEN 2
          WHEN LOWER(d.category) IN ('breakfast', 'brunch', 'soups', 'salads') THEN 3
          WHEN LOWER(d.category) IN ('appetizers', 'starters', 'small plates') THEN 4
          WHEN LOWER(d.category) IN ('desserts', 'ice cream', 'sweets') THEN 5
          ELSE 6
        END,
        -- Within category priority, prefer items with prices (menu staples)
        CASE WHEN d.price IS NOT NULL THEN 0 ELSE 1 END,
        d.name
      LIMIT 5
    LOOP
      -- Count existing AI votes for this dish
      SELECT COUNT(*) INTO v_existing_count
      FROM votes
      WHERE dish_id = v_dish.dish_id
        AND source = 'ai_estimated';

      v_votes_needed := 10 - v_existing_count;
      IF v_votes_needed <= 0 THEN CONTINUE; END IF;

      v_total_dishes := v_total_dishes + 1;
      v_dish_count := v_dish_count + 1;

      -- Base rating: moderate range (6.0-8.5) with category-aware adjustment
      -- Seafood gets a slight MV premium, desserts trend positive
      IF LOWER(v_dish.category) IN ('seafood', 'specialties', 'signatures') THEN
        v_base_rating := 7.0 + random() * 1.5;      -- 7.0-8.5
      ELSIF LOWER(v_dish.category) IN ('desserts', 'ice cream', 'sweets') THEN
        v_base_rating := 7.0 + random() * 1.5;      -- 7.0-8.5
      ELSIF LOWER(v_dish.category) IN ('entrees', 'mains', 'sandwiches', 'burgers', 'pizza') THEN
        v_base_rating := 6.5 + random() * 1.5;      -- 6.5-8.0
      ELSIF LOWER(v_dish.category) IN ('breakfast', 'brunch') THEN
        v_base_rating := 6.5 + random() * 2.0;      -- 6.5-8.5
      ELSE
        v_base_rating := 6.0 + random() * 2.0;      -- 6.0-8.0
      END IF;

      -- If dish has existing AI votes, anchor to their average
      IF v_existing_count > 0 THEN
        SELECT AVG(rating_10) INTO v_base_rating
        FROM votes
        WHERE dish_id = v_dish.dish_id
          AND source = 'ai_estimated'
          AND rating_10 IS NOT NULL;
      END IF;

      -- Insert votes with realistic variance
      FOR v_i IN 1..v_votes_needed LOOP
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
            'method', 'broader_mv_seeder',
            'generated_at', NOW()::TEXT,
            'base_rating', ROUND(v_base_rating::NUMERIC, 1),
            'category', v_dish.category
          )
        );

        v_total_inserted := v_total_inserted + 1;
      END LOOP;

      RAISE NOTICE '  [%] % @ % (%): +% votes',
        v_dish.category, v_dish.dish_name,
        v_restaurant.restaurant_name, v_restaurant.town,
        v_votes_needed;
    END LOOP;

    IF v_dish_count > 0 THEN
      v_total_restaurants := v_total_restaurants + 1;
    END IF;
  END LOOP;

  RAISE NOTICE '================================';
  RAISE NOTICE 'Restaurants touched: %', v_total_restaurants;
  RAISE NOTICE 'Dishes seeded: %', v_total_dishes;
  RAISE NOTICE 'Votes inserted: %', v_total_inserted;
  RAISE NOTICE 'Completed at %', NOW();
END $$;
