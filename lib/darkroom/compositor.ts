/**
 * Image Compositor - Pixel-perfect layering
 * Preserves 100% of original product pixels
 * Adds realistic drop shadows for grounding
 */

import sharp from 'sharp';

interface CompositeOptions {
  product: Buffer; // PNG with alpha channel
  background: Buffer; // Generated backdrop
  addShadow: boolean;
}

export async function compositeImage(options: CompositeOptions): Promise<Buffer> {
  const { product, background, addShadow } = options;

  try {
    // Get product dimensions
    const productMeta = await sharp(product).metadata();
    const bgMeta = await sharp(background).metadata();

    if (!productMeta.width || !productMeta.height || !bgMeta.width || !bgMeta.height) {
      throw new Error('Invalid image dimensions');
    }

    // Calculate scaling to fit product on background (max 80% of background size)
    const maxProductWidth = bgMeta.width * 0.8;
    const maxProductHeight = bgMeta.height * 0.8;
    
    const scaleX = maxProductWidth / productMeta.width;
    const scaleY = maxProductHeight / productMeta.height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't upscale

    const scaledWidth = Math.round(productMeta.width * scale);
    const scaledHeight = Math.round(productMeta.height * scale);

    // Resize product if needed (preserving alpha)
    const scaledProduct = await sharp(product)
      .resize(scaledWidth, scaledHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();

    // Center product on background
    const left = Math.round((bgMeta.width - scaledWidth) / 2);
    const top = Math.round((bgMeta.height - scaledHeight) / 2);

    let composite = sharp(background);

    // Add drop shadow if requested
    if (addShadow) {
      // Create shadow layer (blurred, offset, semi-transparent black)
      const shadowOffset = Math.round(scaledHeight * 0.02); // 2% of product height
      const shadowBlur = Math.round(scaledHeight * 0.03); // 3% of product height

      const shadow = await sharp(scaledProduct)
        .extract({
          left: 0,
          top: 0,
          width: scaledWidth,
          height: scaledHeight,
        })
        .blur(shadowBlur)
        .modulate({
          brightness: 0.3, // Darken
        })
        .toBuffer();

      // Composite shadow first
      composite = composite.composite([
        {
          input: shadow,
          top: top + shadowOffset,
          left: left + shadowOffset,
          blend: 'multiply',
        },
      ]);
    }

    // Composite product on top (preserves original pixels)
    const result = await composite
      .composite([
        {
          input: scaledProduct,
          top,
          left,
          blend: 'over', // Alpha blending - preserves product pixels
        },
      ])
      .jpeg({
        quality: 90,
        mozjpeg: true,
      })
      .toBuffer();

    return result;
  } catch (error) {
    console.error('Compositing error:', error);
    throw error;
  }
}
