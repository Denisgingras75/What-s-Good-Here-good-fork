-- Add content hash column for menu change detection
-- Saves Claude API costs by skipping unchanged menus
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS menu_content_hash TEXT;
