/**
 * PreviewBanner — Floating indicator that campaign preview mode is active.
 *
 * Only renders when a promotion is being previewed (never visible to public).
 * Helps the merchant understand they are seeing a preview, not the live site.
 */
export function PreviewBanner({ promotionName }) {
  if (!promotionName) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 z-[9999] -translate-x-1/2 px-6 py-3 text-center shadow-lg"
      style={{
        backgroundColor: 'rgba(201, 169, 110, 0.95)',
        color: '#000',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        fontWeight: 500,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        borderRadius: '4px',
        maxWidth: '90vw',
      }}
    >
      Preview Mode — &ldquo;{promotionName}&rdquo; is not live
    </div>
  );
}
