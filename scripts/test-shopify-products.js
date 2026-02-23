/**
 * Test Shopify Product Query
 * Verifies that products with specific tags can be found
 */

const https = require('https');

const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || 'YOUR_TOKEN_HERE';
const STORE_DOMAIN = 'charmed-dark.myshopify.com';

async function testProductQuery() {
  console.log('🔍 Testing Shopify Product Query...\n');

  // Test 1: Get ALL products (first 5)
  console.log('Test 1: Fetching first 5 products...');
  const allProducts = await queryProducts('', 5);
  console.log(`Found ${allProducts.length} products\n`);
  
  if (allProducts.length > 0) {
    console.log('Sample product:');
    console.log(`  Title: ${allProducts[0].title}`);
    console.log(`  Handle: ${allProducts[0].handle}`);
    console.log(`  Tags: ${allProducts[0].tags.join(', ')}`);
    console.log('');
  }

  // Test 2: Search for products with img:needs-brand tag
  console.log('Test 2: Searching for tag:img:needs-brand...');
  const needsBrandProducts = await queryProducts('tag:img:needs-brand', 10);
  console.log(`Found ${needsBrandProducts.length} products\n`);

  // Test 2b: Try searching for "Calming Crystal Candle" by title
  console.log('Test 2b: Searching for "Calming Crystal Candle" by title...');
  const candleProducts = await queryProducts('title:Calming Crystal Candle', 10);
  console.log(`Found ${candleProducts.length} products`);
  if (candleProducts.length > 0) {
    console.log('Product found! Tags:');
    candleProducts.forEach(p => {
      console.log(`  Title: ${p.title}`);
      console.log(`  Tags: [${p.tags.map(t => `"${t}"`).join(', ')}]`);
      console.log(`  Tag count: ${p.tags.length}`);
    });
  }
  console.log('');

  // Test 2c: Try searching with escaped colon
  console.log('Test 2c: Trying different tag search formats...');
  const formats = [
    'tag:"img:needs-brand"',
    'tag:img\\:needs-brand',
    'img:needs-brand',
  ];
  for (const format of formats) {
    const results = await queryProducts(format, 10);
    console.log(`  ${format} → ${results.length} products`);
  }
  console.log('');

  // Test 3: Search for products with all three tags
  console.log('Test 3: Searching for all three tags...');
  const query = '(tag:img:needs-brand AND tag:source:faire AND tag:dept:objects) AND (status:active OR status:draft)';
  console.log(`Query: ${query}`);
  const targetProducts = await queryProducts(query, 10);
  console.log(`Found ${targetProducts.length} products\n`);

  if (targetProducts.length > 0) {
    console.log('✅ Products found with all tags:');
    targetProducts.forEach(p => {
      console.log(`  - ${p.title}`);
      console.log(`    Handle: ${p.handle}`);
      console.log(`    Tags: ${p.tags.join(', ')}`);
      console.log(`    Images: ${p.images.length}`);
      console.log('');
    });
  } else {
    console.log('❌ No products found with all three tags');
    console.log('\nTrying individual tag searches...\n');
    
    const faire = await queryProducts('tag:source:faire', 10);
    const objects = await queryProducts('tag:dept:objects', 10);
    
    console.log(`Products with tag:source:faire: ${faire.length}`);
    console.log(`Products with tag:dept:objects: ${objects.length}`);
    console.log(`Products with tag:img:needs-brand: ${needsBrandProducts.length}`);
    
    if (faire.length > 0) {
      console.log('\nSample product with source:faire:');
      console.log(`  Title: ${faire[0].title}`);
      console.log(`  All tags: ${faire[0].tags.join(', ')}`);
    }
  }
}

async function queryProducts(searchQuery, limit) {
  const query = `
    query getProducts($query: String!, $first: Int!) {
      products(first: $first, query: $query) {
        edges {
          node {
            id
            handle
            title
            tags
            images(first: 5) {
              edges {
                node {
                  id
                  url
                }
              }
            }
          }
        }
      }
    }
  `;

  const postData = JSON.stringify({
    query,
    variables: {
      query: searchQuery,
      first: limit,
    },
  });

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
            if (response.errors) {
              reject(new Error(`GraphQL errors: ${JSON.stringify(response.errors)}`));
              return;
            }
            const products = response.data?.products?.edges?.map(edge => ({
              id: edge.node.id,
              handle: edge.node.handle,
              title: edge.node.title,
              tags: edge.node.tags,
              images: edge.node.images.edges.map(imgEdge => ({
                id: imgEdge.node.id,
                url: imgEdge.node.url,
              })),
            })) || [];
            resolve(products);
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

    await testProductQuery();
    console.log('\n✅ Test complete!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
})();
