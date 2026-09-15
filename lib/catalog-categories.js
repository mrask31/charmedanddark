// Product type is the current merchandising source. Legacy category tags are a fallback.
const TYPES = {
  BAGS: ['kisslock bag', 'kiss lock bag', 'tote bag'],
  APPAREL: ['t-shirt', 'hoodie', 'tank top', 'socks', 'tights'],
  DRINKWARE: ['mug', 'water bottle', 'tumbler', 'cocktail glasses', 'teacup', 'glassware'],
  RITUAL: ['candle', 'candle holder', 'cleansing bundle'],
  WALL_ART: ['art print', 'canvas', 'canvas wall art', 'wall decor'],
  ACCESSORIES: ['earrings', 'necklace', 'bracelet', 'beanie', 'baseball cap', 'trucker hat', 'hats'],
  HOME: ['mirror', 'serving stand', 'serving board', 'dinnerware set', 'bedding set', 'sheet set', 'throw pillow', 'decorative tray', 'bookends', 'ottoman', 'vase', 'ornament', 'cheese knife set'],
};
const LEGACY = { accessories: 'ACCESSORIES', apparel: 'APPAREL', clothing: 'APPAREL', ritual: 'RITUAL', 'home decor': 'HOME', home: 'HOME', decor: 'HOME', 'wall art': 'WALL_ART', drinkware: 'DRINKWARE', bags: 'BAGS' };
const normalize = (value) => String(value || '').trim().toLowerCase();

export const COLLECTION_CATEGORIES = {
  bags: 'BAGS', 'gothic-clothing': 'APPAREL', 'gothic-home-decor': 'HOME',
  'candles-ritual': 'RITUAL', drinkware: 'DRINKWARE', accessories: 'ACCESSORIES', 'wall-art': 'WALL_ART',
};

export function productShopCategory(product) {
  const type = normalize(product.productType);
  for (const [category, types] of Object.entries(TYPES)) {
    if (types.includes(type)) return category;
  }
  // Some legacy products used a product type as their display category.
  const category = normalize(product.category);
  for (const [key, types] of Object.entries(TYPES)) {
    if (types.includes(category)) return key;
  }
  const name = normalize(product.name || product.title);
  if (/\b(kisslock|kiss lock|tote)\b/.test(name)) return 'BAGS';
  if (/\b(mug|teacup|water bottle|tumbler|coupe|glassware)\b/.test(name)) return 'DRINKWARE';
  const tag = (product.tags || []).find((value) => /^category:\s*\S/i.test(value));
  return LEGACY[category] || LEGACY[normalize(tag?.slice(tag.indexOf(':') + 1))] || 'OTHER';
}
