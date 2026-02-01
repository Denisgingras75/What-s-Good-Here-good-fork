-- Add dish_photos table for decoupled photo capture
-- Run this in your Supabase SQL Editor

-- ============================================
-- TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS dish_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dish_id, user_id)  -- One photo per user per dish
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_dish_photos_dish ON dish_photos(dish_id);
CREATE INDEX IF NOT EXISTS idx_dish_photos_user ON dish_photos(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE dish_photos ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view dish photos)
CREATE POLICY "Public read access" ON dish_photos
  FOR SELECT USING (true);

-- Users can insert their own photos
CREATE POLICY "Users can insert own photos" ON dish_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own photos
CREATE POLICY "Users can update own photos" ON dish_photos
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos" ON dish_photos
  FOR DELETE USING (auth.uid() = user_id);
