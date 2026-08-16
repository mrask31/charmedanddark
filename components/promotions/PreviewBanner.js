/**
 * PreviewBanner — Top-of-page indicator that campaign preview mode is active.
 *
 * Only renders when a promotion is being previewed (never visible to public).
 * Compact, non-obtrusive banner that stays visible while scrolling.
 */
export function PreviewBanner({ promotionName, promotionStatus }) {
  if (!promotionName) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-3 px-4 py-2"
      style={{
        backgroundColor: 'rgba(201, 169, 110, 0.95)',
        color: '#000',
        fontFamily: 'Inter, sans-serif',
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
    >
      <span style={{ opacity: 0.7 }}>Preview Mode</span>
      <span>&mdash;</span>
      <span>&ldquo;{promotionName}&rdquo;</span>
      {promotionStatus && promotionStatus !== 'active' && promotionStatus !== 'live' && (
        <>
          <span>&mdash;</span>
          <span style={{ opacity: 0.7 }}>Status: {promotionStatus}</span>
        </>
      )}
      <span>&mdash;</span>
      <span style={{ opacity: 0.7 }}>Not visible to customers</span>
    </div>
  );
}
