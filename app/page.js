import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/hero";
import { HomepageProductSection } from "@/components/homepage-product-section";
import { Footer } from "@/components/footer";
import DropAlertBand from "@/components/drops/DropAlertBand";
import { getMerchandisingProducts } from "@/lib/catalog-merchandising";
import { productIsAvailable } from "@/lib/product-display";
import { getActivePromotions, PROMOTION_ENGINE_ENABLED } from "@/lib/promotions";
import { PromotionHero } from "@/components/promotions/PromotionHero";
import { PreviewWrapper } from "@/components/promotions/PreviewWrapper";

export const revalidate = 60;
export const metadata = {
  title: { absolute: "Gothic Bags, Clothing & Home Décor | Charmed & Dark" },
  description: "Elegant gothic goods for the life you actually live. Discover distinctive kisslock bags, expressive clothing, candles, and atmospheric home décor at Charmed & Dark.",
  alternates: { canonical: "https://www.charmedanddark.com" },
  openGraph: {
    title: "Charmed & Dark — Gothic Goods for Everyday Living",
    description: "Distinctive bags, expressive apparel, and atmospheric pieces for your home.",
    url: "https://www.charmedanddark.com",
  },
};

function everydayPieces(products) {
  return products.filter((product) => !product.hidden && productIsAvailable(product) && !product.tags?.includes('lifecycle:last-chance'));
}

export default async function Home({ searchParams }) {
  const [bags, candles, darkHome, apparel, bookish] = await Promise.all([
    getMerchandisingProducts('homepage-best-sellers'),
    getMerchandisingProducts('homepage-candles'),
    getMerchandisingProducts('homepage-dark-home'),
    getMerchandisingProducts('homepage-apparel'),
    getMerchandisingProducts('smutty-good-girl'),
  ]);
  const groups = [bags, apparel, darkHome, candles].map(everydayPieces);
  const signaturePieces = groups.map((products) => products[0]).filter(Boolean);
  const heroProducts = [groups[0][0], groups[3][0], groups[2][0]].filter(Boolean);
  const bookishFeature = everydayPieces(bookish).find((product) => product.imageUrls?.[0]);
  const destinations = [
    { label: 'Kisslock Bags', description: 'A little statement. Everywhere you go.', handle: 'kiss-lock-bags', product: groups[0][0] },
    { label: 'Clothing', description: 'Your everyday, with a darker edge.', handle: 'gothic-clothing', product: groups[1][0] },
    { label: 'Home & Décor', description: 'Make your space feel like you.', handle: 'gothic-home-decor', product: groups[2][0] },
    { label: 'Candles & Ritual', description: 'Settle into the softer hours.', handle: 'candles-ritual', product: groups[3][0] },
  ];
  let homepagePromotion = null;
  if (PROMOTION_ENGINE_ENABLED) {
    try {
      const activePromos = await getActivePromotions();
      homepagePromotion = activePromos.find((promotion) => promotion.homepageEnabled) || null;
    } catch (err) {
      console.error('[Homepage] Campaign unavailable:', err.message);
    }
  }

  return (
    <>
      <main id="main-content" className="bg-[#08080a] text-[#f5f0e8]">
        <Hero products={heroProducts} />
        <section aria-labelledby="home-categories" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="home-categories" className="font-serif text-3xl sm:text-4xl">Find what feels like you.</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#c4bdb3]">Something to carry. Something to wear. Somewhere to belong.</p>
            </div>
            <Link href="/shop" className="inline-flex min-h-11 items-center gap-2 text-sm text-[#d4b984] underline underline-offset-4">Shop everything <span aria-hidden="true">→</span></Link>
          </div>
          <nav aria-label="Shop by category" className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4 lg:gap-6">
            {destinations.map((destination) => (
              <Link key={destination.handle} href={`/collections/${destination.handle}`} className="group min-w-0">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#19151b]">
                  {destination.product?.imageUrls?.[0] ? <Image src={destination.product.imageUrls[0]} alt={destination.product.name || destination.product.title} fill sizes="(max-width: 1023px) 50vw, 300px" className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" /> : <span className="absolute inset-0 flex items-center justify-center font-serif text-2xl text-[#d4b984]">{destination.label}</span>}
                </div>
                <h3 className="mt-3 flex items-center justify-between gap-2 text-base text-[#f5f0e8] sm:text-lg">{destination.label}<span aria-hidden="true" className="text-[#d4b984]">↗</span></h3>
                <p className="mt-1 text-sm leading-relaxed text-[#bdb5a9]">{destination.description}</p>
              </Link>
            ))}
          </nav>
        </section>
        {homepagePromotion && <PromotionHero promotion={homepagePromotion} />}
        <HomepageProductSection title="A few pieces to make your own" products={signaturePieces} viewAllHref="/shop" ctaLabel="Explore all pieces" intro="A first look at the little details that make an ordinary day feel more like you." />
        {bookishFeature && (
          <section aria-labelledby="featured-collection" className="border-y border-white/10 bg-[#121014]">
            <div className="mx-auto grid max-w-7xl md:grid-cols-2">
              <Link href="/collections/smutty-good-girl" className="relative block aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[430px]">
                <Image src={bookishFeature.imageUrls[0]} alt={bookishFeature.name || bookishFeature.title} fill sizes="(max-width: 767px) 100vw, 600px" className="object-cover object-center" />
              </Link>
              <div className="flex flex-col justify-center px-5 py-9 sm:px-8 md:px-12 md:py-14">
                <p className="text-xs uppercase tracking-[0.18em] text-[#d4b984]">The featured collection · Smutty Good Girl</p>
                <h2 id="featured-collection" className="mt-4 font-serif text-4xl italic leading-tight sm:text-5xl">For your next<br />late-night chapter.</h2>
                <p className="mt-4 max-w-md text-base leading-relaxed text-[#d0c8bd]">Dark-romance drinkware, totes, and everyday essentials for the good girls who read bad books.</p>
                <Link href="/collections/smutty-good-girl" className="mt-6 inline-flex min-h-12 w-fit items-center gap-4 border border-[#c9a96e] px-5 py-3 text-sm text-[#f5f0e8] transition-colors hover:bg-[#c9a96e] hover:text-black">Explore Smutty Good Girl <span aria-hidden="true">→</span></Link>
              </div>
            </div>
          </section>
        )}
        <section aria-labelledby="home-belonging" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-[#d4b984]">A place for your kind of beautiful</p>
            <h2 id="home-belonging" className="mt-4 font-serif text-4xl sm:text-5xl">You can feel at home here.</h2>
            <p className="mt-4 text-base leading-relaxed text-[#c4bdb3]">The bag you reach for. The candle you light. The corner of your home that feels entirely yours. Charmed &amp; Dark brings together gothic pieces for the moments you live every day.</p>
            <Link href="/about" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-[#d4b984] underline underline-offset-4">Meet Charmed &amp; Dark <span aria-hidden="true">→</span></Link>
          </div>
          <div className="mt-8 grid gap-6 border-t border-white/10 pt-7 text-center sm:grid-cols-3">
            <div><h3 className="text-sm text-[#f5f0e8]">Secure checkout</h3><p className="mt-2 text-sm leading-relaxed text-[#bdb5a9]">Orders are processed through Shopify.</p></div>
            <div><Link href="/returns" className="inline-flex min-h-6 items-center text-sm underline underline-offset-4">Returns, clearly explained</Link><p className="mt-2 text-sm leading-relaxed text-[#bdb5a9]">Read the policy before choosing your piece.</p></div>
            <div><Link href="/contact" className="inline-flex min-h-6 items-center text-sm underline underline-offset-4">A question before you order?</Link><p className="mt-2 text-sm leading-relaxed text-[#bdb5a9]">Get in touch. We’re here to help.</p></div>
          </div>
        </section>
        <div className="border-t border-white/10 bg-[#101014]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 pt-9 sm:px-8 lg:px-10">
            <Link href="/drops" className="inline-flex min-h-11 items-center gap-3 text-base text-[#f5f0e8]">Discover new &amp; upcoming drops <span aria-hidden="true">→</span></Link>
            <Link href="/last-chance" className="inline-flex min-h-11 items-center text-sm text-[#c4bdb3] underline underline-offset-4">Last Chance: retiring designs</Link>
          </div>
          <DropAlertBand variant="home" />
        </div>
        <PreviewWrapper searchParams={searchParams} products={signaturePieces} />
      </main>
      <Footer />
    </>
  );
}
