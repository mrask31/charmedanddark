/**
 * Shopify-driven Darkroom Pipeline
 * Automatically processes products tagged img:needs-brand
 */

import { removeBackground } from './background-removal';
import { generateBackground } from './background-generation';
import { compositeImage } from './compositor';
import { selectBackgroundForProduct, getBackgroundPrompt, BackgroundType } from './background-selector';
import {
  fetchProductsNeedingBranding,
  uploadImageToProduct,
  reorderProductMedia,
  updateProductTags,
  ShopifyProductForDarkroom,
} from '@/lib/shopify/darkroom';

export interface ProcessingResult {
  productId: string;
  productHandle: string;
  productTitle: string;
  status: 'success' | 'error';
  backgroundType?: BackgroundType;
  imagesProcessed?: number;
  error?: string;
}

export interface PipelineProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  currentProduct?: string;
}

/**
 * Run automated Darkroom pipeline on Shopify products
 * @param limit - Max products to process (default 20)
 * @param onProgress - Progress callback
 */
export async function runShopifyDarkroomPipeline(
  limit: number = 20,
  onProgress?: (progress: PipelineProgress) => void
): Promise<ProcessingResult[]> {
  const results: ProcessingResult[] = [];

  try {
    // Step 1: Fetch products needing branding
    console.log('Fetching products tagged img:needs-brand...');
    const products = await fetchProductsNeedingBranding(limit);

    if (products.length === 0) {
      console.log('No products found needing branding');
      return results;
    }

    console.log(`Found ${products.length} products to process`);

    const progress: PipelineProgress = {
      total: products.length,
      processed: 0,
      succeeded: 0,
      failed: 0,
    };

    // Step 2: Process each product
    for (const product of products) {
      progress.currentProduct = product.title;
      onProgress?.(progress);

      try {
        const result = await processProduct(product);
        results.push(result);

        if (result.status === 'success') {
          progress.succeeded++;
        } else {
          progress.failed++;
        }
      } catch (error) {
        console.error(`Failed to process ${product.handle}:`, error);
        results.push({
          productId: product.id,
          productHandle: product.handle,
          productTitle: product.title,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        progress.failed++;
      }

      progress.processed++;
      onProgress?.(progress);

      // Add delay between products to avoid rate limits
      if (progress.processed < products.length) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    return results;
  } catch (error) {
    console.error('Pipeline error:', error);
    throw error;
  }
}

/**
 * Process a single product through the Darkroom pipeline
 */
async function processProduct(product: ShopifyProductForDarkroom): Promise<ProcessingResult> {
  console.log(`Processing: ${product.title} (${product.handle})`);

  try {
    // Safety check: Never process Printify products
    if (
      product.tags.includes('source:printify') ||
      product.tags.includes('dept:wardrobe')
    ) {
      throw new Error('Safety check failed: Product is Printify or Wardrobe');
    }

    // Verify required tags
    if (
      !product.tags.includes('source:faire') ||
      !product.tags.includes('dept:objects')
    ) {
      throw new Error('Product missing required tags (source:faire, dept:objects)');
    }

    if (product.images.length === 0) {
      throw new Error('Product has no images');
    }

    // Step 1: AI selects best background
    console.log(`  Selecting background for ${product.title}...`);
    const backgroundType = await selectBackgroundForProduct(product.title, product.tags);
    console.log(`  Selected background: ${backgroundType}`);

    // Step 2: Generate background once
    console.log(`  Generating ${backgroundType} background...`);
    const backgroundPrompt = getBackgroundPrompt(backgroundType);
    const background = await generateBackground({
      prompt: backgroundPrompt,
      width: 1024,
      height: 1024,
    });

    // Step 3: Process each image
    const brandedImageUrls: string[] = [];
    const brandedMediaIds: string[] = [];

    for (let i = 0; i < product.images.length; i++) {
      const sourceImage = product.images[i];
      console.log(`  Processing image ${i + 1}/${product.images.length}...`);

      // Remove background
      const extractedImage = await removeBackground(sourceImage.url);

      // Composite onto background
      const compositedImage = await compositeImage({
        product: extractedImage,
        background: background,
        addShadow: true,
      });

      // Upload to Shopify (Shopify will host the image)
      // We need to upload to a temporary location first, then use that URL
      // For now, we'll use Supabase Storage as temporary hosting
      const { uploadToSupabase } = await import('./storage');
      const tempUrl = await uploadToSupabase({
        imageBuffer: compositedImage,
        filename: `temp-shopify/${product.handle}-${i + 1}-${Date.now()}.jpg`,
        bucket: 'products',
      });

      // Upload to Shopify product
      const uploadResult = await uploadImageToProduct(
        product.id,
        tempUrl,
        `${product.title} - Branded ${i + 1}`
      );

      brandedImageUrls.push(uploadResult.url);
      brandedMediaIds.push(uploadResult.mediaId);

      // Small delay between images
      if (i < product.images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Step 4: Reorder media (branded images first)
    console.log(`  Reordering media...`);
    const existingMediaIds = product.images.map(img => img.id);
    const newMediaOrder = [...brandedMediaIds, ...existingMediaIds];
    await reorderProductMedia(product.id, newMediaOrder);

    // Step 5: Update tags
    console.log(`  Updating tags...`);
    await updateProductTags(
      product.id,
      product.tags,
      ['img:branded', `bg:${backgroundType}`],
      ['img:needs-brand']
    );

    console.log(`  ✓ Successfully processed ${product.title}`);

    return {
      productId: product.id,
      productHandle: product.handle,
      productTitle: product.title,
      status: 'success',
      backgroundType,
      imagesProcessed: product.images.length,
    };
  } catch (error) {
    console.error(`  ✗ Failed to process ${product.title}:`, error);
    return {
      productId: product.id,
      productHandle: product.handle,
      productTitle: product.title,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
