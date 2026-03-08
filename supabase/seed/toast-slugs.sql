-- Toast POS online ordering slugs for MV restaurants
-- URL pattern: https://order.toasttab.com/online/{slug}
-- Confirmed 2026-03-08

-- Oak Bluffs (11)
UPDATE restaurants SET toast_slug = 'lookout-tavern' WHERE name ILIKE '%lookout%tavern%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'sharkob' WHERE name ILIKE '%sharky%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'nancys' WHERE name ILIKE '%nancy%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'offshore-ale-co-30-kennebec-ave' WHERE name ILIKE '%offshore%ale%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'backyard-taco' WHERE (name ILIKE '%dos mas%' OR name ILIKE '%backyard%taco%') AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'thebarn' WHERE name ILIKE '%barn%bowl%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'tigerhawk-sandwich-co' WHERE name ILIKE '%tigerhawk%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'loudkitchenexp' WHERE name ILIKE '%loud%kitchen%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'mo''s-lunch' WHERE name ILIKE '%mo''s%lunch%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'chowder' WHERE name ILIKE '%chowder%company%' AND town = 'Oak Bluffs';
UPDATE restaurants SET toast_slug = 'nomans' WHERE name ILIKE '%noman%' AND town = 'Oak Bluffs';

-- Edgartown (12)
UPDATE restaurants SET toast_slug = 'town-bar-and-grill-mv' WHERE name ILIKE '%town%bar%grill%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'bad-martha-farmers-brewery-edgartown-270-upper-main-street' WHERE name ILIKE '%bad%martha%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'atria-137-upper-main-street' WHERE name ILIKE '%atria%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'sharkedg' WHERE name ILIKE '%sharky%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'rockfish-11-n-water-street' WHERE name ILIKE '%rockfish%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'behind-the-bookstore' WHERE name ILIKE '%behind%bookstore%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'wharf-pub' WHERE name ILIKE '%wharf%pub%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'alchemymv' WHERE name ILIKE '%alchemy%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'wicked-burger-258-upper-main-street' WHERE name ILIKE '%wicked%burger%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'great-harbor-market-199-upper-main-street' WHERE name ILIKE '%great%harbor%market%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = '19-raw-oyster-bar-19-church-street' WHERE name ILIKE '%19%raw%' AND town = 'Edgartown';
UPDATE restaurants SET toast_slug = 'cozycornercafemv' WHERE name ILIKE '%cozy%corner%' AND town = 'Edgartown';

-- Vineyard Haven (10)
UPDATE restaurants SET toast_slug = 'black-dog-tavern' WHERE name ILIKE '%black%dog%tavern%' AND town = 'Vineyard Haven';
UPDATE restaurants SET toast_slug = 'black-dog-bakery-cafe-vineyard-haven' WHERE name ILIKE '%black%dog%bakery%' AND town = 'Vineyard Haven';
UPDATE restaurants SET toast_slug = 'beach-road-mv-688-state-road' WHERE name ILIKE '%beach%road%' AND town = 'Vineyard Haven';
UPDATE restaurants SET toast_slug = 'ninasonbeachroad' WHERE name ILIKE '%nina%beach%' AND town = 'Vineyard Haven';
UPDATE restaurants SET toast_slug = 'la-strada-65-main-street' WHERE name ILIKE '%la%strada%' AND town = 'Vineyard Haven';
UPDATE restaurants SET toast_slug = 'artcliff-diner-39-beach-road' WHERE name ILIKE '%art%cliff%' AND town = 'Vineyard Haven';
UPDATE restaurants SET toast_slug = 'net-result-79-beach-road' WHERE name ILIKE '%net%result%' AND town = 'Vineyard Haven';
UPDATE restaurants SET toast_slug = 'garde-east-52-beach-road' WHERE name ILIKE '%garde%east%' AND town = 'Vineyard Haven';
UPDATE restaurants SET toast_slug = 'portopizza' WHERE name ILIKE '%porto%pizza%' AND town = 'Vineyard Haven';
UPDATE restaurants SET toast_slug = 'themakermv' WHERE name ILIKE '%maker%' AND town = 'Vineyard Haven';

-- West Tisbury (2)
UPDATE restaurants SET toast_slug = '7a-foods' WHERE name ILIKE '%7a%food%' AND town = 'West Tisbury';
UPDATE restaurants SET toast_slug = 'black-sheep-mercantile' WHERE name ILIKE '%black%sheep%' AND town = 'West Tisbury';
