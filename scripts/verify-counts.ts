/**
 * Quick count verification script
 * Run: npx ts-node scripts/verify-counts.ts
 */

import { getHouseProducts } from '../lib/products.js';
import { getActiveCoreUniform, apparelItems } from '../lib/apparel.js';

console.log('=== INVENTORY COUNT VERIFICATION ===\n');

const houseProducts = getHouseProducts();
const coreUniform = getActiveCoreUniform();
const allApparel = apparelItems;

console.log(`House Products (getHouseProducts): ${houseProducts.length}`);
console.log(`  Expected: 54`);
console.log(`  Status: ${houseProducts.length === 54 ? '✅ PASS' : '❌ FAIL'}\n`);

console.log(`Active Core Uniform (getActiveCoreUniform): ${coreUniform.length}`);
console.log(`All Apparel Items (apparelItems): ${allApparel.length}`);
console.log(`  Expected: 12`);
console.log(`  Status: ${allApparel.length === 12 ? '✅ PASS' : '❌ FAIL'}\n`);

// Count products with variants
const productsWithVariants = houseProducts.filter(p => p.variants && p.variants.length > 0);
const totalVariants = productsWithVariants.reduce((sum, p) => sum + (p.variants?.length || 0), 0);

console.log(`Products with Variants: ${productsWithVariants.length}`);
console.log(`Total Variants: ${totalVariants}`);
console.log(`  Expected: 9 products, 32 variants`);
console.log(`  Status: ${productsWithVariants.length === 9 && totalVariants === 32 ? '✅ PASS' : '❌ FAIL'}\n`);

if (houseProducts.length === 54 && allApparel.length === 12 && productsWithVariants.length === 9 && totalVariants === 32) {
  console.log('🎉 ALL COUNTS VERIFIED - READY TO SHIP');
  process.exit(0);
} else {
  console.log('❌ COUNT MISMATCH - INVESTIGATE');
  process.exit(1);
}
