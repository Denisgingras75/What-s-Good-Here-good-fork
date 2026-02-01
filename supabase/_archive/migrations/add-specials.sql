-- Specials table for restaurant deals
CREATE TABLE IF NOT EXISTS specials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  deal_name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- Index for active specials lookup
CREATE INDEX IF NOT EXISTS idx_specials_active ON specials(is_active, restaurant_id);

-- RLS policies
ALTER TABLE specials ENABLE ROW LEVEL SECURITY;

-- Anyone can read active specials
CREATE POLICY "Anyone can view active specials"
  ON specials FOR SELECT
  USING (is_active = true);

-- Authenticated users can insert (for now - later restrict to restaurant owners)
CREATE POLICY "Authenticated users can create specials"
  ON specials FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Creator can update their own specials
CREATE POLICY "Creator can update own specials"
  ON specials FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Creator can delete their own specials
CREATE POLICY "Creator can delete own specials"
  ON specials FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());
