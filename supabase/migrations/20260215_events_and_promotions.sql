-- =============================================
-- Events table + promotion flag for specials
-- =============================================
-- Run in Supabase SQL Editor

-- 1. Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  event_type TEXT NOT NULL CHECK (event_type IN ('live_music', 'trivia', 'comedy', 'karaoke', 'open_mic', 'other')),
  recurring_pattern TEXT CHECK (recurring_pattern IN ('weekly', 'monthly') OR recurring_pattern IS NULL),
  recurring_day_of_week INT CHECK (recurring_day_of_week BETWEEN 0 AND 6 OR recurring_day_of_week IS NULL),
  is_active BOOLEAN DEFAULT true,
  is_promoted BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'auto_scrape')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. Indexes (partial indexes per supabase-postgres-best-practices/query-partial-indexes)
CREATE INDEX IF NOT EXISTS idx_events_restaurant ON events(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_events_active_upcoming ON events(event_date, is_promoted DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type) WHERE is_active = true;

-- 3. RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read active events" ON events FOR SELECT USING (is_active = true OR is_admin() OR is_restaurant_manager(restaurant_id));
CREATE POLICY "Admin or manager insert events" ON events FOR INSERT WITH CHECK (is_admin() OR is_restaurant_manager(restaurant_id));
CREATE POLICY "Admin or manager update events" ON events FOR UPDATE USING (is_admin() OR is_restaurant_manager(restaurant_id));
CREATE POLICY "Admin or manager delete events" ON events FOR DELETE USING (is_admin() OR is_restaurant_manager(restaurant_id));

-- 4. Add is_promoted and source to specials
ALTER TABLE specials ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT false;
ALTER TABLE specials ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'auto_scrape'));

-- 5. pg_cron job for daily scraping at 6 AM EST (11 UTC)
-- Run this separately after deploying edge functions:
-- SELECT cron.schedule(
--   'daily-scraper-dispatch',
--   '0 11 * * *',
--   $$
--   SELECT net.http_post(
--     url := current_setting('app.settings.supabase_url') || '/functions/v1/scraper-dispatcher',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );
