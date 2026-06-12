"use client";

/**
 * Product Badge Component
 *
 * Displays a badge label (e.g. "Best Seller", "New Arrival") on product cards
 * and product detail pages. Badge data comes from the product's metadata.badge
 * field in Supabase.
 *
 * To set a badge, update the product's metadata in Supabase:
 *   UPDATE products SET metadata = metadata || '{"badge": "Best Seller"}'::jsonb WHERE slug = 'my-product';
 *
 * To remove a badge:
 *   UPDATE products SET metadata = metadata - 'badge' WHERE slug = 'my-product';
 *
 * Supported badge values (display as-is):
 *   - "Best Seller"
 *   - "New Arrival"
 *   - "Summerween Favorite"
 *   - "Staff Pick"
 *   - "Limited Edition"
 *   - Or any custom string
 */

export default function ProductBadge({ badge, variant = 'card' }) {
  if (!badge) return null;

  if (variant === 'detail') {
    return (
      <span
        className="inline-block text-[10px] uppercase tracking-[0.2em] font-medium px-3 py-1"
        style={{
          color: '#c9a96e',
          backgroundColor: 'rgba(201, 169, 110, 0.08)',
          border: '1px solid rgba(201, 169, 110, 0.25)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {badge}
      </span>
    );
  }

  // Card variant — positioned absolutely over the image
  return (
    <span
      className="absolute top-3 left-3 z-10 text-[9px] uppercase tracking-[0.2em] font-medium px-2.5 py-1"
      style={{
        color: '#c9a96e',
        backgroundColor: 'rgba(8, 8, 15, 0.85)',
        border: '1px solid rgba(201, 169, 110, 0.3)',
        fontFamily: 'Inter, sans-serif',
        backdropFilter: 'blur(4px)',
      }}
    >
      {badge}
    </span>
  );
}
