-- =============================================
-- Enable daily event/special scraper cron job
-- =============================================
-- Runs daily at 6 AM EST (11:00 UTC)
-- Calls the scraper-dispatcher edge function which scrapes
-- all restaurants with website_url or facebook_url set.
--
-- Prerequisites:
--   1. pg_net extension enabled (Supabase has this by default)
--   2. pg_cron extension enabled (enable in Supabase Dashboard > Database > Extensions)
--   3. Edge functions deployed: scraper-dispatcher, restaurant-scraper
--   4. ANTHROPIC_API_KEY set in edge function secrets
--
-- Run this in Supabase SQL Editor AFTER enabling pg_cron extension.
-- =============================================

-- Enable extensions if not already
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the daily scraper dispatch
SELECT cron.schedule(
  'daily-scraper-dispatch',
  '0 11 * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url' LIMIT 1) || '/functions/v1/scraper-dispatcher',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Schedule biweekly menu refresh (every other Monday at 7 AM EST / 12:00 UTC)
-- Processes up to 10 restaurants per run whose menu_last_checked is >14 days old
SELECT cron.schedule(
  'biweekly-menu-refresh',
  '0 12 */14 * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url' LIMIT 1) || '/functions/v1/menu-refresh',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Verify both jobs are scheduled
SELECT * FROM cron.job WHERE jobname IN ('daily-scraper-dispatch', 'biweekly-menu-refresh');
