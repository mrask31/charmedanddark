import Link from "next/link";

/**
 * Social Proof Section — homepage trust signals using only verifiable claims.
 * No fabricated review or purchase counts.
 */

const PROOF_ITEMS = [
  {
    label: 'Featured at Haunted America 2026',
    detail: 'Official vendor — Grafton, IL',
    icon: '🦇',
  },
  {
    label: 'Sanctuary Members Save 10%',
    detail: 'Free to join. Discount applies at checkout.',
    icon: '🖤',
    href: '/join',
  },
  {
    label: 'Seasonal Collections',
    detail: 'Summerween, Haunted America, and year-round drops.',
    icon: '🌙',
    href: '/drops',
  },
  {
    label: 'Secure Shopify Checkout',
    detail: "All orders processed through Shopify’s trusted platform.",
    icon: '✓',
  },
];

export function SocialProof() {
  return (
    <section className="bg-black px-8 py-16 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROOF_ITEMS.map((item) => {
            const content = (
              <div className="flex flex-col items-center gap-2 text-center px-4 py-6">
                <span className="text-xl" aria-hidden="true">{item.icon}</span>
                <p className="text-xs uppercase tracking-[0.15em] font-medium" style={{ color: '#c9a96e' }}>
                  {item.label}
                </p>
                <p className="text-[11px] font-light leading-relaxed" style={{ color: 'rgba(232, 228, 220, 0.5)', fontFamily: 'Inter, sans-serif' }}>
                  {item.detail}
                </p>
              </div>
            );

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="border border-zinc-800 transition-colors duration-200 hover:border-[rgba(201,169,110,0.3)]"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div key={item.label} className="border border-zinc-800">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}