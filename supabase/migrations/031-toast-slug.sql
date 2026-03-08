-- Add Toast POS online ordering slug
-- Links to: https://order.toasttab.com/online/{toast_slug}
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS toast_slug TEXT;
