export const ALL_PRODUCTS_QUERY = `
  query AllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          handle
          description
          productType
          tags
          vendor
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                sku
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                quantityAvailable
              }
            }
          }
        }
      }
    }
  }
`;

export async function getAllShopifyProducts() {
  const { shopifyFetch } = await import('./client.js');
  let allProducts = [];
  let hasNextPage = true;
  let after = null;

  while (hasNextPage) {
    const data = await shopifyFetch({
      query: ALL_PRODUCTS_QUERY,
      variables: { first: 50, after },
    });

    const products = data.products.edges.map(({ node }) => node);
    allProducts = [...allProducts, ...products];

    hasNextPage = data.products.pageInfo.hasNextPage;
    after = data.products.pageInfo.endCursor;
  }

  return allProducts;
}
