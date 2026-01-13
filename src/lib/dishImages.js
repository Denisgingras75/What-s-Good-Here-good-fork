// Smart keyword-to-image mapping for dishes
// Uses free Unsplash images with direct URLs

const KEYWORD_IMAGES = {
  // Appetizers & Snacks
  'pickle': 'https://images.unsplash.com/photo-1619057356645-3c1e0e8d4b33?w=800&q=80',
  'calamari': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
  'squid': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
  'crab cake': 'https://images.unsplash.com/photo-1559742811-822873691df8?w=800&q=80',
  'onion ring': 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=800&q=80',
  'brussels': 'https://images.unsplash.com/photo-1438118907704-7718ee9a191a?w=800&q=80',
  'sprout': 'https://images.unsplash.com/photo-1438118907704-7718ee9a191a?w=800&q=80',
  'mozzarella stick': 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=800&q=80',
  'nachos': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800&q=80',
  'guacamole': 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=800&q=80',
  'hummus': 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=800&q=80',
  'pretzel': 'https://images.unsplash.com/photo-1570128477959-c258d7d19a54?w=800&q=80',
  'meatball': 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&q=80',
  'slider': 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=800&q=80',
  'quesadilla': 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=800&q=80',
  'bruschetta': 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&q=80',
  'shrimp': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80',
  'prawn': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&q=80',
  'oyster': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
  'mussel': 'https://images.unsplash.com/photo-1614618599445-c156d4e6d0e4?w=800&q=80',
  'clam': 'https://images.unsplash.com/photo-1626645738196-c2a72c1491b9?w=800&q=80',
  'ceviche': 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=800&q=80',
  'deviled egg': 'https://images.unsplash.com/photo-1608039829572-f1d0e3f96f97?w=800&q=80',
  'egg roll': 'https://images.unsplash.com/photo-1606525437679-037aca74a3e9?w=800&q=80',
  'spring roll': 'https://images.unsplash.com/photo-1548507200-81e4a34d4ee4?w=800&q=80',
  'dumpling': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80',
  'potsticker': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80',
  'gyoza': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80',
  'edamame': 'https://images.unsplash.com/photo-1564894809611-1742fc40ed80?w=800&q=80',
  'cauliflower': 'https://images.unsplash.com/photo-1568702846914-96b305d2uj67?w=800&q=80',
  'artichoke': 'https://images.unsplash.com/photo-1580910365203-91ea9115a319?w=800&q=80',
  'spinach dip': 'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=800&q=80',
  'cheese plate': 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&q=80',
  'charcuterie': 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&q=80',

  // Proteins
  'steak': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80',
  'ribeye': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80',
  'filet': 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80',
  'sirloin': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80',
  'prime rib': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
  'lamb': 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?w=800&q=80',
  'pork chop': 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&q=80',
  'ribs': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
  'brisket': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80',
  'pulled pork': 'https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?w=800&q=80',
  'bacon': 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=800&q=80',
  'sausage': 'https://images.unsplash.com/photo-1601628828688-632f38a5a7d0?w=800&q=80',
  'chicken breast': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80',
  'rotisserie': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80',
  'duck': 'https://images.unsplash.com/photo-1580554530778-ca36943c8f35?w=800&q=80',

  // Seafood
  'salmon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
  'tuna': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  'cod': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
  'halibut': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
  'swordfish': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
  'scallop': 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=800&q=80',
  'lobster': 'https://images.unsplash.com/photo-1553247407-23251ce81f59?w=800&q=80',
  'crab': 'https://images.unsplash.com/photo-1559742811-822873691df8?w=800&q=80',
  'fish and chips': 'https://images.unsplash.com/photo-1579208030886-b937da0925dc?w=800&q=80',
  'fish & chips': 'https://images.unsplash.com/photo-1579208030886-b937da0925dc?w=800&q=80',

  // Soups
  'chowder': 'https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?w=800&q=80',
  'bisque': 'https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?w=800&q=80',
  'french onion': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
  'tomato soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
  'minestrone': 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=800&q=80',
  'gazpacho': 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&q=80',
  'ramen': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
  'pho': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80',

  // Salads
  'caesar': 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&q=80',
  'cobb': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  'greek salad': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
  'wedge': 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=800&q=80',
  'caprese': 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&q=80',
  'kale': 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&q=80',
  'arugula': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',

  // Pasta
  'spaghetti': 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80',
  'fettuccine': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&q=80',
  'alfredo': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&q=80',
  'carbonara': 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80',
  'bolognese': 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80',
  'lasagna': 'https://images.unsplash.com/photo-1619895092538-128341789043?w=800&q=80',
  'ravioli': 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=800&q=80',
  'gnocchi': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80',
  'penne': 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80',
  'linguine': 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80',
  'mac and cheese': 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=800&q=80',
  'mac & cheese': 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=800&q=80',
  'risotto': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80',

  // Pizza toppings
  'pepperoni': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80',
  'margherita': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
  'hawaiian': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  'meat lovers': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  'veggie pizza': 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800&q=80',
  'white pizza': 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&q=80',

  // Burgers
  'cheeseburger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
  'bacon burger': 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800&q=80',
  'mushroom burger': 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800&q=80',
  'veggie burger': 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&q=80',
  'turkey burger': 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=800&q=80',

  // Sandwiches
  'club sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80',
  'blt': 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=800&q=80',
  'reuben': 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=800&q=80',
  'grilled cheese': 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=800&q=80',
  'panini': 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&q=80',
  'cheesesteak': 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&q=80',
  'philly': 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&q=80',
  'cuban': 'https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=800&q=80',
  'po boy': 'https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=800&q=80',
  'wrap': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80',

  // Tacos & Mexican
  'taco': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
  'burrito': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80',
  'enchilada': 'https://images.unsplash.com/photo-1534352956036-cd81e27dd615?w=800&q=80',
  'fajita': 'https://images.unsplash.com/photo-1611250188496-e966043a0629?w=800&q=80',
  'carnitas': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
  'al pastor': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
  'carne asada': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
  'churro': 'https://images.unsplash.com/photo-1624371414361-e670edf4892e?w=800&q=80',

  // Breakfast
  'pancake': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
  'waffle': 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800&q=80',
  'french toast': 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80',
  'eggs benedict': 'https://images.unsplash.com/photo-1608039829572-f1d0e3f96f97?w=800&q=80',
  'omelette': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
  'omelet': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
  'scrambled': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
  'avocado toast': 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&q=80',
  'bagel': 'https://images.unsplash.com/photo-1585445490387-f47934b73b54?w=800&q=80',
  'croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',

  // Sushi & Asian
  'sashimi': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
  'nigiri': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
  'maki': 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80',
  'roll': 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80',
  'tempura': 'https://images.unsplash.com/photo-1581781870027-04212e231e96?w=800&q=80',
  'teriyaki': 'https://images.unsplash.com/photo-1609183480237-ccaec3c31cf9?w=800&q=80',
  'pad thai': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80',
  'fried rice': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80',
  'lo mein': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80',
  'curry': 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80',
  'tikka masala': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
  'tandoori': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
  'naan': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
  'samosa': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',

  // Sides
  'fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80',
  'french fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80',
  'sweet potato fries': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80',
  'truffle fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80',
  'tots': 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?w=800&q=80',
  'mashed potato': 'https://images.unsplash.com/photo-1591299177061-2151c67d4c9b?w=800&q=80',
  'baked potato': 'https://images.unsplash.com/photo-1568569350062-ebfa3cb195df?w=800&q=80',
  'coleslaw': 'https://images.unsplash.com/photo-1625938145744-533e82abab26?w=800&q=80',
  'cornbread': 'https://images.unsplash.com/photo-1597733153203-a54d0fbc47de?w=800&q=80',
  'mac': 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=800&q=80',

  // Chicken
  'wing': 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=800&q=80',
  'buffalo': 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=800&q=80',
  'tender': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80',
  'nugget': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80',
  'fried chicken': 'https://images.unsplash.com/photo-1626645738196-c2a72c1491b9?w=800&q=80',
  'chicken parm': 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800&q=80',
  'chicken parmesan': 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800&q=80',

  // Desserts
  'cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
  'cheesecake': 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=800&q=80',
  'brownie': 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=800&q=80',
  'cookie': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80',
  'ice cream': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80',
  'sundae': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80',
  'pie': 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=800&q=80',
  'tiramisu': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80',
  'creme brulee': 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&q=80',
  'donut': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
  'doughnut': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',

  // Poke bowls
  'poke': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  'bowl': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  'acai': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80',
}

// Get image URL for a dish based on its name
export function getDishImage(dishName) {
  if (!dishName) return null

  const nameLower = dishName.toLowerCase()

  // Check each keyword against the dish name
  for (const [keyword, imageUrl] of Object.entries(KEYWORD_IMAGES)) {
    if (nameLower.includes(keyword)) {
      return imageUrl
    }
  }

  return null // No match found, will fall back to category image
}
