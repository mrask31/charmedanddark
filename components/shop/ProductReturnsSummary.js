import Link from 'next/link';

/**
 * ProductReturnsSummary — brief return policy on product pages.
 */
export default function ProductReturnsSummary() {
  return (
    <div
      className="flex flex-col gap-2 py-3"
      style={{ borderTop: '1px solid rgba(201, 169, 110, 0.12)' }}
    >
      <p className="text-[12px] font-medium" style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif' }}>
        30-Day Returns
      </p>
      <p className="text-[11px] font-light leading-relaxed" style={{ color: 'rgba(232, 228, 220, 0.45)', fontFamily: 'Inter, sans-serif' }}>
        If your item arrives damaged or isn&apos;t what you expected, contact us within 30 days and we&apos;ll make it right.
      </p>
      <Link
        href="/returns"
        className="text-[11px] font-light underline underline-offset-2 transition-opacity hover:opacity-80"
        style={{ color: 'rgba(232, 228, 220, 0.4)', fontFamily: 'Inter, sans-serif' }}
      >
        Full return policy
      </Link>
    </div>
  );
}
