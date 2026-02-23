import { NextResponse } from 'next/server';
import { getAdminToken, getStoreDomain, SHOPIFY_API_VERSION } from '@/lib/shopify/config';

/**
 * Sync Sanctuary Member to Shopify Customer
 * Creates or updates Shopify customer with sanctuary_member tag
 */

const CREATE_CUSTOMER_MUTATION = `
  mutation customerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        tags
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_CUSTOMER_MUTATION = `
  mutation customerUpdate($input: CustomerInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        email
        tags
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const SEARCH_CUSTOMER_QUERY = `
  query searchCustomers($query: String!) {
    customers(first: 1, query: $query) {
      edges {
        node {
          id
          email
          tags
        }
      }
    }
  }
`;

async function shopifyAdminRequest(query: string, variables: any) {
  const domain = getStoreDomain();
  const token = getAdminToken();
  const endpoint = `https://${domain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(`GraphQL errors: ${json.errors.map((e: any) => e.message).join(', ')}`);
  }

  return json.data;
}

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    console.log('[Sanctuary Sync] Syncing customer:', email);

    // Search for existing customer
    const searchData = await shopifyAdminRequest(SEARCH_CUSTOMER_QUERY, {
      query: `email:${email}`,
    });

    const existingCustomer = searchData.customers.edges[0]?.node;

    if (existingCustomer) {
      // Update existing customer with sanctuary_member tag
      const tags = existingCustomer.tags || [];
      if (!tags.includes('sanctuary_member')) {
        tags.push('sanctuary_member');
      }

      const updateData = await shopifyAdminRequest(UPDATE_CUSTOMER_MUTATION, {
        input: {
          id: existingCustomer.id,
          tags,
        },
      });

      console.log('[Sanctuary Sync] Updated existing customer:', existingCustomer.id);

      return NextResponse.json({
        success: true,
        customer: updateData.customerUpdate.customer,
        action: 'updated',
      });
    } else {
      // Create new customer with sanctuary_member tag
      const createData = await shopifyAdminRequest(CREATE_CUSTOMER_MUTATION, {
        input: {
          email,
          tags: ['sanctuary_member'],
          emailMarketingConsent: {
            marketingState: 'NOT_SUBSCRIBED',
          },
        },
      });

      if (createData.customerCreate.userErrors.length > 0) {
        throw new Error(createData.customerCreate.userErrors[0].message);
      }

      console.log('[Sanctuary Sync] Created new customer:', createData.customerCreate.customer.id);

      return NextResponse.json({
        success: true,
        customer: createData.customerCreate.customer,
        action: 'created',
      });
    }
  } catch (error) {
    console.error('[Sanctuary Sync] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}
