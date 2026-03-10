// scripts/check-lore.js
// Diagnostic script to check if lore is in Supabase
// Run with: node scripts/check-lore.js

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkLore() {
  console.log('Checking lore in Supabase...\n');
  
  const { data, error } = await supabase
    .from('products')
    .select('id, name, lore, description')
    .limit(5);

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Found ${data.length} products:\n`);
  
  data.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`);
    console.log(`   Has lore: ${!!product.lore}`);
    console.log(`   Lore length: ${product.lore?.length || 0} chars`);
    console.log(`   Lore preview: ${product.lore?.substring(0, 100) || 'NO LORE'}...`);
    console.log(`   Description: ${product.description?.substring(0, 100) || 'NO DESCRIPTION'}...`);
    console.log('');
  });
}

checkLore();
