-- =============================================
-- Add menu_url and menu_last_checked to restaurants
-- =============================================
-- menu_url: Direct link to the restaurant's online menu
--   (separate from website_url — many restaurants use Toast, Square, etc.)
-- menu_last_checked: Timestamp of last automated menu refresh
--   Used by menu-refresh cron to find stale menus (>14 days)

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS menu_url TEXT;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS menu_last_checked TIMESTAMPTZ;

-- Index for finding stale menus efficiently
CREATE INDEX IF NOT EXISTS idx_restaurants_menu_stale
  ON restaurants (menu_last_checked)
  WHERE menu_url IS NOT NULL AND is_open = true;

-- Add cocktails to the valid dish categories for import-menu
-- (The category already exists in the app constants, this is a comment for reference)
-- Categories now include: oysters, coffee, cocktails, ice cream

COMMENT ON COLUMN restaurants.menu_url IS 'Direct URL to online menu (Toast, Square, website menu page)';
COMMENT ON COLUMN restaurants.menu_last_checked IS 'Last time automated menu refresh ran for this restaurant';
