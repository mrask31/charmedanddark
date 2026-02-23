/**
 * Shopify Admin API utilities for Darkroom automation
 * Fetches products by tag, uploads media, updates tags
 */

export interface ShopifyProductForDarkroom {
  id: string; // GraphQL ID (gid://shopify/Product/...)
  handle: string;
  title: string;
  tags: string[];
  images: Array<{
    id: string;
    url: string;
    altText: string | null;
  }>;
}

export interface ShopifyMediaUploadResult {
  mediaId: string;
  url: string;
}

/**
 * Fetch products tagged with img:needs-brand, source:faire, dept:objects
 * @param limit - Max products to fetch (default 20)
 */
export async function fetchProductsNeedingBranding(limit: number = 20): Promise<ShopifyProductForDarkroom[]> {
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

  if (!adminToken || !storeDomain) {
    throw new Error('Missing Shopify Admin API credentials');
  }

  const query = `
    query getProductsNeedingBranding($query: String!, $first: Int!) {
      products(first: $first, query: $query, savedSearchId: null) {
        edges {
          node {
            id
            handle
            title
            tags
            status
            images(first: 10) {
              edges {
                node {
                  id
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  `;

  // Query for products with all three tags (including draft products)
  // Note: Tags with colons must be quoted in the search query
  const searchQuery = 'tag:"img:needs-brand" AND tag:"source:faire" AND tag:"dept:objects"';

  try {
    const response = await fetch(
      `https://${storeDomain}/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': adminToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            query: searchQuery,
            first: limit,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    const products = data.data?.products?.edges?.map((edge: any) => ({
      id: edge.node.id,
      handle: edge.node.handle,
      title: edge.node.title,
      tags: edge.node.tags,
      images: edge.node.images.edges.map((imgEdge: any) => ({
        id: imgEdge.node.id,
        url: imgEdge.node.url,
        altText: imgEdge.node.altText,
      })),
    })) || [];

    return products;
  } catch (error) {
    console.error('Failed to fetch products from Shopify:', error);
    throw error;
  }
}

/**
 * Upload branded image to Shopify product
 * @param productId - GraphQL product ID
 * @param imageUrl - Public URL of branded image
 * @param altText - Alt text for image
 */
export async function uploadImageToProduct(
  productId: string,
  imageUrl: string,
  altText: string
): Promise<ShopifyMediaUploadResult> {
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

  if (!adminToken || !storeDomain) {
    throw new Error('Missing Shopify Admin API credentials');
  }

  const mutation = `
    mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media {
          ... on MediaImage {
            id
            image {
              url
            }
          }
        }
        mediaUserErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://${storeDomain}/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': adminToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            productId,
            media: [
              {
                originalSource: imageUrl,
                alt: altText,
                mediaContentType: 'IMAGE',
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    if (data.data?.productCreateMedia?.mediaUserErrors?.length > 0) {
      throw new Error(`Media upload errors: ${JSON.stringify(data.data.productCreateMedia.mediaUserErrors)}`);
    }

    const media = data.data?.productCreateMedia?.media?.[0];
    if (!media) {
      throw new Error('No media returned from upload');
    }

    return {
      mediaId: media.id,
      url: media.image.url,
    };
  } catch (error) {
    console.error('Failed to upload image to Shopify:', error);
    throw error;
  }
}

/**
 * Reorder product media to set hero image first
 * @param productId - GraphQL product ID
 * @param mediaIds - Array of media IDs in desired order
 */
export async function reorderProductMedia(productId: string, mediaIds: string[]): Promise<void> {
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

  if (!adminToken || !storeDomain) {
    throw new Error('Missing Shopify Admin API credentials');
  }

  const mutation = `
    mutation productReorderMedia($id: ID!, $moves: [MoveInput!]!) {
      productReorderMedia(id: $id, moves: $moves) {
        job {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  // Build moves array to reorder media
  const moves = mediaIds.map((mediaId, index) => ({
    id: mediaId,
    newPosition: String(index),
  }));

  try {
    const response = await fetch(
      `https://${storeDomain}/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': adminToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            id: productId,
            moves,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    if (data.data?.productReorderMedia?.userErrors?.length > 0) {
      throw new Error(`Reorder errors: ${JSON.stringify(data.data.productReorderMedia.userErrors)}`);
    }
  } catch (error) {
    console.error('Failed to reorder product media:', error);
    throw error;
  }
}

/**
 * Update product tags
 * @param productId - GraphQL product ID
 * @param tagsToAdd - Tags to add (e.g., ['img:branded', 'bg:stone'])
 * @param tagsToRemove - Tags to remove (e.g., ['img:needs-brand'])
 */
export async function updateProductTags(
  productId: string,
  currentTags: string[],
  tagsToAdd: string[],
  tagsToRemove: string[]
): Promise<void> {
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

  if (!adminToken || !storeDomain) {
    throw new Error('Missing Shopify Admin API credentials');
  }

  // Calculate new tags
  const newTags = [
    ...currentTags.filter(tag => !tagsToRemove.includes(tag)),
    ...tagsToAdd,
  ];

  const mutation = `
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          tags
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const response = await fetch(
      `https://${storeDomain}/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': adminToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            input: {
              id: productId,
              tags: newTags,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    if (data.data?.productUpdate?.userErrors?.length > 0) {
      throw new Error(`Tag update errors: ${JSON.stringify(data.data.productUpdate.userErrors)}`);
    }
  } catch (error) {
    console.error('Failed to update product tags:', error);
    throw error;
  }
}
