// scripts/check-lore.js
// Diagnostic script to check if lore is in Supabase
// Run with: node scripts/check-lore.js

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

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
