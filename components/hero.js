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
        <h1 className="max-w-4xl font-serif text-3xl italic leading-tight text-white md:text-5xl lg:text-6xl">
          Dark Home. Dark Style. Darker Stories.
        </h1>
        <p className="mt-6 max-w-2xl text-sm font-light leading-relaxed text-zinc-300 md:text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
          Curated gothic décor, apparel, accessories, and seasonal collections for those who live beautifully in the shadows.
        </p>

        {/* CTAs */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/shop"
            className="border border-white px-8 py-4 text-xs uppercase tracking-widest text-white transition-colors duration-160 hover:bg-white hover:text-black"
          >
            Shop Best Sellers
          </Link>
          <Link
            href="/drops"
            className="bg-[#B89C6D] px-8 py-4 text-xs uppercase tracking-widest text-black transition-opacity duration-160 hover:opacity-90"
          >
            Explore Summerween
          </Link>
        </div>
      </div>
    </section>
  );
}
