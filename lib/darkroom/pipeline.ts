/**
 * The Darkroom - Automated Image Processing Pipeline
 * Compositing-first architecture to preserve original product pixels
 */

import { removeBackground } from './background-removal';
import { generateBackground } from './background-generation';
import { compositeImage } from './compositor';
import { uploadToSupabase } from './storage';
import { updateProductImage } from './database';

export type PipelineStatus = 'pending' | 'extracting' | 'generating' | 'compositing' | 'uploading' | 'complete';

interface PipelineOptions {
  productHandle: string;
  productTitle: string;
  sourceImageUrl: string;
  onProgress?: (status: PipelineStatus) => void;
}

interface PipelineResult {
  imageUrl: string;
  productHandle: string;
}

export async function processImagePipeline(options: PipelineOptions): Promise<PipelineResult> {
  const { productHandle, productTitle, sourceImageUrl, onProgress } = options;

  try {
    // Step 1: Extract product (remove background)
    onProgress?.('extracting');
    const extractedImage = await removeBackground(sourceImageUrl);

    // Step 2: Generate branded background
    onProgress?.('generating');
    const background = await generateBackground({
      prompt: 'Dark brutalist concrete wall, moody single-source lighting, architectural shadows, empty space, product photography backdrop, matte finish',
      width: 1024,
      height: 1024,
    });

    // Step 3: Composite product onto background
    onProgress?.('compositing');
    const compositedImage = await compositeImage({
      product: extractedImage,
      background: background,
      addShadow: true,
    });

    // Step 4: Upload to Supabase Storage
    onProgress?.('uploading');
    const imageUrl = await uploadToSupabase({
      imageBuffer: compositedImage,
      filename: `${productHandle}.jpg`,
      bucket: 'products',
    });

    // Step 5: Update database
    await updateProductImage({
      productHandle,
      imageUrl,
    });

    return {
      imageUrl,
      productHandle,
    };
  } catch (error) {
    console.error(`Pipeline error for ${productHandle}:`, error);
    throw error;
  }
}
