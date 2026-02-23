/**
 * Test Shopify Admin API Connection
 * Verifies that SHOPIFY_ADMIN_ACCESS_TOKEN works
 * 
 * Run: node scripts/test-shopify-connection.js
 */

const https = require('https');

// Load from environment or hardcode for testing
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || 'YOUR_TOKEN_HERE';
const STORE_DOMAIN = 'charmedanddark.myshopify.com';

/**
 * Test connection by fetching shop info
 */
async function testConnection() {
  console.log('🔍 Testing Shopify Admin API Connection...\n');
  console.log(`Store: ${STORE_DOMAIN}`);
  console.log(`Token: ${ACCESS_TOKEN.substring(0, 10)}...${ACCESS_TOKEN.substring(ACCESS_TOKEN.length - 4)}\n`);

  const query = `
    query {
      shop {
        name
        email
        myshopifyDomain
      }
      products(first: 1, query: "tag:img:needs-brand") {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  `;

  const postData = JSON.stringify({ query });

  const options = {
    hostname: STORE_DOMAIN,
    port: 443,
    path: '/admin/api/2024-01/graphql.json',
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': ACCESS_TOKEN,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            resolve(response);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Run the test
(async () => {
  try {
    if (ACCESS_TOKEN === 'YOUR_TOKEN_HERE') {
      console.error('❌ Error: Please set SHOPIFY_ADMIN_ACCESS_TOKEN environment variable');
      console.error('   or update ACCESS_TOKEN in the script\n');
      process.exit(1);
    }

    const result = await testConnection();

    if (result.errors) {
      console.error('❌ GraphQL Errors:', JSON.stringify(result.errors, null, 2));
      process.exit(1);
    }

    console.log('✅ Connection Successful!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Shop Info:');
    console.log(`  Name: ${result.data.shop.name}`);
    console.log(`  Email: ${result.data.shop.email}`);
    console.log(`  Domain: ${result.data.shop.myshopifyDomain}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const products = result.data.products.edges;
    if (products.length > 0) {
      console.log('✅ Found products with tag "img:needs-brand":');
      products.forEach(({ node }) => {
        console.log(`  - ${node.title} (${node.handle})`);
      });
    } else {
      console.log('ℹ️  No products found with tag "img:needs-brand"');
      console.log('   (This is OK - Darkroom will work when you add the tags)');
    }

    console.log('\n🎉 Your Shopify Admin API is ready!');
    console.log('   You can now use the Darkroom automation.\n');

  } catch (error) {
    console.error('❌ Connection Failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   - Verify the token is correct (starts with shpat_)');
    console.error('   - Check that the token is added to Vercel environment variables');
    console.error('   - Ensure the app has the required scopes');
    console.error('   - Confirm the app is installed on your store');
    process.exit(1);
  }
})();
