/**
 * Production Health Check - Curator Notes
 * Tests curator note generation and metafield saving for first 10 products
 */

import { getSupabaseClient } from '@/lib/supabase/client';
import { getCuratorNote } from '@/app/product/[handle]/actions';

interface Product {
  id: string;
  handle: string;
  title: string;
  product_type: string | null;
  description: string | null;
  shopify_product_id: string | null;
}

async function healthCheck() {
  console.log('🔍 Curator Note Health Check\n');
  console.log('Testing first 10 products...\n');

  const supabase = getSupabaseClient();

  // Fetch first 10 products
  const { data: products, error } = await supabase
    .from('products')
    .select('id, handle, title, product_type, description, shopify_product_id')
    .limit(10);

  if (error || !products) {
    console.error('❌ Failed to fetch products:', error);
    process.exit(1);
  }

  console.log(`Found ${products.length} products\n`);

  let successCount = 0;
  let failureCount = 0;
  let timeoutCount = 0;
  const results: Array<{
    handle: string;
    status: 'success' | 'failure' | 'timeout';
    duration: number;
    noteLength?: number;
  }> = [];

  for (const product of products) {
    const startTime = Date.now();
    
    try {
      console.log(`Testing: ${product.handle}`);
      
      const note = await getCuratorNote(
        product.shopify_product_id || product.id,
        product.title,
        product.product_type,
        product.description
      );

      const duration = Date.now() - startTime;

      if (note) {
        successCount++;
        results.push({
          handle: product.handle,
          status: 'success',
          duration,
          noteLength: note.length,
        });
        console.log(`  ✅ Success (${duration}ms, ${note.length} chars)`);
        console.log(`  📝 "${note.substring(0, 80)}..."\n`);
      } else {
        if (duration >= 3000) {
          timeoutCount++;
          results.push({
            handle: product.handle,
            status: 'timeout',
            duration,
          });
          console.log(`  ⏱️  Timeout (${duration}ms)\n`);
        } else {
          failureCount++;
          results.push({
            handle: product.handle,
            status: 'failure',
            duration,
          });
          console.log(`  ❌ Failed (${duration}ms)\n`);
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      failureCount++;
      results.push({
        handle: product.handle,
        status: 'failure',
        duration,
      });
      console.log(`  ❌ Error (${duration}ms):`, error instanceof Error ? error.message : error);
      console.log('');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Products: ${products.length}`);
  console.log(`✅ Success: ${successCount} (${Math.round(successCount / products.length * 100)}%)`);
  console.log(`❌ Failures: ${failureCount} (${Math.round(failureCount / products.length * 100)}%)`);
  console.log(`⏱️  Timeouts: ${timeoutCount} (${Math.round(timeoutCount / products.length * 100)}%)`);

  // Performance stats
  const successResults = results.filter(r => r.status === 'success');
  if (successResults.length > 0) {
    const avgDuration = successResults.reduce((sum, r) => sum + r.duration, 0) / successResults.length;
    const maxDuration = Math.max(...successResults.map(r => r.duration));
    const minDuration = Math.min(...successResults.map(r => r.duration));
    
    console.log('\nPerformance:');
    console.log(`  Average: ${Math.round(avgDuration)}ms`);
    console.log(`  Min: ${minDuration}ms`);
    console.log(`  Max: ${maxDuration}ms`);
  }

  // Note length stats
  const noteLengths = successResults.filter(r => r.noteLength).map(r => r.noteLength!);
  if (noteLengths.length > 0) {
    const avgLength = noteLengths.reduce((sum, len) => sum + len, 0) / noteLengths.length;
    console.log('\nNote Length:');
    console.log(`  Average: ${Math.round(avgLength)} chars`);
    console.log(`  Min: ${Math.min(...noteLengths)} chars`);
    console.log(`  Max: ${Math.max(...noteLengths)} chars`);
  }

  console.log('\n' + '='.repeat(60));

  // Exit with error if too many failures
  if (failureCount > products.length * 0.2) {
    console.log('\n⚠️  WARNING: More than 20% failure rate!');
    process.exit(1);
  }

  console.log('\n✅ Health check passed!');
  process.exit(0);
}

// Run health check
healthCheck().catch((error) => {
  console.error('❌ Health check failed:', error);
  process.exit(1);
});
