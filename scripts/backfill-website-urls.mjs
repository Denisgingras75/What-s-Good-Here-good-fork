#!/usr/bin/env node

/**
 * Backfill website_url for restaurants that have google_place_id but no website_url.
 * Uses Google Places Details API (New) to fetch website URLs.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... GOOGLE_PLACES_API_KEY=... node scripts/backfill-website-urls.mjs
 *
 * Or add these to .env.local and run:
 *   node scripts/backfill-website-urls.mjs
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Load env
// ---------------------------------------------------------------------------

function loadEnv() {
  try {
    const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8')
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    // .env.local optional if env vars set directly
  }
}

loadEnv()

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const googleApiKey = process.env.GOOGLE_PLACES_API_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE_KEY) required')
  console.error('Set them as env vars or add to .env.local')
  process.exit(1)
}

if (!googleApiKey) {
  console.error('Error: GOOGLE_PLACES_API_KEY required')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const supabase = createClient(supabaseUrl, supabaseKey)

async function getPlaceWebsite(placeId) {
  const fields = 'websiteUri'
  const url = `https://places.googleapis.com/v1/places/${placeId}?languageCode=en`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': googleApiKey,
      'X-Goog-FieldMask': fields,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Places API error ${response.status}: ${text}`)
  }

  const data = await response.json()
  return data.websiteUri || null
}

async function main() {
  console.log('\n=== Backfill Restaurant Website URLs ===\n')

  // Find restaurants with google_place_id but no website_url
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, google_place_id, website_url')
    .not('google_place_id', 'is', null)
    .is('website_url', null)
    .eq('is_open', true)

  if (error) {
    console.error('Error fetching restaurants:', error.message)
    process.exit(1)
  }

  console.log(`Found ${restaurants.length} restaurants with google_place_id but no website_url\n`)

  if (restaurants.length === 0) {
    console.log('Nothing to backfill!')
    return
  }

  let updated = 0
  let skipped = 0
  let errors = 0

  for (const restaurant of restaurants) {
    try {
      const websiteUrl = await getPlaceWebsite(restaurant.google_place_id)

      if (websiteUrl) {
        const { error: updateError } = await supabase
          .from('restaurants')
          .update({ website_url: websiteUrl })
          .eq('id', restaurant.id)

        if (updateError) {
          console.error(`  Error updating ${restaurant.name}:`, updateError.message)
          errors++
        } else {
          console.log(`  + ${restaurant.name} -> ${websiteUrl}`)
          updated++
        }
      } else {
        console.log(`  - ${restaurant.name} (no website on Google)`)
        skipped++
      }

      // Rate limit: 100ms between calls
      await new Promise(r => setTimeout(r, 100))
    } catch (err) {
      console.error(`  ! ${restaurant.name}: ${err.message}`)
      errors++
    }
  }

  console.log(`\nDone! Updated: ${updated}, No website: ${skipped}, Errors: ${errors}`)
}

main().catch(err => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})
