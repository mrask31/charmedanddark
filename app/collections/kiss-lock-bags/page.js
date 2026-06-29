import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/footer";
import { supabase } from "@/lib/supabase/client";

const KISS_LOCK_BAG_HANDLES = [
  'ghost-cat-pumpkin-kiss-lock-bag',
  'celestial-dragon-kiss-lock-bag-in-linen-cotton-blend',
  'celestial-kisslock-bag-in-linen-blended-fabric',
  'moon-moth-vintage-kiss-lock-bag-in-linen-blended-material',
  'desert-moon-cowgirl-kiss-lock-bag',
];

async function fetchBagProducts() {
  try {
    const { data } = await supabase
      .from('products')
      .select('name, title, handle, slug, price, sale_price, image_url, image_urls, images, short_description, description')
      .in('handle', KISS_LOCK_BAG_HANDLES)
      .eq('hidden', false);

    return KISS_LOCK_BAG_HANDLES
      .map((h) => (data || []).find((p) => p.handle === h || p.slug === h))
      .filter(Boolean);
  } catch (err) {
    console.error('Failed to fetch kiss lock bags:', err);
    return [];
  }
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

function getImage(product) {
  return product.image_url || product.image_urls?.[0] || product.images?.[0] || null;
}

export const metadata = {
  title: 'Kiss Lock Bags | Charmed & Dark',
  description: 'Vintage-inspired gothic kiss lock bags chosen as the new hero collection for Charmed & Dark.',
};

export default async function KissLockBagsPage() {
  const products = await fetchBagProducts();

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-8 pt-24 pb-16 text-center lg:px-16">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#B89C6D]" style={{ fontFamily: 'Inter, sans-serif' }}>
          Hero collection
        </p>
        <h1 className="mx-auto mt-5 max-w-4xl font-serif text-4xl italic leading-tight md:text-6xl">
          Kiss Lock Bags
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-sm font-light leading-relaxed text-zinc-300 md:text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
          One bag at a time. A complete dark little statement without needing to overbuild the outfit.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-xs uppercase tracking-[0.22em] text-zinc-500" style={{ fontFamily: 'Inter, sans-serif' }}>
          Start with the bag. Let everything else orbit around it.
        </p>
      </section>

      <section className="px-8 pb-24 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => {
            const price = product.sale_price || product.price;
            const slug = product.handle || product.slug;
            const imageUrl = getImage(product);
            const isIntentPick = index < 2;

            return (
              <Link key={slug} href={`/shop/${slug}`} className="group flex flex-col gap-4">
                <div className="relative aspect-[3/4] overflow-hidden border border-zinc-900 bg-zinc-950 transition-colors duration-160 group-hover:border-[#B89C6D]">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name || product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-700">
                      <span className="font-serif text-5xl">C&D</span>
                    </div>
                  )}
                  <span
                    className="absolute left-3 top-3 z-10 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.2em]"
                    style={{
                      color: '#c9a96e',
                      backgroundColor: 'rgba(8, 8, 15, 0.85)',
                      border: '1px solid rgba(201, 169, 110, 0.3)',
                      fontFamily: 'Inter, sans-serif',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {isIntentPick ? 'High Intent Pick' : 'Bag Favorite'}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="font-serif text-2xl leading-tight text-white transition-opacity duration-160 group-hover:opacity-80">
                    {product.name || product.title}
                  </h2>
                  <p className="text-sm font-light text-zinc-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {formatPrice(price)}
                  </p>
                  <p className="text-xs font-light leading-relaxed text-zinc-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Designed to be the focal point: one bag, one complete mood.
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {products.length === 0 && (
          <div className="mx-auto max-w-xl border border-zinc-900 px-6 py-12 text-center text-zinc-400">
            Kiss lock bags are being prepared for the shop.
          </div>
        )}
      </section>

      <section className="border-y border-zinc-900 px-8 py-12 text-center lg:px-16">
        <p className="mx-auto max-w-2xl text-sm font-light leading-relaxed text-zinc-400" style={{ fontFamily: 'Inter, sans-serif' }}>
          Best for shoppers who want one piece that carries the whole outfit: gothic, vintage-inspired, and easy to buy one at a time.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block border border-[#B89C6D] px-8 py-4 text-xs uppercase tracking-widest text-[#B89C6D] transition-colors duration-160 hover:bg-[#B89C6D] hover:text-black"
        >
          Continue Shopping
        </Link>
      </section>

      <Footer />
    </main>
  );
}