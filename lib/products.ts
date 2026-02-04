/**
 * Product Data Foundation for Charmed & Dark
 * 
 * This module serves as the single source of truth for product data
 * until Shopify integration is implemented.
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ProductStatus = "core" | "drop_candidate" | "hold" | "archive";

export type ProductRealm = "house" | "uniform";

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

export interface ProductVariant {
  id: string;
  label: string; // e.g., "8oz", "12oz", "Matte Black", "Set of 3"
  pricePublic: number;
  priceSanctuary: number;
  inStock: boolean;
  isDefault?: boolean;
  image?: string; // Optional variant-specific image
}

export interface ProductDescription {
  ritualIntro: string;
  objectDetails: string[];
  whoFor: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  realm: ProductRealm;
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
  variants?: ProductVariant[]; // Optional variants
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
  // CANDLES & SCENT (4 products)
  {
    id: "candle-midnight",
    slug: "midnight-candle",
    name: "Midnight Candle",
    realm: "house",
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
    inStock: true,
    mirrorEligible: true,
    mirrorRole: 'containment',
    variants: [
      {
        id: "candle-midnight-8oz",
        label: "8 oz",
        pricePublic: 28.00,
        priceSanctuary: calculateSanctuaryPrice(28.00),
        inStock: true,
        isDefault: true
      },
      {
        id: "candle-midnight-12oz",
        label: "12 oz",
        pricePublic: 32.00,
        priceSanctuary: calculateSanctuaryPrice(32.00),
        inStock: true
      },
      {
        id: "candle-midnight-16oz",
        label: "16 oz",
        pricePublic: 38.00,
        priceSanctuary: calculateSanctuaryPrice(38.00),
        inStock: true
      }
    ]
  },
  {
    id: "candle-three-star",
    slug: "three-star-candle",
    name: "Three Star Candle",
    realm: "house",
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
    inStock: true,
    mirrorEligible: true,
    mirrorRole: 'warmth',
    variants: [
      {
        id: "candle-three-star-8oz",
        label: "8 oz",
        pricePublic: 30.00,
        priceSanctuary: calculateSanctuaryPrice(30.00),
        inStock: true,
        isDefault: true
      },
      {
        id: "candle-three-star-12oz",
        label: "12 oz",
        pricePublic: 34.00,
        priceSanctuary: calculateSanctuaryPrice(34.00),
        inStock: true
      }
    ]
  },
  {
    id: "candle-solstice",
    slug: "solstice-candle",
    name: "Solstice Candle",
    realm: "house",
    category: "Candles & Scent",
    status: "core",
    pricePublic: 36.00,
    priceSanctuary: calculateSanctuaryPrice(36.00),
    shortDescription: "A candle for marking the turn of seasons.",
    description: {
      ritualIntro: "Light this when the days shift. When darkness lengthens or light returns. The flame marks time without urgency.",
      objectDetails: [
        "100% soy wax blend",
        "Cotton wick, lead-free",
        "Burn time: 50-55 hours",
        "Scent: Pine, amber, winter spice",
        "Hand-poured in small batches"
      ],
      whoFor: "For those who honor the turning of seasons."
    },
    images: [],
    inStock: true
  },
  {
    id: "incense-holder",
    slug: "incense-holder",
    name: "Incense Holder",
    realm: "house",
    category: "Candles & Scent",
    status: "core",
    pricePublic: 22.00,
    priceSanctuary: calculateSanctuaryPrice(22.00),
    shortDescription: "A simple holder for incense that needs no explanation.",
    description: {
      ritualIntro: "Place the stick. Light the tip. Let the smoke rise. This holder catches the ash without ceremony.",
      objectDetails: [
        "Cast iron construction",
        "Length: 10 inches",
        "Matte black finish",
        "Ash catch groove",
        "Wipe clean with damp cloth"
      ],
      whoFor: "For those who practice with smoke."
    },
    images: [],
    inStock: true
  },

  // TABLE & DISPLAY (6 products)
  {
    id: "dish-obsidian",
    slug: "obsidian-dish",
    name: "Obsidian Dish",
    realm: "house",
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
    inStock: true,
    mirrorEligible: true,
    mirrorRole: 'containment'
  },
  {
    id: "mirror-tabletop",
    slug: "tabletop-mirror",
    name: "Tabletop Mirror",
    realm: "house",
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
    inStock: true,
    mirrorEligible: true,
    mirrorRole: 'witness'
  },
  {
    id: "board-charcuterie",
    slug: "charcuterie-board",
    name: "Charcuterie Board",
    realm: "house",
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
    inStock: true,
    mirrorEligible: true,
    mirrorRole: 'boundary',
    variants: [
      {
        id: "board-charcuterie-small",
        label: "Small (12\")",
        pricePublic: 48.00,
        priceSanctuary: calculateSanctuaryPrice(48.00),
        inStock: true
      },
      {
        id: "board-charcuterie-medium",
        label: "Medium (16\")",
        pricePublic: 56.00,
        priceSanctuary: calculateSanctuaryPrice(56.00),
        inStock: true,
        isDefault: true
      },
      {
        id: "board-charcuterie-large",
        label: "Large (20\")",
        pricePublic: 68.00,
        priceSanctuary: calculateSanctuaryPrice(68.00),
        inStock: true
      }
    ]
  },
  {
    id: "tray-two-tier",
    slug: "two-tier-tray",
    name: "Two-Tier Tray",
    realm: "house",
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
    inStock: true,
    mirrorEligible: true,
    mirrorRole: 'boundary'
  },
  {
    id: "coasters-set",
    slug: "coaster-set",
    name: "Coaster Set",
    realm: "house",
    category: "Table & Display",
    status: "core",
    pricePublic: 32.00,
    priceSanctuary: calculateSanctuaryPrice(32.00),
    shortDescription: "Four coasters that protect surfaces without commentary.",
    description: {
      ritualIntro: "Place your cup. Protect the wood. These coasters do their work quietly.",
      objectDetails: [
        "Natural slate stone",
        "Diameter: 4 inches each",
        "Cork backing",
        "Set of 4",
        "Wipe clean with damp cloth"
      ],
      whoFor: "For those who care for their surfaces."
    },
    images: [],
    inStock: true
  },
  {
    id: "candleholder-pillar",
    slug: "pillar-candleholder",
    name: "Pillar Candleholder",
    realm: "house",
    category: "Table & Display",
    status: "core",
    pricePublic: 34.00,
    priceSanctuary: calculateSanctuaryPrice(34.00),
    shortDescription: "A weighted holder for pillar candles.",
    description: {
      ritualIntro: "Set the candle. Light the wick. This holder keeps the flame steady and the wax contained.",
      objectDetails: [
        "Cast iron construction",
        "Diameter: 5 inches",
        "Height: 2 inches",
        "Matte black finish",
        "Fits 3-4 inch pillar candles",
        "Wipe clean with damp cloth"
      ],
      whoFor: "For those who light candles with intention."
    },
    images: [],
    inStock: true
  },

  // DECOR OBJECTS (5 products)
  {
    id: "bookends-skull",
    slug: "skull-bookends",
    name: "Skull Bookends",
    realm: "house",
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
    inStock: true,
    mirrorEligible: true,
    mirrorRole: 'grounding'
  },
  {
    id: "vase-black",
    slug: "black-vase",
    name: "Black Vase",
    realm: "house",
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
    inStock: true,
    mirrorEligible: true,
    mirrorRole: 'grounding',
    variants: [
      {
        id: "vase-black-small",
        label: "Small (7\")",
        pricePublic: 36.00,
        priceSanctuary: calculateSanctuaryPrice(36.00),
        inStock: true
      },
      {
        id: "vase-black-medium",
        label: "Medium (9\")",
        pricePublic: 42.00,
        priceSanctuary: calculateSanctuaryPrice(42.00),
        inStock: true,
        isDefault: true
      },
      {
        id: "vase-black-large",
        label: "Large (12\")",
        pricePublic: 52.00,
        priceSanctuary: calculateSanctuaryPrice(52.00),
        inStock: true
      }
    ]
  },
  {
    id: "vase-heart",
    slug: "heart-vase",
    name: "Heart Vase",
    realm: "house",
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
  {
    id: "frame-photo",
    slug: "photo-frame",
    name: "Photo Frame",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 38.00,
    priceSanctuary: calculateSanctuaryPrice(38.00),
    shortDescription: "A frame for the images that matter.",
    description: {
      ritualIntro: "Choose one photo. Frame it. Let it hold the memory without clutter.",
      objectDetails: [
        "Black metal frame",
        "Fits 5x7 inch photos",
        "Glass front",
        "Easel back for tabletop display",
        "Wall mounting hardware included",
        "Wipe clean with soft cloth"
      ],
      whoFor: "For those who display memories with care."
    },
    images: [],
    inStock: true,
    variants: [
      {
        id: "frame-photo-5x7",
        label: "5x7\"",
        pricePublic: 38.00,
        priceSanctuary: calculateSanctuaryPrice(38.00),
        inStock: true,
        isDefault: true
      },
      {
        id: "frame-photo-8x10",
        label: "8x10\"",
        pricePublic: 48.00,
        priceSanctuary: calculateSanctuaryPrice(48.00),
        inStock: true
      }
    ]
  },
  {
    id: "bowl-offering",
    slug: "offering-bowl",
    name: "Offering Bowl",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 46.00,
    priceSanctuary: calculateSanctuaryPrice(46.00),
    shortDescription: "A bowl for objects that hold meaning.",
    description: {
      ritualIntro: "Stones. Shells. Small tokens. This bowl holds what you choose to keep close.",
      objectDetails: [
        "Glazed ceramic",
        "Diameter: 6 inches",
        "Depth: 3 inches",
        "Matte black exterior",
        "Glossy black interior",
        "Hand-wash recommended"
      ],
      whoFor: "For those who collect with intention."
    },
    images: [],
    inStock: true
  },

  // WALL OBJECTS (3 products)
  {
    id: "wall-art-stars",
    slug: "stars-wall-art",
    name: "Stars Wall Art",
    realm: "house",
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
    inStock: true,
    mirrorEligible: true,
    mirrorRole: 'witness'
  },
  {
    id: "wall-art-moon",
    slug: "moon-wall-art",
    name: "Moon Wall Art",
    realm: "house",
    category: "Wall Objects",
    status: "core",
    pricePublic: 78.00,
    priceSanctuary: calculateSanctuaryPrice(78.00),
    shortDescription: "Lunar phases rendered in quiet detail.",
    description: {
      ritualIntro: "The moon waxes. The moon wanes. This print marks the cycle without urgency.",
      objectDetails: [
        "Printed on archival paper",
        "Size: 18 x 24 inches",
        "Black background with silver moon phases",
        "Unframed (frame-ready)",
        "Shipped flat in protective sleeve"
      ],
      whoFor: "For those who track the turning of time."
    },
    images: [],
    inStock: true
  },
  {
    id: "wall-shelf",
    slug: "wall-shelf",
    name: "Wall Shelf",
    realm: "house",
    category: "Wall Objects",
    status: "core",
    pricePublic: 52.00,
    priceSanctuary: calculateSanctuaryPrice(52.00),
    shortDescription: "A floating shelf for objects that deserve elevation.",
    description: {
      ritualIntro: "Mount this. Place what matters. Let the objects float without clutter beneath.",
      objectDetails: [
        "Black metal construction",
        "Length: 24 inches",
        "Depth: 6 inches",
        "Weight capacity: 15 lbs",
        "Mounting hardware included",
        "Wipe clean with damp cloth"
      ],
      whoFor: "For those who display with intention."
    },
    images: [],
    inStock: true
  },

  // OBJECTS OF USE (4 products)
  {
    id: "sage-bundle",
    slug: "sage-bundle",
    name: "Sage Bundle",
    realm: "house",
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
    inStock: true,
    mirrorEligible: true,
    mirrorRole: 'return'
  },
  {
    id: "cheese-knives",
    slug: "cheese-knives",
    name: "Cheese Knives",
    realm: "house",
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
  {
    id: "journal-blank",
    slug: "blank-journal",
    name: "Blank Journal",
    realm: "house",
    category: "Objects of Use",
    status: "core",
    pricePublic: 28.00,
    priceSanctuary: calculateSanctuaryPrice(28.00),
    shortDescription: "A journal for thoughts that need no structure.",
    description: {
      ritualIntro: "Write what needs to be written. No prompts. No guidance. Just blank pages waiting.",
      objectDetails: [
        "Hardcover binding",
        "200 blank pages",
        "Acid-free paper",
        "Size: 5.5 x 8.5 inches",
        "Black linen cover",
        "Lay-flat binding"
      ],
      whoFor: "For those who write without instruction."
    },
    images: [],
    inStock: true
  },
  {
    id: "matches-long",
    slug: "long-matches",
    name: "Long Matches",
    realm: "house",
    category: "Objects of Use",
    status: "core",
    pricePublic: 12.00,
    priceSanctuary: calculateSanctuaryPrice(12.00),
    shortDescription: "Long matches for lighting candles with care.",
    description: {
      ritualIntro: "Strike. Light. Let the flame transfer. These matches give you time and distance.",
      objectDetails: [
        "Length: 11 inches",
        "Box of 50 matches",
        "Strike-anywhere tips",
        "Black-tipped matches",
        "Recyclable cardboard box"
      ],
      whoFor: "For those who light candles often."
    },
    images: [],
    inStock: true
  },

  // RITUAL DRINKWARE (3 products)
  {
    id: "mug-ritual",
    slug: "ritual-mug",
    name: "Ritual Mug",
    realm: "house",
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
    inStock: true,
    mirrorEligible: true,
    mirrorRole: 'warmth',
    variants: [
      {
        id: "mug-ritual-10oz",
        label: "10 oz",
        pricePublic: 26.00,
        priceSanctuary: calculateSanctuaryPrice(26.00),
        inStock: true
      },
      {
        id: "mug-ritual-12oz",
        label: "12 oz",
        pricePublic: 28.00,
        priceSanctuary: calculateSanctuaryPrice(28.00),
        inStock: true,
        isDefault: true
      },
      {
        id: "mug-ritual-16oz",
        label: "16 oz",
        pricePublic: 32.00,
        priceSanctuary: calculateSanctuaryPrice(32.00),
        inStock: true
      }
    ]
  },
  {
    id: "teapot",
    slug: "teapot",
    name: "Teapot",
    realm: "house",
    category: "Ritual Drinkware",
    status: "core",
    pricePublic: 58.00,
    priceSanctuary: calculateSanctuaryPrice(58.00),
    shortDescription: "A teapot for brewing with intention.",
    description: {
      ritualIntro: "Steep the leaves. Pour the tea. This pot makes the ritual feel deliberate.",
      objectDetails: [
        "Cast iron construction",
        "Capacity: 24 oz",
        "Matte black exterior",
        "Enamel interior",
        "Removable stainless steel infuser",
        "Hand-wash recommended"
      ],
      whoFor: "For those who brew tea as practice."
    },
    images: [],
    inStock: true
  },
  {
    id: "glass-set",
    slug: "glass-set",
    name: "Glass Set",
    realm: "house",
    category: "Ritual Drinkware",
    status: "core",
    pricePublic: 42.00,
    priceSanctuary: calculateSanctuaryPrice(42.00),
    shortDescription: "Four glasses for water, wine, or whatever you pour.",
    description: {
      ritualIntro: "Fill these. Drink from them. These glasses hold what you choose without judgment.",
      objectDetails: [
        "Smoked glass",
        "Capacity: 12 oz each",
        "Set of 4",
        "Dishwasher safe",
        "Stackable design"
      ],
      whoFor: "For those who drink with presence."
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
 * Get all House products (excludes archived items)
 */
export function getHouseProducts(): Product[] {
  return products.filter(product => 
    product.realm === 'house' && product.status !== 'archive'
  );
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
