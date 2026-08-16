/**
 * PromotionBadge — Sale badge overlay for product cards.
 *
 * Renders a small badge (e.g. "40% OFF") on the product card image.
 * Only renders when the product has a saleBadge from the promotion engine.
 *
 * Props:
 *   badge: string | null — Badge text (e.g. "40% OFF", "SUMMERWEEN")
 *   accentColor: string — Badge accent color (default gold)
 */
export function PromotionBadge({ badge, accentColor = '#c9a96e' }) {
  if (!badge) return null;

  return (
    <span
      className="absolute right-3 top-3 z-20 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.2em]"
      style={{
        color: '#fff',
        backgroundColor: accentColor,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {badge}
    </span>
  );
}
