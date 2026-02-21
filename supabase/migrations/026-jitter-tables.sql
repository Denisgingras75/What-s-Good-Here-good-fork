-- 026-jitter-tables.sql
-- Jitter Protocol: behavioral biometrics tables + server-side profile builder
-- Run in Supabase SQL Editor to deploy

-- =============================================
-- 1. TABLES
-- =============================================

-- Jitter Protocol: behavioral biometrics for human verification
CREATE TABLE IF NOT EXISTS jitter_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_data JSONB NOT NULL DEFAULT '{}',
  review_count INTEGER NOT NULL DEFAULT 0,
  confidence_level TEXT NOT NULL DEFAULT 'low' CHECK (confidence_level IN ('low', 'medium', 'high')),
  consistency_score DECIMAL(4, 3) DEFAULT 0,
  flagged BOOLEAN DEFAULT false,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jitter_samples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sample_data JSONB NOT NULL,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. INDEXES
-- =============================================

-- Keep only last 30 samples per user (rolling window)
CREATE INDEX IF NOT EXISTS idx_jitter_samples_user ON jitter_samples (user_id, collected_at DESC);

-- =============================================
-- 3. ROW LEVEL SECURITY
-- =============================================

-- RLS: users can insert their own samples, read their own profile
ALTER TABLE jitter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jitter_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own jitter profile" ON jitter_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jitter samples" ON jitter_samples
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role manages jitter" ON jitter_profiles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role manages jitter samples" ON jitter_samples
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 4. TRIGGER FUNCTION + TRIGGER
-- =============================================

-- Merge a new jitter sample into the user's running profile
-- Called by trigger after jitter_samples INSERT
CREATE OR REPLACE FUNCTION merge_jitter_sample()
RETURNS TRIGGER AS $$
DECLARE
  existing_profile JSONB;
  new_sample JSONB;
  sample_count INTEGER;
  new_confidence TEXT;
  new_consistency DECIMAL(4, 3);
BEGIN
  new_sample := NEW.sample_data;

  -- Get or initialize profile
  SELECT profile_data, review_count INTO existing_profile, sample_count
  FROM jitter_profiles WHERE user_id = NEW.user_id;

  IF NOT FOUND THEN
    -- First sample: create profile directly from sample
    INSERT INTO jitter_profiles (user_id, profile_data, review_count, confidence_level, consistency_score, last_updated)
    VALUES (
      NEW.user_id,
      new_sample,
      1,
      'low',
      0,
      NOW()
    );
  ELSE
    sample_count := sample_count + 1;

    -- Determine confidence level
    IF sample_count >= 15 THEN
      new_confidence := 'high';
    ELSIF sample_count >= 5 THEN
      new_confidence := 'medium';
    ELSE
      new_confidence := 'low';
    END IF;

    -- Calculate consistency: compare new sample's mean_inter_key to running profile's
    -- Consistency = 1 - normalized_deviation (higher = more consistent)
    new_consistency := 0;
    IF existing_profile ? 'mean_inter_key' AND new_sample ? 'mean_inter_key'
       AND (existing_profile->>'mean_inter_key')::DECIMAL > 0 THEN
      new_consistency := GREATEST(0, LEAST(1,
        1.0 - ABS(
          (new_sample->>'mean_inter_key')::DECIMAL - (existing_profile->>'mean_inter_key')::DECIMAL
        ) / (existing_profile->>'mean_inter_key')::DECIMAL
      ));
      -- Weighted running average with existing consistency
      IF (SELECT consistency_score FROM jitter_profiles WHERE user_id = NEW.user_id) > 0 THEN
        new_consistency := (
          (SELECT consistency_score FROM jitter_profiles WHERE user_id = NEW.user_id) *
          (sample_count - 1) + new_consistency
        ) / sample_count;
      END IF;
    END IF;

    -- Merge: running weighted average of key metrics
    UPDATE jitter_profiles SET
      profile_data = jsonb_build_object(
        'mean_inter_key', ROUND((
          COALESCE((existing_profile->>'mean_inter_key')::DECIMAL, 0) * (sample_count - 1) +
          COALESCE((new_sample->>'mean_inter_key')::DECIMAL, 0)
        ) / sample_count, 2),
        'std_inter_key', ROUND((
          COALESCE((existing_profile->>'std_inter_key')::DECIMAL, 0) * (sample_count - 1) +
          COALESCE((new_sample->>'std_inter_key')::DECIMAL, 0)
        ) / sample_count, 2),
        'mean_dwell', CASE
          WHEN new_sample ? 'mean_dwell' AND new_sample->>'mean_dwell' IS NOT NULL
          THEN ROUND((
            COALESCE((existing_profile->>'mean_dwell')::DECIMAL, (new_sample->>'mean_dwell')::DECIMAL) * (sample_count - 1) +
            (new_sample->>'mean_dwell')::DECIMAL
          ) / sample_count, 2)
          ELSE existing_profile->'mean_dwell'
        END,
        'std_dwell', CASE
          WHEN new_sample ? 'std_dwell' AND new_sample->>'std_dwell' IS NOT NULL
          THEN ROUND((
            COALESCE((existing_profile->>'std_dwell')::DECIMAL, (new_sample->>'std_dwell')::DECIMAL) * (sample_count - 1) +
            (new_sample->>'std_dwell')::DECIMAL
          ) / sample_count, 2)
          ELSE existing_profile->'std_dwell'
        END,
        'bigram_signatures', COALESCE(new_sample->'bigram_signatures', existing_profile->'bigram_signatures', '{}'::JSONB),
        'fatigue_drift', new_sample->'fatigue_drift',
        'total_keystrokes', COALESCE((existing_profile->>'total_keystrokes')::INTEGER, 0) +
          COALESCE((new_sample->>'total_keystrokes')::INTEGER, 0)
      ),
      review_count = sample_count,
      confidence_level = new_confidence,
      consistency_score = ROUND(new_consistency::NUMERIC, 3),
      last_updated = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  -- Prune old samples (keep last 30)
  DELETE FROM jitter_samples
  WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id FROM jitter_samples
      WHERE user_id = NEW.user_id
      ORDER BY collected_at DESC
      LIMIT 30
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS jitter_sample_merge ON jitter_samples;
CREATE TRIGGER jitter_sample_merge
  AFTER INSERT ON jitter_samples
  FOR EACH ROW
  EXECUTE FUNCTION merge_jitter_sample();
