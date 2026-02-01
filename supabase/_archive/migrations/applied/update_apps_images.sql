-- Update Apps category dish images
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/fzgbxwonitnqmeguqixn/sql

-- Brussels Sprouts
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1438118907704-7718ee9a191a?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%brussels%' OR LOWER(name) LIKE '%brussel%');

-- Calamari (crispy fried calamari)
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1604909052743-94e838986f24?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%calamari%';

-- Mozzarella Sticks / Cheese Curds
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%mozzarella%' OR LOWER(name) LIKE '%cheese curd%');

-- Onion Rings
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%onion ring%';

-- Crab Cakes
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1559742811-822873691df8?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%crab cake%';

-- Mussels
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1614618599445-c156d4e6d0e4?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%mussel%';

-- Shrimp
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%shrimp%';

-- Nachos
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%nacho%';

-- Quesadillas
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%quesadilla%' OR LOWER(name) LIKE '%dilla%');

-- Guacamole & Chips
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%guac%' OR LOWER(name) LIKE '%chips & %' OR LOWER(name) LIKE '%chips and%');

-- Spinach Artichoke Dip
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%spinach%' OR LOWER(name) LIKE '%artichoke%');

-- Pretzels
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1570128477959-c258d7d19a54?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%pretzel%';

-- Pickles
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1619057356645-3c1e0e8d4b33?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%pickle%';

-- Cauliflower
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%cauliflower%' OR LOWER(name) LIKE '%gobi%');

-- Soups
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%soup%' OR LOWER(name) LIKE '%bisque%' OR LOWER(name) LIKE '%chili%');

-- Bruschetta
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%bruschetta%';

-- Hummus
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%hummus%' OR LOWER(name) LIKE '%baba%');

-- Poke/Tuna
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%poke%' OR LOWER(name) LIKE '%tuna%');

-- Ceviche
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%ceviche%';

-- Oysters
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%oyster%';

-- Clams/Steamers
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1626645738196-c2a72c1491b9?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%clam%' OR LOWER(name) LIKE '%steamer%' OR LOWER(name) LIKE '%quahog%');

-- Egg Rolls/Rangoons
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1606525437679-037aca74a3e9?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%egg roll%' OR LOWER(name) LIKE '%rangoon%');

-- Dumplings/Potstickers
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%dumpling%' OR LOWER(name) LIKE '%potsticker%');

-- Meatballs
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%meatball%';

-- Sliders
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%slider%';

-- Cheese dishes (Burrata, Ricotta, Brie, Cheese Plate)
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%burrata%' OR LOWER(name) LIKE '%ricotta%' OR LOWER(name) LIKE '%brie%' OR LOWER(name) LIKE '%cheese plate%' OR LOWER(name) LIKE '%baked cheese%' OR LOWER(name) LIKE '%today''s cheese%');

-- Deviled Eggs
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1608039829572-f1d0e3f96f97?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%deviled%';

-- Bacon Lollipops
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%bacon lollipop%';

-- Scallops
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%scallop%';

-- Lobster
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1553247407-23251ce81f59?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%lobster%';

-- Chicken bites (Popcorn, Sesame, Pakora)
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%popcorn chicken%' OR LOWER(name) LIKE '%sesame chicken%' OR LOWER(name) LIKE '%chicken pakora%' OR LOWER(name) LIKE '%chilli chicken%');

-- Samosas/Pakoras
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%samosa%' OR LOWER(name) LIKE '%pakora%' OR LOWER(name) LIKE '%bhel%' OR LOWER(name) LIKE '%chaat%' OR LOWER(name) LIKE '%naan%');

-- Steak Skewers
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%skewer%';

-- Pork Belly/Ribs
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%pork belly%' OR LOWER(name) LIKE '%pork rib%');

-- Bread
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%bread%' OR LOWER(name) LIKE '%focaccia%');

-- Cornbread
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1597733153203-a54d0fbc47de?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%cornbread%';

-- Fries/Fritters
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%fries%' OR LOWER(name) LIKE '%frys%' OR LOWER(name) LIKE '%fritter%');

-- Poutine
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1578345218746-50a229b3d0f8?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%poutine%';

-- Potato Skins/Potatoes
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1568569350062-ebfa3cb195df?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%potato%';

-- Plantains
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1528750717929-32abb73d3bd9?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%plantain%';

-- Arancini/Risotto Balls
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%arancini%' OR LOWER(name) LIKE '%risotto ball%');

-- Tostadas
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%tostada%';

-- Jalapeno Poppers
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1619057356645-3c1e0e8d4b33?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%jalapeno%' OR LOWER(name) LIKE '%popper%');

-- Queso
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%queso%';

-- Charcuterie/Pate/Foie Gras
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%foie gras%' OR LOWER(name) LIKE '%pate%' OR LOWER(name) LIKE '%meat + cheese%' OR LOWER(name) LIKE '%mortadella%' OR LOWER(name) LIKE '%mezze%' OR LOWER(name) LIKE '%mediterranean%' OR LOWER(name) LIKE '%sampler%');

-- Croquettes/Codfish
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1559742811-822873691df8?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%croquette%' OR LOWER(name) LIKE '%codfish%' OR LOWER(name) LIKE '%coxinha%' OR LOWER(name) LIKE '%pastel%');

-- Raw Bar
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%raw bar%';

-- Ravioli
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%ravioli%';

-- Toast/Fig
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%toast%' OR LOWER(name) LIKE '%fig%');

-- Carrots
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%carrot%';

-- Cucumber
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%cucumber%';

-- Broccoli Rabe
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%broccoli rabe%';

-- Cabbage
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1598030343246-eec71cb44b32?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%cabbage%';

-- Eggplant
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%eggplant%';

-- Desserts (in apps category)
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%chocolate cake%';

UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%honey pie%';

UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%sorbet%';

-- Shishitos
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%shishito%';

-- Salmon/Tartare
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%salmon%' OR LOWER(name) LIKE '%tartare%');

-- Fish (Tinned, Bluefish)
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80'
WHERE category = 'apps' AND (LOWER(name) LIKE '%tinned fish%' OR LOWER(name) LIKE '%bluefish%');

-- Beets
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%beet%';

-- Giardiniera
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1619057356645-3c1e0e8d4b33?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%giardiniera%';

-- Garlic Bread
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%garlic bread%';

-- Coconut Shrimp (use shrimp image)
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%coconut shrimp%';

-- Sausage dishes
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1601628828688-632f38a5a7d0?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%sausage%' AND LOWER(name) NOT LIKE '%foie gras%';

-- Mac Fritters
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%mac fritter%';

-- Three Sisters (corn, beans, squash - use veggie)
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%three sisters%';

-- Polenta
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%polenta%';

-- Tempura
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1581781870027-04212e231e96?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%tempura%';

-- Lettuce Wraps
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%lettuce wrap%';

-- Seafood Medley
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%seafood medley%';

-- Town Triple Sampler
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%triple sampler%';

-- Waterside Potato Chips
UPDATE dishes SET photo_url = 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&q=80'
WHERE category = 'apps' AND LOWER(name) LIKE '%potato chip%';

-- Verify the update
SELECT name, photo_url FROM dishes WHERE category = 'apps' AND photo_url IS NOT NULL LIMIT 10;
