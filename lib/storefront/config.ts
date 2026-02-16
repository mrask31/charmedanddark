/**
 * Storefront Configuration
 * Collection handles and featured product settings for Charmed & Dark
 */

export const STOREFRONT_CONFIG = {
  // Primary navigation collections
  collections: {
    apparel: 'apparel',
    apparelFeatured: 'apparel-featured',
    new: 'new',
    homeDecor: 'home-decor',
    decorFeatured: 'decor-featured',
  },
  
  // Capsule collections (brand identity)
  capsules: {
    stillness: 'stillness',
    afterHours: 'after-hours',
    solace: 'solace',
  },
  
  // Featured product limits
  limits: {
    homepageApparelFeatured: 12,
    homepageDecorPreview: 6,
    relatedProducts: 4,
  },
} as const;

export type CollectionHandle = keyof typeof STOREFRONT_CONFIG.collections | keyof typeof STOREFRONT_CONFIG.capsules;
