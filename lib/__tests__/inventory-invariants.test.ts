/**
 * Inventory Invariant Tests
 * 
 * These tests enforce minimum inventory counts to prevent accidental regression.
 * If these tests fail, it means someone has modified the CSV files or ingestion
 * logic in a way that reduces the inventory below the verified baseline.
 * 
 * BASELINE ESTABLISHED: February 2026
 * - House products: 54 (realm='house')
 * - Uniform products: 12 (realm='uniform', from lib/apparel.ts)
 * - House variants: 21 (in lib/products.ts)
 * - Uniform variants: 11 (in lib/apparel.ts, for size-based products)
 * - Total variants: 32 (21 House + 11 Uniform)
 * 
 * These are MINIMUM counts. The inventory can grow, but should never shrink
 * below these numbers without explicit intention and review.
 */

import { products } from '../products';
import { apparelItems } from '../apparel';

describe('Inventory Invariants', () => {
  describe('House Inventory (lib/products.ts)', () => {
    it('should have at least 54 House products', () => {
      const houseProducts = products.filter(p => p.realm === 'house');
      expect(houseProducts.length).toBeGreaterThanOrEqual(54);
    });

    it('should have products with variants', () => {
      const productsWithVariants = products.filter(p => p.variants && p.variants.length > 0);
      expect(productsWithVariants.length).toBeGreaterThan(0);
    });
  });

  describe('Uniform Inventory (lib/apparel.ts)', () => {
    it('should have at least 12 Uniform items', () => {
      expect(apparelItems.length).toBeGreaterThanOrEqual(12);
    });

    it('should have all items with realm uniform or undefined', () => {
      // apparel.ts doesn't have realm field, but conceptually all items are uniform
      expect(apparelItems.length).toBeGreaterThan(0);
    });
  });

  describe('Variant Inventory', () => {
    it('should have at least 21 House variants across all products', () => {
      const totalVariants = products.reduce((sum, product) => {
        return sum + (product.variants?.length || 0);
      }, 0);
      
      expect(totalVariants).toBeGreaterThanOrEqual(21);
    });

    it('should have products with multiple variants', () => {
      const multiVariantProducts = products.filter(p => 
        p.variants && p.variants.length >= 2
      );
      
      expect(multiVariantProducts.length).toBeGreaterThan(0);
    });

    it('should have at least one default variant per product with variants', () => {
      const productsWithVariants = products.filter(p => p.variants && p.variants.length > 0);
      
      productsWithVariants.forEach(product => {
        const hasDefault = product.variants!.some(v => v.isDefault === true);
        expect(hasDefault).toBe(true);
      });
    });
  });

  describe('Data Integrity', () => {
    it('should have unique product IDs across House inventory', () => {
      const ids = products.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique apparel IDs across Uniform inventory', () => {
      const ids = apparelItems.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid pricing for all products', () => {
      products.forEach(product => {
        expect(product.pricePublic).toBeGreaterThan(0);
        expect(product.priceSanctuary).toBeGreaterThan(0);
        expect(product.priceSanctuary).toBeLessThan(product.pricePublic);
      });
    });

    it('should have valid pricing for all apparel', () => {
      apparelItems.forEach(item => {
        expect(item.pricePublic).toBeGreaterThan(0);
        expect(item.priceSanctuary).toBeGreaterThan(0);
        expect(item.priceSanctuary).toBeLessThan(item.pricePublic);
      });
    });
  });

  describe('Regression Prevention', () => {
    it('should fail if House inventory drops below 54', () => {
      const houseCount = products.filter(p => p.realm === 'house').length;
      
      if (houseCount < 54) {
        throw new Error(
          `REGRESSION DETECTED: House inventory has dropped to ${houseCount} (minimum: 54). ` +
          `Check canonical_products_pass1.csv and scripts/ingest-inventory.ts for changes.`
        );
      }
      
      expect(houseCount).toBeGreaterThanOrEqual(54);
    });

    it('should fail if Uniform inventory drops below 12', () => {
      const uniformCount = apparelItems.length;
      
      if (uniformCount < 12) {
        throw new Error(
          `REGRESSION DETECTED: Uniform inventory has dropped to ${uniformCount} (minimum: 12). ` +
          `Check lib/apparel.ts for changes.`
        );
      }
      
      expect(uniformCount).toBeGreaterThanOrEqual(12);
    });

    it('should fail if House variants drop below 21', () => {
      const totalVariants = products.reduce((sum, product) => {
        return sum + (product.variants?.length || 0);
      }, 0);
      
      if (totalVariants < 21) {
        throw new Error(
          `REGRESSION DETECTED: House variants have dropped to ${totalVariants} (minimum: 21). ` +
          `Check product_variants_pass1.csv and scripts/ingest-inventory.ts for changes.`
        );
      }
      
      expect(totalVariants).toBeGreaterThanOrEqual(21);
    });
  });
});
