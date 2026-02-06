/**
 * Unit tests for Product Data Foundation
 * 
 * Tests the product data module to ensure data integrity and helper functions work correctly.
 */

import {
  products,
  getProductBySlug,
  getProductsByCategory,
  getCoreProducts,
  getInStockProducts,
  getCategoriesWithCounts,
  searchProducts,
  validateAllProducts,
  validateProductCategory,
  type Product,
  type ProductCategory,
  type ProductStatus
} from '../products';

describe('Product Data Foundation', () => {
  describe('Product Data Integrity', () => {
    it('should have at least one product', () => {
      expect(products.length).toBeGreaterThan(0);
    });

    it('should have unique product IDs', () => {
      const ids = products.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique product slugs', () => {
      const slugs = products.map(p => p.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('should have valid sanctuary pricing (10% off public)', () => {
      products.forEach(product => {
        const expectedSanctuary = Math.round(product.pricePublic * 0.9 * 100) / 100;
        expect(product.priceSanctuary).toBe(expectedSanctuary);
      });
    });

    it('should have all required fields populated', () => {
      products.forEach(product => {
        expect(product.id).toBeTruthy();
        expect(product.slug).toBeTruthy();
        expect(product.name).toBeTruthy();
        expect(product.category).toBeTruthy();
        expect(product.status).toBeTruthy();
        expect(product.pricePublic).toBeGreaterThan(0);
        expect(product.priceSanctuary).toBeGreaterThan(0);
        expect(product.shortDescription).toBeTruthy();
        expect(product.description.ritualIntro).toBeTruthy();
        expect(product.description.objectDetails.length).toBeGreaterThan(0);
        expect(product.description.whoFor).toBeTruthy();
        expect(Array.isArray(product.images)).toBe(true);
        expect(typeof product.inStock).toBe('boolean');
      });
    });

    it('should have valid product categories', () => {
      const validCategories: ProductCategory[] = [
        "Candles & Scent",
        "Ritual Drinkware",
        "Wall Objects",
        "Decor Objects",
        "Table & Display",
        "Objects of Use",
        "Holiday"
      ];

      products.forEach(product => {
        expect(validCategories).toContain(product.category);
      });
    });

    it('should have valid product statuses', () => {
      const validStatuses: ProductStatus[] = ["core", "drop_candidate", "hold"];

      products.forEach(product => {
        expect(validStatuses).toContain(product.status);
      });
    });

    it('should have properly formatted slugs (lowercase, hyphenated)', () => {
      products.forEach(product => {
        expect(product.slug).toMatch(/^[a-z0-9-]+$/);
        expect(product.slug).not.toMatch(/^-|-$/); // No leading/trailing hyphens
      });
    });
  });

  describe('getProductBySlug', () => {
    it('should return a product when slug exists', () => {
      const firstProduct = products[0];
      const result = getProductBySlug(firstProduct.slug);
      expect(result).toBeDefined();
      expect(result?.id).toBe(firstProduct.id);
    });

    it('should return undefined when slug does not exist', () => {
      const result = getProductBySlug('non-existent-slug');
      expect(result).toBeUndefined();
    });

    it('should be case-sensitive', () => {
      const firstProduct = products[0];
      const result = getProductBySlug(firstProduct.slug.toUpperCase());
      expect(result).toBeUndefined();
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products in the specified category', () => {
      const category: ProductCategory = "Table & Display";
      const result = getProductsByCategory(category);
      
      expect(result.length).toBeGreaterThan(0);
      result.forEach(product => {
        expect(product.category).toBe(category);
      });
    });

    it('should return empty array for category with no products', () => {
      // This test assumes not all categories have products yet
      const allCategories: ProductCategory[] = [
        "Candles & Scent",
        "Ritual Drinkware",
        "Wall Objects",
        "Decor Objects",
        "Table & Display",
        "Objects of Use"
      ];

      const usedCategories = new Set(products.map(p => p.category));
      const unusedCategory = allCategories.find(cat => !usedCategories.has(cat));

      if (unusedCategory) {
        const result = getProductsByCategory(unusedCategory);
        expect(result).toEqual([]);
      }
    });

    it('should return all products when filtering by their category', () => {
      const categoryCounts = new Map<ProductCategory, number>();
      products.forEach(p => {
        categoryCounts.set(p.category, (categoryCounts.get(p.category) || 0) + 1);
      });

      categoryCounts.forEach((count, category) => {
        const result = getProductsByCategory(category);
        expect(result.length).toBe(count);
      });
    });
  });

  describe('getCoreProducts', () => {
    it('should return only products with status "core"', () => {
      const result = getCoreProducts();
      
      result.forEach(product => {
        expect(product.status).toBe('core');
      });
    });

    it('should not include drop_candidate or hold products', () => {
      const result = getCoreProducts();
      const nonCoreStatuses = result.filter(p => 
        p.status === 'drop_candidate' || p.status === 'hold'
      );
      
      expect(nonCoreStatuses.length).toBe(0);
    });
  });

  describe('getInStockProducts', () => {
    it('should return only products that are in stock', () => {
      const result = getInStockProducts();
      
      result.forEach(product => {
        expect(product.inStock).toBe(true);
      });
    });

    it('should not include out of stock products', () => {
      const result = getInStockProducts();
      const outOfStock = result.filter(p => !p.inStock);
      
      expect(outOfStock.length).toBe(0);
    });
  });

  describe('getCategoriesWithCounts', () => {
    it('should return all categories with product counts', () => {
      const result = getCategoriesWithCounts();
      
      expect(result.length).toBeGreaterThan(0);
      result.forEach(item => {
        expect(item.category).toBeTruthy();
        expect(item.count).toBeGreaterThan(0);
      });
    });

    it('should have accurate counts for each category', () => {
      const result = getCategoriesWithCounts();
      
      result.forEach(item => {
        const actualCount = products.filter(p => p.category === item.category).length;
        expect(item.count).toBe(actualCount);
      });
    });

    it('should not include categories with zero products', () => {
      const result = getCategoriesWithCounts();
      
      result.forEach(item => {
        expect(item.count).toBeGreaterThan(0);
      });
    });
  });

  describe('searchProducts', () => {
    it('should find products by name', () => {
      const firstProduct = products[0];
      const searchTerm = firstProduct.name.split(' ')[0].toLowerCase();
      const result = searchProducts(searchTerm);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(p => p.id === firstProduct.id)).toBe(true);
    });

    it('should find products by short description', () => {
      const productWithDescription = products.find(p => p.shortDescription.length > 10);
      if (productWithDescription) {
        const searchTerm = productWithDescription.shortDescription.split(' ')[0].toLowerCase();
        const result = searchProducts(searchTerm);
        
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('should be case-insensitive', () => {
      const firstProduct = products[0];
      const searchTermLower = firstProduct.name.split(' ')[0].toLowerCase();
      const searchTermUpper = searchTermLower.toUpperCase();
      
      const resultLower = searchProducts(searchTermLower);
      const resultUpper = searchProducts(searchTermUpper);
      
      expect(resultLower.length).toBe(resultUpper.length);
    });

    it('should return empty array when no matches found', () => {
      const result = searchProducts('xyznonexistentproduct123');
      expect(result).toEqual([]);
    });

    it('should search across multiple fields', () => {
      const result = searchProducts('ritual');
      
      // Should find products with "ritual" in name, description, or whoFor
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Brand Voice Compliance', () => {
    it('should not contain emojis in any text fields', () => {
      const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      
      products.forEach(product => {
        expect(product.name).not.toMatch(emojiRegex);
        expect(product.shortDescription).not.toMatch(emojiRegex);
        expect(product.description.ritualIntro).not.toMatch(emojiRegex);
        expect(product.description.whoFor).not.toMatch(emojiRegex);
        product.description.objectDetails.forEach(detail => {
          expect(detail).not.toMatch(emojiRegex);
        });
      });
    });

    it('should have "Who this is for" statements starting with "For those"', () => {
      products.forEach(product => {
        expect(product.description.whoFor).toMatch(/^For those/);
      });
    });

    it('should have ritual intros that are calm and poetic (no exclamation marks)', () => {
      products.forEach(product => {
        expect(product.description.ritualIntro).not.toContain('!');
      });
    });

    it('should have object details as factual bullets', () => {
      products.forEach(product => {
        expect(product.description.objectDetails.length).toBeGreaterThan(0);
        product.description.objectDetails.forEach(detail => {
          expect(detail.length).toBeGreaterThan(0);
          expect(detail.length).toBeLessThan(100); // Bullets should be concise
        });
      });
    });
  });
});


  describe('Shop Canon Guardrail', () => {
    it('should validate all products have canonical shop section assignment', () => {
      // This test enforces the shop canon guardrail
      // Every product MUST be assigned to a canonical shop section
      // No inference, no fallbacks, no exceptions
      expect(() => validateAllProducts()).not.toThrow();
    });

    it('should validate individual product categories', () => {
      products.forEach(product => {
        expect(() => validateProductCategory(product)).not.toThrow();
      });
    });

    it('should reject products with invalid categories', () => {
      const invalidProduct = {
        ...products[0],
        category: 'Invalid Category' as ProductCategory
      };
      
      expect(() => validateProductCategory(invalidProduct)).toThrow();
    });
  });
