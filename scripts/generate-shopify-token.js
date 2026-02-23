/**
 * Generate Shopify Admin API Access Token
 * Uses OAuth 2.0 Client Credentials Grant Flow
 * 
 * Run: node scripts/generate-shopify-token.js
 */

const https = require('https');

// Configuration - Replace these with your actual values
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';
const STORE_DOMAIN = 'charmed-dark.myshopify.com';

// Scopes your app needs
const SCOPES = [
  'read_products',
  'write_products',
  'read_product_listings',
  'write_product_listings',
  'read_files',
  'write_files'
].join(',');

/**
 * Generate access token using client credentials flow
 */
async function generateAccessToken() {
  console.log('🔐 Generating Shopify Admin API Access Token...\n');
  console.log(`Store: ${STORE_DOMAIN}`);
  console.log(`Client ID: ${CLIENT_ID.substring(0, 10)}...`);
  console.log(`Scopes: ${SCOPES}\n`);

  const postData = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  }).toString();

  const options = {
    hostname: STORE_DOMAIN,
    port: 443,
    path: '/admin/oauth/access_token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'Accept': 'application/json',
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

// Run the script
(async () => {
  try {
    // Validate configuration
    if (CLIENT_ID === 'YOUR_CLIENT_ID_HERE' || CLIENT_SECRET === 'YOUR_CLIENT_SECRET_HERE') {
      console.error('❌ Error: Please update CLIENT_ID and CLIENT_SECRET in the script');
      process.exit(1);
    }

    const result = await generateAccessToken();

    console.log('✅ Success! Access token generated:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Access Token: ${result.access_token}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 Next Steps:\n');
    console.log('1. Copy the access token above');
    console.log('2. Add it to your Vercel environment variables:');
    console.log('   Variable name: SHOPIFY_ADMIN_ACCESS_TOKEN');
    console.log(`   Value: ${result.access_token}\n`);
    console.log('3. Redeploy your app or wait for auto-deploy\n');

    console.log('🔗 Add to Vercel:');
    console.log('   https://vercel.com/mrask31/charmedanddark/settings/environment-variables\n');

    if (result.scope) {
      console.log(`Granted Scopes: ${result.scope}`);
    }

  } catch (error) {
    console.error('❌ Error generating token:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   - Verify Client ID and Client Secret are correct');
    console.error('   - Ensure the app is installed on your store');
    console.error('   - Check that Admin API scopes are configured');
    console.error('   - Confirm store domain is correct');
    process.exit(1);
  }
})();
