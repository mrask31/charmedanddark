/**
 * Google Merchant Center Product Feed
 * Serves valid RSS 2.0 XML at /api/google-feed
 *
 * Required apparel attributes for Google free listings:
 * g:age_group, g:gender, g:color, g:size, g:item_group_id
 */

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const SITE_URL = 'https://www.charmedanddark.com';

// Products with known unavailable pages — exclude from feed until fixed
const EXCLUDED_HANDLES = [];

const PRODUCTS_QUERY = `
  query Products($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          title
          handle
          descriptionHtml
          productType
          vendor
          images(first: 5) { edges { node { url } } }
          variants(first: 50) {
            edges {
              node {
                id
                title
                sku
                availableForSale
                price { amount currencyCode }
                selectedOptions { name value }
                image { url }
              }
            }
          }
        }
      }
    }
  }
`;

async function shopifyFetch(query, variables = {}) {
  const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message);
  return json.data;
}

async function fetchAllProducts() {
  const all = [];
  let hasNextPage = true;
  let after = null;
  while (hasNextPage) {
    const data = await shopifyFetch(PRODUCTS_QUERY, { first: 250, after });
    all.push(...data.products.edges.map(({ node }) => node));
    hasNextPage = data.products.pageInfo.hasNextPage;
    after = data.products.pageInfo.endCursor;
  }
  return all;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

function escapeXml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
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
  'T-Shirt': 'Apparel & Accessories > Clothing > Shirts & Tops',
  'Tank Top': 'Apparel & Accessories > Clothing > Shirts & Tops',
  'Hoodie': 'Apparel & Accessories > Clothing > Outerwear > Coats & Jackets',
  'Hats': 'Apparel & Accessories > Clothing Accessories > Hats',
  'Apparel': 'Apparel & Accessories > Clothing',
  'Accessories': 'Apparel & Accessories > Jewelry',
  'Home Decor': 'Home & Garden > Decor',
  'Candle': 'Home & Garden > Decor > Candles',
  'Ritual': 'Home & Garden > Decor > Candles',
  'Wall Art': 'Home & Garden > Decor > Artwork',
};

function getGoogleCategory(productType) {
  return CATEGORY_MAP[productType] || 'Home & Garden > Decor';
}

const POD_VENDORS = ['Printify', 'Charmed & Dark'];

export async function GET() {
  try {
    const products = await fetchAllProducts();
    const channelDesc = 'Charmed & Dark — Premium gothic lifestyle brand.';

    let items = '';

    for (const product of products) {
      // Exclude products with known unavailable pages
      if (EXCLUDED_HANDLES.includes(product.handle)) continue;

      const desc = escapeXml(stripHtml(product.descriptionHtml) || product.title);
      const link = `${SITE_URL}/shop/${product.handle}`;
      const primaryImage = product.images.edges[0]?.node?.url || '';
      const additionalImages = product.images.edges.slice(1).map(({ node }) => node.url);
      const googleCategory = getGoogleCategory(product.productType);
      const isPod = POD_VENDORS.includes(product.vendor);
      const needsApparelAttrs = isApparelOrAccessory(product.productType, googleCategory);

      for (const { node: variant } of product.variants.edges) {
        // Build title
        const itemTitle = (variant.title === 'Default Title' && product.variants.edges.length === 1)
          ? product.title
          : `${product.title} - ${variant.title}`;

        const itemId = variant.sku || variant.id.split('/').pop();
        const price = `${parseFloat(variant.price.amount).toFixed(2)} ${variant.price.currencyCode}`;
        const available = isPod ? true : variant.availableForSale;
        const variantImage = variant.image?.url || primaryImage;

        // Validate image URL
        if (!variantImage || !variantImage.startsWith('https://')) continue;

        let apparelFields = '';

        // Google Merchant Center requires these for apparel/accessories
        if (needsApparelAttrs) {
          const attrs = extractVariantAttributes(product, variant);

          if (attrs.ageGroup) {
            apparelFields += `\n      <g:age_group>${escapeXml(attrs.ageGroup)}</g:age_group>`;
          }
          if (attrs.gender) {
            apparelFields += `\n      <g:gender>${escapeXml(attrs.gender)}</g:gender>`;
          }
          if (attrs.color) {
            apparelFields += `\n      <g:color>${escapeXml(attrs.color)}</g:color>`;
          }
          if (attrs.size) {
            apparelFields += `\n      <g:size>${escapeXml(attrs.size)}</g:size>`;
          }
          if (attrs.itemGroupId) {
            apparelFields += `\n      <g:item_group_id>${escapeXml(attrs.itemGroupId)}</g:item_group_id>`;
          }
        }

        // Additional images
        let additionalImageFields = '';
        for (const img of additionalImages.slice(0, 9)) {
          additionalImageFields += `\n      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`;
        }

        items += `
    <item>
      <g:id>${escapeXml(itemId)}</g:id>
      <g:title>${escapeXml(itemTitle)}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(variantImage)}</g:image_link>${additionalImageFields}
      <g:price>${price}</g:price>
      <g:availability>${available ? 'in stock' : 'out of stock'}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>Charmed &amp; Dark</g:brand>
      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
      <g:product_type>${escapeXml(product.productType || 'Home Decor')}</g:product_type>${apparelFields}
    </item>`;
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Charmed &amp; Dark</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(channelDesc)}</description>${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('Google feed error:', err);
    return new Response('<error>Feed generation failed</error>', {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
