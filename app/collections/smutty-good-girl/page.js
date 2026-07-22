import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/footer";
import { supabase } from "@/lib/supabase/client";

const SGG_HANDLES = [
  'smutty-good-girl-society-tote',
  'smutty-good-girl-reading-fuel-accent-coffee-mug-15oz',
  's-g-g-enchanted-reads-water-bottle-20oz',
  's-g-g-secret-society-water-bottle-20oz',
];

async function fetchProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('name, title, handle, slug, price, sale_price, image_url, image_urls, images, description, qty')
      .in('handle', SGG_HANDLES)
      .eq('hidden', false);

    if (error) {
      console.error('Failed to fetch Smutty Good Girl products:', error);
      return [];
    }

    return SGG_HANDLES
      .map((handle) => (data || []).find((product) => product.handle === handle || product.slug === handle))
      .filter(Boolean);
  } catch (error) {
    console.error('Failed to fetch Smutty Good Girl products:', error);
    return [];
  }
}

function getImage(product) {
  return product.image_url || product.image_urls?.[0] || product.images?.[0] || null;
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value));
}

export const metadata = {
  title: 'Smutty Good Girl Collection | Charmed & Dark',
  description: 'Bookish drinkware, totes, and everyday essentials for dark-romance readers, fictional-boyfriend collectors, and anyone with a suspiciously long TBR.',
};

export const revalidate = 0;

export default async function SmuttyGoodGirlCollectionPage() {
  const products = await fetchProducts();

  return (
    <main
      className="min-h-screen text-white"
      style={{
        background: 'radial-gradient(circle at 50% 0%, rgba(116, 56, 78, 0.2), transparent 35%), linear-gradient(180deg, #08080f 0%, #100b12 50%, #08080f 100%)',
      }}
    >
      <section className="relative overflow-hidden px-6 pb-14 pt-20 text-center sm:px-8 lg:px-16">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(ellipse 55% 45% at 50% 35%, rgba(202, 132, 157, 0.12) 0%, transparent 72%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-4xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#d7a0b5]" style={{ fontFamily: 'Inter, sans-serif' }}>
            A Charmed & Dark Bookish Collection
          </p>
          <h1 className="mt-5 font-serif text-4xl italic leading-tight text-[#f7f1f3] md:text-6xl">
            Smutty Good Girl
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-[#c8bcc1] md:text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
            Sweet on the outside. Unhinged between chapters. Bookish drinkware, totes, and everyday essentials for readers who prefer their stories dark, dramatic, and morally questionable.
          </p>
          <p className="mx-auto mt-5 max-w-xl text-xs uppercase tracking-[0.2em] text-[#8d747e]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Good girls read bad books.
          </p>
        </div>
      </section>

      <section className="px-6 pb-10 sm:px-8 lg:px-16">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-7 gap-y-3 border border-[#d7a0b5]/15 bg-[#d7a0b5]/[0.03] px-6 py-4 text-center">
          {['Dark romance approved', 'Bookish gift ready', 'Secure checkout', 'Sanctuary members save 10%'].map((item) => (
            <span key={item} className="text-[10px] uppercase tracking-[0.18em] text-[#a98b96]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24 sm:px-8 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const slug = product.handle || product.slug;
            const imageUrl = getImage(product);
            const price = Number(product.sale_price || product.price);
            const isSoldOut = product.qty != null && product.qty <= 0;

            return (
              <Link key={slug} href={`/shop/${slug}`} className="group flex flex-col gap-4">
                <div className="relative aspect-[3/4] overflow-hidden border border-[#d7a0b5]/15 bg-[#100c12] transition-all duration-200 group-hover:border-[#d7a0b5]/50 group-hover:shadow-[0_0_35px_rgba(215,160,181,0.09)]">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name || product.title}
                      fill
                      className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isSoldOut ? 'grayscale opacity-60' : ''}`}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#6f5660]">
                      <span className="font-serif text-4xl">S.G.G.</span>
                    </div>
                  )}
                  {!isSoldOut && (
                    <span className="absolute left-3 top-3 z-10 border border-[#d7a0b5]/30 bg-[#08080f]/85 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[#d7a0b5] backdrop-blur-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Just Dropped
                    </span>
                  )}
                </div>

                <div className="px-1">
                  <h2 className="font-serif text-xl leading-tight text-[#f7f1f3] transition-colors group-hover:text-[#d7a0b5] sm:text-2xl">
                    {product.name || product.title}
                  </h2>
                  <p className="mt-2 text-sm font-light text-[#b8aeb2]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {isSoldOut ? 'Notify me when available' : formatPrice(price)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {products.length === 0 && (
          <div className="mx-auto max-w-xl border border-[#d7a0b5]/15 px-6 py-12 text-center text-[#8d747e]">
            The Smutty Good Girl collection is being prepared for the shop.
          </div>
        )}
      </section>

      <section className="border-y border-[#d7a0b5]/10 px-6 py-16 text-center sm:px-8 lg:px-16">
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#d7a0b5]" style={{ fontFamily: 'Inter, sans-serif' }}>
          Complete the Reading Ritual
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl font-serif text-3xl italic text-[#f7f1f3] md:text-4xl">
          Add candlelight, pour something warm, and ignore the red flags in hardcover.
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/shop" className="border border-[#d7a0b5] px-7 py-3 text-xs uppercase tracking-widest text-[#d7a0b5] transition-colors hover:bg-[#d7a0b5] hover:text-black">
            Shop Candles & Dark Home
          </Link>
          <Link href="/drops" className="border border-white/15 px-7 py-3 text-xs uppercase tracking-widest text-zinc-300 transition-colors hover:border-white/40 hover:text-white">
            Explore New Drops
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
