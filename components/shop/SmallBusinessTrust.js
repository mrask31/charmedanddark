/**
 * SmallBusinessTrust — small business trust signals for product pages.
 */
export default function SmallBusinessTrust() {
  return (
    <div
      className="flex flex-col gap-2 py-3"
      style={{ borderTop: '1px solid rgba(201, 169, 110, 0.12)' }}
    >
      {[
        { icon: '🖤', text: 'Family-owned small business' },
        { icon: '📦', text: 'Carefully packed and shipped from trusted fulfillment partners' },
        { icon: '✓', text: 'Secure Shopify checkout' },
        { icon: '↩️', text: '30-day return policy' },
      ].map((item) => (
        <div key={item.text} className="flex items-center gap-2.5">
          <span className="text-[11px]" aria-hidden="true">{item.icon}</span>
          <span className="text-[12px] font-light" style={{ color: 'rgba(232, 228, 220, 0.55)', fontFamily: 'Inter, sans-serif' }}>
            {item.text}
          </span>
        </div>
      ))}
    </div>
  );
}
