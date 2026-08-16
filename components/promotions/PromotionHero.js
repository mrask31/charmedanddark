import Link from "next/link";

/**
 * PromotionHero — Featured campaign banner for the homepage.
 * Uses promotion data as the source of truth and keeps member savings explicit.
 */
export function PromotionHero({ promotion }) {
  if (!promotion) return null;

  const {
    heroTitle,
    heroSubtitle,
    heroCtaText,
    heroCtaUrl,
    accentColor,
    countdownEnabled,
    endDate,
    percentage,
    productIds,
  } = promotion;

  if (!heroTitle) return null;

  const percentOff = Number(percentage || 0);
  const selectedCount = productIds?.length || null;

  return (
    <section
      className="relative overflow-hidden border-y px-6 py-16 text-center md:py-20 lg:px-16"
      style={{
        backgroundColor: '#08080f',
        borderColor: `${accentColor}22`,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse 58% 72% at 50% 45%, ${accentColor}12 0%, ${accentColor}04 42%, transparent 72%)`,
        }}
      />
      <div
        className="absolute left-1/2 top-0 h-px w-48 -translate-x-1/2 md:w-72"
        aria-hidden="true"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}99, transparent)` }}
      />

      <div className="relative z-10 mx-auto max-w-4xl">
        <p
          className="mb-5 text-[10px] uppercase tracking-[0.34em]"
          style={{ color: accentColor, fontFamily: 'Inter, sans-serif' }}
        >
          The Season Has Turned
        </p>

        {percentOff > 0 && (
          <div className="mb-4 flex flex-col items-center">
            <span
              className="font-serif text-6xl leading-none md:text-8xl"
              style={{ color: '#f5f0e8', fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 400 }}
            >
              {percentOff}% OFF
            </span>
            <span
              className="mt-2 text-[10px] uppercase tracking-[0.28em]"
              style={{ color: `${accentColor}cc`, fontFamily: 'Inter, sans-serif' }}
            >
              {selectedCount ? `${selectedCount} Selected Pieces` : 'Selected Pieces'} · Limited Time
            </span>
          </div>
        )}

        <h2
          className="font-serif text-3xl italic leading-tight text-white md:text-5xl"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 400 }}
        >
          {heroTitle}
        </h2>

        {heroSubtitle && (
          <p
            className="mx-auto mt-4 max-w-2xl text-base font-light leading-relaxed md:text-lg"
            style={{ color: 'rgba(232, 228, 220, 0.72)', fontFamily: 'Inter, sans-serif' }}
          >
            {heroSubtitle}
          </p>
        )}

        {percentOff > 0 && (
          <div
            className="mx-auto mt-6 inline-flex items-center gap-2 border px-4 py-2 text-[10px] uppercase tracking-[0.18em]"
            style={{
              color: accentColor,
              borderColor: `${accentColor}33`,
              backgroundColor: `${accentColor}08`,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <span aria-hidden="true">◆</span>
            Sanctuary members take an additional 10% off sale prices
          </div>
        )}

        <div>
          <Link
            href={heroCtaUrl || '/sale'}
            className="mt-8 inline-block px-9 py-4 text-xs uppercase tracking-[0.16em] transition-all duration-200 hover:brightness-110"
            style={{ backgroundColor: accentColor, color: '#08080f', fontFamily: 'Inter, sans-serif' }}
          >
            {heroCtaText || 'Shop the Sale'}
          </Link>
        </div>

        {countdownEnabled && endDate && (
          <p
            className="mt-6 text-[11px] uppercase tracking-[0.2em]"
            style={{ color: `${accentColor}99`, fontFamily: 'Inter, sans-serif' }}
          >
            Ends {new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>
    </section>
  );
}
