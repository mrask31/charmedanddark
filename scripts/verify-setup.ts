/**
 * Verify Charmed & Dark setup
 * Checks environment variables and connections
 */

import { createClient } from '@supabase/supabase-js';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const results: CheckResult[] = [];

function check(name: string, status: 'pass' | 'fail' | 'warn', message: string) {
  results.push({ name, status, message });
}

async function verifySetup() {
  console.log('🔍 Verifying Charmed & Dark Setup...\n');

  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN',
    'NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      check(envVar, 'pass', 'Set');
    } else {
      check(envVar, 'fail', 'Missing');
    }
  }

  // Test Supabase connection
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.from('products').select('count');
      
      if (error) {
        check('Supabase Connection', 'fail', `Error: ${error.message}`);
      } else {
        check('Supabase Connection', 'pass', 'Connected successfully');
      }
    } catch (error: any) {
      check('Supabase Connection', 'fail', `Error: ${error.message}`);
    }
  } else {
    check('Supabase Connection', 'fail', 'Missing credentials');
  }

  // Test Shopify connection
  const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const shopifyToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (shopifyDomain && shopifyToken) {
    try {
      const response = await fetch(
        `https://${shopifyDomain}/api/2024-01/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': shopifyToken,
          },
          body: JSON.stringify({
            query: '{ shop { name } }',
          }),
        }
      );

      const data = await response.json();

      if (data.errors) {
        check('Shopify Connection', 'fail', `Error: ${data.errors[0].message}`);
      } else if (data.data?.shop) {
        check('Shopify Connection', 'pass', `Connected to ${data.data.shop.name}`);
      } else {
        check('Shopify Connection', 'fail', 'Invalid response');
      }
    } catch (error: any) {
      check('Shopify Connection', 'fail', `Error: ${error.message}`);
    }
  } else {
    check('Shopify Connection', 'fail', 'Missing credentials');
  }

  // Print results
  console.log('Results:\n');
  
  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
  }

  const failCount = results.filter((r) => r.status === 'fail').length;
  const passCount = results.filter((r) => r.status === 'pass').length;

  console.log(`\n${passCount}/${results.length} checks passed`);

  if (failCount > 0) {
    console.log('\n⚠️  Some checks failed. Please review your .env file and configuration.');
    process.exit(1);
  } else {
    console.log('\n✨ Setup verified! You\'re ready to run the development server.');
  }
}

verifySetup();
