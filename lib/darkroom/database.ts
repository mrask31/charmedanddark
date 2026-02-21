/**
 * Database Update
 * Updates product images array in Supabase
 */

import { createClient } from '@supabase/supabase-js';

interface UpdateOptions {
  productHandle: string;
  imageUrls: string[]; // Now an array
}

export async function updateProductImage(options: UpdateOptions): Promise<void> {
  const { productHandle, imageUrls } = options;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Build images array with position metadata
    const images = imageUrls.map((url, index) => ({
      url,
      position: index,
      alt: `${productHandle} - Image ${index + 1}`,
    }));

    const { error } = await supabase
      .from('products')
      .update({ 
        images: images, // JSONB array
        image_url: imageUrls[0], // Keep first image for backward compatibility
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
