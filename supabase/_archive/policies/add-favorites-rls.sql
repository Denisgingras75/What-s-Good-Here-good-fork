-- Enable Row Level Security on favorites table
-- SECURITY: Users can only access their own favorites

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users can only read their own favorites
CREATE POLICY "Users can read own favorites" ON favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert favorites for themselves
CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own favorites
CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Note: No UPDATE policy needed - favorites are either added or removed, never modified
