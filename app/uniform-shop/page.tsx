import { ProductDiscoveryGrid } from '@/components/ProductDiscoveryGrid';
import { getDiscoveryProducts } from '@/lib/products-discovery';

/**
 * Uniform Shop - /uniform-shop
 * Curated uniform/apparel product browsing with strict density controls
 * Feature: product-discovery-threshold
 * 
 * Enforces:
 * - Maximum 4 items per row
 * - 5-7 products per viewport
 * - No infinite scrolling, no pagination
 * - Accent Reveal System (deep red/purple hovers)
 * - Dual Pricing Law
 */

export default async function UniformShopPage() {
  // Fetch products filtered by uniform/apparel category
  const allProducts = await getDiscoveryProducts();
  const uniformProducts = allProducts.filter(p => 
    p.category?.toLowerCase().includes('apparel') || 
    p.category?.toLowerCase().includes('uniform')
  );

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
            The Uniform
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
      <ProductDiscoveryGrid products={uniformProducts} route="uniform" />
    </div>
  );
}
