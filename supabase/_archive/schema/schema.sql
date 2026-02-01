-- What's Good Here - Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dishes table
CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'burger', 'pizza', 'sushi', 'burrito', 'sandwich', 'salad', 'pasta', 'taco'
  price DECIMAL(6, 2),
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  would_order_again BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dish_id, user_id) -- One vote per user per dish
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_dishes_restaurant ON dishes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category);
CREATE INDEX IF NOT EXISTS idx_votes_dish ON votes(dish_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(lat, lng);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access" ON restaurants;
DROP POLICY IF EXISTS "Public read access" ON dishes;
DROP POLICY IF EXISTS "Public read access" ON votes;
DROP POLICY IF EXISTS "Users can insert own votes" ON votes;
DROP POLICY IF EXISTS "Users can update own votes" ON votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON votes;

-- Restaurants: Public read (admin write policies in add-admin-rls.sql)
CREATE POLICY "Public read access" ON restaurants
  FOR SELECT USING (true);

-- Dishes: Public read (admin write policies in add-admin-rls.sql)
CREATE POLICY "Public read access" ON dishes
  FOR SELECT USING (true);

-- Votes: Public read, authenticated users can write their own votes
CREATE POLICY "Public read access" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own votes" ON votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes" ON votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON votes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- DATABASE FUNCTION: Get Ranked Dishes
-- ============================================

CREATE OR REPLACE FUNCTION get_ranked_dishes(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_miles INT DEFAULT 5,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  dish_id UUID,
  dish_name TEXT,
  restaurant_id UUID,
  restaurant_name TEXT,
  category TEXT,
  price DECIMAL,
  photo_url TEXT,
  total_votes BIGINT,
  yes_votes BIGINT,
  percent_worth_it INT,
  distance_miles DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id AS dish_id,
    d.name AS dish_name,
    r.id AS restaurant_id,
    r.name AS restaurant_name,
    d.category,
    d.price,
    d.photo_url,
    COUNT(v.id) AS total_votes,
    SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END) AS yes_votes,
    CASE
      WHEN COUNT(v.id) > 0
      THEN ROUND(100.0 * SUM(CASE WHEN v.would_order_again THEN 1 ELSE 0 END) / COUNT(v.id))::INT
      ELSE 0
    END AS percent_worth_it,
    ROUND((
      3959 * ACOS(
        LEAST(1.0, GREATEST(-1.0,
          COS(RADIANS(user_lat)) * COS(RADIANS(r.lat)) *
          COS(RADIANS(r.lng) - RADIANS(user_lng)) +
          SIN(RADIANS(user_lat)) * SIN(RADIANS(r.lat))
        ))
      )
    )::NUMERIC, 2) AS distance_miles
  FROM dishes d
  INNER JOIN restaurants r ON d.restaurant_id = r.id
  LEFT JOIN votes v ON d.id = v.dish_id
  WHERE (
    3959 * ACOS(
      LEAST(1.0, GREATEST(-1.0,
        COS(RADIANS(user_lat)) * COS(RADIANS(r.lat)) *
        COS(RADIANS(r.lng) - RADIANS(user_lng)) +
        SIN(RADIANS(user_lat)) * SIN(RADIANS(r.lat))
      ))
    )
  ) <= radius_miles
  AND (filter_category IS NULL OR d.category = filter_category)
  GROUP BY d.id, d.name, r.id, r.name, d.category, d.price, d.photo_url, r.lat, r.lng
  ORDER BY percent_worth_it DESC, total_votes DESC;
END;
$$ LANGUAGE plpgsql STABLE;
