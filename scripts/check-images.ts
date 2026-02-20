/**
 * Check which products are missing images
 * Helps identify which product folders need to be created
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

interface ImageStatus {
  handle: string;
  title: string;
  hasFolder: boolean;
  hasHero: boolean;
  hasFront: boolean;
  hasHover: boolean;
}

async function checkImages() {
  console.log('🖼️  Checking product images...\n');

  // Fetch all products from Supabase
  const { data: products, error } = await supabase
    .from('products')
    .select('handle, title')
    .order('handle');

  if (error) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }

  if (!products || products.length === 0) {
    console.log('No products found in database.');
    console.log('Run "npm run seed-products" to add sample products.');
    return;
  }

  const productsDir = path.join(process.cwd(), 'public', 'products');
  const statuses: ImageStatus[] = [];

  for (const product of products) {
    const productDir = path.join(productsDir, product.handle);
    const hasFolder = fs.existsSync(productDir);
    
    const status: ImageStatus = {
      handle: product.handle,
      title: product.title,
      hasFolder,
      hasHero: hasFolder && fs.existsSync(path.join(productDir, 'hero.jpg')),
      hasFront: hasFolder && fs.existsSync(path.join(productDir, 'front.jpg')),
      hasHover: hasFolder && fs.existsSync(path.join(productDir, 'hover.jpg')),
    };

    statuses.push(status);
  }

  // Print results
  console.log(`Found ${products.length} products in database\n`);

  const complete = statuses.filter((s) => s.hasHero);
  const missing = statuses.filter((s) => !s.hasHero);

  console.log(`✅ Complete: ${complete.length}`);
  console.log(`❌ Missing: ${missing.length}\n`);

  if (missing.length > 0) {
    console.log('Products missing hero.jpg:\n');
    for (const status of missing) {
      console.log(`  ${status.handle}`);
      console.log(`    Title: ${status.title}`);
      console.log(`    Folder: ${status.hasFolder ? '✓' : '✗'}`);
      console.log('');
    }

    console.log('\nTo fix:');
    console.log('1. Create folder: public/products/[handle]/');
    console.log('2. Add hero.jpg (required)');
    console.log('3. Add front.jpg and hover.jpg (optional)');
  } else {
    console.log('All products have hero images! 🎉');
  }

  // Summary by image type
  console.log('\nImage Coverage:');
  console.log(`  Hero:  ${statuses.filter((s) => s.hasHero).length}/${statuses.length}`);
  console.log(`  Front: ${statuses.filter((s) => s.hasFront).length}/${statuses.length}`);
  console.log(`  Hover: ${statuses.filter((s) => s.hasHover).length}/${statuses.length}`);
}

checkImages();
