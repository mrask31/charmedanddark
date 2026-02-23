/**
 * Shopify Media Polling Utilities
 * Helpers for waiting until Shopify finishes processing uploaded media
 */

/**
 * Poll until Shopify media is ready with image URLs
 * @param productId - GraphQL product ID
 * @param timeoutMs - Maximum time to wait (default 60000ms = 1 minute)
 * @param intervalMs - Polling interval (default 3000ms = 3 seconds)
 * @returns true if media is ready, false if timeout
 * 
 * NOTE: Not currently used in pipeline. Groundwork for Phase 6B.
 */
export async function pollUntilShopifyMediaReady(
  productId: string,
  timeoutMs: number = 60000,
  intervalMs: number = 3000
): Promise<boolean> {
  const startTime = Date.now();
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

  if (!adminToken || !storeDomain) {
    throw new Error('Missing Shopify Admin API credentials');
  }

  const query = `
    query getProductMedia($id: ID!) {
      product(id: $id) {
        id
        media(first: 50) {
          edges {
            node {
              ... on MediaImage {
                id
                image {
                  url
                }
              }
            }
          }
        }
      }
    }
  `;

  while (Date.now() - startTime < timeoutMs) {
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
            variables: { id: productId },
          }),
        }
      );

      if (!response.ok) {
        console.warn(`Polling failed: ${response.status}`);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        continue;
      }

      const data = await response.json();

      if (data.errors) {
        console.warn('Polling GraphQL errors:', data.errors);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        continue;
      }

      const media = data.data?.product?.media?.edges || [];
      
      // Check if all media have image URLs
      const allReady = media.every((edge: any) => {
        return edge.node?.image?.url;
      });

      if (allReady && media.length > 0) {
        console.log(`Media ready after ${Date.now() - startTime}ms`);
        return true;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    } catch (error) {
      console.warn('Polling error:', error);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  console.warn(`Media polling timeout after ${timeoutMs}ms`);
  return false;
}
