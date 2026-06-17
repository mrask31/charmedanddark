/**
 * SmallBusinessTrust — compact inline trust bar for product pages.
 */
export default function SmallBusinessTrust() {
  return (
    <p
      className="flex flex-wrap gap-x-3 gap-y-1 py-2 text-[11px] font-light"
      style={{
        color: 'rgba(232, 228, 220, 0.5)',
        fontFamily: 'Inter, sans-serif',
        borderTop: '1px solid rgba(201, 169, 110, 0.12)',
      }}
    >
      <span><span aria-hidden="true">🖤</span> Family-owned small business</span>
      <span aria-hidden="true" style={{ color: 'rgba(201, 169, 110, 0.3)' }}>·</span>
      <span><span aria-hidden="true">📦</span> Trusted fulfillment</span>
      <span aria-hidden="true" style={{ color: 'rgba(201, 169, 110, 0.3)' }}>·</span>
      <span><span aria-hidden="true">✓</span> Secure Shopify checkout</span>
      <span aria-hidden="true" style={{ color: 'rgba(201, 169, 110, 0.3)' }}>·</span>
      <span><span aria-hidden="true">↩️</span> 30-day returns</span>
    </p>
  );
}
