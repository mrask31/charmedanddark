/**
 * Seed script for Supabase products table
 * Creates sample physical home objects
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample products - replace with your actual 50 items
const sampleProducts = [
  {
    handle: 'gothic-candle-holder',
    title: 'Gothic Candle Holder',
    description: 'Hand-forged iron candle holder with intricate gothic detailing. Holds standard taper candles.',
    price: 68.00,
    stock_quantity: 12,
    category: 'Lighting',
  },
  {
    handle: 'velvet-throw-pillow',
    title: 'Velvet Throw Pillow',
    description: 'Luxurious black velvet pillow with subtle embroidered pattern. 18x18 inches.',
    price: 45.00,
    stock_quantity: 25,
    category: 'Textiles',
  },
  {
    handle: 'antique-mirror',
    title: 'Antique Mirror',
    description: 'Ornate wall mirror with aged brass frame. Adds depth and mystery to any space.',
    price: 120.00,
    stock_quantity: 8,
    category: 'Decor',
  },
  {
    handle: 'ceramic-skull-vase',
    title: 'Ceramic Skull Vase',
    description: 'Matte black ceramic vase in skull form. Perfect for dried flowers or branches.',
    price: 52.00,
    stock_quantity: 15,
    category: 'Decor',
  },
  {
    handle: 'leather-journal',
    title: 'Leather Journal',
    description: 'Hand-bound leather journal with aged paper. 200 pages of unlined parchment.',
    price: 38.00,
    stock_quantity: 30,
    category: 'Stationery',
  },
];

async function seedProducts() {
  console.log('Starting product seed...');

  try {
    const { data, error } = await supabase
      .from('products')
      .insert(sampleProducts)
      .select();

    if (error) {
      console.error('Error seeding products:', error);
      process.exit(1);
    }

    console.log(`Successfully seeded ${data?.length || 0} products`);
    console.log('Products:', data);
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

seedProducts();
