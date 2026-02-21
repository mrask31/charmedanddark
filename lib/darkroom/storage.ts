/**
 * Supabase Storage Upload
 * Handles image upload to product-images bucket
 */

import { createClient } from '@supabase/supabase-js';

interface UploadOptions {
  imageBuffer: Buffer;
  filename: string;
  bucket: string;
}

export async function uploadToSupabase(options: UploadOptions): Promise<string> {
  const { imageBuffer, filename, bucket } = options;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true, // Overwrite if exists
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Storage upload error:', error);
    throw error;
  }
}
