#!/usr/bin/env node

/**
 * Automated menu importer for What's Good Here.
 *
 * Usage:
 *   node scripts/import-menu.mjs "Beach Road" --url "https://beachroadmv.com/menus/"
 *   pbpaste | node scripts/import-menu.mjs "Beach Road"
 *   cat menu.txt | node scripts/import-menu.mjs "Beach Road"
 *
 * Requires OPENAI_API_KEY in .env.local (alongside existing Supabase keys).
 */

import { readFileSync } from 'fs'
import { writeFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// ---------------------------------------------------------------------------
// 1. Parse args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2)
if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
Usage:
  node scripts/import-menu.mjs "Restaurant Name" --url "https://..."
  pbpaste | node scripts/import-menu.mjs "Restaurant Name"
  cat menu.txt | node scripts/import-menu.mjs "Restaurant Name"

Options:
  --url <url>   Fetch menu from a URL (strips HTML)
  --fresh       Force fresh mode (DELETE + INSERT) even if dishes exist
  --help        Show this help message
`)
  process.exit(0)
}

const restaurantName = args[0]
const urlFlagIdx = args.indexOf('--url')
const menuUrl = urlFlagIdx !== -1 ? args[urlFlagIdx + 1] : null
const forceFresh = args.includes('--fresh')

if (urlFlagIdx !== -1 && !menuUrl) {
  console.error('Error: --url flag requires a URL argument')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// 2. Load env from .env.local
// ---------------------------------------------------------------------------

function loadEnv() {
  try {
    const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8')
    const vars = {}
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      vars[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim()
    }
    return vars
  } catch {
    console.error('Error: Could not read .env.local — make sure it exists in the project root.')
    process.exit(1)
  }
}

const env = loadEnv()

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_ANON_KEY
const openaiKey = env.OPENAI_API_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env.local')
  process.exit(1)
}
if (!openaiKey) {
  console.error('Error: OPENAI_API_KEY must be set in .env.local')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// 3. Get menu text
// ---------------------------------------------------------------------------

async function getMenuText() {
  if (menuUrl) {
    console.log(`Fetching menu from ${menuUrl} ...`)
    const resp = await fetch(menuUrl)
    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status} ${resp.statusText}`)
    const html = await resp.text()
    // Strip HTML tags, decode entities, collapse whitespace
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;|&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Read from stdin
  if (process.stdin.isTTY) {
    console.error('Error: No menu input. Pipe text via stdin or use --url.')
    process.exit(1)
  }
  return readFileSync(0, 'utf-8').trim()
}

// ---------------------------------------------------------------------------
// 4. Call GPT-4o for structured extraction
// ---------------------------------------------------------------------------

const VALID_CATEGORIES = [
  'pizza', 'burger', 'taco', 'wings', 'sushi', 'breakfast',
  'breakfast sandwich', 'lobster roll', 'chowder', 'pasta', 'steak',
  'sandwich', 'salad', 'seafood', 'fish', 'tendys', 'fried chicken',
  'apps', 'fries', 'entree', 'dessert', 'donuts', 'pokebowl',
  'asian', 'chicken', 'quesadilla', 'soup',
  'ribs', 'sides', 'duck', 'lamb', 'pork', 'clams',
  'oysters', 'coffee', 'cocktails', 'ice cream',
]

const SYSTEM_PROMPT = `You are a menu data extraction assistant for a food discovery app on Martha's Vineyard.

Given raw menu text, extract every food dish and return structured JSON.

## Category Vocabulary (use ONLY these exact IDs)

| Category ID | Use For |
|---|---|
| pizza | Pizza |
| burger | Burgers |
| taco | Tacos, quesadillas |
| wings | Wings |
| sushi | Sushi, sashimi, rolls |
| breakfast | Breakfast plates, waffles, pancakes, eggs |
| breakfast sandwich | Breakfast sandwiches, breakfast burritos |
| lobster roll | Lobster rolls specifically |
| chowder | Clam chowder, any chowder |
| pasta | Pasta, risotto |
| steak | Steak entrees |
| sandwich | Sandwiches, wraps, BLTs, clubs, grilled cheese, hot dogs |
| salad | Salads |
| seafood | Seafood entrees INCLUDING fish entrees (salmon, cod, swordfish, halibut, etc.), shellfish, crab cakes. NOT lobster roll, NOT chowder |
| fish | ONLY fish & chips, fish sandwiches, fish tacos — casual/fried fish items |
| tendys | Chicken tenders |
| fried chicken | Fried chicken sandwiches, fried chicken plates |
| apps | Appetizers, soups (non-chowder), shareable plates, starters |
| fries | ONLY fries, onion rings, tater tots |
| sides | Non-fries side dishes: vegetables, rice, beans, coleslaw, etc. |
| entree | Other entrees that don't fit a more specific category |
| ribs | Ribs (BBQ ribs, baby back ribs, rack of ribs) |
| pork | Pork entrees (pork chop, pork belly, pulled pork) |
| lamb | Lamb entrees (rack of lamb, lamb chops, lamb shank) |
| duck | Duck entrees (duck breast, duck confit) |
| dessert | Cakes, pies, ice cream, brownies, sundaes |
| donuts | Donuts, fritters |
| pokebowl | Poke bowls |
| asian | Asian entrees (pad thai, curry, stir-fry, fried rice) |
| chicken | Chicken entrees (not fried chicken, not tenders) |
| quesadilla | Quesadillas |
| soup | Soups (non-chowder) |
| cocktails | Cocktails, mixed drinks, signature drinks |
| coffee | Coffee drinks, espresso, lattes, specialty coffee |
| ice cream | Ice cream, gelato, frozen treats, milkshakes |
| oysters | Oysters (raw bar, oyster plates) |
| clams | Clam dishes (steamers, stuffed clams, clam strips) |

## Extraction Rules

1. **Include cocktails, coffee drinks, and specialty beverages** — skip generic beer/wine lists, soda, plain juice
2. **Skip condiment-level sides under ~$4** — skip things like extra sauce, dressing on the side, bread roll
3. **Include substantive sides $4+** — fries, onion rings, vegetables, etc.
4. **Deduplicate sizes** — if a dish comes in small/large or lunch/dinner sizes, keep only the larger/dinner version
5. **Use the restaurant's actual menu section headings** as menu_section values
6. **Use exact dish names** from the menu — don't rename, abbreviate, or editorialize
7. **Prices must be numbers** (no $ sign). If a dish has a price range (e.g. "12-18"), use the lower price. If no price is listed, use null.
8. **One category per dish** — pick the most specific match from the vocabulary
9. **Return menu_section_order** matching the order sections appear on the actual menu

## Output Format

Return ONLY valid JSON (no markdown, no explanation):
{
  "dishes": [
    { "name": "Dish Name", "category": "category_id", "menu_section": "Section Name", "price": 18.00 }
  ],
  "menu_section_order": ["Section 1", "Section 2"]
}`

async function extractDishes(menuText) {
  const openai = new OpenAI({ apiKey: openaiKey })

  console.log(`Sending menu text to GPT-4o (${menuText.length} chars) ...`)

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Extract dishes from this menu for "${restaurantName}":\n\n${menuText}` },
    ],
  })

  const content = response.choices[0].message.content
  let parsed
  try {
    parsed = JSON.parse(content)
  } catch {
    console.error('Error: GPT-4o returned invalid JSON:')
    console.error(content)
    process.exit(1)
  }

  if (!parsed.dishes || !Array.isArray(parsed.dishes)) {
    console.error('Error: GPT-4o response missing "dishes" array')
    console.error(JSON.stringify(parsed, null, 2))
    process.exit(1)
  }

  // Validate categories
  let fixedCount = 0
  for (const dish of parsed.dishes) {
    if (!VALID_CATEGORIES.includes(dish.category)) {
      console.warn(`  Warning: "${dish.name}" has invalid category "${dish.category}" — defaulting to "entree"`)
      dish.category = 'entree'
      fixedCount++
    }
  }
  if (fixedCount > 0) {
    console.warn(`  Fixed ${fixedCount} invalid categories`)
  }

  return parsed
}

// ---------------------------------------------------------------------------
// 5. Query Supabase for existing dishes
// ---------------------------------------------------------------------------

async function getExistingDishes() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  // First find the restaurant
  const { data: restaurant, error: restErr } = await supabase
    .from('restaurants')
    .select('id, name')
    .ilike('name', restaurantName)
    .maybeSingle()

  if (restErr) {
    console.error('Supabase error looking up restaurant:', restErr.message)
    return { restaurant: null, dishes: [] }
  }

  if (!restaurant) {
    console.log(`Restaurant "${restaurantName}" not found in Supabase — will use fresh mode.`)
    return { restaurant: null, dishes: [] }
  }

  console.log(`Found restaurant: "${restaurant.name}" (id: ${restaurant.id})`)

  // Get existing dishes
  const { data: dishes, error: dishErr } = await supabase
    .from('dishes')
    .select('id, name, category, menu_section, price, photo_count, yes_count, no_count')
    .eq('restaurant_id', restaurant.id)

  if (dishErr) {
    console.error('Supabase error fetching dishes:', dishErr.message)
    return { restaurant, dishes: [] }
  }

  console.log(`Found ${dishes.length} existing dishes in Supabase.`)
  return { restaurant, dishes: dishes || [] }
}

// ---------------------------------------------------------------------------
// 6. Generate SQL
// ---------------------------------------------------------------------------

function escapeSql(str) {
  return str.replace(/'/g, "''")
}

function toKebabCase(str) {
  return str
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function generateSql(extracted, existing) {
  const { dishes, menu_section_order } = extracted
  const { restaurant, dishes: existingDishes } = existing

  const hasDishesWithData = existingDishes.some(
    d => (d.photo_count && d.photo_count > 0) || (d.yes_count && d.yes_count > 0) || (d.no_count && d.no_count > 0)
  )
  const useSafeMode = hasDishesWithData && !forceFresh

  const restNameSql = escapeSql(restaurantName)
  const restSelect = `(SELECT id FROM restaurants WHERE name = '${restNameSql}')`

  const lines = []

  // Header
  lines.push(`-- ${restaurantName} - Full Menu`)
  lines.push(`-- Run this in Supabase SQL Editor`)
  if (useSafeMode) {
    lines.push(`-- SAFE MODE: Updates existing dishes, inserts new ones (preserves photos/votes)`)
  } else {
    lines.push(`-- IMPORTANT: Delete existing ${restaurantName} dishes first to avoid duplicates`)
  }
  lines.push(``)

  if (useSafeMode) {
    // Build a name-based lookup of existing dishes
    const existingByName = new Map()
    for (const d of existingDishes) {
      existingByName.set(d.name.toLowerCase(), d)
    }

    const updates = []
    const inserts = []
    const matchedNames = new Set()

    for (const dish of dishes) {
      const match = existingByName.get(dish.name.toLowerCase())
      if (match) {
        matchedNames.add(match.name.toLowerCase())
        // Check if anything changed
        const priceChanged = dish.price !== null && dish.price !== match.price
        const categoryChanged = dish.category !== match.category
        const sectionChanged = dish.menu_section !== match.menu_section
        if (priceChanged || categoryChanged || sectionChanged) {
          updates.push({ dish, existing: match })
        }
      } else {
        inserts.push(dish)
      }
    }

    // Find orphaned dishes (in DB but not on new menu)
    const orphaned = existingDishes.filter(d => !matchedNames.has(d.name.toLowerCase()))

    // UPDATEs
    if (updates.length > 0) {
      lines.push(`-- Update ${updates.length} existing dishes`)
      for (const { dish } of updates) {
        const setClauses = []
        setClauses.push(`category = '${escapeSql(dish.category)}'`)
        setClauses.push(`menu_section = '${escapeSql(dish.menu_section)}'`)
        if (dish.price !== null) {
          setClauses.push(`price = ${Number(dish.price).toFixed(2)}`)
        }
        lines.push(`UPDATE dishes SET ${setClauses.join(', ')}`)
        lines.push(`WHERE restaurant_id = ${restSelect} AND name = '${escapeSql(dish.name)}';`)
        lines.push(``)
      }
    }

    // INSERTs
    if (inserts.length > 0) {
      lines.push(`-- Insert ${inserts.length} new dishes`)
      lines.push(`INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES`)

      let currentSection = null
      const insertLines = []
      for (const dish of inserts) {
        if (dish.menu_section !== currentSection) {
          currentSection = dish.menu_section
          insertLines.push({ comment: `-- ${currentSection}` })
        }
        const priceVal = dish.price !== null ? Number(dish.price).toFixed(2) : 'NULL'
        insertLines.push({
          sql: `(${restSelect}, '${escapeSql(dish.name)}', '${escapeSql(dish.category)}', '${escapeSql(dish.menu_section)}', ${priceVal})`,
        })
      }

      for (let i = 0; i < insertLines.length; i++) {
        const item = insertLines[i]
        if (item.comment) {
          lines.push(item.comment)
        } else {
          // Find next non-comment item
          const isLast = insertLines.slice(i + 1).every(x => x.comment)
          lines.push(item.sql + (isLast ? ';' : ','))
        }
      }
      lines.push(``)
    }

    // Orphaned dishes (commented out for review)
    if (orphaned.length > 0) {
      lines.push(`-- REVIEW: ${orphaned.length} dishes in DB but NOT on new menu`)
      lines.push(`-- Uncomment to remove them (will lose photos/votes):`)
      for (const d of orphaned) {
        const info = []
        if (d.yes_count > 0 || d.no_count > 0) info.push(`${d.yes_count || 0} yes / ${d.no_count || 0} no votes`)
        if (d.photo_count > 0) info.push(`${d.photo_count} photos`)
        const infoStr = info.length > 0 ? ` -- ${info.join(', ')}` : ''
        lines.push(`-- DELETE FROM dishes WHERE restaurant_id = ${restSelect} AND name = '${escapeSql(d.name)}';${infoStr}`)
      }
      lines.push(``)
    }

    if (updates.length === 0 && inserts.length === 0) {
      lines.push(`-- No changes needed — menu matches existing dishes.`)
      lines.push(``)
    }
  } else {
    // Fresh mode: DELETE + INSERT
    lines.push(`-- Delete old ${restaurantName} dishes`)
    lines.push(`DELETE FROM dishes`)
    lines.push(`WHERE restaurant_id = ${restSelect};`)
    lines.push(``)

    lines.push(`-- Insert complete menu (${dishes.length} items)`)
    lines.push(`INSERT INTO dishes (restaurant_id, name, category, menu_section, price) VALUES`)

    let currentSection = null
    for (let i = 0; i < dishes.length; i++) {
      const dish = dishes[i]
      if (dish.menu_section !== currentSection) {
        currentSection = dish.menu_section
        lines.push(`-- ${currentSection}`)
      }
      const priceVal = dish.price !== null ? Number(dish.price).toFixed(2) : 'NULL'
      const comma = i < dishes.length - 1 ? ',' : ';'
      lines.push(`(${restSelect}, '${escapeSql(dish.name)}', '${escapeSql(dish.category)}', '${escapeSql(dish.menu_section)}', ${priceVal})${comma}`)
    }
    lines.push(``)
  }

  // menu_section_order
  const sections = (menu_section_order || []).map(s => `'${escapeSql(s)}'`).join(', ')
  lines.push(`-- Update menu_section_order`)
  lines.push(`UPDATE restaurants`)
  lines.push(`SET menu_section_order = ARRAY[${sections}]`)
  lines.push(`WHERE name = '${restNameSql}';`)
  lines.push(``)

  // Verify
  lines.push(`-- Verify import`)
  lines.push(`SELECT COUNT(*) as dish_count`)
  lines.push(`FROM dishes`)
  lines.push(`WHERE restaurant_id = ${restSelect};`)
  lines.push(``)
  if (useSafeMode) {
    const newCount = dishes.filter(d => !existingDishes.some(e => e.name.toLowerCase() === d.name.toLowerCase())).length
    lines.push(`-- Existing: ${existingDishes.length}, New: ${newCount}`)
  } else {
    lines.push(`-- Should show ${dishes.length} dishes`)
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// 7. Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\nImporting menu for: ${restaurantName}\n`)

  // Get menu text
  const menuText = await getMenuText()
  if (!menuText || menuText.length < 20) {
    console.error('Error: Menu text is too short or empty.')
    process.exit(1)
  }
  console.log(`Got menu text: ${menuText.length} characters\n`)

  // Extract dishes with GPT-4o
  const extracted = await extractDishes(menuText)
  console.log(`\nExtracted ${extracted.dishes.length} dishes in ${extracted.menu_section_order.length} sections:`)
  for (const section of extracted.menu_section_order) {
    const count = extracted.dishes.filter(d => d.menu_section === section).length
    console.log(`  ${section}: ${count} dishes`)
  }
  console.log()

  // Query Supabase for existing dishes
  const existing = await getExistingDishes()
  const hasDishesWithData = existing.dishes.some(
    d => (d.photo_count && d.photo_count > 0) || (d.yes_count && d.yes_count > 0) || (d.no_count && d.no_count > 0)
  )
  const mode = hasDishesWithData && !forceFresh ? 'safe' : 'fresh'
  console.log(`Mode: ${mode}${forceFresh ? ' (forced)' : ''}\n`)

  // Generate SQL
  const sql = generateSql(extracted, existing)

  // Write file
  const slug = toKebabCase(restaurantName)
  const outPath = new URL(`../supabase/seed/data/menus/${slug}-full-menu.sql`, import.meta.url)
  writeFileSync(outPath, sql + '\n')

  const relPath = `supabase/seed/data/menus/${slug}-full-menu.sql`
  console.log(`Written to: ${relPath}`)
  console.log(`\nSummary:`)
  console.log(`  Restaurant: ${restaurantName}`)
  console.log(`  Dishes: ${extracted.dishes.length}`)
  console.log(`  Sections: ${extracted.menu_section_order.join(', ')}`)
  console.log(`  Mode: ${mode}`)
  if (mode === 'safe') {
    const newDishes = extracted.dishes.filter(
      d => !existing.dishes.some(e => e.name.toLowerCase() === d.name.toLowerCase())
    )
    const orphaned = existing.dishes.filter(
      d => !extracted.dishes.some(e => e.name.toLowerCase() === d.name.toLowerCase())
    )
    console.log(`  New dishes: ${newDishes.length}`)
    console.log(`  Orphaned (review): ${orphaned.length}`)
  }
  console.log(`\nDone! Review the SQL then run it in Supabase SQL Editor.`)
}

main().catch(err => {
  console.error('Fatal error:', err.message || err)
  process.exit(1)
})
