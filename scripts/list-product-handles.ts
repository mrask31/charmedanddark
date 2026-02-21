import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function listProductHandles() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data, error } = await supabase
      .from('products')
      .select('handle, title, id')
      .order('title');

    if (error) {
      console.error('Error fetching products:', error);
      process.exit(1);
    }

    console.log('\n=== Product Handles in Database ===\n');
    console.log('Total products:', data?.length || 0);
    console.log('\nHandle | Title');
    console.log('------|------');
    
    data?.forEach(product => {
      console.log(`${product.handle} | ${product.title}`);
    });

    console.log('\n=== CSV Format ===\n');
    console.log('product_handle,product_title,image_1,image_2');
    data?.slice(0, 5).forEach(product => {
      console.log(`${product.handle},${product.title},https://example.com/image1.jpg,https://example.com/image2.jpg`);
    });

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

listProductHandles();
