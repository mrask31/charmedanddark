// scripts/restore-branded-names.js
// Restores custom branded product names from CSV to Supabase
// Run with: node scripts/restore-branded-names.js

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { getProducts as getProductsCSV } from '../lib/products-csv.js';

// Load .env.local explicitly
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function sanitizeHandle(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function restoreBrandedNames() {
  console.log('Starting branded name restoration...');
  
  const csvProducts = await getProductsCSV();
  console.log(`Found ${csvProducts.length} products in CSV`);

  let restored = 0;
  let notFound = 0;
  let errors = [];

  for (const csvProduct of csvProducts) {
    const handle = sanitizeHandle(csvProduct.slug || csvProduct.name);
    
    // Check if product exists in Supabase
    const { data: existing, error: fetchError } = await supabase
      .from('products')
      .select('id, name, handle')
      .eq('handle', handle)
      .single();

    if (fetchError || !existing) {
      notFound++;
      console.log(`Product not found in Supabase: ${csvProduct.name} (handle: ${handle})`);
      continue;
    }

    // Only update if the name is different (meaning it was overwritten by Shopify)
    if (existing.name !== csvProduct.name) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ name: csvProduct.name })
        .eq('handle', handle);

      if (updateError) {
        errors.push({ product: csvProduct.name, error: updateError.message });
        console.error(`Error restoring name for ${csvProduct.name}:`, updateError.message);
      } else {
        restored++;
        console.log(`Restored: "${existing.name}" → "${csvProduct.name}"`);
      }
    } else {
      console.log(`Skipped (name unchanged): ${csvProduct.name}`);
    }
  }

  console.log('\n=== Restoration Complete ===');
  console.log(`Total CSV products: ${csvProducts.length}`);
  console.log(`Names restored: ${restored}`);
  console.log(`Not found in Supabase: ${notFound}`);
  console.log(`Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  - ${e.product}: ${e.error}`));
  }
}

restoreBrandedNames();
