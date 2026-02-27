import { ProductDiscoveryGrid } from '@/components/ProductDiscoveryGrid';
import { getDiscoveryProducts } from '@/lib/products-discovery';

/**
 * The Object Gallery - /shop
 * Curated, gallery-like product browsing with strict density controls
 * Feature: product-discovery-threshold
 * 
 * Enforces:
 * - Maximum 4 items per row
 * - 5-7 products per viewport
 * - No infinite scrolling, no pagination
 * - Accent Reveal System (deep red/purple hovers)
 * - Dual Pricing Law
 */

// Force dynamic rendering to always fetch fresh product data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ShopPage() {
  const products = await getDiscoveryProducts();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f0' }}>
      {/* Header */}
      <div style={{ 
        borderBottom: '1px solid #e8e8e3',
        backgroundColor: '#f5f5f0',
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '2rem 3rem',
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 400, 
            letterSpacing: '-0.02em',
            color: '#1a1a1a',
            marginBottom: '0.5rem',
          }}>
            Objects
          </h1>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#404040', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em',
          }}>
            Curated Selection
          </p>
        </div>
      </div>

      {/* Discovery Grid */}
      <ProductDiscoveryGrid products={products} route="shop" />
    </div>
  );
}
