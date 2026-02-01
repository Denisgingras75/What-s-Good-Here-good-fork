-- Move beef and duck dishes to 'entree' category
-- Run this in Supabase SQL Editor

UPDATE dishes SET category = 'entree'
WHERE name IN (
  'Steak Frites',
  'Beef Tenderloin',
  'Duck Breast',
  'Beef Bourguignon'
);

-- Verify changes
SELECT
  r.name as restaurant,
  d.name as dish_name,
  d.category
FROM dishes d
JOIN restaurants r ON d.restaurant_id = r.id
WHERE d.name IN (
  'Steak Frites',
  'Beef Tenderloin',
  'Duck Breast',
  'Beef Bourguignon'
)
ORDER BY r.name;
