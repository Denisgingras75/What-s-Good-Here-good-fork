-- Add has_onboarded column to profiles table for onboarding flow tracking
-- Run this in your Supabase SQL Editor

-- Add the column with default value of false
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS has_onboarded BOOLEAN DEFAULT false;

-- Update existing users to mark them as onboarded (they've already used the app)
UPDATE profiles SET has_onboarded = true WHERE has_onboarded IS NULL;
