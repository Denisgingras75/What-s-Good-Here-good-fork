-- Martha's Vineyard Restaurants - Master Seed
-- Safe to re-run: uses INSERT ... ON CONFLICT (name) DO UPDATE
-- Does NOT touch dishes (handled by individual menu files in menus/)
-- Run this in Supabase SQL Editor

-- ============================================
-- VINEYARD HAVEN
-- ============================================
INSERT INTO restaurants (name, address, lat, lng, town, cuisine) VALUES
('Black Sheep', '23 Main St, Vineyard Haven, MA 02568', 41.4545, -70.6036, 'Vineyard Haven', 'American'),
('Net Result', '79 Beach Rd, Vineyard Haven, MA 02568', 41.4555, -70.6025, 'Vineyard Haven', 'Seafood'),
('Art Cliff Diner', '39 Beach Rd, Vineyard Haven, MA 02568', 41.4540, -70.6020, 'Vineyard Haven', 'American'),
('Waterside Market', '76 Main St, Vineyard Haven, MA 02568', 41.4550, -70.6040, 'Vineyard Haven', 'Deli/Market'),
('Le Grenier French Restaurant', '96 Main St, Vineyard Haven, MA 02568', 41.4560, -70.6045, 'Vineyard Haven', 'French'),
('Black Dog Tavern', '20 Beach St Extension, Vineyard Haven, MA 02568', 41.4573, -70.6008, 'Vineyard Haven', 'American'),
('Beach Road', '79 Beach Rd, Vineyard Haven, MA 02568', 41.4556, -70.6024, 'Vineyard Haven', 'Seafood'),
('9 Craft Kitchen and Bar', '9 Main St, Vineyard Haven, MA 02568', 41.4541, -70.6033, 'Vineyard Haven', 'American'),
('Espresso Love', '17 Church St, Vineyard Haven, MA 02568', 41.4548, -70.6031, 'Vineyard Haven', 'Cafe')
ON CONFLICT (name) DO UPDATE SET
  address = EXCLUDED.address,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  town = EXCLUDED.town,
  cuisine = EXCLUDED.cuisine;

-- ============================================
-- OAK BLUFFS
-- ============================================
INSERT INTO restaurants (name, address, lat, lng, town, cuisine) VALUES
('Back Door Donuts', '5 Post Office Square, Oak Bluffs, MA 02557', 41.4545, -70.5615, 'Oak Bluffs', 'Bakery'),
('Nancy''s Restaurant', '29 Lake Ave, Oak Bluffs, MA 02557', 41.4560, -70.5630, 'Oak Bluffs', 'Seafood'),
('Offshore Ale Company', '30 Kennebec Ave, Oak Bluffs, MA 02557', 41.4550, -70.5620, 'Oak Bluffs', 'American'),
('Red Cat Kitchen', '14 Kennebec Ave, Oak Bluffs, MA 02557', 41.4548, -70.5618, 'Oak Bluffs', 'American'),
('Linda Jean''s Restaurant', '34 Circuit Ave, Oak Bluffs, MA 02557', 41.4552, -70.5625, 'Oak Bluffs', 'American'),
('Coop de Ville', '7 Docks, Oak Bluffs, MA 02557', 41.4558, -70.5592, 'Oak Bluffs', 'Seafood'),
('Martha''s Vineyard Chowder Company', '9 Oak Bluffs Ave, Oak Bluffs, MA 02557', 41.4544, -70.5613, 'Oak Bluffs', 'Seafood'),
('Lookout Tavern', '8 Seaview Ave, Oak Bluffs, MA 02557', 41.4565, -70.5588, 'Oak Bluffs', 'American'),
('MV Salads', '5 Post Office Square, Oak Bluffs, MA 02557', 41.4545, -70.5614, 'Oak Bluffs', 'Salads'),
('The Barn Bowl & Bistro', '13 Uncas Ave, Oak Bluffs, MA 02557', 41.4530, -70.5590, 'Oak Bluffs', 'American'),
('Sharky''s Cantina', '31 Circuit Ave, Oak Bluffs, MA 02557', 41.4551, -70.5622, 'Oak Bluffs', 'Mexican'),
('Biscuits', '14 Circuit Ave, Oak Bluffs, MA 02557', 41.4549, -70.5619, 'Oak Bluffs', 'Southern'),
('Bangkok Cuisine', '14 Kennebec Ave, Oak Bluffs, MA 02557', 41.4547, -70.5617, 'Oak Bluffs', 'Thai'),
('Vineyard Caribbean Cuisine', '72 Circuit Ave, Oak Bluffs, MA 02557', 41.4555, -70.5628, 'Oak Bluffs', 'Caribbean'),
('Town Bar', '37 Circuit Ave, Oak Bluffs, MA 02557', 41.4553, -70.5624, 'Oak Bluffs', 'American'),
('Porto Pizza', '14 Circuit Ave, Oak Bluffs, MA 02557', 41.4549, -70.5620, 'Oak Bluffs', 'Pizza'),
('Cozy Corner', '1 Lake Ave, Oak Bluffs, MA 02557', 41.4559, -70.5631, 'Oak Bluffs', 'Breakfast'),
('Ocean Club', '20 Kennebec Ave, Oak Bluffs, MA 02557', 41.4549, -70.5619, 'Oak Bluffs', 'Japanese'),
('Dock Street', '1 Circuit Ave Extension, Oak Bluffs, MA 02557', 41.4551, -70.5616, 'Oak Bluffs', 'American'),
('Catboat', '1 Main St, Oak Bluffs, MA 02557', 41.4557, -70.5608, 'Oak Bluffs', 'Seafood'),
('Wolf''s Den Pizzeria', '15 State Rd, Oak Bluffs, MA 02557', 41.4516, -70.5667, 'Oak Bluffs', 'Pizza'),
('Nat''s Nook', '76 Circuit Ave, Oak Bluffs, MA 02557', 41.4556, -70.5629, 'Oak Bluffs', 'American')
ON CONFLICT (name) DO UPDATE SET
  address = EXCLUDED.address,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  town = EXCLUDED.town,
  cuisine = EXCLUDED.cuisine;

-- ============================================
-- EDGARTOWN
-- ============================================
INSERT INTO restaurants (name, address, lat, lng, town, cuisine) VALUES
('Atria', '137 Main St, Edgartown, MA 02539', 41.3890, -70.5133, 'Edgartown', 'Fine Dining'),
('Alchemy Bistro & Bar', '71 Main St, Edgartown, MA 02539', 41.3895, -70.5130, 'Edgartown', 'Bistro'),
('Among The Flowers Cafe', '17 Mayhew Ln, Edgartown, MA 02539', 41.3885, -70.5125, 'Edgartown', 'Cafe'),
('The Seafood Shanty', '31 Dock St, Edgartown, MA 02539', 41.3880, -70.5120, 'Edgartown', 'Seafood'),
('L''etoile Restaurant', '22 N Water St, Edgartown, MA 02539', 41.3892, -70.5128, 'Edgartown', 'French'),
('Bettini Restaurant', '18 N Water St, Edgartown, MA 02539', 41.3891, -70.5126, 'Edgartown', 'Italian'),
('The Covington', '76 Main St, Edgartown, MA 02539', 41.3893, -70.5131, 'Edgartown', 'American'),
('Edgartown Pizza', '48 Main St, Edgartown, MA 02539', 41.3888, -70.5135, 'Edgartown', 'Pizza'),
('Garde East', '16 Main St, Edgartown, MA 02539', 41.3886, -70.5138, 'Edgartown', 'Fine Dining'),
('The Sweet Life Cafe', '63 Circuit Ave, Oak Bluffs, MA 02557', 41.4554, -70.5627, 'Oak Bluffs', 'Fine Dining'),
('Indigo', '58 N Water St, Edgartown, MA 02539', 41.3900, -70.5122, 'Edgartown', 'American')
ON CONFLICT (name) DO UPDATE SET
  address = EXCLUDED.address,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  town = EXCLUDED.town,
  cuisine = EXCLUDED.cuisine;

-- ============================================
-- WEST TISBURY / CHILMARK / AQUINNAH
-- ============================================
INSERT INTO restaurants (name, address, lat, lng, town, cuisine) VALUES
('State Road', '688 State Rd, West Tisbury, MA 02575', 41.3970, -70.6640, 'West Tisbury', 'American'),
('TigerHawk Sandwich Company', '236 State Rd, Vineyard Haven, MA 02568', 41.4300, -70.6330, 'Vineyard Haven', 'Sandwiches'),
('Mo''s Lunch', '10 Basin Rd, Chilmark, MA 02535', 41.3440, -70.7310, 'Chilmark', 'Seafood'),
('Rockfish', '19 Oak Bluffs Ave, Oak Bluffs, MA 02557', 41.4544, -70.5612, 'Oak Bluffs', 'Seafood'),
('The Attic', '137 Main St, Edgartown, MA 02539', 41.3890, -70.5132, 'Edgartown', 'Asian Fusion'),
('Square Rigger', '225 State Rd, Chilmark, MA 02535', 41.3530, -70.7230, 'Chilmark', 'Seafood')
ON CONFLICT (name) DO UPDATE SET
  address = EXCLUDED.address,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  town = EXCLUDED.town,
  cuisine = EXCLUDED.cuisine;

-- ============================================
-- VERIFY
-- ============================================
SELECT town, COUNT(*) as count
FROM restaurants
WHERE town IN ('Vineyard Haven', 'Oak Bluffs', 'Edgartown', 'West Tisbury', 'Chilmark', 'Aquinnah')
GROUP BY town
ORDER BY count DESC;
