/**
 * Shopify-driven Darkroom Pipeline
 * Automatically processes products tagged img:needs-brand
 */

import { removeBackground } from './background-removal';
import { generateBackground } from './background-generation';
import { compositeImage } from './compositor';
import { selectBackgroundForProduct, getBackgroundPrompt, BackgroundType } from './background-selector';
import { DarkroomLogger, generateRunId } from './logger';
import { getModelName } from '@/lib/google/gemini';
import {
  fetchProductsNeedingBranding,
  uploadImageToProduct,
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
  const run_id = generateRunId();
  const logger = new DarkroomLogger(run_id);

  logger.info('Starting Darkroom pipeline', { limit });

  try {
    // Step 1: Fetch products needing branding
    const fetchStart = logger.stepStart('fetch_products');
    const products = await fetchProductsNeedingBranding(limit);
    logger.stepSuccess('fetch_products', fetchStart, { products_found: products.length });

    if (products.length === 0) {
      logger.info('No products found needing branding');
      return results;
    }

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
        const result = await processProduct(product, logger);
        results.push(result);

        if (result.status === 'success') {
          progress.succeeded++;
        } else {
          progress.failed++;
        }
      } catch (error) {
        logger.error('Product processing failed', {
          product_id: product.id,
          handle: product.handle,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
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

    logger.info('Pipeline completed', {
      total: progress.total,
      succeeded: progress.succeeded,
      failed: progress.failed,
    });

    return results;
  } catch (error) {
    logger.error('Pipeline error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Process a single product through the Darkroom pipeline
 */
async function processProduct(
  product: ShopifyProductForDarkroom,
  logger: DarkroomLogger
): Promise<ProcessingResult> {
  const productContext = {
    product_id: product.id,
    handle: product.handle,
  };

  logger.info(`Processing product: ${product.title}`, {
    ...productContext,
    image_count: product.images.length,
  });

  const productStart = Date.now();

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

    // Validate all images have URLs
    const invalidImages = product.images.filter(img => !img || !img.url);
    if (invalidImages.length > 0) {
      throw new Error(`Product has ${invalidImages.length} images without URLs`);
    }

    // Step 1: AI selects best background with fallback
    const bgStart = logger.stepStart('select_background', productContext);
    let backgroundType: BackgroundType = 'stone'; // Default fallback
    
    try {
      const modelName = getModelName('darkroom');
      logger.info('Selecting background with AI', {
        ...productContext,
        model: modelName,
        purpose: 'darkroom',
      });
      
      backgroundType = await selectBackgroundForProduct(product.title, product.tags);
      
      // Validate response
      if (!['stone', 'candle', 'glass'].includes(backgroundType)) {
        logger.warning('Invalid background type returned, using fallback', {
          ...productContext,
          invalid_value: backgroundType,
          fallback: 'stone',
        });
        backgroundType = 'stone';
      }
      
      logger.stepSuccess('select_background', bgStart, {
        ...productContext,
        background_type: backgroundType,
      });
    } catch (error) {
      logger.stepError('select_background', bgStart, error instanceof Error ? error : String(error), {
        ...productContext,
        fallback: 'stone',
      });
      backgroundType = 'stone'; // Fallback on error
    }

    // Step 2: Generate background once
    const genStart = logger.stepStart('generate_background', {
      ...productContext,
      background_type: backgroundType,
    });
    const backgroundPrompt = getBackgroundPrompt(backgroundType);
    const background = await generateBackground({
      prompt: backgroundPrompt,
      width: 1024,
      height: 1024,
    });
    logger.stepSuccess('generate_background', genStart, productContext);

    // Step 3: Process each image
    const brandedImageUrls: string[] = [];
    const brandedMediaIds: string[] = [];

    for (let i = 0; i < product.images.length; i++) {
      const sourceImage = product.images[i];
      const imageContext = {
        ...productContext,
        image_index: i + 1,
        image_total: product.images.length,
      };

      logger.info(`Processing image ${i + 1}/${product.images.length}`, imageContext);
      const imageStart = Date.now();

      // Remove background
      const extractedImage = await removeBackground(sourceImage.url);

      // Composite onto background
      const compositedImage = await compositeImage({
        product: extractedImage,
        background: background,
        addShadow: true,
      });

      // Upload to Supabase as temporary hosting
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

      logger.info(`Image ${i + 1} processed`, {
        ...imageContext,
        duration_ms: Date.now() - imageStart,
        media_id: uploadResult.mediaId,
      });

      // Small delay between images
      if (i < product.images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Step 4: Skip media reordering (Phase 6A - no reorder yet)
    logger.stepSkip('reorder_media', 'Shopify processing delay - deferred to Phase 6B', productContext);

    // Step 5: Update tags
    const tagStart = logger.stepStart('update_tags', productContext);
    await updateProductTags(
      product.id,
      product.tags,
      ['img:branded', `bg:${backgroundType}`],
      ['img:needs-brand']
    );
    logger.stepSuccess('update_tags', tagStart, productContext);

    const totalDuration = Date.now() - productStart;
    logger.info(`Product processing complete: ${product.title}`, {
      ...productContext,
      status: 'success',
      duration_ms: totalDuration,
      background_type: backgroundType,
      images_processed: product.images.length,
    });

    return {
      productId: product.id,
      productHandle: product.handle,
      productTitle: product.title,
      status: 'success',
      backgroundType,
      imagesProcessed: product.images.length,
    };
  } catch (error) {
    const totalDuration = Date.now() - productStart;
    logger.error(`Product processing failed: ${product.title}`, {
      ...productContext,
      status: 'error',
      duration_ms: totalDuration,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return {
      productId: product.id,
      productHandle: product.handle,
      productTitle: product.title,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
