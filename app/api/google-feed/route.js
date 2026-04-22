const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const SITE_URL = 'https://www.charmedanddark.com';

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
          images(first: 1) { edges { node { url } } }
          variants(first: 50) {
            edges {
              node {
                id
                title
                sku
                availableForSale
                price { amount currencyCode }
                selectedOptions { name value }
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
    const description = stripHtml('Charmed & Dark — Premium gothic lifestyle brand. Dark home decor, ritual tools, and wearable art.');

    let items = '';

    for (const product of products) {
      const desc = escapeXml(stripHtml(product.descriptionHtml) || product.title);
      const link = `${SITE_URL}/shop/${product.handle}`;
      const imageUrl = product.images.edges[0]?.node?.url || '';
      const googleCategory = getGoogleCategory(product.productType);
      const isPod = POD_VENDORS.includes(product.vendor);

      for (const { node: variant } of product.variants.edges) {
        if (variant.title === 'Default Title' && product.variants.edges.length === 1) {
          // Single variant product — use product title only
          var itemTitle = product.title;
        } else {
          var itemTitle = `${product.title} - ${variant.title}`;
        }

        const itemId = variant.sku || variant.id.split('/').pop();
        const price = `${parseFloat(variant.price.amount).toFixed(2)} ${variant.price.currencyCode}`;
        const available = isPod ? true : variant.availableForSale;

        items += `
    <item>
      <g:id>${escapeXml(itemId)}</g:id>
      <g:title>${escapeXml(itemTitle)}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:price>${price}</g:price>
      <g:availability>${available ? 'in stock' : 'out of stock'}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>Charmed &amp; Dark</g:brand>
      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
    </item>`;
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Charmed &amp; Dark</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(description)}</description>${items}
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
