'use server';

/**
 * Server actions for product page
 * Handles curator note fetching and generation
 */

import { generateCuratorNote } from '@/lib/curator/generator';
import { getAdminToken, getStoreDomain, SHOPIFY_API_VERSION } from '@/lib/shopify/config';
import { devLog } from '@/lib/utils/logger';

interface ProductMetafield {
  namespace: string;
  key: string;
  value: string;
}

/**
 * Fetch curator note from Shopify metafield or generate with AI
 */
export async function getCuratorNote(
  productId: string,
  title: string,
  productType: string | null,
  description: string | null
): Promise<string | null> {
  try {
    // First, try to fetch existing curator note from Shopify metafield
    const existingNote = await fetchCuratorNoteMetafield(productId);
    
    if (existingNote) {
      devLog.log('[Curator] Using existing metafield note');
      return existingNote;
    }

    // If no metafield exists, generate with AI
    devLog.log('[Curator] No metafield found, generating with AI');
    const generatedNote = await generateCuratorNote(title, productType, description);

    if (generatedNote) {
      // Optionally save to Shopify metafield for future use
      await saveCuratorNoteMetafield(productId, generatedNote);
    }

    return generatedNote;
  } catch (error) {
    console.error('[Curator] Error getting curator note:', error);
    return null;
  }
}

/**
 * Fetch curator note from Shopify metafield
 */
async function fetchCuratorNoteMetafield(productId: string): Promise<string | null> {
  const domain = getStoreDomain();
  const token = getAdminToken();
  const endpoint = `https://${domain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const query = `
    query getProductMetafield($id: ID!) {
      product(id: $id) {
        metafield(namespace: "custom", key: "curator_note") {
          value
        }
      }
    }
  `;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({
        query,
        variables: { id: productId },
      }),
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const json = await response.json();

    if (json.errors) {
      throw new Error(`GraphQL errors: ${json.errors.map((e: any) => e.message).join(', ')}`);
    }

    return json.data?.product?.metafield?.value || null;
  } catch (error) {
    console.error('[Curator] Failed to fetch metafield:', error);
    return null;
  }
}

/**
 * Save curator note to Shopify metafield
 */
async function saveCuratorNoteMetafield(productId: string, note: string): Promise<boolean> {
  const domain = getStoreDomain();
  const token = getAdminToken();
  const endpoint = `https://${domain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const mutation = `
    mutation setProductMetafield($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            id: productId,
            metafields: [
              {
                namespace: 'custom',
                key: 'curator_note',
                value: note,
                type: 'multi_line_text_field',
              },
            ],
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const json = await response.json();

    if (json.errors || json.data?.productUpdate?.userErrors?.length > 0) {
      const errors = json.errors || json.data.productUpdate.userErrors;
      throw new Error(`Failed to save metafield: ${JSON.stringify(errors)}`);
    }

    devLog.log('[Curator] Saved note to Shopify metafield');
    return true;
  } catch (error) {
    console.error('[Curator] Failed to save metafield:', error);
    return false;
  }
}
