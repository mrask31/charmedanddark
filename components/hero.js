import Link from "next/link";
import Image from "next/image";

export function Hero({ products = [] }) {
  const images = products.filter((product) => product?.imageUrls?.[0]).slice(0, 3);

  return (
    <section aria-labelledby="home-heading" className="relative overflow-hidden bg-[#0b0a0c]">
      <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/images/homepage/hero-background.jpg')" }} />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-2 lg:gap-14 lg:px-10 lg:py-16">
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.18em] text-[#d4b984]">Gothic goods for everyday living</p>
          <h1 id="home-heading" className="mt-5 font-serif text-[2.75rem] italic leading-[1.08] text-[#f5f0e8] sm:text-6xl lg:text-7xl">
            Live Beautifully<br className="hidden sm:block" /> in the Shadows.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-[#ded8cf]">Distinctive bags, expressive apparel, and atmospheric pieces for your home.</p>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#bdb5a9]">Elegant gothic goods for the life you actually live.</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/shop" className="inline-flex min-h-12 items-center justify-center bg-[#c9a96e] px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-[#dfc394]">Explore the Collection</Link>
            <Link href="/collections/kiss-lock-bags" className="inline-flex min-h-12 items-center gap-2 py-3 text-sm text-[#f5f0e8] underline underline-offset-4">Shop Kisslock Bags <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        {images.length > 0 && (
          <div className="grid h-[300px] grid-cols-3 grid-rows-2 gap-3 sm:h-[410px] lg:h-[540px]">
            {images.map((product, index) => (
              <Link key={product.id} href={`/shop/${product.slug || product.handle}`} className={`group relative overflow-hidden bg-[#171318] ${index === 0 ? `row-span-2 ${images.length === 1 ? 'col-span-3' : 'col-span-2'}` : images.length === 2 ? 'row-span-2' : ''}`}>
                <Image src={product.imageUrls[0]} alt={product.name || product.title} fill priority={index === 0} sizes={index === 0 ? '(max-width: 1023px) 65vw, 400px' : '(max-width: 1023px) 32vw, 200px'} className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" />
                <span aria-hidden="true" className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/70 text-white">↗</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
