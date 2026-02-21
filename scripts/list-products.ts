/**
 * List all products from database for image mapping
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listProducts() {
  const { data: products, error } = await supabase
    .from('products')
    .select('handle, title, category')
    .order('category, title');

  if (error || !products) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log(`\nTotal products: ${products.length}\n`);
  
  let currentCategory = '';
  for (const product of products) {
    if (product.category !== currentCategory) {
      currentCategory = product.category || 'Uncategorized';
      console.log(`\n=== ${currentCategory} ===\n`);
    }
    console.log(`${product.handle}`);
    console.log(`  ${product.title}`);
  }
}

listProducts();
