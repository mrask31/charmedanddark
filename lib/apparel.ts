/**
 * Apparel Data Foundation for Charmed & Dark - The Uniform
 * 
 * This module manages apparel items for /uniform route.
 * Supports both core uniform pieces and seasonal drops.
 * 
 * MIRROR ELIGIBILITY: Apparel is NEVER mirror-eligible.
 * Apparel introduces size/fit anxiety. The Mirror removes choice.
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ApparelCadence = 'core' | 'drop';

export type DropTag = 
  | 'valentines' 
  | 'halloween' 
  | 'winter' 
  | 'anniversary' 
  | 'limited';

export type ApparelCategory =
  | 'T-Shirts'
  | 'Hoodies'
  | 'Outerwear'
  | 'Accessories';

export interface ApparelItem {
  id: string;
  slug: string;
  name: string;
  category: ApparelCategory;
  cadence: ApparelCadence;
  dropTag?: DropTag;
  pricePublic: number;
  priceSanctuary: number;
  shortDescription: string;
  ritualIntro: string;
  details: string[];
  whoFor: string;
  images: string[];
  active: boolean;
  // Apparel is NEVER mirror-eligible (always false)
  mirrorEligible?: false;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate Sanctuary pricing (10% off public price)
 */
function calculateSanctuaryPrice(publicPrice: number): number {
  return Math.round(publicPrice * 0.9 * 100) / 100;
}

/**
 * Format price as USD currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price);
}

// ============================================
// APPAREL DATA
// ============================================

export const apparelItems: ApparelItem[] = [
  // CORE UNIFORM - T-Shirts
  {
    id: "tshirt-crest",
    slug: "crest-tee",
    name: "Crest Tee",
    category: "T-Shirts",
    cadence: "core",
    pricePublic: 32.00,
    priceSanctuary: calculateSanctuaryPrice(32.00),
    shortDescription: "Black tee with small chest crest. Quiet recognition.",
    ritualIntro: "Wear this and be recognized without announcing yourself.",
    details: [
      "100% combed cotton",
      "Unisex fit",
      "Small crest logo on left chest",
      "Pre-shrunk",
      "Machine wash cold, tumble dry low"
    ],
    whoFor: "For those who prefer symbols over statements.",
    images: [
      "/images/Female_tshirt.png",
      "/images/male_tshirt.png",
      "/images/male_female_tshirt.png"
    ],
    active: true
  },
  {
    id: "tshirt-full-graphic",
    slug: "full-graphic-tee",
    name: "Full Graphic Tee",
    category: "T-Shirts",
    cadence: "core",
    pricePublic: 36.00,
    priceSanctuary: calculateSanctuaryPrice(36.00),
    shortDescription: "Black tee with full back graphic. For those who commit.",
    ritualIntro: "The front stays quiet. The back speaks for you.",
    details: [
      "100% combed cotton",
      "Unisex fit",
      "Large back graphic print",
      "Small front chest logo",
      "Pre-shrunk",
      "Machine wash cold, tumble dry low"
    ],
    whoFor: "For those who let their exit do the talking.",
    images: [
      "/images/Blonde and Brunette females full graphic shirt.png",
      "/images/mohawk blonde in unisex shirt.png"
    ],
    active: true
  },

  // CORE UNIFORM - Hoodies
  {
    id: "hoodie-pullover",
    slug: "pullover-hoodie",
    name: "Pullover Hoodie",
    category: "Hoodies",
    cadence: "core",
    pricePublic: 58.00,
    priceSanctuary: calculateSanctuaryPrice(58.00),
    shortDescription: "Black pullover hoodie. Structured warmth.",
    ritualIntro: "Pull this on when the world gets loud. The hood stays up. You stay grounded.",
    details: [
      "80% cotton, 20% polyester fleece",
      "Unisex fit",
      "Embroidered chest logo",
      "Lined hood with drawstrings",
      "Kangaroo pocket",
      "Pre-shrunk",
      "Machine wash cold, tumble dry low"
    ],
    whoFor: "For those who need armor that breathes.",
    images: [
      "/images/Female_signature_hoodie.png",
      "/images/male_signature_hoodie.png",
      "/images/male_female_signature_and_zipup.png"
    ],
    active: true
  },
  {
    id: "hoodie-zip",
    slug: "zip-hoodie",
    name: "Zip Hoodie",
    category: "Hoodies",
    cadence: "core",
    pricePublic: 62.00,
    priceSanctuary: calculateSanctuaryPrice(62.00),
    shortDescription: "Black zip-up hoodie. Layered intention.",
    ritualIntro: "Zip it up or leave it open. Either way, you're covered.",
    details: [
      "80% cotton, 20% polyester fleece",
      "Unisex fit",
      "Full-length YKK zipper",
      "Embroidered chest logo",
      "Lined hood with drawstrings",
      "Side pockets",
      "Pre-shrunk",
      "Machine wash cold, tumble dry low"
    ],
    whoFor: "For those who layer with purpose.",
    images: [
      "/images/Female_zip_up_hoodie.png",
      "/images/Models with zip up hoodie.png",
      "/images/male_female_signature_and_zipup_2.png"
    ],
    active: true
  },

  // CORE UNIFORM - Accessories
  {
    id: "beanie",
    slug: "beanie",
    name: "Beanie",
    category: "Accessories",
    cadence: "core",
    pricePublic: 24.00,
    priceSanctuary: calculateSanctuaryPrice(24.00),
    shortDescription: "Black knit beanie. Warmth without commentary.",
    ritualIntro: "Cover your head. Keep the cold out. Stay present.",
    details: [
      "100% acrylic knit",
      "One size fits most",
      "Embroidered logo patch",
      "Cuffed design",
      "Hand wash cold, lay flat to dry"
    ],
    whoFor: "For those who dress for function first.",
    images: [
      "/images/female_beanie.png",
      "/images/female_beanie_white.png"
    ],
    active: true
  },

  // SEASONAL DROPS - Valentine's (ACTIVE)
  {
    id: "tshirt-valentines",
    slug: "valentines-tee",
    name: "Valentine's Tee",
    category: "T-Shirts",
    cadence: "drop",
    dropTag: "valentines",
    pricePublic: 38.00,
    priceSanctuary: calculateSanctuaryPrice(38.00),
    shortDescription: "Dark romance held in restraint. Limited run.",
    ritualIntro: "Love doesn't need to be loud. This shirt knows that.",
    details: [
      "100% combed cotton",
      "Unisex fit",
      "Heart graphic with gothic typography",
      "Limited edition print",
      "Pre-shrunk",
      "Machine wash cold, tumble dry low"
    ],
    whoFor: "For those who express love through symbols.",
    images: [
      "/images/Valentines Day Shirt.png"
    ],
    active: true
  },
  {
    id: "hoodie-valentines",
    slug: "valentines-hoodie",
    name: "Valentine's Hoodie",
    category: "Hoodies",
    cadence: "drop",
    dropTag: "valentines",
    pricePublic: 68.00,
    priceSanctuary: calculateSanctuaryPrice(68.00),
    shortDescription: "Embroidered heart detail. Romance in thread.",
    ritualIntro: "Wear your heart on your sleeve. Literally. Quietly.",
    details: [
      "80% cotton, 20% polyester fleece",
      "Unisex fit",
      "Hand-embroidered heart on sleeve",
      "Limited edition",
      "Lined hood with drawstrings",
      "Kangaroo pocket",
      "Pre-shrunk",
      "Machine wash cold, tumble dry low"
    ],
    whoFor: "For those who commit to the gesture.",
    images: [],
    active: true
  },

  // SEASONAL DROPS - Halloween (ACTIVE)
  {
    id: "tshirt-halloween",
    slug: "halloween-tee",
    name: "Halloween Tee",
    category: "T-Shirts",
    cadence: "drop",
    dropTag: "halloween",
    pricePublic: 38.00,
    priceSanctuary: calculateSanctuaryPrice(38.00),
    shortDescription: "The night returns. So do we.",
    ritualIntro: "October arrives. The veil thins. This shirt marks the season.",
    details: [
      "100% combed cotton",
      "Unisex fit",
      "Moon phase graphic with ravens",
      "Limited edition print",
      "Pre-shrunk",
      "Machine wash cold, tumble dry low"
    ],
    whoFor: "For those who wait all year for autumn.",
    images: [],
    active: true
  },

  // SEASONAL DROPS - Winter (INACTIVE - to prove the system)
  {
    id: "hoodie-winter",
    slug: "winter-hoodie",
    name: "Winter Hoodie",
    category: "Hoodies",
    cadence: "drop",
    dropTag: "winter",
    pricePublic: 64.00,
    priceSanctuary: calculateSanctuaryPrice(64.00),
    shortDescription: "Quiet armor for the long season. (Past drop)",
    ritualIntro: "The longest night. The coldest months. This hoodie held you through it.",
    details: [
      "80% cotton, 20% polyester fleece",
      "Unisex fit",
      "Snowflake constellation graphic",
      "Limited edition - sold out",
      "Lined hood with drawstrings",
      "Kangaroo pocket",
      "Pre-shrunk",
      "Machine wash cold, tumble dry low"
    ],
    whoFor: "For those who endure winter with grace.",
    images: [],
    active: false
  },

  // SEASONAL DROPS - Anniversary (INACTIVE)
  {
    id: "tshirt-anniversary",
    slug: "anniversary-tee",
    name: "Anniversary Tee",
    category: "T-Shirts",
    cadence: "drop",
    dropTag: "anniversary",
    pricePublic: 42.00,
    priceSanctuary: calculateSanctuaryPrice(42.00),
    shortDescription: "A mark of return. (Past drop)",
    ritualIntro: "One year. One crest. One reminder that you were here from the beginning.",
    details: [
      "100% combed cotton",
      "Unisex fit",
      "Special anniversary crest design",
      "Limited edition - sold out",
      "Numbered print run",
      "Pre-shrunk",
      "Machine wash cold, tumble dry low"
    ],
    whoFor: "For those who mark time with intention.",
    images: [],
    active: false
  },

  // CORE UNIFORM - Additional pieces
  {
    id: "tshirt-crop",
    slug: "crop-tee",
    name: "Crop Tee",
    category: "T-Shirts",
    cadence: "core",
    pricePublic: 34.00,
    priceSanctuary: calculateSanctuaryPrice(34.00),
    shortDescription: "Cropped black tee with chest logo. Restrained edge.",
    ritualIntro: "Show a little skin. Keep the rest to yourself.",
    details: [
      "100% combed cotton",
      "Fitted crop cut",
      "Small chest logo",
      "Cropped hem hits at natural waist",
      "Pre-shrunk",
      "Machine wash cold, tumble dry low"
    ],
    whoFor: "For those who balance restraint with revelation.",
    images: [
      "/images/Blonde wearing the charmed and dark crop shirt.png",
      "/images/Short red head 1 with crop.png",
      "/images/short red head 2 with crop.png"
    ],
    active: true
  },
  {
    id: "tshirt-gothic",
    slug: "gothic-tee",
    name: "Gothic Tee",
    category: "T-Shirts",
    cadence: "core",
    pricePublic: 32.00,
    priceSanctuary: calculateSanctuaryPrice(32.00),
    shortDescription: "Classic black tee with gothic crest. Timeless.",
    ritualIntro: "This is the uniform. Black. Simple. Unmistakable.",
    details: [
      "100% combed cotton",
      "Unisex fit",
      "Gothic crest graphic on chest",
      "Pre-shrunk",
      "Machine wash cold, tumble dry low"
    ],
    whoFor: "For those who know what they're about.",
    images: [
      "/images/Blonde woman wearing unisex black gothic t-shirt with Charmed and Dark crest logo..png",
      "/images/Man with neck tattoos wearing a Charmed and Dark unisex gothic t-shirt..png",
      "/images/Dark-haired woman with tattoos wearing a black 'Charmed and Dark' t-shirt with a small chest logo against a dark patterned wallpaper background..png"
    ],
    active: true
  }
];

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Get all active core uniform items
 */
export function getActiveCoreUniform(): ApparelItem[] {
  return apparelItems.filter(item => 
    item.cadence === 'core' && item.active === true
  );
}

/**
 * Get active drop items grouped by dropTag
 */
export function getActiveDrops(): Map<DropTag, ApparelItem[]> {
  const drops = new Map<DropTag, ApparelItem[]>();
  
  apparelItems
    .filter(item => item.cadence === 'drop' && item.active === true && item.dropTag)
    .forEach(item => {
      const tag = item.dropTag!;
      const existing = drops.get(tag) || [];
      drops.set(tag, [...existing, item]);
    });
  
  return drops;
}

/**
 * Get an apparel item by slug (only if active)
 */
export function getApparelBySlug(slug: string): ApparelItem | null {
  const item = apparelItems.find(item => item.slug === slug);
  return (item && item.active) ? item : null;
}

/**
 * Get related items (same category, different item, active only)
 */
export function getRelatedApparel(currentItem: ApparelItem, limit: number = 3): ApparelItem[] {
  return apparelItems
    .filter(item => 
      item.active &&
      item.id !== currentItem.id &&
      item.category === currentItem.category
    )
    .slice(0, limit);
}

/**
 * Get drop description text by tag
 */
export function getDropDescription(dropTag: DropTag): string {
  const descriptions: Record<DropTag, string> = {
    valentines: "Dark romance, held in restraint.",
    halloween: "The night returns. So do we.",
    winter: "Quiet armor for the long season.",
    anniversary: "A mark of return.",
    limited: "Made once. Kept by those who noticed."
  };
  
  return descriptions[dropTag];
}

/**
 * Get drop display name by tag
 */
export function getDropName(dropTag: DropTag): string {
  const names: Record<DropTag, string> = {
    valentines: "Valentine's",
    halloween: "Halloween",
    winter: "Winter",
    anniversary: "Anniversary",
    limited: "Limited"
  };
  
  return names[dropTag];
}
