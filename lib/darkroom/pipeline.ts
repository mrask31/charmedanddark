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
  sourceImageUrls: string[]; // Now an array
  onProgress?: (status: PipelineStatus) => void;
}

interface PipelineResult {
  imageUrls: string[]; // Now an array
  productHandle: string;
}

export async function processImagePipeline(options: PipelineOptions): Promise<PipelineResult> {
  const { productHandle, productTitle, sourceImageUrls, onProgress } = options;

  const processedImageUrls: string[] = [];

  try {
    // Process each image in the array
    for (let i = 0; i < sourceImageUrls.length; i++) {
      const sourceImageUrl = sourceImageUrls[i];
      
      // Step 1: Extract product (remove background)
      onProgress?.('extracting');
      const extractedImage = await removeBackground(sourceImageUrl);

      // Step 2: Generate branded background (reuse for all images of same product)
      if (i === 0) {
        onProgress?.('generating');
      }
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
        filename: `${productHandle}-${i + 1}.jpg`, // Add position suffix
        bucket: 'products',
      });

      processedImageUrls.push(imageUrl);
    }

    // Step 5: Update database with all image URLs
    await updateProductImage({
      productHandle,
      imageUrls: processedImageUrls,
    });

    return {
      imageUrls: processedImageUrls,
      productHandle,
    };
  } catch (error) {
    console.error(`Pipeline error for ${productHandle}:`, error);
    throw error;
  }
}
