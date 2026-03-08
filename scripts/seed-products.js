// scripts/seed-products.js
// Run with: node scripts/seed-products.js
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { getProducts as getProductsCSV } from '../lib/products-csv.js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seed() {
  const csvProducts = await getProductsCSV();
  console.log(`Found ${csvProducts.length} products in CSV`);

  for (const p of csvProducts) {
    const record = {
      sku: p.sku || null,
      name: p.name,
      slug: p.slug || slugify(p.name),
      category: p.category || null,
      description: p.description || null,
      price: parseFloat(p.price) || 0,
      sale_price: p.salePrice ? parseFloat(p.salePrice) : null,
      qty: parseInt(p.qty) || 0,
      hidden: p.hidden === true || p.hidden === 'true',
      image_urls: Array.isArray(p.imageUrls) ? p.imageUrls : [],
      // Map to existing columns
      title: p.name,
      handle: p.slug || slugify(p.name),
      stock_quantity: parseInt(p.qty) || 0,
    };

    const { error } = await supabase
      .from('products')
      .upsert(record, { onConflict: 'slug' });

    if (error) {
      console.error(`Error seeding ${p.name}:`, error.message);
    } else {
      console.log(`Seeded: ${p.name}`);
    }
  }

  console.log('Seed complete.');
}

seed();
