import { MetadataRoute } from 'next';
import { storefrontRequest } from '@/lib/shopify/storefront';
import { getCanonicalUrl } from '@/lib/config/site';

/**
 * Dynamic sitemap generation
 * Includes static pages, collections, and all products
 */

interface ShopifyProduct {
  handle: string;
  updatedAt: string;
}

interface ShopifyCollection {
  handle: string;
  updatedAt: string;
}

const PRODUCTS_QUERY = `
  query GetProductHandles($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          handle
          updatedAt
        }
      }
    }
  }
`;

const COLLECTIONS_QUERY = `
  query GetCollectionHandles($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          handle
          updatedAt
        }
      }
    }
  }
`;

async function fetchAllProducts(): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const data = await storefrontRequest<{
      products: {
        pageInfo: { hasNextPage: boolean; endCursor: string };
        edges: Array<{ node: ShopifyProduct }>;
      };
    }>(PRODUCTS_QUERY, {
      first: 250,
      after: cursor,
    });

    if (!data) {
      throw new Error('Failed to fetch products from Shopify');
    }

    products.push(...data.products.edges.map(edge => edge.node));
    hasNextPage = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
  }

  return products;
}

async function fetchCollections(): Promise<ShopifyCollection[]> {
  const data = await storefrontRequest<{
    collections: {
      edges: Array<{ node: ShopifyCollection }>;
    };
  }>(COLLECTIONS_QUERY, { first: 250 });

  if (!data) {
    throw new Error('Failed to fetch collections from Shopify');
  }

  return data.collections.edges.map(edge => edge.node);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([
    fetchAllProducts(),
    fetchCollections(),
  ]);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: getCanonicalUrl('/'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: getCanonicalUrl('/shop'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Collection pages
  const collectionPages: MetadataRoute.Sitemap = collections.map(collection => ({
    url: getCanonicalUrl(`/collections/${collection.handle}`),
    lastModified: new Date(collection.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Product pages
  const productPages: MetadataRoute.Sitemap = products.map(product => ({
    url: getCanonicalUrl(`/product/${product.handle}`),
    lastModified: new Date(product.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...collectionPages, ...productPages];
}
