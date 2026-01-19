-- Admin RLS Policies for What's Good Here
-- Run this in your Supabase SQL Editor AFTER the main schema.sql

-- ============================================
-- ADMINS TABLE
-- ============================================

-- Create admins table to track admin users
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Only admins can read the admins table
CREATE POLICY "Admins can read admins" ON admins
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

-- ============================================
-- HELPER FUNCTION
-- ============================================

-- Function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- ADMIN WRITE POLICIES FOR DISHES
-- ============================================

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can insert dishes" ON dishes;
DROP POLICY IF EXISTS "Admins can update dishes" ON dishes;
DROP POLICY IF EXISTS "Admins can delete dishes" ON dishes;

-- Admins can insert dishes
CREATE POLICY "Admins can insert dishes" ON dishes
  FOR INSERT WITH CHECK (is_admin());

-- Admins can update dishes
CREATE POLICY "Admins can update dishes" ON dishes
  FOR UPDATE USING (is_admin());

-- Admins can delete dishes
CREATE POLICY "Admins can delete dishes" ON dishes
  FOR DELETE USING (is_admin());

-- ============================================
-- ADMIN WRITE POLICIES FOR RESTAURANTS
-- ============================================

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can insert restaurants" ON restaurants;
DROP POLICY IF EXISTS "Admins can update restaurants" ON restaurants;
DROP POLICY IF EXISTS "Admins can delete restaurants" ON restaurants;

-- Admins can insert restaurants
CREATE POLICY "Admins can insert restaurants" ON restaurants
  FOR INSERT WITH CHECK (is_admin());

-- Admins can update restaurants
CREATE POLICY "Admins can update restaurants" ON restaurants
  FOR UPDATE USING (is_admin());

-- Admins can delete restaurants
CREATE POLICY "Admins can delete restaurants" ON restaurants
  FOR DELETE USING (is_admin());

-- ============================================
-- SEED INITIAL ADMIN (UPDATE WITH YOUR USER ID)
-- ============================================

-- To add yourself as an admin, run this with your actual user_id:
-- INSERT INTO admins (user_id) VALUES ('your-user-id-here');
--
-- You can find your user_id in Supabase Dashboard > Authentication > Users
-- Or by running: SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
