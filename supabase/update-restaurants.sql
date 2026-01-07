-- Update Restaurant Names and Coordinates
-- In-place updates to preserve foreign key relationships

-- Update Black Sheep → Black Dog (Vineyard Haven)
UPDATE restaurants
SET
  name = 'Black Dog',
  address = '20 Beach St Extension, Vineyard Haven, MA 02568',
  lat = 41.4547,
  lng = -70.6052
WHERE name = 'Black Sheep';

-- Update Linda Jean's Restaurant → Lookout Tavern (Oak Bluffs)
UPDATE restaurants
SET
  name = 'Lookout Tavern',
  address = '8 Seaview Ave, Oak Bluffs, MA 02557',
  lat = 41.4553,
  lng = -70.5628
WHERE name = 'Linda Jean''s Restaurant';

-- Verify updates
SELECT name, address, lat, lng
FROM restaurants
WHERE name IN ('Black Dog', 'Lookout Tavern')
ORDER BY name;
