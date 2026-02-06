/**
 * Product Data Foundation for Charmed & Dark
 * 
 * This module serves as the single source of truth for product data
 * until Shopify integration is implemented.
 * 
 * AUTO-GENERATED from data/canonical_products_pass1.csv and data/product_variants_pass1.csv
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
  label: string;
  pricePublic: number;
  priceSanctuary: number;
  inStock: boolean;
  isDefault?: boolean;
  image?: string;
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
  variants?: ProductVariant[];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function calculateSanctuaryPrice(publicPrice: number): number {
  return Math.round(publicPrice * 0.9 * 100) / 100;
}

// ============================================
// PRODUCT DATA
// ============================================

export const products: Product[] = [
  {
    id: "black-swan-whiskey-glass-set-of-4",
    slug: "black-swan-whiskey-glass-set-of-4",
    name: "The Black Swan",
    realm: "house",
    category: "Ritual Drinkware",
    status: "core",
    pricePublic: 50.00,
    priceSanctuary: calculateSanctuaryPrice(50.00),
    shortDescription: "Rare. Elegant. Dangerous. Sip your spirits from a vessel as mysterious as the night itself. The Black Swan Tumbler Set transforms the ritual of a nigh...",
    description: {
      ritualIntro: "Rare. Elegant. Dangerous. Sip your spirits from a vessel as mysterious as the night itself. The Black Swan Tumbler Set transforms the ritual of a nightcap into an act of dark devotion. Crafted from sl...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/assets_task_01k5qnjn0pfk59dh6a3apfzgaj_175850.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/BlackSwanOfWhiskeyGlassSetof4_img2.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/BlackSwanOfWhiskeyGlassSetof4_img1.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/BlackSwanOfWhiskeyGlassSetof4_img3.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/assets_task_01k5qnjn0pfk59dh6a3apfzgaj_175850.webp"],
    inStock: true
  },
  {
    id: "black-wood-board-small",
    slug: "black-wood-board-small",
    name: "The Midnight Plank",
    realm: "house",
    category: "Table & Display",
    status: "core",
    pricePublic: 34.00,
    priceSanctuary: calculateSanctuaryPrice(34.00),
    shortDescription: "A Foundation for Feasts and Spells. Simple, stark, and beautifully functional, The Midnight Plank is a versatile essential for the dark aesthetic home...",
    description: {
      ritualIntro: "A Foundation for Feasts and Spells. Simple, stark, and beautifully functional, The Midnight Plank is a versatile essential for the dark aesthetic home. Crafted from solid wood and finished in a deep, ...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/1d844c65-5bb5-4df4-9d7f-7c6f6d7d8f89/file-4ab3f0e.png"],
    inStock: true
  },
  {
    id: "brass-and-glass-soap-dish",
    slug: "brass-and-glass-soap-dish",
    name: "The Gilded Claw-Foot Vanity Dish",
    realm: "house",
    category: "Ritual Drinkware",
    status: "core",
    pricePublic: 22.00,
    priceSanctuary: calculateSanctuaryPrice(22.00),
    shortDescription: "A Vessel for Your Daily Rituals. Elevate the mundane to the magical with The Gilded Claw-Foot Vanity Dish . Inspired by the opulence of 19th-century E...",
    description: {
      ritualIntro: "A Vessel for Your Daily Rituals. Elevate the mundane to the magical with The Gilded Claw-Foot Vanity Dish . Inspired by the opulence of 19th-century English estates, this heavy glass vessel rests upon...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/VINTAG~1.PNG"],
    inStock: true
  },
  {
    id: "calming-crystal-candle-with-rough-amethyst",
    slug: "calming-crystal-candle-with-rough-amethyst",
    name: "The Amethyst Spire",
    realm: "house",
    category: "Candles & Scent",
    status: "core",
    pricePublic: 15.00,
    priceSanctuary: calculateSanctuaryPrice(15.00),
    shortDescription: "Ignite the Peace Within. Silence the noise of the outside world with The Amethyst Spire . Shaped like a raw quartz point and cast in a deep, mystical ...",
    description: {
      ritualIntro: "Ignite the Peace Within. Silence the noise of the outside world with The Amethyst Spire . Shaped like a raw quartz point and cast in a deep, mystical purple, this candle is a physical anchor for ritua...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Calming%20Purple_img1.jpeg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Calming%20Purple_img6.jpeg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Calming%20Purple_img3.jpeg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Calming%20Purple_img2.jpeg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Calming%20Purple_img4.jpeg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Calming%20Purple_img5.jpeg"],
    inStock: true
  },
  {
    id: "eclipse-path-moon-phase-necklace",
    slug: "eclipse-path-moon-phase-necklace",
    name: "Eclipse Path Moon Phase Necklace",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 26.99,
    priceSanctuary: calculateSanctuaryPrice(26.99),
    shortDescription: "Product Description Two chains. One rhythm. No effort required. The Eclipse Path Moon Phase Necklace pairs a sculptural moon phase bar with a contr...",
    description: {
      ritualIntro: "Product Description Two chains. One rhythm. No effort required. The Eclipse Path Moon Phase Necklace pairs a sculptural moon phase bar with a contrasting black enamel chain, creating a built-in layere...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/1000019103.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/1000018632.jpg"],
    inStock: true
  },
  {
    id: "creepy-nun-glass-ornament",
    slug: "creepy-nun-glass-ornament",
    name: "The Unholy Sister",
    realm: "house",
    category: "Ritual Drinkware",
    status: "core",
    pricePublic: 15.00,
    priceSanctuary: calculateSanctuaryPrice(15.00),
    shortDescription: "Pray She Doesn't Look Back. Summon a chill to your holiday décor with The Unholy Sister . A tribute to classic supernatural horror, this glass ornamen...",
    description: {
      ritualIntro: "Pray She Doesn't Look Back. Summon a chill to your holiday décor with The Unholy Sister . A tribute to classic supernatural horror, this glass ornament captures the terrifying visage of a possessed nu...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Scary%20glass%20nun%20ornament%20with%20yellow%20eyes%20and%20.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Gothic%20flat%20lay%20featuring%20the%20creepy%20glass%20nun.png"],
    inStock: true
  },
  {
    id: "crushed-velvet-4-piece-comforter-set",
    slug: "crushed-velvet-4-piece-comforter-set",
    name: "The Crushed Velvet Sanctuary Comforter Set",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 150.00,
    priceSanctuary: calculateSanctuaryPrice(150.00),
    shortDescription: "Wrap Yourself in Shadows and Softness. Create a bedroom fit for royalty with The Crushed Velvet Sanctuary Set . While standard bedding simply covers a...",
    description: {
      ritualIntro: "Wrap Yourself in Shadows and Softness. Create a bedroom fit for royalty with The Crushed Velvet Sanctuary Set . While standard bedding simply covers a mattress, this set drapes your bed in rich, multi...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Black%20crushed%20velvet%20comforter%20set%20with%20a%20diam.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/assets_task_01k5qkw05we3m8rxkx4at80pw8_175850.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Crushed%20Velvet%204-Piece%20Comforter%20or%20D-c9a788e.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Victorian%20Rose%20pink%20crushed%20velvet%204-piece%20com.png"],
    inStock: false,
    variants: [
      {
        id: "crs-vlv-4-pc-full-queen-black",
        label: "Full/Queen / Black",
        pricePublic: 150.00,
        priceSanctuary: calculateSanctuaryPrice(150.00),
        inStock: true,
        isDefault: true
      },
      {
        id: "crs-vlv-4-pc-full-queen-victorian-rose-blush",
        label: "Full/Queen / Victorian Rose (Blush)",
        pricePublic: 150.00,
        priceSanctuary: calculateSanctuaryPrice(150.00),
        inStock: true
      },
      {
        id: "crs-vlv-4-pc-king-cal-king-black",
        label: "King/Cal King / Black",
        pricePublic: 175.00,
        priceSanctuary: calculateSanctuaryPrice(175.00),
        inStock: true
      },
      {
        id: "crs-vlv-4-pc-king-cal-king-victorian-rose-blush",
        label: "King/Cal King / Victorian Rose (Blush)",
        pricePublic: 175.00,
        priceSanctuary: calculateSanctuaryPrice(175.00),
        inStock: true
      }
    ]
  },
  {
    id: "frankenstein-glass-ornament",
    slug: "frankenstein-glass-ornament",
    name: "Frankenstein's Holiday",
    realm: "house",
    category: "Ritual Drinkware",
    status: "core",
    pricePublic: 15.00,
    priceSanctuary: calculateSanctuaryPrice(15.00),
    shortDescription: "It's Alive... with Holiday Spirit. Bring a touch of classic horror to your yuletide celebrations with our Frankenstein’s Holiday Glass Ornament . This...",
    description: {
      ritualIntro: "It's Alive... with Holiday Spirit. Bring a touch of classic horror to your yuletide celebrations with our Frankenstein’s Holiday Glass Ornament . This isn't your average bauble; it's a statement piece...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Gothic%20holiday%20flat%20lay%20on%20black%20velvet%20featur.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Studio%20close-up%20of%20green%20glass%20Frankenstein%20bu.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Frankenstein%20monster%20glass%20ornament%20with%20Santa.png"],
    inStock: true
  },
  {
    id: "gothic-halloween-black-spider-teacup",
    slug: "gothic-halloween-black-spider-teacup",
    name: "The Weaver’s Teacup",
    realm: "house",
    category: "Ritual Drinkware",
    status: "core",
    pricePublic: 12.00,
    priceSanctuary: calculateSanctuaryPrice(12.00),
    shortDescription: "Sip Your Venom in Style. Embrace the elegance of the arachnid with The Weaver’s Teacup . This isn't your grandmother's fine China—unless your grandmot...",
    description: {
      ritualIntro: "Sip Your Venom in Style. Embrace the elegance of the arachnid with The Weaver’s Teacup . This isn't your grandmother's fine China—unless your grandmother was a hedge witch. Cast in midnight-black cera...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Halloween%20Spider%20teacup_img1.jpeg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Halloween%20Spider%20teacup_img5.jpeg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Halloween%20Spider%20Teacup_img3.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Halloween%20Spider%20Teacup_img2.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Halloween%20Spider%20Teacup_img4.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Halloween%20Spider%20teacup_img6.jpeg"],
    inStock: true
  },
  {
    id: "gothic-striped-bat-wing-halloween-teacup",
    slug: "gothic-striped-bat-wing-halloween-teacup",
    name: "The Midnight Striped Bat Wing Teacup",
    realm: "house",
    category: "Ritual Drinkware",
    status: "core",
    pricePublic: 14.00,
    priceSanctuary: calculateSanctuaryPrice(14.00),
    shortDescription: "Sip in gothic style with the Midnight Striped Bat Wing Teacup , a 490ml ceramic statement piece perfect for your dark aesthetic home decor. Elevate Yo...",
    description: {
      ritualIntro: "Sip in gothic style with the Midnight Striped Bat Wing Teacup , a 490ml ceramic statement piece perfect for your dark aesthetic home decor. Elevate Your Daily Ritual. Turn your morning brew or evening...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Gothic%20Striped%20Bat%20Wing%20Halloween%20Teacup%20Model.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Gothic%20Striped%20Bat%20Wing%20Halloween%20Teacup%20Hand.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Striped%20Bat%20Wing%20Halloweeen%20teacup_img1.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Gothic%20Striped%20Bat%20Wing%20Halloween%20Teacup%20on%20cl.png"],
    inStock: true
  },
  {
    id: "holiday-tree-ornaments",
    slug: "holiday-tree-ornaments",
    name: "The Gothic Legends Collection",
    realm: "house",
    category: "Ritual Drinkware",
    status: "core",
    pricePublic: 11.00,
    priceSanctuary: calculateSanctuaryPrice(11.00),
    shortDescription: "Deck the Halls with Darkness. Celebrate a Gothmas like no other with our exclusive Gothic Legends Collection . This series of hand-blown glass ornamen...",
    description: {
      ritualIntro: "Deck the Halls with Darkness. Celebrate a Gothmas like no other with our exclusive Gothic Legends Collection . This series of hand-blown glass ornaments pays tribute to the icons of horror, literature...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Gothic%20holiday%20flat%20lay%20with%20Medusa%20ornament%20o.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Gothic%20literary%20holiday%20decor%20featuring%20Edgar%20.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Black%20glass%20Christmas%20ornament%20featuring%20Edgar.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Black%20glass%20Christmas%20ornament%20featuring%20Count.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Gothic%20holiday%20flat%20lay%20with%20Dracula%20ornament%20.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Black%20glass%20Christmas%20ornament%20featuring%20the%20H.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Gothic%20holiday%20flat%20lay%20with%20Headless%20Horseman.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Black%20glass%20Christmas%20ornament%20featuring%20Medus.png"],
    inStock: false,
    variants: [
      {
        id: "hld-tr-rnm-edgar-allen-poe",
        label: "Edgar Allen Poe",
        pricePublic: 11.00,
        priceSanctuary: calculateSanctuaryPrice(11.00),
        inStock: true
      },
      {
        id: "hld-tr-rnm-dracula-spooky",
        label: "Dracula Spooky",
        pricePublic: 11.00,
        priceSanctuary: calculateSanctuaryPrice(11.00),
        inStock: true,
        isDefault: true
      },
      {
        id: "hld-tr-rnm-headless-horsemen",
        label: "Headless Horsemen",
        pricePublic: 11.00,
        priceSanctuary: calculateSanctuaryPrice(11.00),
        inStock: true
      },
      {
        id: "hld-tr-rnm-medussa",
        label: "Medussa",
        pricePublic: 11.00,
        priceSanctuary: calculateSanctuaryPrice(11.00),
        inStock: true
      }
    ]
  },
  {
    id: "halloween-skeleton-black-and-white-ornaments",
    slug: "halloween-skeleton-black-and-white-ornaments",
    name: "The Monochrome Macabre",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 45.00,
    priceSanctuary: calculateSanctuaryPrice(45.00),
    shortDescription: "Your Complete Gothmas Ritual in a Box. Transform your tree into a monument of dark elegance with The Monochrome Macabre Collection . This curated 40-p...",
    description: {
      ritualIntro: "Your Complete Gothmas Ritual in a Box. Transform your tree into a monument of dark elegance with The Monochrome Macabre Collection . This curated 40-piece set eliminates the guesswork of holiday styli...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Black%20gothic%20tabletop%20Christmas%20tree%20decorated.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Close-up%20of%20white%20skull%2C%20black%20bat%2C%20and%20stripe.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Halloween%20Skeleton%20Black%20and%20White%20Ornament%20S.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Halloween%20Skeleton%20Black%20and%20White%20Or-bfa9add.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Halloween%20Skeleton%20Black%20and%20White%20Or-0b1352e.webp"],
    inStock: true
  },
  {
    id: "heart-shaped-resin-flower-vase",
    slug: "heart-shaped-resin-flower-vase",
    name: "The Sacred Heart",
    realm: "house",
    category: "Wall Objects",
    status: "core",
    pricePublic: 25.00,
    priceSanctuary: calculateSanctuaryPrice(25.00),
    shortDescription: "Beauty is in the Veins. Move beyond traditional crystal and embrace the dark romance of the Sacred Heart Vase . Anatomically inspired and artistically...",
    description: {
      ritualIntro: "Beauty is in the Veins. Move beyond traditional crystal and embrace the dark romance of the Sacred Heart Vase . Anatomically inspired and artistically rendered, this resin vessel captures the intricat...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Deep%20red%20anatomical%20heart%20vase%20holding%20a%20bouqu.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/MATTEB~1.PNG","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Metallic%20gold%20anatomical%20heart%20vase%20filled%20wit.png"],
    inStock: false,
    variants: [
      {
        id: "hrt-shp-rsn-flw-black",
        label: "Black",
        pricePublic: 25.00,
        priceSanctuary: calculateSanctuaryPrice(25.00),
        inStock: true,
        isDefault: true
      },
      {
        id: "hrt-shp-rsn-flw-red",
        label: "Red",
        pricePublic: 25.00,
        priceSanctuary: calculateSanctuaryPrice(25.00),
        inStock: true
      },
      {
        id: "hrt-shp-rsn-flw-gold",
        label: "Gold",
        pricePublic: 25.00,
        priceSanctuary: calculateSanctuaryPrice(25.00),
        inStock: true
      }
    ]
  },
  {
    id: "lunar-arc-hammered-bracelet",
    slug: "lunar-arc-hammered-bracelet",
    name: "Lunar Arc Hammered Bracelet",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 19.99,
    priceSanctuary: calculateSanctuaryPrice(19.99),
    shortDescription: "Product Description A quiet ode to cycles, softness, and strength. The Lunar Arc Hammered Bracelet features a slender crescent moon, hand-hammered ...",
    description: {
      ritualIntro: "Product Description A quiet ode to cycles, softness, and strength. The Lunar Arc Hammered Bracelet features a slender crescent moon, hand-hammered to catch light with every movement. Minimal and fluid...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/10a21381-cd5f-477e-a31e-7c561fee1c51-1-51b333f.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/1000018628.jpg"],
    inStock: true
  },
  {
    id: "large-set-of-3-metallic-gold-cast-iron-starburst-wall-decor",
    slug: "large-set-of-3-metallic-gold-cast-iron-starburst-wall-decor",
    name: "The Gilded North Star Trio",
    realm: "house",
    category: "Wall Objects",
    status: "core",
    pricePublic: 38.00,
    priceSanctuary: calculateSanctuaryPrice(38.00),
    shortDescription: "Illuminate the Darkness. Bring the warmth of the cosmos into your home with The Gilded North Star Trio . Crafted from heavy cast iron and finished in ...",
    description: {
      ritualIntro: "Illuminate the Darkness. Bring the warmth of the cosmos into your home with The Gilded North Star Trio . Crafted from heavy cast iron and finished in an antiqued metallic gold, these eight-pointed sta...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Large%20Set%20of%203%20Metallic%20Gold%20Cast%20Iro-af409bc.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Black%20and%20Gold%20Stars%20on%20patterned%20background%20-.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Large%20Set%20of%203%20Metallic%20Gold%20Cast%20Iro-cf52c0c.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Large%20Set%20of%203%20Metallic%20Gold%20Cast%20Iro-92380b9.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Large%20Set%20of%203%20Metallic%20Gold%20Cast%20Iro-f21b2b0.webp"],
    inStock: true
  },
  {
    id: "luxury-satin-6-piece-sheet-set",
    slug: "luxury-satin-6-piece-sheet-set",
    name: "Midnight Black Satin 6-Piece Sheet Set",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 75.00,
    priceSanctuary: calculateSanctuaryPrice(75.00),
    shortDescription: "Slip into the Shadows. Transform your bedroom into a sanctuary of darkness and indulgence with The Nocturnal Satin Sheet Set . There is nothing quite ...",
    description: {
      ritualIntro: "Slip into the Shadows. Transform your bedroom into a sanctuary of darkness and indulgence with The Nocturnal Satin Sheet Set . There is nothing quite like the feeling of sliding into cool, liquid-blac...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Luxurious%20black%20satin%206-piece%20sheet%20set%20styled.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Satin%20Sheets.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Satin%20Sheets%202.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Unmade%20bed%20featuring%20luxurious%20black%20satin%20she.png"],
    inStock: false,
    variants: [
      {
        id: "lxr-stn-6-pc-queen",
        label: "Queen",
        pricePublic: 75.00,
        priceSanctuary: calculateSanctuaryPrice(75.00),
        inStock: true,
        isDefault: true
      },
      {
        id: "lxr-stn-6-pc-king",
        label: "King",
        pricePublic: 90.00,
        priceSanctuary: calculateSanctuaryPrice(90.00),
        inStock: true
      }
    ]
  },
  {
    id: "made-for-each-other-art-print",
    slug: "made-for-each-other-art-print",
    name: "Made For Each Other",
    realm: "house",
    category: "Wall Objects",
    status: "core",
    pricePublic: 43.00,
    priceSanctuary: calculateSanctuaryPrice(43.00),
    shortDescription: "A Love That Defies Nature. Celebrate the ultimate union of the underworld with Made For Each Other, an officially licensed fine art print by Mike Bell...",
    description: {
      ritualIntro: "A Love That Defies Nature. Celebrate the ultimate union of the underworld with Made For Each Other, an officially licensed fine art print by Mike Bell. This piece captures the electric connection betw...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Made%20for%20Each%20Other%20-%20Art%20Print_img2-3a7189a.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Made%20for%20Each%20Other%20-%20Art%20Print_img3-9867ab4.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Made%20for%20Each%20Other%20-%20Art%20Print_img4-ced5d76.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Made%20for%20Each%20Other%20-%20Art%20Print_img5-879f8f6.webp"],
    inStock: true
  },
  {
    id: "midnight-wing-dual-taper-candle-holder-matte-black",
    slug: "midnight-wing-dual-taper-candle-holder-matte-black",
    name: "Midnight Wing Dual-Taper Candle Holder - Matte Black",
    realm: "house",
    category: "Candles & Scent",
    status: "core",
    pricePublic: 34.00,
    priceSanctuary: calculateSanctuaryPrice(34.00),
    shortDescription: "Cast a shadow of elegance over your space with this distinctive Bat Candle Holder. Standing over 14 inches tall, this matte black metal piece features...",
    description: {
      ritualIntro: "Cast a shadow of elegance over your space with this distinctive Bat Candle Holder. Standing over 14 inches tall, this matte black metal piece features a classic turned-column base that rises into a st...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/A%20black%20metal%20bat-shaped%20candelabra%20holding%20tw.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Matte%20black%20bat%20candle%20holder%20featuring%20two%20li.jpg"],
    inStock: true
  },
  {
    id: "melancholy-monster-art-print",
    slug: "melancholy-monster-art-print",
    name: "Melancholy Monster",
    realm: "house",
    category: "Wall Objects",
    status: "core",
    pricePublic: 43.00,
    priceSanctuary: calculateSanctuaryPrice(43.00),
    shortDescription: "Beauty in the Broken. Capture the soulful, misunderstood nature of the world’s most iconic creature with Melancholy Monster. This officially licensed ...",
    description: {
      ritualIntro: "Beauty in the Broken. Capture the soulful, misunderstood nature of the world’s most iconic creature with Melancholy Monster. This officially licensed fine art print by Mike Bell moves beyond the horro...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Melancholy%20Monster%20Art%20-%20Art%20Print_img1.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Melancholy%20Monster%20Art%20-%20Art%20Print_img3.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Melancholy%20Monster%20Art%20-%20Art%20Print_img5.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Melancholy%20Monster%20Art%20-%20Art%20Print_img2.webp"],
    inStock: true
  },
  {
    id: "amorous-libation-art-print",
    slug: "amorous-libation-art-print",
    name: "Amorous Libation",
    realm: "house",
    category: "Wall Objects",
    status: "core",
    pricePublic: 43.00,
    priceSanctuary: calculateSanctuaryPrice(43.00),
    shortDescription: "Raise a Glass to Eternal Love. Cheers to the couple that was literally made for each other. Amorous Libation is a cheeky, romantic fine art print by M...",
    description: {
      ritualIntro: "Raise a Glass to Eternal Love. Cheers to the couple that was literally made for each other. Amorous Libation is a cheeky, romantic fine art print by Mike Bell that captures a quiet moment of connectio...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Amorous%20Libation%20-%20Art%20Print_img1.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Amorous%20Libation%20-%20Art%20Print_img2.webp"],
    inStock: true
  },
  {
    id: "mesa-18-piece-stoneware-dinnerware-set",
    slug: "mesa-18-piece-stoneware-dinnerware-set",
    name: "The Mesa Ritual Collection",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 70.00,
    priceSanctuary: calculateSanctuaryPrice(70.00),
    shortDescription: "The Foundation of Your Feast. Dining is more than just eating; it is a ritual. Set the stage for your next gathering with The Mesa Ritual Collection ,...",
    description: {
      ritualIntro: "The Foundation of Your Feast. Dining is more than just eating; it is a ritual. Set the stage for your next gathering with The Mesa Ritual Collection , a dinnerware set designed for those who appreciat...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Matte%20black%20stoneware%20dinner%20plate%2C%20salad%20plat.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/18%20piece%20Stoneware%20Dinnerware%20Set_img2.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/18%20piece%20Stoneware%20Dinnerware%20Set_img1.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/18%20piece%20Stoneware%20Dinnerware%20Set_img5.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/18%20piece%20Stoneware%20Dinnerware%20Set_img6.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/18%20piece%20Stoneware%20Dinnerware%20Set_img4.webp"],
    inStock: true
  },
  {
    id: "matte-black-cheese-knives-book-box",
    slug: "matte-black-cheese-knives-book-box",
    name: "The Midnight Feast",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 29.00,
    priceSanctuary: calculateSanctuaryPrice(29.00),
    shortDescription: "Sleek enough for a modern home. Dark enough for yours. Elevate your entertaining ritual with The Midnight Feast Knife Set . Forget traditional silverw...",
    description: {
      ritualIntro: "Sleek enough for a modern home. Dark enough for yours. Elevate your entertaining ritual with The Midnight Feast Knife Set . Forget traditional silverware; this trio is dipped in a deep, matte black fi...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Cheese%20knives%2C%20charcuterie%20board%2C%20and%20-6b66cd9.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Matte%20Black%20Cheese%20Knives%20Book%20Box_img4.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Matte%20Black%20Cheese%20Knives%20Book%20Box_img2.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Matte%20Black%20Cheese%20Knives%20Book%20Box_img1.webp"],
    inStock: true
  },
  {
    id: "undying-love-art-print",
    slug: "undying-love-art-print",
    name: "Undying Love",
    realm: "house",
    category: "Wall Objects",
    status: "core",
    pricePublic: 43.00,
    priceSanctuary: calculateSanctuaryPrice(43.00),
    shortDescription: "A Romance That Transcends the Grave. Celebrate a devotion that lasts longer than a lifetime with Undying Love, an exclusive art print by renowned arti...",
    description: {
      ritualIntro: "A Romance That Transcends the Grave. Celebrate a devotion that lasts longer than a lifetime with Undying Love, an exclusive art print by renowned artist Mike Bell. This piece captures the essence of g...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Undying%20Love_img1.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Undying%20Love_img2.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Undying%20Love_img3.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Made%20for%20Each%20Other%20-%20Art%20Print_img5-879f8f6.webp"],
    inStock: true
  },
  {
    id: "protection-crystal-candle-with-rough-black-obsidian",
    slug: "protection-crystal-candle-with-rough-black-obsidian",
    name: "The Obsidian Tower",
    realm: "house",
    category: "Candles & Scent",
    status: "core",
    pricePublic: 15.00,
    priceSanctuary: calculateSanctuaryPrice(15.00),
    shortDescription: "Burn the Wax, Reveal the Stone. Fortify your sacred space with The Obsidian Tower , a candle designed for banishing negativity and reclaiming your pow...",
    description: {
      ritualIntro: "Burn the Wax, Reveal the Stone. Fortify your sacred space with The Obsidian Tower , a candle designed for banishing negativity and reclaiming your power. Molded into the shape of a jagged black crysta...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Protection%20Crystal%20Candle%20with%20Rough%20-cab8152.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Protection%20Crystal%20Candle%20with%20Rough%20Black%20Ob.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Protection%20Crystal%20Candle%20with%20Rough%20Black%20Ob.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Protection%20Crystal%20Candle%20with%20Rough%20Black%20Ob.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Protection%20Crystal%20Candle%20with%20Rough%20Black%20Ob.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Protection%20Crystal%20Candle%20with%20Rough%20Black%20Ob.webp"],
    inStock: true
  },
  {
    id: "arcane-kisslock-bag-collection",
    slug: "arcane-kisslock-bag-collection",
    name: "Arcane Kisslock Bag Collection",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 24.99,
    priceSanctuary: calculateSanctuaryPrice(24.99),
    shortDescription: "Step into a world of vintage magic with the Arcane Kisslock Bag Collection — a lineup of statement purses designed for those who dress with intention....",
    description: {
      ritualIntro: "Step into a world of vintage magic with the Arcane Kisslock Bag Collection — a lineup of statement purses designed for those who dress with intention. Each piece features intricate embroidered artwork...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Mushroom.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Celistel%20Kisslock%20Bag%20Collection.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Celestial%20Mushroom%20Kiss%20Lock%20Bag%20in%20Linen%20Cot.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Moon%20Moth%20Vintage%20Kisslock%20Bag.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Romantasy%20Dragon%20Kiss%20Lock%20Bag%20in%20Linen%20Cotto.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Dragon.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Celestial.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Moth.png"],
    inStock: false,
    variants: [
      {
        id: "rcn-kss-bag-cll-celestial-kisslock-bag",
        label: "Celestial Kisslock Bag",
        pricePublic: 24.99,
        priceSanctuary: calculateSanctuaryPrice(24.99),
        inStock: true,
        isDefault: true
      },
      {
        id: "rcn-kss-bag-cll-celestial-mushroom-kiss-lock-bag-in-linen-cotton-blend-mater",
        label: "Celestial Mushroom Kiss Lock Bag in Linen Cotton Blend Mater",
        pricePublic: 24.99,
        priceSanctuary: calculateSanctuaryPrice(24.99),
        inStock: true
      },
      {
        id: "rcn-kss-bag-cll-moon-moth-vintage-kisslock-bag",
        label: "Moon Moth Vintage Kisslock Bag",
        pricePublic: 24.99,
        priceSanctuary: calculateSanctuaryPrice(24.99),
        inStock: true
      },
      {
        id: "rcn-kss-bag-cll-romantasy-dragon-kiss-lock-bag-in-linen-cotton-blend",
        label: "Romantasy Dragon Kiss Lock Bag in Linen Cotton Blend",
        pricePublic: 24.99,
        priceSanctuary: calculateSanctuaryPrice(24.99),
        inStock: true
      }
    ]
  },
  {
    id: "rectangle-vanity-mirror",
    slug: "rectangle-vanity-mirror",
    name: "The Victorian Oracle",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 32.00,
    priceSanctuary: calculateSanctuaryPrice(32.00),
    shortDescription: "Reflect on Your Darkest Desires. Transform your daily rituals into a moment of Victorian drama with The Victorian Oracle Mirror . This isn't just a lo...",
    description: {
      ritualIntro: "Reflect on Your Darkest Desires. Transform your daily rituals into a moment of Victorian drama with The Victorian Oracle Mirror . This isn't just a looking glass; it's a portal to a bygone era of eleg...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Gothic%20tabletop%20vanity%20mirror%20on%20a%20dark%20carved.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Vintage-style%20rectangular%20tabletop%20mirror%20with.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Rectangle%20Vanity%20Mirror.webp"],
    inStock: true
  },
  {
    id: "set-of-3-black-candy-cane-stripe-creepmas-taper-candles",
    slug: "set-of-3-black-candy-cane-stripe-creepmas-taper-candles",
    name: "The Shadow Stripe Taper Trio",
    realm: "house",
    category: "Candles & Scent",
    status: "core",
    pricePublic: 12.00,
    priceSanctuary: calculateSanctuaryPrice(12.00),
    shortDescription: "A Twisted Take on Tradition. Why dream of a white Christmas when you can have a dark one? The Shadow Stripe Taper Trio reimagines the classic candy ca...",
    description: {
      ritualIntro: "A Twisted Take on Tradition. Why dream of a white Christmas when you can have a dark one? The Shadow Stripe Taper Trio reimagines the classic candy cane aesthetic for those who prefer their holidays h...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Set%20of%203%20Black%20Candy%20Cane%20Stripe%20Creepmas%20Tap.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Set%20of%203%20Black%20Candy%20Cane%20Stripe%20Cree-9f2f380.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Set%20of%203%20Black%20Candy%20Cane%20Stripe%20Cree-e729a76.webp"],
    inStock: true
  },
  {
    id: "set-of-3-large-black-cast-iron-starburst-wall-hangings",
    slug: "set-of-3-large-black-cast-iron-starburst-wall-hangings",
    name: "The Obsidian Compass Stars",
    realm: "house",
    category: "Wall Objects",
    status: "core",
    pricePublic: 38.00,
    priceSanctuary: calculateSanctuaryPrice(38.00),
    shortDescription: "Navigate by the Shadows. Add a touch of celestial protection to your home with The Iron North Star Trio . Crafted from heavy cast iron and finished in...",
    description: {
      ritualIntro: "Navigate by the Shadows. Add a touch of celestial protection to your home with The Iron North Star Trio . Crafted from heavy cast iron and finished in a rustic matte black, these eight-pointed stars e...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/SETOFT~1.PNG","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Set%20of%20three%20black%20cast%20iron%20eight-pointed%20sta.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Black%20and%20Gold%20Stars%20on%20real%20wall%20set%20up%20-%20BES.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Set%20of%203%20Large%20Black%20Cast%20Iron%20Starbu-90be3e8.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Set%20of%203%20Large%20Black%20Cast%20Iron%20Starbu-4cfef16.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Set%20of%203%20Large%20Black%20Cast%20Iron%20Starbu-3c9f923.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Set%20of%203%20Large%20Black%20Cast%20Iron%20Starbu-3642eda.webp"],
    inStock: true
  },
  {
    id: "set-of-3-starry-night-celestial-taper-candles",
    slug: "set-of-3-starry-night-celestial-taper-candles",
    name: "The Starry Night Taper Trio",
    realm: "house",
    category: "Candles & Scent",
    status: "core",
    pricePublic: 12.00,
    priceSanctuary: calculateSanctuaryPrice(12.00),
    shortDescription: "Light the Cosmos. Bring the magic of a clear midnight sky to your altar or dining table with The Starry Night Taper Trio . These deep navy candles are...",
    description: {
      ritualIntro: "Light the Cosmos. Bring the magic of a clear midnight sky to your altar or dining table with The Starry Night Taper Trio . These deep navy candles are illustrated with a constellation of golden stars,...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Dark%20blue%20celestial%20taper%20candles%20with%20gold%20co.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Set%20of%203%20Starry%20Night%20Celestial%20Taper-80fb567.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Set%20of%203%20Starry%20Night%20Celestial%20Taper%20Candles.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Set%20of%203%20Starry%20Night%20Celestial%20Taper%20Candles.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Set%20of%203%20Starry%20Night%20Celestial%20Taper%20Candles.webp"],
    inStock: true
  },
  {
    id: "skull-book-ends-gothic-lifesize-human",
    slug: "skull-book-ends-gothic-lifesize-human",
    name: "The Catacomb Scholar",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 35.00,
    priceSanctuary: calculateSanctuaryPrice(35.00),
    shortDescription: "Guardians of Your Forbidden Knowledge. Keep your most treasured grimoires, leather-bound classics, and dark tales in order with The Catacomb Scholar B...",
    description: {
      ritualIntro: "Guardians of Your Forbidden Knowledge. Keep your most treasured grimoires, leather-bound classics, and dark tales in order with The Catacomb Scholar Bookend Set . Crafted with an incredibly realistic,...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Skull%20bookends.png/:/rs=w:600,h:600","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Skull%20Book%20Ends%20Gothic%20Lifesize%20Human_img1.webp/:/rs=w:600,h:600","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Skull%20Book%20Ends%20Gothic%20Lifesize%20Human_img4.webp/:/rs=w:600,h:600","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Skull%20Book%20Ends%20Gothic%20Lifesize%20Human_img5.webp/:/rs=w:600,h:600","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Skull%20Book%20Ends%20Gothic%20Lifesize%20Human_img2.webp/:/rs=w:600,h:600","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Skull%20Book%20Ends%20Gothic%20Lifesize%20Human_img8.webp/:/rs=w:600,h:600","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Skull%20Book%20Ends%20Gothic%20Lifesize%20Human_img7.webp/:/rs=w:600,h:600","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Skull%20Book%20Ends%20Gothic%20Lifesize%20Human_img6.webp/:/rs=w:600,h:600","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Skull%20Book%20Ends%20Gothic%20Lifesize%20Human_img3.webp/:/rs=w:600,h:600"],
    inStock: true
  },
  {
    id: "eternal-rest-coffin-studs",
    slug: "eternal-rest-coffin-studs",
    name: "Eternal Rest Coffin Studs",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 14.99,
    priceSanctuary: calculateSanctuaryPrice(14.99),
    shortDescription: "Product Description Small in scale, heavy in symbolism. The Eternal Rest Coffin Studs are a quiet nod to mortality, mystery, and devotion to the da...",
    description: {
      ritualIntro: "Product Description Small in scale, heavy in symbolism. The Eternal Rest Coffin Studs are a quiet nod to mortality, mystery, and devotion to the dark aesthetic. Minimalist coffin silhouettes in gold o...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/10a21381-cd5f-477e-a31e-7c561fee1c51-1_all_435.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/10a21381-cd5f-477e-a31e-7c561fee1c51-1-9cd3804.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/1000018622.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/1000018624.jpg"],
    inStock: false,
    variants: [
      {
        id: "trn-rst-cff-std-gold",
        label: "Gold",
        pricePublic: 14.99,
        priceSanctuary: calculateSanctuaryPrice(14.99),
        inStock: true,
        isDefault: true
      },
      {
        id: "trn-rst-cff-std-silver",
        label: "Silver",
        pricePublic: 14.99,
        priceSanctuary: calculateSanctuaryPrice(14.99),
        inStock: true
      }
    ]
  },
  {
    id: "two-tier-round-slate-stone-and-metal-serving-tray",
    slug: "two-tier-round-slate-stone-and-metal-serving-tray",
    name: "The Obsidian Tier",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 30.00,
    priceSanctuary: calculateSanctuaryPrice(30.00),
    shortDescription: "Serve Your Guests in Stone. Elevate your gatherings—or your altar—with The Obsidian Tier . Crafted from rough-hewn natural slate stone, this two-tiere...",
    description: {
      ritualIntro: "Serve Your Guests in Stone. Elevate your gatherings—or your altar—with The Obsidian Tier . Crafted from rough-hewn natural slate stone, this two-tiered stand brings the raw beauty of the earth into yo...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Two-tier%20slate%20and%20chrome%20serving%20stand%20displa.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Two-tier%20round%20natural%20slate%20and%20chrome%20displa.png"],
    inStock: true
  },
  {
    id: "void-moon-stud-earrings",
    slug: "void-moon-stud-earrings",
    name: "Void Moon Stud Earrings",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 14.99,
    priceSanctuary: calculateSanctuaryPrice(14.99),
    shortDescription: "Product Description Minimal, modern, and quietly magnetic. The Void Moon Stud Earrings feature an abstract crescent—open, weightless, and designed ...",
    description: {
      ritualIntro: "Product Description Minimal, modern, and quietly magnetic. The Void Moon Stud Earrings feature an abstract crescent—open, weightless, and designed to feel like a second skin. Sculptural without being ...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/1000018630.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/1000019101.jpg"],
    inStock: true
  },
  {
    id: "venus-ribbed-champagne-coupe-set-7oz-set-of-6",
    slug: "venus-ribbed-champagne-coupe-set-7oz-set-of-6",
    name: "The Sepia & Smoke Ribbed Coupe Set",
    realm: "house",
    category: "Ritual Drinkware",
    status: "core",
    pricePublic: 55.00,
    priceSanctuary: calculateSanctuaryPrice(55.00),
    shortDescription: "A Toast to the Old World. Transport your evening rituals back to the age of speakeasies and candlelight with the Sepia & Smoke Ribbed Coupe Set . This...",
    description: {
      ritualIntro: "A Toast to the Old World. Transport your evening rituals back to the age of speakeasies and candlelight with the Sepia & Smoke Ribbed Coupe Set . This stunning collection of six glasses moves beyond c...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/assets_task_01k5qn0yhhfmg8631a2nrvwrr-fc924ae.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Venus%20Ribbed%20Champagne%20Coupe%20Set%207oz%20-99b7f79.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Venus%20Ribbed%20Champagne%20Coupe%20Set%207oz%20%20Set%20of%20.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Venus%20Ribbed%20Champagne%20Coupe%20Set%207oz%20%20Set%20of%20.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Venus%20Ribbed%20Champagne%20Coupe%20Set%207oz%20-f1a271c.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/assets_task_01k5qn0yhhfmg8631a2nrvwrr-5bd55ed.webp"],
    inStock: true
  },
  {
    id: "wicked-witch-crescent-moon-glass-ornament",
    slug: "wicked-witch-crescent-moon-glass-ornament",
    name: "The Midnight Flight",
    realm: "house",
    category: "Ritual Drinkware",
    status: "core",
    pricePublic: 15.00,
    priceSanctuary: calculateSanctuaryPrice(15.00),
    shortDescription: "A Timeless Symbol of Magic. Celebrate the season of shadows with the Midnight Flight Witch Ornament , an exquisite piece of holiday décor that honors ...",
    description: {
      ritualIntro: "A Timeless Symbol of Magic. Celebrate the season of shadows with the Midnight Flight Witch Ornament , an exquisite piece of holiday décor that honors the old ways. This isn't just a decoration; it’s a...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Glass%20ornament%20of%20a%20witch%20flying%20on%20a%20broomsti.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Gothic%20flat%20lay%20featuring%20the%20witch%20and%20moon%20g.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Close-up%20studio%20photograph%20of%20hand-blown%20glass.png"],
    inStock: true
  },
  {
    id: "web-of-becoming-spider-lariat",
    slug: "web-of-becoming-spider-lariat",
    name: "Web of Becoming Spider Lariat",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 26.99,
    priceSanctuary: calculateSanctuaryPrice(26.99),
    shortDescription: "Product Description Delicate in form, powerful in meaning. The Web of Becoming Spider Lariat is designed as a quiet talisman—fluid, adjustable, and...",
    description: {
      ritualIntro: "Product Description Delicate in form, powerful in meaning. The Web of Becoming Spider Lariat is designed as a quiet talisman—fluid, adjustable, and intentional. A crystal-studded spider drifts along a...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/10a21381-cd5f-477e-a31e-7c561fee1c51-1-505faff.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/1000018626.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/1000019097.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/1000019095.jpg"],
    inStock: true
  },
  {
    id: "white-sage-smudge-sticks",
    slug: "white-sage-smudge-sticks",
    name: "The Foundation Ritual",
    realm: "house",
    category: "Objects of Use",
    status: "core",
    pricePublic: 6.00,
    priceSanctuary: calculateSanctuaryPrice(6.00),
    shortDescription: "The Original Purifier. When in doubt, return to the source. The Foundation Ritual Bundle is the essential tool for any spiritual practice—pure, unadul...",
    description: {
      ritualIntro: "The Original Purifier. When in doubt, return to the source. The Foundation Ritual Bundle is the essential tool for any spiritual practice—pure, unadulterated White Sage ( Salvia apiana ). Known for ge...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/White%20Sage%20Smudge%20Sticks_img1.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/White%20Sage%20Smudge%20Sticks_img4.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/White%20Sage%20Smudge%20Sticks_img2.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Sage_vid2.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Gemini_Generated_Image_zihcdrzihcdrzihcBurning.png"],
    inStock: true
  },
  {
    id: "white-sage-w-eucalyptus-smudge-sticks",
    slug: "white-sage-w-eucalyptus-smudge-sticks",
    name: "The Clarity Ritual",
    realm: "house",
    category: "Objects of Use",
    status: "core",
    pricePublic: 6.00,
    priceSanctuary: calculateSanctuaryPrice(6.00),
    shortDescription: "Breathe New Life Into Your Space. When the air feels heavy and your mind feels clouded, reach for The Clarity Ritual Bundle . This handcrafted smudge ...",
    description: {
      ritualIntro: "Breathe New Life Into Your Space. When the air feels heavy and your mind feels clouded, reach for The Clarity Ritual Bundle . This handcrafted smudge stick intertwines the sacred purifying power of Wh...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Burning%20white%20sage%20and%20dried%20lavender%20cleansin.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/White%20Sage%20w%20Eucalyptus%20Smudge%20Sticks_img4.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/White%20Sage%20w%20Eucalyptus%20Smudge%20Sticks_img3.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/White%20Sage%20w%20Eucalyptus%20Smudge%20Sticks_img5.webp"],
    inStock: true
  },
  {
    id: "white-sage-with-dried-lavender-smudge-sticks",
    slug: "white-sage-with-dried-lavender-smudge-sticks",
    name: "The Serenity Ritual",
    realm: "house",
    category: "Objects of Use",
    status: "core",
    pricePublic: 6.00,
    priceSanctuary: calculateSanctuaryPrice(6.00),
    shortDescription: "Clear the Shadows, Invite the Calm. Reset the energy of your sanctuary with The Serenity Ritual Bundle . This hand-wrapped smudge stick marries the po...",
    description: {
      ritualIntro: "Clear the Shadows, Invite the Calm. Reset the energy of your sanctuary with The Serenity Ritual Bundle . This hand-wrapped smudge stick marries the powerful, purifying properties of White Sage with th...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Burning%20white%20sage%20and%20dried%20lavender%20cleansin.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/White%20Sage%20with%20Dried%20Lavender%20Smudge%20Sticks_.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/White%20Sage%20with%20Dried%20Lavender%20Smudge-93cfc79.webp"],
    inStock: true
  },
  {
    id: "xn-the-blood-moon-spiral-solid-crimson-taper-set-4-pack-ps38a",
    slug: "xn-the-blood-moon-spiral-solid-crimson-taper-set-4-pack-ps38a",
    name: "The Blood Moon Spiral",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 34.00,
    priceSanctuary: calculateSanctuaryPrice(34.00),
    shortDescription: "Saturate your sanctuary in the color of vitality and passion with The Blood Moon Spiral Tapers . This set of four handcrafted candles features a deep,...",
    description: {
      ritualIntro: "Saturate your sanctuary in the color of vitality and passion with The Blood Moon Spiral Tapers . This set of four handcrafted candles features a deep, solid crimson hue from wick to base. The twisted,...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Set%20of%20four%20solid%20crimson%20red%20spiral%20taper%20can.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/A%20set%20of%20five%20solid%20red%20spiral%20taper%20candles%20a.jpg"],
    inStock: true
  },
  {
    id: "xn-the-obsidian-twist-glossy-black-spiral-taper-candles-pair-cs61b",
    slug: "xn-the-obsidian-twist-glossy-black-spiral-taper-candles-pair-cs61b",
    name: "The Obsidian Twist",
    realm: "house",
    category: "Candles & Scent",
    status: "core",
    pricePublic: 20.00,
    priceSanctuary: calculateSanctuaryPrice(20.00),
    shortDescription: "Elevate your illumination with The Obsidian Twist Taper Set . These aren't just candles; they are sculptural art for your altar or dining table. Hand-...",
    description: {
      ritualIntro: "Elevate your illumination with The Obsidian Twist Taper Set . These aren't just candles; they are sculptural art for your altar or dining table. Hand-dipped and carefully formed into a mesmerizing spi...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Pair%20of%20glossy%20black%20spiral%20taper%20candles%20with.jpg"],
    inStock: true
  },
  {
    id: "xn-the-crimson-fade-spiral-metallic-blood-ombre-tapers-4-pack-fe32b",
    slug: "xn-the-crimson-fade-spiral-metallic-blood-ombre-tapers-4-pack-fe32b",
    name: "The Crimson Fade Spiral",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 38.00,
    priceSanctuary: calculateSanctuaryPrice(38.00),
    shortDescription: "Ignite a passion that burns from purity to desire with The Crimson Fade Spiral Tapers . This set of four handcrafted candles features a mesmerizing om...",
    description: {
      ritualIntro: "Ignite a passion that burns from purity to desire with The Crimson Fade Spiral Tapers . This set of four handcrafted candles features a mesmerizing ombre design. Beginning with a ghost-white tip, the ...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Styled%20as%20a%20complete%20set%20on%20a%20dining%20table%20to%20.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Set%20of%20four%20lit%20spiral%20taper%20candles%20featuring.jpg"],
    inStock: true
  },
  {
    id: "xn-the-gloomy-gingerbread-spooky-gothic-creepmas-ornament-qs38a",
    slug: "xn-the-gloomy-gingerbread-spooky-gothic-creepmas-ornament-qs38a",
    name: "The Gloomy Gingerbread",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 12.00,
    priceSanctuary: calculateSanctuaryPrice(12.00),
    shortDescription: "Who says Christmas has to be merry? Hang a little mischief on your tree with The Gloomy Gingerbread . This isn't your grandmother's cookie. This Ginge...",
    description: {
      ritualIntro: "Who says Christmas has to be merry? Hang a little mischief on your tree with The Gloomy Gingerbread . This isn't your grandmother's cookie. This Ginger-dead man features a burnt-black finish, white X ...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Black%20resin%20gingerbread%20man%20Christmas%20ornament.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Black%20resin%20'Ginger-dead'%20man%20ornament%20with%20a%20.jpg"],
    inStock: true
  },
  {
    id: "xn-the-midnight-bloom-tealight-holder-matte-black-resin-rose-wl30b",
    slug: "xn-the-midnight-bloom-tealight-holder-matte-black-resin-rose-wl30b",
    name: "The Midnight Bloom Tealight Holder",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 12.00,
    priceSanctuary: calculateSanctuaryPrice(12.00),
    shortDescription: "Capture the allure of a romance that lasts forever with The Midnight Bloom Tealight Holder . Sculpted from durable resin, this holder captures the del...",
    description: {
      ritualIntro: "Capture the allure of a romance that lasts forever with The Midnight Bloom Tealight Holder . Sculpted from durable resin, this holder captures the delicate, unfolding petals of a rose in full bloom, f...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Matte%20black%20resin%20rose-shaped%20tealight%20holder%20.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Black%20resin%20rose%20tealight%20holder%20with%20a%20glowin.jpg"],
    inStock: true
  },
  {
    id: "xn-the-midnight-coffin-vanity-tray-matte-black-trinket-dish-vz69a",
    slug: "xn-the-midnight-coffin-vanity-tray-matte-black-trinket-dish-vz69a",
    name: "The Midnight Coffin Vanity Tray",
    realm: "house",
    category: "Table & Display",
    status: "core",
    pricePublic: 18.00,
    priceSanctuary: calculateSanctuaryPrice(18.00),
    shortDescription: "Organize your most precious artifacts in a vessel worthy of their power. The Midnight Coffin Vanity Tray serves as a resting place for your daily esse...",
    description: {
      ritualIntro: "Organize your most precious artifacts in a vessel worthy of their power. The Midnight Coffin Vanity Tray serves as a resting place for your daily essentials, blending macabre shape with practical desi...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Styled%20on%20an%20antique%20wooden%20dresser%20with%20silve.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Matte%20black%20wooden%20coffin%20tray%20styled%20as%20a%20wit.jpg"],
    inStock: true
  },
  {
    id: "xn-the-emerald-celestial-pillow-velvet-moon-star-embroidery-o690b",
    slug: "xn-the-emerald-celestial-pillow-velvet-moon-star-embroidery-o690b",
    name: "The Emerald Celestial Pillow",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 48.00,
    priceSanctuary: calculateSanctuaryPrice(48.00),
    shortDescription: "Add a touch of cosmic luxury to your sacred space with The Emerald Celestial Pillow . Soft, tactile, and visually striking, this piece brings the magi...",
    description: {
      ritualIntro: "Add a touch of cosmic luxury to your sacred space with The Emerald Celestial Pillow . Soft, tactile, and visually striking, this piece brings the magic of the night sky into your home. Crafted from lu...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Styled%20on%20a%20dark%20surface%20to%20make%20the%20emerald%20a.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Emerald%20green%20velvet%20celestial%20pillow%20with%20gol.jpg"],
    inStock: true
  },
  {
    id: "xn-the-ravenwood-branch-candelabra-dark-metal-triple-taper-holder-with-birds-w580c",
    slug: "xn-the-ravenwood-branch-candelabra-dark-metal-triple-taper-holder-with-birds-w580c",
    name: "The Ravenwood Branch Candelabra",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 49.00,
    priceSanctuary: calculateSanctuaryPrice(49.00),
    shortDescription: "Bring the enchantment of a moonlit forest into your home with The Ravenwood Branch Candelabra . This striking piece is more than just a candle holder;...",
    description: {
      ritualIntro: "Bring the enchantment of a moonlit forest into your home with The Ravenwood Branch Candelabra . This striking piece is more than just a candle holder; it's a sculpture that tells a story. Forged from ...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/A%20dramatic%2C%20close-up%20shot%20focusing%20on%20the%20text.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/The%20Ravenwood%20Branch%20Candelabra%20styled%20in%20a%20mo.jpg"],
    inStock: true
  },
  {
    id: "xn-the-ravens-watch-pillar-stand-gothic-candle-holder-5e75aqi",
    slug: "xn-the-ravens-watch-pillar-stand-gothic-candle-holder-5e75aqi",
    name: "The Raven’s Watch Pillar Stand",
    realm: "house",
    category: "Candles & Scent",
    status: "core",
    pricePublic: 22.00,
    priceSanctuary: calculateSanctuaryPrice(22.00),
    shortDescription: "Invite the mystery of the macabre into your home with The Raven’s Watch Pillar Stand . This striking piece features a realistic black raven perched up...",
    description: {
      ritualIntro: "Invite the mystery of the macabre into your home with The Raven’s Watch Pillar Stand . This striking piece features a realistic black raven perched upon the base of a textured, cast-iron style column....",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Gothic%20raven%20pillar%20candle%20holder%20with%20a%20lit%20b.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Black%20textured%20resin%20pillar%20candle%20holder%20feat.jpg"],
    inStock: true
  },
  {
    id: "xn-the-shadow-spire-trio-matte-black-3-piece-candlestick-set-jl30b",
    slug: "xn-the-shadow-spire-trio-matte-black-3-piece-candlestick-set-jl30b",
    name: "The Shadow Spire Trio",
    realm: "house",
    category: "Candles & Scent",
    status: "core",
    pricePublic: 58.00,
    priceSanctuary: calculateSanctuaryPrice(58.00),
    shortDescription: "Create a cathedral of shadows in your own home with The Shadow Spire Trio . This essential set includes three matte black candle holders of graduated ...",
    description: {
      ritualIntro: "Create a cathedral of shadows in your own home with The Shadow Spire Trio . This essential set includes three matte black candle holders of graduated heights, designed to bring depth and drama to your...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/A%20dramatic%20scene%20showing%20the%20trio%20lit%20on%20a%20wit.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Set%20of%20three%20graduated%2C%20hand-forged%20matte%20blac.jpg"],
    inStock: true
  },
  {
    id: "xn-the-serpents-coil-sculpted-3d-snake-taper-candles-pair-gl30b",
    slug: "xn-the-serpents-coil-sculpted-3d-snake-taper-candles-pair-gl30b",
    name: "The Serpent's Coil",
    realm: "house",
    category: "Candles & Scent",
    status: "core",
    pricePublic: 24.00,
    priceSanctuary: calculateSanctuaryPrice(24.00),
    shortDescription: "Invite the ancient symbol of wisdom and rebirth to your altar with The Serpent's Coil Taper Set . These aren't ordinary candles; they are miniature sc...",
    description: {
      ritualIntro: "Invite the ancient symbol of wisdom and rebirth to your altar with The Serpent's Coil Taper Set . These aren't ordinary candles; they are miniature sculptures. Each tall white taper features a lifelik...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/White%20candles%20with%20gold%20snakes%2C%20styled%20for%20lux.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Tall%20white%20taper%20candle%20featuring%20a%20sculpted%20b.jpg"],
    inStock: false,
    variants: [
      {
        id: "xn-the-srp-s-the-gilded-serpent-gold",
        label: "The Gilded Serpent: Gold",
        pricePublic: 24.00,
        priceSanctuary: calculateSanctuaryPrice(24.00),
        inStock: true,
        isDefault: true
      },
      {
        id: "xn-the-srp-s-the-shadow-serpent-black",
        label: "The Shadow Serpent: Black",
        pricePublic: 24.00,
        priceSanctuary: calculateSanctuaryPrice(24.00),
        inStock: true
      }
    ]
  },
  {
    id: "xn-the-twilight-blush-ritual-candle-black-rose-cork-8e75a",
    slug: "xn-the-twilight-blush-ritual-candle-black-rose-cork-8e75a",
    name: "The Twilight Blush Ritual Candle",
    realm: "house",
    category: "Candles & Scent",
    status: "core",
    pricePublic: 16.00,
    priceSanctuary: calculateSanctuaryPrice(16.00),
    shortDescription: "Ignite the magic of the evening with The Twilight Blush Ritual Candle . Infused with the captivating scent of dark roses and twilight musk, this candl...",
    description: {
      ritualIntro: "Ignite the magic of the evening with The Twilight Blush Ritual Candle . Infused with the captivating scent of dark roses and twilight musk, this candle is designed to put you under its spell. Housed i...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Black%20glass%20scented%20candle%20with%20a%20natural%20cork.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Black%20glass%20scented%20candle%20with%20a%20cork%20lid%20fea.jpg"],
    inStock: true
  },
  {
    id: "xn-the-verdant-gradient-spiral-taper-candle-set-4-pack-q667a",
    slug: "xn-the-verdant-gradient-spiral-taper-candle-set-4-pack-q667a",
    name: "The Verdant Gradient",
    realm: "house",
    category: "Candles & Scent",
    status: "core",
    pricePublic: 36.00,
    priceSanctuary: calculateSanctuaryPrice(36.00),
    shortDescription: "Bring the stillness of the deep woods into your home with The Verdant Gradient Taper Set . This curated collection of four handcrafted spiral candles ...",
    description: {
      ritualIntro: "Bring the stillness of the deep woods into your home with The Verdant Gradient Taper Set . This curated collection of four handcrafted spiral candles captures the many shades of the forest. The set cr...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Four%20lit%20spiral%20taper%20candles%20showing%20a%20green%20.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/477bbc19745f37bb3dd512b3db61261d83ef789ea5bc2.webp"],
    inStock: true
  },
  {
    id: "xn-the-witching-hour-ritual-candle-white-sage-cleansing-blend-r690b",
    slug: "xn-the-witching-hour-ritual-candle-white-sage-cleansing-blend-r690b",
    name: "The Witching Hour Ritual Candle",
    realm: "house",
    category: "Candles & Scent",
    status: "core",
    pricePublic: 16.00,
    priceSanctuary: calculateSanctuaryPrice(16.00),
    shortDescription: "Clear the energy and reset your sanctuary with The Witching Hour Ritual Candle . When the clock strikes twelve—or whenever you need a fresh start—ligh...",
    description: {
      ritualIntro: "Clear the energy and reset your sanctuary with The Witching Hour Ritual Candle . When the clock strikes twelve—or whenever you need a fresh start—light this candle to release the purifying aroma of wh...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Black%20glass%20'Witching%20Hour'%20scented%20candle%20wit.jpg","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Witching%20Hour%20White%20Sage%20candle%20styled%20on%20a%20go.jpg"],
    inStock: true
  },
  {
    id: "yolanda-24-round-upholstered-accent-ottoman",
    slug: "yolanda-24-round-upholstered-accent-ottoman",
    name: "The Emerald Boudoir Ottoman",
    realm: "house",
    category: "Decor Objects",
    status: "core",
    pricePublic: 85.00,
    priceSanctuary: calculateSanctuaryPrice(85.00),
    shortDescription: "A Seat Fit for a Queen of the Night. Drape your home in the luxury of the Old World with the Emerald Boudoir Ottoman . This piece is a masterclass in ...",
    description: {
      ritualIntro: "A Seat Fit for a Queen of the Night. Drape your home in the luxury of the Old World with the Emerald Boudoir Ottoman . This piece is a masterclass in vintage glamour, blending the richness of deep eme...",
      objectDetails: ["Details from CSV"],
      whoFor: "For those who seek the extraordinary."
    },
    images: ["https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Emerald%20green%20velvet%20round%20ottoman%20with%20gold%20f.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Emerald%20green%20velvet%20vanity%20ottoman%20with%20gold%20.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Autumon.png","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Yolanda%2024%20Round%20Upholstered%20Accent%20Ottoman.webp","https://img1.wsimg.com/isteam/ip/021f10ea-1ee0-4cd6-9752-37761b8edd13/ols/Yolanda%2024%20Round%20Upholstered%20Accent%20Ottoman%20S.webp"],
    inStock: true
  }
];

// ============================================
// QUERY FUNCTIONS
// ============================================

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(product => product.slug === slug);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter(product => product.category === category);
}

export function getHouseProducts(): Product[] {
  return products.filter(product => 
    product.realm === 'house' && product.status !== 'archive'
  );
}

export function getCoreProducts(): Product[] {
  return products.filter(product => product.status === "core");
}

export function getInStockProducts(): Product[] {
  return products.filter(product => product.inStock);
}

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

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  
  return products.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.shortDescription.toLowerCase().includes(lowerQuery) ||
    product.description.ritualIntro.toLowerCase().includes(lowerQuery) ||
    product.description.whoFor.toLowerCase().includes(lowerQuery)
  );
}
