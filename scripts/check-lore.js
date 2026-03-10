// scripts/check-lore.js
// Diagnostic script to check if lore is in Supabase
// Run with: node scripts/check-lore.js

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load .env.local explicitly
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Found' : 'Missing');
  console.error('\nMake sure these are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLore() {
  console.log('Checking lore in Supabase...');
  console.log('URL:', supabaseUrl);
  console.log('');
  
  // Get total count
  const { count: totalCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  
  // Get count with lore
  const { count: withLoreCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .not('lore', 'is', null);
  
  console.log(`Total products: ${totalCount}`);
  console.log(`Products with lore: ${withLoreCount}`);
  console.log(`Products without lore: ${totalCount - withLoreCount}`);
  console.log('');
  
  // Get sample products
  const { data, error } = await supabase
    .from('products')
    .select('id, name, lore, description')
    .limit(10);

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Sample of ${data.length} products:\n`);
  
  let cleanLoreCount = 0;
  let markdownLoreCount = 0;
  
  data.forEach((product, index) => {
    const hasMarkdown = product.lore?.startsWith('**') || false;
    if (hasMarkdown) {
      markdownLoreCount++;
    } else if (product.lore) {
      cleanLoreCount++;
    }
    
    console.log(`${index + 1}. ${product.name || 'null'}`);
    console.log(`   Has lore: ${!!product.lore}`);
    console.log(`   Format: ${hasMarkdown ? 'MARKDOWN (needs regeneration)' : 'CLEAN'}`);
    console.log(`   Lore length: ${product.lore?.length || 0} chars`);
    console.log(`   Lore preview: ${product.lore?.substring(0, 100) || 'NO LORE'}...`);
    console.log('');
  });
  
  console.log('Format Summary:');
  console.log(`  Clean lore: ${cleanLoreCount}`);
  console.log(`  Markdown lore (needs regeneration): ${markdownLoreCount}`);
}

checkLore();
