import Link from "next/link";

/**
 * PromotionHero — Featured campaign banner for the homepage.
 *
 * Only renders when an active promotion has homepage_enabled=true.
 * Displays the promotion's hero_title, hero_subtitle, CTA, and optional countdown.
 *
 * Props:
 *   promotion: Promotion object from getHomepagePromotion()
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
  } = promotion;

  // Don't render if no hero content
  if (!heroTitle) return null;

  return (
    <section
      className="relative overflow-hidden px-8 py-16 text-center lg:px-16"
      style={{ backgroundColor: '#08080f' }}
    >
      {/* Subtle accent glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${accentColor}08 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl">
        {/* Eyebrow badge */}
        <span
          className="inline-block px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] font-medium mb-6"
          style={{
            color: accentColor,
            border: `1px solid ${accentColor}40`,
            backgroundColor: `${accentColor}08`,
          }}
        >
          Limited Time
        </span>

        {/* Title */}
        <h2
          className="font-serif text-3xl italic leading-tight text-white md:text-5xl"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
        >
          {heroTitle}
        </h2>

        {/* Subtitle */}
        {heroSubtitle && (
          <p
            className="mt-4 text-base font-light leading-relaxed md:text-lg"
            style={{ color: 'rgba(232, 228, 220, 0.7)', fontFamily: 'Inter, sans-serif' }}
          >
            {heroSubtitle}
          </p>
        )}

        {/* CTA */}
        <Link
          href={heroCtaUrl || '/sale'}
          className="mt-8 inline-block px-8 py-4 text-xs uppercase tracking-widest transition-all duration-200 hover:opacity-90"
          style={{
            backgroundColor: accentColor,
            color: '#000',
          }}
        >
          {heroCtaText || 'Shop the Sale'}
        </Link>

        {/* Countdown placeholder — client component needed for live countdown */}
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
