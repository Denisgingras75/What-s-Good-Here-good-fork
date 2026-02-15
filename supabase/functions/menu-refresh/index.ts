import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Menu Refresh Edge Function
 *
 * Finds restaurants with menu_url where menu_last_checked is older than 14 days
 * (or never checked), fetches the menu page, uses Claude to extract dishes,
 * and upserts them into the database.
 *
 * Triggered by pg_cron every 2 weeks, or manually via POST.
 *
 * Can also process a single restaurant:
 *   POST { restaurant_id: "uuid" }
 */

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const VALID_CATEGORIES = [
  'pizza', 'burger', 'taco', 'wings', 'sushi', 'breakfast',
  'breakfast sandwich', 'lobster roll', 'chowder', 'pasta', 'steak',
  'sandwich', 'salad', 'seafood', 'fish', 'tendys', 'fried chicken',
  'apps', 'fries', 'entree', 'dessert', 'donuts', 'pokebowl',
  'asian', 'chicken', 'quesadilla', 'soup',
  'ribs', 'sides', 'duck', 'lamb', 'pork', 'clams',
  'oysters', 'coffee', 'cocktails', 'ice cream',
]

const MENU_EXTRACTION_PROMPT = `You are a menu data extraction assistant for a food discovery app.

Given raw menu text from a restaurant webpage, extract every food AND drink item and return structured JSON.

## Category Vocabulary (use ONLY these exact IDs)

| Category ID | Use For |
|---|---|
| pizza | Pizza |
| burger | Burgers |
| taco | Tacos, burritos, quesadillas |
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
| seafood | Seafood entrees (salmon, cod, swordfish, shellfish, crab cakes). NOT lobster roll, NOT chowder |
| fish | Fish & chips, fish sandwiches, fish tacos — casual/fried fish items |
| oysters | Oysters (raw bar, oyster plates) |
| clams | Clam dishes (steamers, stuffed clams, clam strips) |
| tendys | Chicken tenders |
| fried chicken | Fried chicken sandwiches, fried chicken plates |
| apps | Appetizers, starters, shareable plates |
| fries | Fries, onion rings, tater tots |
| sides | Non-fries side dishes: vegetables, rice, beans, coleslaw |
| entree | Other entrees that don't fit a specific category |
| ribs | Ribs |
| pork | Pork entrees |
| lamb | Lamb entrees |
| duck | Duck entrees |
| chicken | Chicken entrees (not fried chicken, not tenders) |
| dessert | Cakes, pies, ice cream, brownies, sundaes |
| donuts | Donuts, fritters |
| pokebowl | Poke bowls |
| asian | Asian entrees (pad thai, curry, stir-fry) |
| soup | Soups (non-chowder) |
| cocktails | Cocktails, mixed drinks, signature drinks |
| coffee | Coffee drinks, espresso, lattes |
| ice cream | Ice cream, gelato, frozen treats, milkshakes |
| quesadilla | Quesadillas |

## Rules

1. **Include cocktails, coffee, and specialty drinks** — these are important categories
2. **Skip generic beverages** — no beer/wine lists, no soda, no plain water/juice
3. **Skip condiment-level items under ~$4** — extra sauce, bread roll, etc.
4. **Include substantive sides $4+**
5. **Deduplicate sizes** — keep only the larger/dinner version
6. **Use exact dish names from the menu**
7. **Prices must be numbers** (no $ sign). If range, use lower price. If no price, use null.
8. **One category per dish** — pick the most specific match

## Output Format

Return ONLY valid JSON (no markdown):
{
  "dishes": [
    { "name": "Dish Name", "category": "category_id", "menu_section": "Section Name", "price": 18.00 }
  ],
  "menu_section_order": ["Section 1", "Section 2"]
}`

interface ExtractedDish {
  name: string
  category: string
  menu_section: string
  price: number | null
}

interface MenuExtractionResult {
  dishes: ExtractedDish[]
  menu_section_order: string[]
}

const MAX_RESTAURANTS_PER_RUN = 10
const STALE_DAYS = 14

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Fetch and strip HTML from a menu URL
 */
async function fetchMenuContent(url: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'WhatsGoodHere-MenuBot/1.0',
        'Accept': 'text/html',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()

    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;|&apos;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 12000) // More generous than event scraper — menus can be long
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Extract dishes from menu text using Claude
 */
async function extractMenuWithClaude(content: string, restaurantName: string): Promise<MenuExtractionResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Extract the full menu from "${restaurantName}":\n\n${content}`,
        },
      ],
      system: MENU_EXTRACTION_PROMPT,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Claude API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text || '{}'

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return { dishes: [], menu_section_order: [] }
  }

  const parsed = JSON.parse(jsonMatch[0])

  // Validate categories
  const validDishes = (Array.isArray(parsed.dishes) ? parsed.dishes : [])
    .filter((d: ExtractedDish) => d.name && d.category)
    .map((d: ExtractedDish) => ({
      ...d,
      category: VALID_CATEGORIES.includes(d.category) ? d.category : 'entree',
    }))

  return {
    dishes: validDishes,
    menu_section_order: Array.isArray(parsed.menu_section_order) ? parsed.menu_section_order : [],
  }
}

/**
 * Upsert dishes for a restaurant (safe mode — preserves votes/photos)
 */
async function upsertDishes(
  supabase: ReturnType<typeof createClient>,
  restaurantId: string,
  extracted: MenuExtractionResult
): Promise<{ inserted: number; updated: number; unchanged: number }> {
  // Get existing dishes
  const { data: existingDishes, error: fetchErr } = await supabase
    .from('dishes')
    .select('id, name, category, menu_section, price, total_votes, photo_url')
    .eq('restaurant_id', restaurantId)

  if (fetchErr) {
    throw new Error(`Failed to fetch existing dishes: ${fetchErr.message}`)
  }

  const existingByName = new Map<string, typeof existingDishes[0]>()
  for (const d of (existingDishes || [])) {
    existingByName.set(d.name.toLowerCase(), d)
  }

  let inserted = 0
  let updated = 0
  let unchanged = 0

  for (const dish of extracted.dishes) {
    const existing = existingByName.get(dish.name.toLowerCase())

    if (existing) {
      // Check if anything changed
      const priceChanged = dish.price !== null && dish.price !== existing.price
      const categoryChanged = dish.category !== existing.category
      const sectionChanged = dish.menu_section !== existing.menu_section

      if (priceChanged || categoryChanged || sectionChanged) {
        const updates: Record<string, unknown> = {}
        if (categoryChanged) updates.category = dish.category
        if (sectionChanged) updates.menu_section = dish.menu_section
        if (priceChanged) updates.price = dish.price

        const { error } = await supabase
          .from('dishes')
          .update(updates)
          .eq('id', existing.id)

        if (!error) updated++
      } else {
        unchanged++
      }
    } else {
      // Insert new dish
      const { error } = await supabase
        .from('dishes')
        .insert({
          restaurant_id: restaurantId,
          name: dish.name,
          category: dish.category,
          menu_section: dish.menu_section || null,
          price: dish.price || null,
        })

      if (!error) inserted++
    }
  }

  // Update menu_section_order
  if (extracted.menu_section_order.length > 0) {
    await supabase
      .from('restaurants')
      .update({ menu_section_order: extracted.menu_section_order })
      .eq('id', restaurantId)
  }

  return { inserted, updated, unchanged }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if single restaurant mode
    let body: Record<string, unknown> = {}
    try {
      body = await req.json()
    } catch {
      // Empty body = batch mode
    }

    let restaurants: Array<{ id: string; name: string; menu_url: string }>

    if (body.restaurant_id) {
      // Single restaurant mode
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, menu_url')
        .eq('id', body.restaurant_id)
        .not('menu_url', 'is', null)
        .single()

      if (error || !data) {
        return new Response(JSON.stringify({ error: 'Restaurant not found or no menu_url' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      restaurants = [data]
    } else {
      // Batch mode: find stale menus
      const staleDate = new Date()
      staleDate.setDate(staleDate.getDate() - STALE_DAYS)

      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, menu_url')
        .not('menu_url', 'is', null)
        .eq('is_open', true)
        .or(`menu_last_checked.is.null,menu_last_checked.lt.${staleDate.toISOString()}`)
        .limit(MAX_RESTAURANTS_PER_RUN)

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch restaurants' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      restaurants = data || []
    }

    if (restaurants.length === 0) {
      return new Response(JSON.stringify({ message: 'No restaurants need menu refresh', processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const results: Array<{
      restaurant_id: string
      name: string
      status: string
      inserted?: number
      updated?: number
      unchanged?: number
      total_dishes?: number
    }> = []

    for (const restaurant of restaurants) {
      try {
        console.log(`Processing menu for: ${restaurant.name}`)

        // Fetch menu content
        const content = await fetchMenuContent(restaurant.menu_url)
        if (content.length < 50) {
          results.push({ restaurant_id: restaurant.id, name: restaurant.name, status: 'skipped: page too short' })
          continue
        }

        // Extract dishes with Claude
        const extracted = await extractMenuWithClaude(content, restaurant.name)
        if (extracted.dishes.length === 0) {
          results.push({ restaurant_id: restaurant.id, name: restaurant.name, status: 'skipped: no dishes found' })
          continue
        }

        // Upsert dishes
        const stats = await upsertDishes(supabase, restaurant.id, extracted)

        // Mark menu as checked
        await supabase
          .from('restaurants')
          .update({ menu_last_checked: new Date().toISOString() })
          .eq('id', restaurant.id)

        results.push({
          restaurant_id: restaurant.id,
          name: restaurant.name,
          status: 'success',
          inserted: stats.inserted,
          updated: stats.updated,
          unchanged: stats.unchanged,
          total_dishes: extracted.dishes.length,
        })
      } catch (err) {
        console.error(`Error processing ${restaurant.name}:`, err)
        results.push({
          restaurant_id: restaurant.id,
          name: restaurant.name,
          status: `error: ${String(err)}`,
        })
      }

      // Rate limit between restaurants
      if (restaurants.length > 1) {
        await sleep(2000)
      }
    }

    const totalInserted = results.reduce((sum, r) => sum + (r.inserted || 0), 0)
    const totalUpdated = results.reduce((sum, r) => sum + (r.updated || 0), 0)
    const successCount = results.filter(r => r.status === 'success').length

    return new Response(JSON.stringify({
      processed: restaurants.length,
      success: successCount,
      total_inserted: totalInserted,
      total_updated: totalUpdated,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Menu refresh error:', error)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
