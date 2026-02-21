/**
 * Database Update
 * Updates product image_url in Supabase
 */

import { createClient } from '@supabase/supabase-js';

interface UpdateOptions {
  productHandle: string;
  imageUrl: string;
}

export async function updateProductImage(options: UpdateOptions): Promise<void> {
  const { productHandle, imageUrl } = options;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { error } = await supabase
      .from('products')
      .update({ 
        image_url: imageUrl,
        last_synced_at: new Date().toISOString(),
      })
      .eq('handle', productHandle);

    if (error) {
      throw new Error(`Database update failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Database update error:', error);
    throw error;
  }
}
