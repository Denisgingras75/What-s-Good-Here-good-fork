# Pending Schema Migrations

Run these in Supabase SQL Editor (Dashboard > SQL Editor > New Query) in order.

## 1. Comprehensive Schema Sync (covers most gaps)

**File:** `supabase/migrations/comprehensive_schema_sync.sql`

This is a 92KB idempotent migration that brings the live DB in sync with schema.sql. It covers:

- Missing restaurant columns (cuisine, town, region, google_place_id, website_url, facebook_url, instagram_url, phone, menu_url, menu_last_checked, menu_content_hash, menu_section_order)
- Vote source tracking columns (source, source_metadata) + partial unique index
- Events table + specials table
- Jitter Protocol tables (jitter_profiles, jitter_samples) + merge trigger
- Rate limiting table + RPC functions
- All RLS policies
- All indexes (40+)
- All RPC functions (get_ranked_dishes, badge evaluation, etc.)
- Badge seed data (41 badges)

**Safe to re-run** — uses IF NOT EXISTS, CREATE OR REPLACE, ON CONFLICT DO UPDATE.

Copy the entire file contents and run in SQL Editor.

## 2. Handle New User Trigger (NEW)

**File:** `supabase/migrations/20260221_handle_new_user_trigger.sql`

Creates a trigger on `auth.users` that auto-creates a `profiles` row when a new user signs up (any method). For Google OAuth users, pulls display_name from provider metadata.

**Must be run** for Google OAuth to work smoothly.

## Run Order

```
1. comprehensive_schema_sync.sql    (~2 min, covers everything up to Feb 16)
2. 20260221_handle_new_user_trigger.sql  (~1 sec, auth trigger)
```

## After Running

Verify with these queries:

```sql
-- Check vote source column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'votes' AND column_name = 'source';

-- Check jitter tables exist
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('jitter_profiles', 'jitter_samples', 'events', 'specials');

-- Check handle_new_user trigger exists
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'users' AND trigger_name = 'on_auth_user_created';

-- Check rate_limits table
SELECT table_name FROM information_schema.tables WHERE table_name = 'rate_limits';
```
