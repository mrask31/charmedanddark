/**
 * Organize product images from public/images into public/products/[handle] folders
 * Maps image filenames to product handles based on content analysis
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Manual mapping of image files to product handles
const imageMapping: Record<string, string[]> = {
  // Candles
  'threeStarCandle1.png': ['celestial-taper-candles'],
  'threeStarCandle2.png': ['celestial-taper-candles'],
  'Candle with Ethos 2.png': ['obsidian-pillar-candle'],
  'Candle with Ethos 3.png': ['obsidian-pillar-candle'],
  
  // Serving & Kitchen
  'Charcuterie board.png': ['ebonized-serving-board'],
  'Cheese knives, charcuterie board, and 2 tier tray combined.png': ['matte-cheese-knife-set', 'ebonized-serving-board'],
  'Cheese knives, charcuterie board, and 2 tier tray combined - 2.png': ['matte-cheese-knife-set'],
  'Cheese knives, charcuterie board, and 2 tier tray combined - 3.png': ['matte-cheese-knife-set'],
  'TwoTierPlatter.png': ['two-tier-serving-stand'],
  
  // Sage & Ritual
  'BEST trinket dish, table top mirror, and sage.png': ['white-sage-bundle', 'clarity-ritual'],
  'Dark haired female burning sage with candles.png': ['white-sage-bundle'],
  'dark hair female burning sage with crystal candles.png': ['white-sage-bundle'],
  
  // Trinket Dishes & Mirrors
  'Trinket dish and table top mirror.png': ['brass-trinket-dish', 'gothic-table-mirror'],
  'Another trinket dish and table top mirror.png': ['brass-trinket-dish', 'gothic-table-mirror'],
  'Better trinket dish and table top mirror.png': ['brass-trinket-dish', 'gothic-table-mirror'],
  'BEST trinket dish, table top mirror, and sage.png': ['brass-trinket-dish', 'gothic-table-mirror'],
  
  // Vases
  'black vase.png': ['matte-black-vase'],
  'red heart vase.png': ['crimson-heart-vase'],
  
  // Bedding
  'BlushPinkBedding.png': ['blush-satin-pillowcase-set'],
  'Satin Sheets.png': ['midnight-satin-sheet-set'],
  'Satin Sheets 2.png': ['midnight-satin-sheet-set'],
  
  // Decor
  'Skull bookends.png': ['skull-bookend-set'],
  'Black and Gold Stars on real wall set up - BEST.png': ['constellation-wall-art'],
  'Black and Gold Stars on all black background.png': ['constellation-wall-art'],
  'Black and Gold Stars on patterned background - 1.png': ['constellation-wall-art'],
  'Black and Gold Stars on patterned background - 2.png': ['constellation-wall-art'],
  
  // Room Setups
  'Room set up with frankenstein and ottoman - 1.png': ['velvet-ottoman'],
  'Room set up with frankenstein and ottoman - 2.png': ['velvet-ottoman'],
};

async function organizeImages() {
  console.log('🖼️  Organizing product images...\n');

  // Fetch all products
  const { data: products, error } = await supabase
    .from('products')
    .select('handle, title, category')
    .order('handle');

  if (error || !products) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }

  const imagesDir = path.join(process.cwd(), 'public', 'images');
  const productsDir = path.join(process.cwd(), 'public', 'products');

  let organized = 0;
  let skipped = 0;

  // Process each mapping
  for (const [imageFile, productHandles] of Object.entries(imageMapping)) {
    const sourcePath = path.join(imagesDir, imageFile);
    
    if (!fs.existsSync(sourcePath)) {
      console.log(`⚠️  Image not found: ${imageFile}`);
      skipped++;
      continue;
    }

    for (const handle of productHandles) {
      const product = products.find(p => p.handle === handle);
      
      if (!product) {
        console.log(`⚠️  Product not found: ${handle}`);
        continue;
      }

      const productDir = path.join(productsDir, handle);
      
      // Create product directory if it doesn't exist
      if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true });
      }

      // Determine if this should be hero, front, or hover
      const existingHero = fs.existsSync(path.join(productDir, 'hero.jpg'));
      const existingFront = fs.existsSync(path.join(productDir, 'front.jpg'));
      
      let targetFilename = 'hero.jpg';
      if (existingHero && !existingFront) {
        targetFilename = 'front.jpg';
      } else if (existingHero && existingFront) {
        targetFilename = 'hover.jpg';
      }

      const targetPath = path.join(productDir, targetFilename);
      
      // Copy image
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ ${handle}/${targetFilename} ← ${imageFile}`);
      organized++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Organized: ${organized} images`);
  console.log(`   Skipped: ${skipped} images`);
  console.log(`\nRun "npm run check-images" to see coverage.`);
}

organizeImages();
