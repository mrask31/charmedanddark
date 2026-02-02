'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type FulfillmentType = 'printify' | 'in_house';
type ProductStatus = 'draft' | 'ready_to_publish';

interface Product {
  id: string;
  name: string;
  sku?: string;
  price: string | number;
  fulfillment_type: FulfillmentType;
  status: ProductStatus;
  primary_image_url?: string;
  gallery_image_urls?: string[];
  locked_narrative_id?: string;
  printify_sku?: string;
  printify_variant_notes?: string;
  inventory_count?: number;
  shipping_weight_oz?: number;
  created_at: string;
  updated_at: string;
}

type ReadinessStatus = 'ready' | 'blocked' | 'draft';

interface ProductReadiness {
  product: Product;
  status: ReadinessStatus;
  diagnostics: string[];
}

export default function LaunchBoardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [readiness, setReadiness] = useState<ProductReadiness[]>([]);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Load products from localStorage
    const saved = localStorage.getItem('product_catalog');
    if (saved) {
      try {
        const loadedProducts = JSON.parse(saved);
        setProducts(loadedProducts);
        
        // Calculate readiness for each product
        const readinessData = loadedProducts.map((product: Product) => 
          calculateReadiness(product)
        );
        setReadiness(readinessData);
      } catch (err) {
        console.error('Failed to load product catalog:', err);
      }
    }
  }, []);

  const calculateReadiness = (product: Product): ProductReadiness => {
    const diagnostics: string[] = [];

    // Check base requirements
    if (!product.name?.trim()) {
      diagnostics.push('Product name missing');
    }
    if (!product.price) {
      diagnostics.push('Price not set');
    }
    if (!product.locked_narrative_id) {
      diagnostics.push('Missing locked narrative');
    }

    // Check fulfillment-specific requirements
    if (product.fulfillment_type === 'printify' && !product.printify_sku?.trim()) {
      diagnostics.push('Printify SKU missing');
    }
    if (product.fulfillment_type === 'in_house' && (product.inventory_count === undefined || product.inventory_count === null)) {
      diagnostics.push('Inventory count missing');
    }

    // Determine status
    let status: ReadinessStatus;
    if (product.status === 'ready_to_publish' && diagnostics.length === 0) {
      status = 'ready';
    } else if (diagnostics.length > 0) {
      status = 'blocked';
    } else {
      status = 'draft';
    }

    return { product, status, diagnostics };
  };

  const handleProductClick = (productId: string) => {
    // Navigate to products page - the product page will need to handle opening specific products
    router.push(`/studio/products?edit=${productId}`);
  };

  const exportLaunchSnapshot = () => {
    const readyProducts = readiness.filter(r => r.status === 'ready');
    const blockedProducts = readiness.filter(r => r.status === 'blocked');
    const draftProducts = readiness.filter(r => r.status === 'draft');

    const snapshot = {
      timestamp: new Date().toISOString(),
      total_products: products.length,
      ready_to_publish_count: readyProducts.length,
      blocked_count: blockedProducts.length,
      draft_count: draftProducts.length,
      ready_products: readyProducts.map(r => ({
        id: r.product.id,
        name: r.product.name,
        sku: r.product.sku,
        fulfillment_type: r.product.fulfillment_type,
      })),
      blocked_products: blockedProducts.map(r => ({
        id: r.product.id,
        name: r.product.name,
        diagnostics: r.diagnostics,
      })),
    };

    copyToClipboard(JSON.stringify(snapshot, null, 2), 'Launch Snapshot');
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(`Copied: ${label}`);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (err) {
      setCopyFeedback('Copy failed');
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  };

  const readyProducts = readiness.filter(r => r.status === 'ready');
  const blockedProducts = readiness.filter(r => r.status === 'blocked');
  const draftProducts = readiness.filter(r => r.status === 'draft');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '400', marginBottom: '12px', color: '#0A0A0A' }}>
              Launch Board
            </h1>
            <p style={{ color: '#666', fontSize: '16px' }}>
              Product readiness dashboard for launch planning.
            </p>
          </div>
          <button
            onClick={exportLaunchSnapshot}
            style={{
              padding: '12px 24px',
              backgroundColor: '#0A0A0A',
              color: 'white',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Copy Launch Snapshot
          </button>
        </div>
      </div>

      {/* Feedback */}
      {copyFeedback && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f0f0f0',
          marginBottom: '24px',
          fontSize: '14px',
        }}>
          {copyFeedback}
        </div>
      )}

      {/* Summary Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '16px', 
        marginBottom: '48px' 
      }}>
        <div style={{ 
          padding: '24px', 
          border: '1px solid #ddd', 
          backgroundColor: 'white' 
        }}>
          <div style={{ fontSize: '32px', fontWeight: '400', color: '#0A0A0A', marginBottom: '8px' }}>
            {products.length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Total Products
          </div>
        </div>
        <div style={{ 
          padding: '24px', 
          border: '1px solid #2e7d32', 
          backgroundColor: '#e8f5e9' 
        }}>
          <div style={{ fontSize: '32px', fontWeight: '400', color: '#2e7d32', marginBottom: '8px' }}>
            {readyProducts.length}
          </div>
          <div style={{ fontSize: '14px', color: '#2e7d32' }}>
            Ready to Publish
          </div>
        </div>
        <div style={{ 
          padding: '24px', 
          border: '1px solid #d32f2f', 
          backgroundColor: '#ffebee' 
        }}>
          <div style={{ fontSize: '32px', fontWeight: '400', color: '#d32f2f', marginBottom: '8px' }}>
            {blockedProducts.length}
          </div>
          <div style={{ fontSize: '14px', color: '#d32f2f' }}>
            Blocked
          </div>
        </div>
        <div style={{ 
          padding: '24px', 
          border: '1px solid #e65100', 
          backgroundColor: '#fff3e0' 
        }}>
          <div style={{ fontSize: '32px', fontWeight: '400', color: '#e65100', marginBottom: '8px' }}>
            {draftProducts.length}
          </div>
          <div style={{ fontSize: '14px', color: '#e65100' }}>
            Drafts
          </div>
        </div>
      </div>

      {/* Ready to Publish Section */}
      {readyProducts.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '400', 
            marginBottom: '24px', 
            color: '#0A0A0A',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>✅</span> Ready to Publish
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {readyProducts.map(({ product }) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                style={{
                  border: '1px solid #2e7d32',
                  padding: '24px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '400', marginBottom: '8px', color: '#0A0A0A' }}>
                      {product.name}
                    </h3>
                    <div style={{ fontSize: '14px', color: '#666', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span>Fulfillment: {product.fulfillment_type}</span>
                      <span>Narrative: ✓ Linked</span>
                      <span
                        style={{
                          padding: '2px 8px',
                          backgroundColor: '#e8f5e9',
                          color: '#2e7d32',
                          fontSize: '12px',
                          borderRadius: '2px',
                        }}
                      >
                        Ready to Publish
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#2e7d32', marginTop: '8px' }}>
                      All requirements met. Product is ready for launch.
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#0A0A0A' }}>
                    View →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blocked Section */}
      {blockedProducts.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '400', 
            marginBottom: '24px', 
            color: '#0A0A0A',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span> Blocked
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {blockedProducts.map(({ product, diagnostics }) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                style={{
                  border: '1px solid #d32f2f',
                  padding: '24px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '400', marginBottom: '8px', color: '#0A0A0A' }}>
                      {product.name}
                    </h3>
                    <div style={{ fontSize: '14px', color: '#666', display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <span>Fulfillment: {product.fulfillment_type}</span>
                      <span>Narrative: {product.locked_narrative_id ? '✓ Linked' : '✗ Missing'}</span>
                      <span
                        style={{
                          padding: '2px 8px',
                          backgroundColor: product.status === 'ready_to_publish' ? '#e8f5e9' : '#fff3e0',
                          color: product.status === 'ready_to_publish' ? '#2e7d32' : '#e65100',
                          fontSize: '12px',
                          borderRadius: '2px',
                        }}
                      >
                        {product.status === 'ready_to_publish' ? 'Ready to Publish' : 'Draft'}
                      </span>
                    </div>
                    
                    {/* Diagnostics */}
                    <div style={{ 
                      padding: '12px', 
                      backgroundColor: '#ffebee', 
                      border: '1px solid #d32f2f',
                      borderRadius: '4px'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#d32f2f', marginBottom: '8px' }}>
                        Issues blocking publication:
                      </div>
                      <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#d32f2f' }}>
                        {diagnostics.map((diagnostic, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>
                            {diagnostic}
                          </li>
                        ))}
                      </ul>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
                        Fix these items to make product publishable
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#0A0A0A', marginLeft: '16px' }}>
                    Fix →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Draft Section */}
      {draftProducts.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '400', 
            marginBottom: '24px', 
            color: '#0A0A0A',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>📝</span> Drafts
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {draftProducts.map(({ product }) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                style={{
                  border: '1px solid #ddd',
                  padding: '24px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '400', marginBottom: '8px', color: '#0A0A0A' }}>
                      {product.name}
                    </h3>
                    <div style={{ fontSize: '14px', color: '#666', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span>Fulfillment: {product.fulfillment_type}</span>
                      <span>Narrative: {product.locked_narrative_id ? '✓ Linked' : '✗ Missing'}</span>
                      <span
                        style={{
                          padding: '2px 8px',
                          backgroundColor: '#fff3e0',
                          color: '#e65100',
                          fontSize: '12px',
                          borderRadius: '2px',
                        }}
                      >
                        Draft
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                      Work in progress. Complete and mark ready to publish.
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#0A0A0A' }}>
                    Edit →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {products.length === 0 && (
        <div style={{
          padding: '48px',
          textAlign: 'center',
          border: '1px solid #ddd',
          backgroundColor: '#fafafa',
        }}>
          <p style={{ color: '#666', fontSize: '16px', marginBottom: '24px' }}>
            No products yet. Create products in the Product Catalog to see launch readiness.
          </p>
          <button
            onClick={() => router.push('/studio/products')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#0A0A0A',
              color: 'white',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Go to Product Catalog
          </button>
        </div>
      )}
    </div>
  );
}
