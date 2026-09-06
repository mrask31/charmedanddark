import 'server-only';
import { cache } from 'react';
import { shopifyFetch, ShopifyRequestError } from './client.js';
import {
  ALL_PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCT_BY_ID_QUERY,
  PRODUCT_VARIANTS_QUERY,
  PRODUCT_IMAGES_QUERY,
  PRODUCT_COLLECTIONS_QUERY,
  COLLECTION_PRODUCTS_QUERY,
} from './queries.js';
import { connectionNodes, mapShopifyProduct } from './catalog-shape.js';

const country = () => process.env.SHOPIFY_BUYER_COUNTRY || 'US';

/** Complete a connection, rejecting bad cursors instead of looping or truncating. */
export async function collectConnection(initial, nextPage) {
  const edges = [];
  const cursors = new Set();
  let connection = initial;
  for (;;) {
    if (!connection?.pageInfo || !Array.isArray(connection.edges)) {
      throw new ShopifyRequestError('Shopify returned an incomplete catalog', 'INVALID_RESPONSE');
    }
    edges.push(...connection.edges);
    if (!connection.pageInfo.hasNextPage) {
      return { edges, pageInfo: connection.pageInfo };
    }
    const cursor = connection.pageInfo.endCursor;
    if (!cursor || cursors.has(cursor)) {
      throw new ShopifyRequestError('Shopify returned an invalid catalog cursor', 'INVALID_PAGINATION');
    }
    cursors.add(cursor);
    connection = await nextPage(cursor);
  }
}

async function mapWithConcurrency(values, mapper, concurrency = 4) {
  const result = new Array(values.length);
  let index = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    for (;;) {
      const current = index++;
      if (current >= values.length) return;
      result[current] = await mapper(values[current]);
    }
  }));
  return result;
}

async function completeProduct(product) {
  const completed = { ...product };
  // Serial connections per product, at most four products at once.
  for (const [field, query] of [
    ['variants', PRODUCT_VARIANTS_QUERY],
    ['images', PRODUCT_IMAGES_QUERY],
    ['collections', PRODUCT_COLLECTIONS_QUERY],
  ]) {
    completed[field] = await collectConnection(product[field], async (after) => {
      const data = await shopifyFetch({
        query,
        variables: { id: product.id, after, country: country() },
        tags: [`shopify-product:${product.id}`],
      });
      if (!data.product) {
        throw new ShopifyRequestError('The catalog changed while loading. Please retry.', 'CATALOG_CHANGED');
      }
      return data.product[field];
    });
  }
  return completed;
}

export const getRawShopifyProducts = cache(async function getRawShopifyProducts() {
  const data = await shopifyFetch({
    query: ALL_PRODUCTS_QUERY,
    variables: { first: 50, after: null, country: country() },
  });
  const connection = await collectConnection(data.products, async (after) => {
    const page = await shopifyFetch({
      query: ALL_PRODUCTS_QUERY,
      variables: { first: 50, after, country: country() },
    });
    return page.products;
  });
  return mapWithConcurrency(connectionNodes(connection), completeProduct);
});

export const getShopifyProducts = cache(async function getShopifyProducts() {
  return (await getRawShopifyProducts()).map(mapShopifyProduct);
});
export const getCatalogProducts = getShopifyProducts;

export const getShopifyProductByHandle = cache(async function getShopifyProductByHandle(handle) {
  const data = await shopifyFetch({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle, country: country() },
    tags: [`shopify-handle:${handle}`],
  });
  return data.product ? mapShopifyProduct(await completeProduct(data.product)) : null;
});

export const getShopifyProductById = cache(async function getShopifyProductById(id) {
  const data = await shopifyFetch({
    query: PRODUCT_BY_ID_QUERY,
    variables: { id, country: country() },
    tags: [`shopify-product:${id}`],
  });
  return data.product ? mapShopifyProduct(await completeProduct(data.product)) : null;
});

export const getShopifyCollection = cache(async function getShopifyCollection(handle) {
  const data = await shopifyFetch({
    query: COLLECTION_PRODUCTS_QUERY,
    variables: { handle, after: null, country: country() },
    tags: [`shopify-collection:${handle}`],
  });
  if (!data.collection) {
    throw new ShopifyRequestError('This collection is temporarily unavailable', 'CATALOG_CONFIGURATION');
  }
  const connection = await collectConnection(data.collection.products, async (after) => {
    const page = await shopifyFetch({
      query: COLLECTION_PRODUCTS_QUERY,
      variables: { handle, after, country: country() },
      tags: [`shopify-collection:${handle}`],
    });
    if (!page.collection) {
      throw new ShopifyRequestError('The collection changed while loading. Please retry.', 'CATALOG_CHANGED');
    }
    return page.collection.products;
  });
  const products = await mapWithConcurrency(connectionNodes(connection), completeProduct);
  return { ...data.collection, products: products.map(mapShopifyProduct) };
});
