'use client';

// Temporarily disabled - needs refactoring for new product structure
export default function InventoryDebugPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Inventory Debug - Under Maintenance</h1>
      <p>This page is being updated for the new product structure.</p>
    </div>
  );
}

/*
// OLD CODE - TO BE REFACTORED
import { getHouseProducts } from '@/lib/products';
import { apparelItems } from '@/lib/apparel';

function InventoryDebugPageOld() {
  const houseProducts = getHouseProducts();
  const productsWithVariants = houseProducts.filter(p => p.variants && p.variants.length > 0);
  const totalVariants = productsWithVariants.reduce((sum, p) => sum + (p.variants?.length || 0), 0);

  const expectedCounts = {
    house: 54,
    uniform: 12,
    productsWithVariants: 9,
    totalVariants: 32
  };

  const isCorrect = (actual: number, expected: number) => actual === expected;

  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'monospace',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#0a0a0a',
      color: '#e0e0e0',
      minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#fff' }}>
        🔍 Inventory Debug Panel
      </h1>
      
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '1.5rem', 
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>
          📊 Inventory Counts
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Metric</th>
              <th style={{ textAlign: 'right', padding: '0.5rem' }}>Actual</th>
              <th style={{ textAlign: 'right', padding: '0.5rem' }}>Expected</th>
              <th style={{ textAlign: 'center', padding: '0.5rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #222' }}>
              <td style={{ padding: '0.5rem' }}>House Products</td>
              <td style={{ textAlign: 'right', padding: '0.5rem' }}>{houseProducts.length}</td>
              <td style={{ textAlign: 'right', padding: '0.5rem' }}>{expectedCounts.house}</td>
              <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                {isCorrect(houseProducts.length, expectedCounts.house) ? '✅' : '❌'}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #222' }}>
              <td style={{ padding: '0.5rem' }}>Uniform Products</td>
              <td style={{ textAlign: 'right', padding: '0.5rem' }}>{apparelItems.length}</td>
              <td style={{ textAlign: 'right', padding: '0.5rem' }}>{expectedCounts.uniform}</td>
              <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                {isCorrect(apparelItems.length, expectedCounts.uniform) ? '✅' : '❌'}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #222' }}>
              <td style={{ padding: '0.5rem' }}>Products with Variants</td>
              <td style={{ textAlign: 'right', padding: '0.5rem' }}>{productsWithVariants.length}</td>
              <td style={{ textAlign: 'right', padding: '0.5rem' }}>{expectedCounts.productsWithVariants}</td>
              <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                {isCorrect(productsWithVariants.length, expectedCounts.productsWithVariants) ? '✅' : '❌'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem' }}>Total Variants</td>
              <td style={{ textAlign: 'right', padding: '0.5rem' }}>{totalVariants}</td>
              <td style={{ textAlign: 'right', padding: '0.5rem' }}>{expectedCounts.totalVariants}</td>
              <td style={{ textAlign: 'center', padding: '0.5rem' }}>
                {isCorrect(totalVariants, expectedCounts.totalVariants) ? '✅' : '❌'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '1.5rem', 
        borderRadius: '8px'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>
          🔀 Products with Variants
        </h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {productsWithVariants.map(p => (
            <li key={p.id} style={{ 
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: '#0f0f0f',
              borderRadius: '4px'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{p.name}</strong>
                <span style={{ marginLeft: '1rem', color: '#888' }}>
                  ({p.variants?.length} variants)
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '0.5rem' }}>
                Slug: <code style={{ color: '#6c9' }}>{p.slug}</code>
              </div>
              <ul style={{ listStyle: 'none', padding: '0 0 0 1rem', marginTop: '0.5rem' }}>
                {p.variants?.map(v => (
                  <li key={v.id} style={{ 
                    padding: '0.5rem',
                    marginBottom: '0.25rem',
                    backgroundColor: v.isDefault ? '#1a2a1a' : '#0a0a0a',
                    borderLeft: v.isDefault ? '3px solid #4a4' : '3px solid #333',
                    fontSize: '0.9rem'
                  }}>
                    <span style={{ color: '#fff' }}>{v.label}</span>
                    <span style={{ marginLeft: '1rem', color: '#6c9' }}>
                      ${v.pricePublic.toFixed(2)}
                    </span>
                    <span style={{ marginLeft: '0.5rem', color: '#999' }}>
                      (Sanctuary: ${v.priceSanctuary.toFixed(2)})
                    </span>
                    {v.isDefault && (
                      <span style={{ marginLeft: '0.5rem', color: '#4a4' }}>[DEFAULT]</span>
                    )}
                    <span style={{ marginLeft: '0.5rem' }}>
                      {v.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#1a2a1a',
        borderRadius: '4px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, color: '#4a4' }}>
          {isCorrect(houseProducts.length, expectedCounts.house) &&
           isCorrect(apparelItems.length, expectedCounts.uniform) &&
           isCorrect(productsWithVariants.length, expectedCounts.productsWithVariants) &&
           isCorrect(totalVariants, expectedCounts.totalVariants)
            ? '🎉 All counts verified - Inventory is healthy!'
            : '⚠️ Count mismatch detected - Check CSV ingestion'}
        </p>
      </div>
    </div>
  );
}
*/
