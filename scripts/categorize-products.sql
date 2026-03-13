-- Categorize products in the Supabase products table
-- Run these statements in order

-- HOME DECOR: Candles, trays, wall decor, teacups, serving ware, book ends, home objects
UPDATE products
SET category = 'home-decor'
WHERE category IS NULL OR category NOT IN ('T-Shirt', 'Tank Top')
AND (
  -- Candles
  name ILIKE '%candle%' OR
  name ILIKE '%taper%' OR
  name ILIKE '%votive%' OR
  name ILIKE '%pillar%' OR
  description ILIKE '%candle%' OR
  
  -- Trays and serving ware
  name ILIKE '%tray%' OR
  name ILIKE '%plate%' OR
  name ILIKE '%bowl%' OR
  name ILIKE '%serving%' OR
  name ILIKE '%platter%' OR
  
  -- Wall decor
  name ILIKE '%wall%' OR
  name ILIKE '%mirror%' OR
  name ILIKE '%frame%' OR
  name ILIKE '%art%' OR
  name ILIKE '%tapestry%' OR
  name ILIKE '%hanging%' OR
  
  -- Teacups and drinkware
  name ILIKE '%teacup%' OR
  name ILIKE '%tea cup%' OR
  name ILIKE '%mug%' OR
  name ILIKE '%cup%' OR
  name ILIKE '%goblet%' OR
  name ILIKE '%chalice%' OR
  
  -- Book ends and shelving
  name ILIKE '%bookend%' OR
  name ILIKE '%book end%' OR
  name ILIKE '%shelf%' OR
  
  -- Home objects
  name ILIKE '%vase%' OR
  name ILIKE '%statue%' OR
  name ILIKE '%figurine%' OR
  name ILIKE '%sculpture%' OR
  name ILIKE '%decor%' OR
  name ILIKE '%ornament%' OR
  name ILIKE '%holder%' OR
  name ILIKE '%stand%' OR
  name ILIKE '%box%' OR
  name ILIKE '%chest%' OR
  name ILIKE '%jar%' OR
  name ILIKE '%vessel%' OR
  name ILIKE '%incense holder%' OR
  name ILIKE '%pillow%' OR
  name ILIKE '%cushion%' OR
  name ILIKE '%throw%' OR
  name ILIKE '%blanket%' OR
  name ILIKE '%rug%' OR
  name ILIKE '%mat%'
);

-- ACCESSORIES: Jewelry and accessories
UPDATE products
SET category = 'accessories'
WHERE category IS NULL OR category NOT IN ('T-Shirt', 'Tank Top')
AND (
  -- Jewelry
  name ILIKE '%necklace%' OR
  name ILIKE '%bracelet%' OR
  name ILIKE '%ring%' OR
  name ILIKE '%earring%' OR
  name ILIKE '%pendant%' OR
  name ILIKE '%charm%' OR
  name ILIKE '%anklet%' OR
  name ILIKE '%brooch%' OR
  name ILIKE '%pin%' OR
  
  -- Accessories
  name ILIKE '%bag%' OR
  name ILIKE '%purse%' OR
  name ILIKE '%wallet%' OR
  name ILIKE '%belt%' OR
  name ILIKE '%scarf%' OR
  name ILIKE '%hat%' OR
  name ILIKE '%beanie%' OR
  name ILIKE '%cap%' OR
  name ILIKE '%gloves%' OR
  name ILIKE '%socks%' OR
  name ILIKE '%accessory%' OR
  name ILIKE '%accessories%'
);

-- RITUAL: Crystals, smudge sticks, ritual objects
UPDATE products
SET category = 'ritual'
WHERE category IS NULL OR category NOT IN ('T-Shirt', 'Tank Top')
AND (
  -- Crystals
  name ILIKE '%crystal%' OR
  name ILIKE '%quartz%' OR
  name ILIKE '%amethyst%' OR
  name ILIKE '%obsidian%' OR
  name ILIKE '%selenite%' OR
  name ILIKE '%citrine%' OR
  name ILIKE '%rose quartz%' OR
  name ILIKE '%clear quartz%' OR
  name ILIKE '%black tourmaline%' OR
  name ILIKE '%labradorite%' OR
  name ILIKE '%moonstone%' OR
  name ILIKE '%stone%' OR
  name ILIKE '%gem%' OR
  
  -- Smudge and cleansing
  name ILIKE '%smudge%' OR
  name ILIKE '%sage%' OR
  name ILIKE '%palo santo%' OR
  name ILIKE '%incense%' OR
  name ILIKE '%resin%' OR
  name ILIKE '%frankincense%' OR
  name ILIKE '%myrrh%' OR
  
  -- Ritual objects
  name ILIKE '%altar%' OR
  name ILIKE '%ritual%' OR
  name ILIKE '%tarot%' OR
  name ILIKE '%oracle%' OR
  name ILIKE '%pendulum%' OR
  name ILIKE '%wand%' OR
  name ILIKE '%athame%' OR
  name ILIKE '%cauldron%' OR
  name ILIKE '%chalice%' OR
  name ILIKE '%pentacle%' OR
  name ILIKE '%grimoire%' OR
  name ILIKE '%spell%' OR
  name ILIKE '%potion%' OR
  name ILIKE '%offering%' OR
  description ILIKE '%ritual%' OR
  description ILIKE '%ceremony%' OR
  description ILIKE '%spiritual%'
);

-- Verify the categorization
SELECT 
  category,
  COUNT(*) as product_count
FROM products
WHERE hidden IS NULL OR hidden = false
GROUP BY category
ORDER BY category;

-- Show uncategorized products (NULL category)
SELECT 
  id,
  name,
  category
FROM products
WHERE (hidden IS NULL OR hidden = false)
  AND category IS NULL
ORDER BY name;
