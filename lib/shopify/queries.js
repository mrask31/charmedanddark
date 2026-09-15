const PAGE_INFO = 'pageInfo { hasNextPage endCursor }';

export const PRODUCT_RECOMMENDATIONS_QUERY = `
  query DiscoveryRecommendations($productId: ID!, $country: CountryCode = US)
  @inContext(country: $country) {
    productRecommendations(productId: $productId, intent: RELATED) { id }
  }
`;

export const VARIANT_FIELDS = `
  id title sku availableForSale quantityAvailable
  selectedOptions { name value }
  price { amount currencyCode }
  compareAtPrice { amount currencyCode }
  image { url altText width height }
`;

const PRODUCT_FIELDS = `
  id title handle description descriptionHtml productType tags vendor
  availableForSale createdAt updatedAt
  seo { title description }
  options { name optionValues { name } }
  priceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  images(first: 100) {
    ${PAGE_INFO}
    edges { node { url altText width height } }
  }
  variants(first: 100) {
    ${PAGE_INFO}
    edges { node { ${VARIANT_FIELDS} } }
  }
  collections(first: 100) {
    ${PAGE_INFO}
    edges { node { id handle title } }
  }
`;

export const ALL_PRODUCTS_QUERY = `
  query AllProducts($first: Int!, $after: String, $country: CountryCode = US)
  @inContext(country: $country) {
    products(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
      ${PAGE_INFO}
      edges { node { ${PRODUCT_FIELDS} } }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query CatalogProductByHandle($handle: String!, $country: CountryCode = US)
  @inContext(country: $country) {
    product(handle: $handle) { ${PRODUCT_FIELDS} }
  }
`;

export const PRODUCT_BY_ID_QUERY = `
  query CatalogProductById($id: ID!, $country: CountryCode = US)
  @inContext(country: $country) {
    product(id: $id) { ${PRODUCT_FIELDS} }
  }
`;

export const PRODUCT_VARIANTS_QUERY = `
  query ProductVariants($id: ID!, $after: String, $country: CountryCode = US)
  @inContext(country: $country) {
    product(id: $id) {
      id options { name optionValues { name } }
      variants(first: 100, after: $after) {
        ${PAGE_INFO}
        edges { node { ${VARIANT_FIELDS} } }
      }
    }
  }
`;

export const PRODUCT_IMAGES_QUERY = `
  query ProductImages($id: ID!, $after: String, $country: CountryCode = US)
  @inContext(country: $country) {
    product(id: $id) {
      images(first: 100, after: $after) {
        ${PAGE_INFO}
        edges { node { url altText width height } }
      }
    }
  }
`;

export const PRODUCT_COLLECTIONS_QUERY = `
  query ProductCollections($id: ID!, $after: String, $country: CountryCode = US)
  @inContext(country: $country) {
    product(id: $id) {
      collections(first: 100, after: $after) {
        ${PAGE_INFO}
        edges { node { id handle title } }
      }
    }
  }
`;

export const COLLECTION_PRODUCTS_QUERY = `
  query CatalogCollection($handle: String!, $after: String, $country: CountryCode = US)
  @inContext(country: $country) {
    collection(handle: $handle) {
      id title handle description seo { title description }
      products(first: 50, after: $after, sortKey: COLLECTION_DEFAULT) {
        ${PAGE_INFO}
        edges { node { ${PRODUCT_FIELDS} } }
      }
    }
  }
`;

// Compatibility for existing server consumers; every nested connection is complete.
export async function getAllShopifyProducts() {
  const { getRawShopifyProducts } = await import('./catalog.js');
  return getRawShopifyProducts();
}
