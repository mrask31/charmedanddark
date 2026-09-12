/** Public feed uses the same fully paginated Shopify variants as product pages. */
import { getProducts, isShopifyCatalogEnabled } from '@/lib/products';
import { productBrand } from '@/lib/product-display';
import { getShopifyProducts } from '@/lib/shopify/catalog';

const SITE_URL = 'https://www.charmedanddark.com';

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

function escapeXml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/** Extract a selected option value by matching common name variations */
function getSelectedOption(selectedOptions, names) {
  if (!selectedOptions) return null;
  const normalizedNames = names.map((n) => n.toLowerCase());
  const match = selectedOptions.find((opt) =>
    normalizedNames.includes(opt.name.toLowerCase())
  );
  return match?.value || null;
}

/** Normalize size values for Google Merchant Center */
function normalizeSize(value) {
  if (!value) return null;
  const v = value.trim();
  if (/^one\s*size$/i.test(v)) return 'One Size';
  return v;
}

/** Infer gender from product title */
function inferGender(title) {
  const t = title.toLowerCase();
  if (/women'?s|crop\s*tank|crop\s*tee|crop\s*top|ringer\s*tee/.test(t)) return 'female';
  if (/unisex|hoodie|beanie|tee|socks|anklets/.test(t)) return 'unisex';
  return 'unisex';
}

/** Determine if product is apparel/accessories (needs variant attributes) */
function isApparelOrAccessory(productType, googleCategory) {
  const apparelTypes = ['T-Shirt', 'Tank Top', 'Hoodie', 'Hats', 'Apparel', 'Accessories'];
  if (apparelTypes.includes(productType)) return true;
  if (googleCategory?.startsWith('Apparel')) return true;
  return false;
}

/** Parse variant title to extract color and size when selectedOptions unavailable */
function parseVariantTitle(variantTitle) {
  if (!variantTitle || variantTitle === 'Default Title') return { color: null, size: null };
  const parts = variantTitle.split(' / ').map((p) => p.trim());
  const sizePatterns = /^(XS|S|M|L|XL|2XL|3XL|4XL|5XL|XXL|XXXL|One\s*Size|OS)$/i;

  let color = null;
  let size = null;

  for (const part of parts) {
    if (sizePatterns.test(part)) {
      size = part;
    } else if (!color) {
      color = part;
    }
  }
  return { color, size };
}

/**
 * Extract all variant attributes needed for Google Merchant Center
 * Returns: { color, size, gender, ageGroup, itemGroupId }
 */
function extractVariantAttributes(product, variant) {
  // Color: from selectedOptions first, then parse variant title
  let color = getSelectedOption(variant.selectedOptions, ['Color', 'Colour']);
  let size = getSelectedOption(variant.selectedOptions, ['Size']);

  // Fallback: parse variant title
  if (!color || !size) {
    const parsed = parseVariantTitle(variant.title);
    if (!color) color = parsed.color;
    if (!size) size = parsed.size;
  }

  // Normalize size
  size = normalizeSize(size);

  // Gender from product title
  const gender = inferGender(product.title);

  // Age group: always adult for this brand
  const ageGroup = 'adult';

  // Item group ID: stable parent identifier (product handle)
  const itemGroupId = product.handle;

  return { color, size, gender, ageGroup, itemGroupId };
}

const CATEGORY_MAP = {
  "Mirror": "Home & Garden > Decor > Mirrors",
  "Serving Stand": "Home & Garden > Kitchen & Dining > Tableware > Serveware > Cake Stands",
  "Serving Board": "Home & Garden > Kitchen & Dining > Kitchen Tools & Utensils > Cutting Boards",
  "Dinnerware Set": "Home & Garden > Kitchen & Dining > Tableware > Dinnerware > Dinnerware Sets",
  "Bedding Set": "Home & Garden > Linens & Bedding > Bedding",
  "Sheet Set": "Home & Garden > Linens & Bedding > Bedding > Bed Sheets",
  "Throw Pillow": "Home & Garden > Decor > Throw Pillows",
  "Decorative Tray": "Home & Garden > Decor > Decorative Trays",
  "Bookends": "Home & Garden > Decor > Bookends",
  "Ottoman": "Furniture > Ottomans",
  "Vase": "Home & Garden > Decor > Vases",
  "Ornament": "Home & Garden > Decor > Seasonal & Holiday Decorations > Holiday Ornaments",
  "Art Print": "Home & Garden > Decor > Artwork > Posters, Prints, & Visual Artwork",
  "Canvas Wall Art": "Home & Garden > Decor > Artwork > Posters, Prints, & Visual Artwork",
  "Cocktail Glasses": "Home & Garden > Kitchen & Dining > Tableware > Drinkware > Stemware",
  "Tumbler": "Home & Garden > Kitchen & Dining > Tableware > Drinkware > Tumblers",
  "Water Bottle": "Home & Garden > Kitchen & Dining > Food & Beverage Carriers > Water Bottles",
  "Mug": "Home & Garden > Kitchen & Dining > Tableware > Drinkware > Mugs",
  "Cleansing Bundle": "Home & Garden > Decor > Home Fragrances > Incense",
  "Candle Holder": "Home & Garden > Decor > Home Fragrance Accessories > Candle Holders",
  "Necklace": "Apparel & Accessories > Jewelry > Necklaces",
  "Bracelet": "Apparel & Accessories > Jewelry > Bracelets",
  "Earrings": "Apparel & Accessories > Jewelry > Earrings",
  "Tote Bag": "Apparel & Accessories > Handbags, Wallets & Cases > Handbags",
  "Kisslock Bag": "Apparel & Accessories > Handbags, Wallets & Cases > Handbags",
  "Tights": "Apparel & Accessories > Clothing > Underwear & Socks > Hosiery",
  "Socks": "Apparel & Accessories > Clothing > Underwear & Socks > Socks",
  "Trucker Hat": "Apparel & Accessories > Clothing Accessories > Hats",
  "Baseball Cap": "Apparel & Accessories > Clothing Accessories > Hats",
  "Beanie": "Apparel & Accessories > Clothing Accessories > Hats",
  "T-Shirt": "Apparel & Accessories > Clothing > Shirts & Tops",
  "Tank Top": "Apparel & Accessories > Clothing > Shirts & Tops",
  "Hoodie": "Apparel & Accessories > Clothing > Shirts & Tops",
  'Hats': 'Apparel & Accessories > Clothing Accessories > Hats',
  'Apparel': 'Apparel & Accessories > Clothing',
  'Accessories': 'Apparel & Accessories > Jewelry',
  'Home Decor': 'Home & Garden > Decor',
  "Candle": "Home & Garden > Decor > Home Fragrances > Candles",
  'Ritual': 'Home & Garden > Decor > Candles',
  'Wall Art': 'Home & Garden > Decor > Artwork',
};

function getGoogleCategory(productType, category) {
  return CATEGORY_MAP[productType] || CATEGORY_MAP[category] || null;
}

export async function GET() {
  try {
    // The existing feed already used Shopify before the storefront migration.
    const products = await (isShopifyCatalogEnabled() ? getProducts() : getShopifyProducts());
    const items = [];
    for (const product of products) {
      const variants = product.shopifyVariants?.variants || [];
      const productName = product.name || product.title;
      const handle = product.slug || product.handle;
      const primaryImage = product.imageUrls?.[0];
      const additionalImages = (product.imageUrls || []).slice(1, 10);
      const productType = product.productType || product.category || '';
      const googleCategory = getGoogleCategory(productType, product.category);
      const needsApparelAttrs = isApparelOrAccessory(productType, googleCategory);
      for (const variant of variants) {
        const variantId = variant.shopifyVariantId || variant.id;
        const itemId = variant.sku || variantId.split('/').pop();
        const itemTitle = variant.title === 'Default Title' && variants.length === 1 ? productName : `${productName} - ${variant.title}`;
        const currentPrice = Number(variant.price);
        const compareAt = Number(variant.compareAtPrice);
        const isSale = compareAt > currentPrice;
        const currency = variant.currency || product.currency || 'USD';
        const image = variant.imageUrl || primaryImage;
        if (!image?.startsWith('https://') || !Number.isFinite(currentPrice)) continue;
        const link = `${SITE_URL}/shop/${handle}?variant=${variantId.split('/').pop()}`;
        const fields = {
          id: itemId,
          title: itemTitle,
          description: stripHtml(product.descriptionHtml || product.description) || productName,
          link,
          image_link: image,
          price: `${(isSale ? compareAt : currentPrice).toFixed(2)} ${currency}`,
          ...(isSale && { sale_price: `${currentPrice.toFixed(2)} ${currency}` }),
          availability: (variant.availableForSale ?? variant.available) ? 'in stock' : 'out of stock',
          condition: 'new',
          brand: productBrand(product),
          ...(googleCategory && { google_product_category: googleCategory }),
          ...(productType && { product_type: productType }),
        };
        if (needsApparelAttrs) {
          const attrs = extractVariantAttributes({ title: productName, handle }, variant);
          Object.assign(fields, { age_group: attrs.ageGroup, gender: attrs.gender, item_group_id: attrs.itemGroupId });
          if (attrs.color) fields.color = attrs.color;
          if (attrs.size) fields.size = attrs.size;
        }
        const xmlFields = Object.entries(fields).map(([key, value]) => `      <g:${key}>${escapeXml(value)}</g:${key}>`);
        for (const imageUrl of additionalImages) xmlFields.push(`      <g:additional_image_link>${escapeXml(imageUrl)}</g:additional_image_link>`);
        items.push(`    <item>\n${xmlFields.join('\n')}\n    </item>`);
      }
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Charmed &amp; Dark</title>
    <link>${SITE_URL}</link>
    <description>Charmed &amp; Dark — Premium gothic lifestyle brand.</description>
${items.join('\n')}
  </channel>
</rss>`;
    return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=60, s-maxage=60' } });
  } catch (error) {
    console.error('[GoogleFeed] Catalog unavailable:', error.message);
    return new Response('<error>Product feed temporarily unavailable</error>', { status: 503, headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'no-store', 'Retry-After': '60' } });
  }
}
