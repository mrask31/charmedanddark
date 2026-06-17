/**
 * ProductDeliveryEstimate — shows shipping timeline on product pages.
 * Detects made-to-order (Printify) products from vendor metadata.
 */
export default function ProductDeliveryEstimate({ vendor }) {
  const isMadeToOrder = vendor === 'Printify' || vendor === 'Charmed & Dark';

  return (
    <div
      className="flex flex-col gap-1.5 py-3"
      style={{ borderTop: '1px solid rgba(201, 169, 110, 0.12)' }}
    >
      {isMadeToOrder && (
        <p className="text-[12px] font-light" style={{ color: 'rgba(232, 228, 220, 0.55)', fontFamily: 'Inter, sans-serif' }}>
          <span aria-hidden="true">🖤</span> Made to order
        </p>
      )}
      <p className="text-[12px] font-light" style={{ color: 'rgba(232, 228, 220, 0.55)', fontFamily: 'Inter, sans-serif' }}>
        <span aria-hidden="true">📦</span> Estimated delivery: {isMadeToOrder ? '7–14 business days' : '3–5 business days'}
      </p>
    </div>
  );
}
