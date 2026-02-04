/**
 * Product Data Foundation for Charmed & Dark
 * 
 * This module serves as the single source of truth for product data
 * until Shopify integration is implemented.
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ProductStatus = "core" | "drop_candidate" | "hold";

export type ProductCategory =
  | "Candles & Scent"
  | "Ritual Drinkware"
  | "Wall Objects"
  | "Decor Objects"
  | "Table & Display"
  | "Objects of Use";

export type MirrorRole =
  | 'containment'
  | 'warmth'
  | 'witness'
  | 'boundary'
  | 'grounding'
  | 'return'
  | 'amplification'
  | 'orientation';

export interface ProductDescription {
  ritualIntro: string;
  objectDetails: string[];
  whoFor: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  status: ProductStatus;
  pricePublic: number;
  priceSanctuary: number;
  shortDescription: string;
  description: ProductDescription;
  images: string[];
  inStock: boolean;
  mirrorEligible?: boolean;
  mirrorRole?: MirrorRole;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert product name to URL-safe slug
 */
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Calculate Sanctuary pricing (10% off public price)
 */
function calculateSanctuaryPrice(publicPrice: number): number {
  return Math.round(publicPrice * 0.9 * 100) / 100;
}

// ============================================
// PRODUCT DATA
// ============================================

export const products: Product[] = [
  // CANDLES & SCENT
  {
    id: "candle-midnight-ritual",
    slug: "midnight-ritual-candle",
    name: "Midnight Ritual Candle",
    category: "Candles & Scent",
    status: "core",
    pricePublic: 32.00,
    priceSanctuary: calculateSanctuaryPrice(32.00),
    shortDescription: "A clean-burning candle for when the noise becomes too much.",
    description: {
      ritualIntro: "Light this when the world demands too much. The flame steadies. The room quiets. You return to yourself.",
      objectDetails: [
        "100% soy wax blend",
        "Cotton wick, lead-free",
        "Burn time: 40-45 hours",
        "Scent: Cedarwood, black pepper, smoke",
        "Hand-poured in small batches"
      ],
      whoFor: "For those who prefer stillness over spectacle."
    },
    images: [
      "/images/threeStarCandle1.png",
      "/images/threeStarCandle2.png"
    ],
    inStock: true
  },
  {
    id: "candle-three-star",
    slug: "three-star-candle",
    name: "Three Star Candle",
    category: "Candles & Scent",
    status: "core",
    pricePublic: 34.00,
    priceSanctuary: calculateSanctuaryPrice(34.00),
    shortDescription: "A ceremonial candle marked with three stars for intention-setting.",
    description: {
      ritualIntro: "Three stars. Three intentions. One flame to hold them all. This is not decoration—this is practice.",
      objectDetails: [
        "100% soy wax blend",
        "Cotton wick, lead-free",
        "Burn time: 45-50 hours",
        "Scent: Frankincense, myrrh, aged wood",
        "Embossed star symbols",
        "Hand-poured in small batches"
      ],
      whoFor: "For those who set intentions with care."
    },
    images: [
      "/images/threeStarCandle1.png",
      "/images/threeStarCandle2.png"
    ],
    inStock: true
  },

  // TABLE & DISPLAY
  {
    id: "trinket-dish-obsidian",
    slug: "obsidian-trinket-dish",
    name: "Obsidian Trinket Dish",
    category: "Table & Display",
    status: "core",
    pricePublic: 24.00,
    priceSanctuary: calculateSanctuaryPrice(24.00),
    shortDescription: "A small vessel for the objects that matter.",
    description: {
      ritualIntro: "Rings. Keys. The small things that hold weight. This dish gives them a place to rest.",
      objectDetails: [
        "Glazed ceramic",
        "Diameter: 4.5 inches",
        "Depth: 1 inch",
        "Matte black finish",
        "Hand-wash recommended"
      ],
      whoFor: "For those who curate with intention."
    },
    images: [
      "/images/BEST trinket dish, table top mirror, and sage.png",
      "/images/Another trinket dish and table top mirror.png"
    ],
    inStock: true
  },
  {
    id: "mirror-tabletop-reflection",
    slug: "reflection-tabletop-mirror",
    name: "Reflection Tabletop Mirror",
    category: "Table & Display",
    status: "core",
    pricePublic: 38.00,
    priceSanctuary: calculateSanctuaryPrice(38.00),
    shortDescription: "A mirror that reflects more than your face.",
    description: {
      ritualIntro: "Look into this and see what you need to see. Not vanity. Not performance. Just you, as you are.",
      objectDetails: [
        "Beveled glass mirror",
        "Black metal frame",
        "Height: 8 inches",
        "Width: 6 inches",
        "Adjustable angle stand",
        "Wipe clean with soft cloth"
      ],
      whoFor: "For those drawn to meaning beneath the surface."
    },
    images: [
      "/images/BEST trinket dish, table top mirror, and sage.png",
      "/images/Another trinket dish and table top mirror.png"
    ],
    inStock: true
  },
  {
    id: "charcuterie-board-ritual",
    slug: "ritual-charcuterie-board",
    name: "Ritual Charcuterie Board",
    category: "Table & Display",
    status: "core",
    pricePublic: 56.00,
    priceSanctuary: calculateSanctuaryPrice(56.00),
    shortDescription: "A serving board for gatherings that feel intentional.",
    description: {
      ritualIntro: "Set the table. Arrange the offerings. Make the meal feel like ceremony, not transaction.",
      objectDetails: [
        "Acacia wood",
        "Length: 16 inches",
        "Width: 10 inches",
        "Thickness: 0.75 inches",
        "Natural wood grain variations",
        "Hand-wash only, oil monthly"
      ],
      whoFor: "For those who host with presence."
    },
    images: [
      "/images/Charcuterie board.png",
      "/images/Cheese knives, charcuterie board, and 2 tier tray combined.png"
    ],
    inStock: true
  },
  {
    id: "two-tier-display-tray",
    slug: "two-tier-display-tray",
    name: "Two-Tier Display Tray",
    category: "Table & Display",
    status: "core",
    pricePublic: 48.00,
    priceSanctuary: calculateSanctuaryPrice(48.00),
    shortDescription: "A tiered tray for objects that deserve elevation.",
    description: {
      ritualIntro: "Display what matters. Elevate the small rituals. This tray holds space for the things you choose to see.",
      objectDetails: [
        "Black metal construction",
        "Two tiers with handles",
        "Bottom tier: 10 inches diameter",
        "Top tier: 7 inches diameter",
        "Height: 12 inches",
        "Wipe clean with damp cloth"
      ],
      whoFor: "For those who arrange their space like an altar."
    },
    images: [
      "/images/TwoTierPlatter.png",
      "/images/Cheese knives, charcuterie board, and 2 tier tray combined.png"
    ],
    inStock: true
  },

  // DECOR OBJECTS
  {
    id: "skull-bookends-pair",
    slug: "skull-bookends",
    name: "Skull Bookends (Pair)",
    category: "Decor Objects",
    status: "core",
    pricePublic: 64.00,
    priceSanctuary: calculateSanctuaryPrice(64.00),
    shortDescription: "Bookends that hold your collection with quiet authority.",
    description: {
      ritualIntro: "Books need weight. These skulls provide it. Not macabre. Not theatrical. Just present.",
      objectDetails: [
        "Resin construction",
        "Matte black finish",
        "Height: 6 inches each",
        "Width: 4 inches each",
        "Weighted base for stability",
        "Sold as pair",
        "Dust with soft cloth"
      ],
      whoFor: "For those who read with intention."
    },
    images: [
      "/images/Skull bookends.png"
    ],
    inStock: true
  },
  {
    id: "vase-black-ceramic",
    slug: "black-ceramic-vase",
    name: "Black Ceramic Vase",
    category: "Decor Objects",
    status: "core",
    pricePublic: 42.00,
    priceSanctuary: calculateSanctuaryPrice(42.00),
    shortDescription: "A vessel for stems that need no explanation.",
    description: {
      ritualIntro: "One branch. One stem. Sometimes that's enough. This vase holds what you choose to display.",
      objectDetails: [
        "Glazed ceramic",
        "Height: 9 inches",
        "Opening diameter: 3 inches",
        "Matte black exterior",
        "Glossy black interior",
        "Hand-wash recommended"
      ],
      whoFor: "For those who prefer restraint over abundance."
    },
    images: [
      "/images/black vase.png"
    ],
    inStock: true
  },
  {
    id: "vase-red-heart",
    slug: "red-heart-vase",
    name: "Red Heart Vase",
    category: "Decor Objects",
    status: "core",
    pricePublic: 44.00,
    priceSanctuary: calculateSanctuaryPrice(44.00),
    shortDescription: "A heart-shaped vessel for romantic gestures that feel earned.",
    description: {
      ritualIntro: "Love doesn't need to be loud. This vase holds a single rose or a quiet offering. That's enough.",
      objectDetails: [
        "Glazed ceramic",
        "Height: 7 inches",
        "Width: 6 inches",
        "Deep red glaze",
        "Heart-shaped silhouette",
        "Hand-wash recommended"
      ],
      whoFor: "For those who express love through objects."
    },
    images: [
      "/images/red heart vase.png"
    ],
    inStock: true
  },

  // WALL OBJECTS
  {
    id: "wall-art-black-gold-stars",
    slug: "black-gold-stars-wall-art",
    name: "Black & Gold Stars Wall Art",
    category: "Wall Objects",
    status: "core",
    pricePublic: 78.00,
    priceSanctuary: calculateSanctuaryPrice(78.00),
    shortDescription: "Celestial wall art that anchors a room without demanding attention.",
    description: {
      ritualIntro: "Stars on black. Gold on void. Hang this where you need a reminder that beauty doesn't need to shout.",
      objectDetails: [
        "Printed on archival paper",
        "Size: 18 x 24 inches",
        "Black background with gold star pattern",
        "Unframed (frame-ready)",
        "Shipped flat in protective sleeve"
      ],
      whoFor: "For those who decorate with restraint."
    },
    images: [
      "/images/Black and Gold Stars on all black background.png",
      "/images/Black and Gold Stars on patterned background - 1.png",
      "/images/Black and Gold Stars on real wall set up - BEST.png"
    ],
    inStock: true
  },

  // OBJECTS OF USE
  {
    id: "sage-bundle-ritual",
    slug: "ritual-sage-bundle",
    name: "Ritual Sage Bundle",
    category: "Objects of Use",
    status: "core",
    pricePublic: 18.00,
    priceSanctuary: calculateSanctuaryPrice(18.00),
    shortDescription: "White sage for clearing space and intention.",
    description: {
      ritualIntro: "Burn this when you need to reset. The smoke clears. The air shifts. You begin again.",
      objectDetails: [
        "California white sage",
        "Bundle length: 4 inches",
        "Sustainably harvested",
        "Tied with natural cotton string",
        "Burn in fireproof dish",
        "Never leave unattended"
      ],
      whoFor: "For those who practice clearing rituals."
    },
    images: [
      "/images/BEST trinket dish, table top mirror, and sage.png"
    ],
    inStock: true
  },
  {
    id: "cheese-knives-set",
    slug: "ritual-cheese-knives",
    name: "Ritual Cheese Knives (Set of 3)",
    category: "Objects of Use",
    status: "core",
    pricePublic: 36.00,
    priceSanctuary: calculateSanctuaryPrice(36.00),
    shortDescription: "A set of three knives for serving with intention.",
    description: {
      ritualIntro: "Cut. Spread. Serve. These knives make the act of hosting feel deliberate, not rushed.",
      objectDetails: [
        "Stainless steel blades",
        "Black resin handles",
        "Set includes: spreader, fork, cleaver",
        "Length: 6-7 inches each",
        "Hand-wash recommended",
        "Sold as set of 3"
      ],
      whoFor: "For those who serve with care."
    },
    images: [
      "/images/Cheese knives, charcuterie board, and 2 tier tray combined - 2.png",
      "/images/Cheese knives, charcuterie board, and 2 tier tray combined - 3.png"
    ],
    inStock: true
  },

  // RITUAL DRINKWARE
  {
    id: "mug-black-ceramic",
    slug: "black-ceramic-ritual-mug",
    name: "Black Ceramic Ritual Mug",
    category: "Ritual Drinkware",
    status: "core",
    pricePublic: 28.00,
    priceSanctuary: calculateSanctuaryPrice(28.00),
    shortDescription: "A mug for morning rituals that feel sacred.",
    description: {
      ritualIntro: "Coffee. Tea. Whatever steadies you. This mug holds it without commentary.",
      objectDetails: [
        "Glazed ceramic",
        "Capacity: 12 oz",
        "Matte black exterior",
        "Glossy black interior",
        "Comfortable handle",
        "Microwave and dishwasher safe"
      ],
      whoFor: "For those who take their mornings seriously."
    },
    images: [],
    inStock: true
  }
];

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Get a product by its slug
 */
export function getProductBySlug(slug: string): Product | undefined {
  return products.find(product => product.slug === slug);
}

/**
 * Get all products in a specific category
 */
export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter(product => product.category === category);
}

/**
 * Get all core products (excludes drop candidates and holds)
 */
export function getCoreProducts(): Product[] {
  return products.filter(product => product.status === "core");
}

/**
 * Get all in-stock products
 */
export function getInStockProducts(): Product[] {
  return products.filter(product => product.inStock);
}

/**
 * Get all product categories with counts
 */
export function getCategoriesWithCounts(): Array<{ category: ProductCategory; count: number }> {
  const categoryCounts = new Map<ProductCategory, number>();
  
  products.forEach(product => {
    const current = categoryCounts.get(product.category) || 0;
    categoryCounts.set(product.category, current + 1);
  });
  
  return Array.from(categoryCounts.entries()).map(([category, count]) => ({
    category,
    count
  }));
}

/**
 * Search products by name or description
 */
export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  
  return products.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.shortDescription.toLowerCase().includes(lowerQuery) ||
    product.description.ritualIntro.toLowerCase().includes(lowerQuery) ||
    product.description.whoFor.toLowerCase().includes(lowerQuery)
  );
}
