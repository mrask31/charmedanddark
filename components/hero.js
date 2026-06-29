import Link from "next/link";

export function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black" style={{ paddingBottom: '32px' }}>
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/homepage/hero-background.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
        <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-[#B89C6D]" style={{ fontFamily: 'Inter, sans-serif' }}>
          Convention favorite · online featured collection
        </p>
        <h1 className="max-w-4xl font-serif text-3xl italic leading-tight text-white md:text-5xl lg:text-6xl">
          One Kiss Lock Bag. The whole look changes.
        </h1>
        <p className="mt-6 max-w-2xl text-sm font-light leading-relaxed text-zinc-300 md:text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
          Vintage-inspired gothic bags, dark home pieces, and seasonal apparel for those who live beautifully in the shadows.
        </p>

        {/* CTAs */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/collections/kiss-lock-bags"
            className="bg-[#B89C6D] px-8 py-4 text-xs uppercase tracking-widest text-black transition-opacity duration-160 hover:opacity-90"
          >
            Shop the Bags
          </Link>
          <Link
            href="/shop"
            className="border border-white px-8 py-4 text-xs uppercase tracking-widest text-white transition-colors duration-160 hover:bg-white hover:text-black"
          >
            View All Pieces
          </Link>
        </div>
      </div>
    </section>
  );
}