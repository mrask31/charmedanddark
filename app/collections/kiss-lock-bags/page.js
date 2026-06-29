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
    const { data, error } = await supabase
      .from('products')
      .select('name, title, handle, slug, price, sale_price, image_url, image_urls, images, description, qty')
      .in('handle', KISS_LOCK_BAG_HANDLES)
      .eq('hidden', false);

    if (error) {
      console.error('Failed to fetch kiss lock bags:', error);
      return [];
    }

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
  description: 'Vintage-inspired gothic kiss lock bags. Small statement pieces that carry the whole mood — one bag at a time.',
};

export default async function KissLockBagsPage() {
  const products = await fetchBagProducts();

  return (
    <main
      className="min-h-screen text-white"
      style={{
        background: 'linear-gradient(180deg, #0a0a12 0%, #0f0d14 30%, #110e16 60%, #0a0a12 100%)',
      }}
    >
      {/* ── Hero Section ── */}
      <section className="relative px-8 pt-24 pb-16 text-center lg:px-16 overflow-hidden">
        {/* Subtle warm radial glow behind heading */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(201,169,110,0.04) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10">
          <p
            className="text-[11px] uppercase tracking-[0.3em]"
            style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif' }}
          >
            Hero Collection
          </p>
          <h1
            className="mx-auto mt-5 max-w-4xl font-serif text-4xl italic leading-tight md:text-6xl"
            style={{ color: '#f5f0e8' }}
          >
            Kiss Lock Bags
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl text-sm font-light leading-relaxed md:text-base"
            style={{ color: '#c4bfb4', fontFamily: 'Inter, sans-serif' }}
          >
            One bag at a time. A complete dark little statement without needing to overbuild the outfit.
          </p>
          <p
            className="mx-auto mt-4 max-w-xl text-xs uppercase tracking-[0.22em]"
            style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}
          >
            Start with the bag. Let everything else orbit around it.
          </p>
        </div>
      </section>

      {/* ── Trust/Value Strip ── */}
      <section className="px-8 pb-10 lg:px-16">
        <div
          className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-4 text-center"
          style={{
            border: '1px solid rgba(201,169,110,0.15)',
            backgroundColor: 'rgba(201,169,110,0.03)',
          }}
        >
          {['Small gothic statement bags', 'Secure checkout', 'Easy everyday styling', 'Limited quantities'].map((item) => (
            <span
              key={item}
              className="text-[10px] uppercase tracking-[0.2em] font-light"
              style={{ color: '#a89a80', fontFamily: 'Inter, sans-serif' }}
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ── Editorial Buying Block ── */}
      <section className="px-8 pb-14 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="text-[11px] uppercase tracking-[0.25em] mb-4"
            style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif' }}
          >
            Why Kiss Lock Bags?
          </p>
          <p
            className="text-base font-light leading-relaxed md:text-lg"
            style={{ color: '#c4bfb4', fontFamily: 'Inter, sans-serif' }}
          >
            A kiss lock bag does not need much around it. It gives a simple outfit a focal point,
            adds vintage structure, and carries the whole mood without overbuilding the look.
          </p>
        </div>
      </section>

      {/* ── Product Grid ── */}
      <section className="px-8 pb-24 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => {
            const price = product.sale_price || product.price;
            const slug = product.handle || product.slug;
            const imageUrl = getImage(product);
            const isIntentPick = index < 2;
            const isSoldOut = product.qty != null && product.qty <= 0;
            const sanctuaryPrice = (price * 0.9).toFixed(2);

            return (
              <Link key={slug} href={`/shop/${slug}`} className="group flex flex-col gap-4">
                <div
                  className="relative aspect-[3/4] overflow-hidden border border-[rgba(201,169,110,0.12)] bg-[#0e0d14] transition-all duration-200 group-hover:border-[#B89C6D]/40 group-hover:shadow-[0_0_30px_rgba(201,169,110,0.08)]"
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name || product.title}
                      fill
                      className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isSoldOut ? 'grayscale opacity-60' : ''}`}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-700">
                      <span className="font-serif text-5xl">C&D</span>
                    </div>
                  )}

                  {/* Badge: sold-out takes priority over intent badge */}
                  {isSoldOut ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                      <div
                        className="px-4 py-2 text-center"
                        style={{
                          backgroundColor: 'rgba(8, 8, 15, 0.8)',
                          border: '1px solid rgba(201, 169, 110, 0.4)',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        <span
                          className="block text-[10px] uppercase tracking-[0.25em] font-medium"
                          style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif' }}
                        >
                          Out of Stock
                        </span>
                        <span
                          className="block mt-1 text-[9px] uppercase tracking-[0.15em]"
                          style={{ color: 'rgba(232, 228, 220, 0.6)', fontFamily: 'Inter, sans-serif' }}
                        >
                          Notify me when it returns
                        </span>
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col gap-2 px-1">
                  <h2
                    className="font-serif text-xl leading-tight transition-colors duration-160 group-hover:text-[#c9a96e] sm:text-2xl"
                    style={{ color: '#f5f0e8', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                  >
                    {product.name || product.title}
                  </h2>
                  {isSoldOut ? (
                    <p
                      className="text-[10px] uppercase tracking-[0.2em]"
                      style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}
                    >
                      Notify me when available
                    </p>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span
                        className="text-sm font-light"
                        style={{ color: '#c4bfb4', fontFamily: 'Inter, sans-serif' }}
                      >
                        {formatPrice(price)}
                      </span>
                      <span
                        className="text-[10px] uppercase tracking-[0.15em]"
                        style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif' }}
                      >
                        Sanctuary ${sanctuaryPrice}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {products.length === 0 && (
          <div
            className="mx-auto max-w-xl px-6 py-12 text-center"
            style={{ border: '1px solid rgba(201,169,110,0.15)', color: '#6b6760' }}
          >
            Kiss lock bags are being prepared for the shop.
          </div>
        )}
      </section>

      {/* ── Bottom CTA ── */}
      <section
        className="px-8 py-14 text-center lg:px-16"
        style={{ borderTop: '1px solid rgba(201,169,110,0.1)', borderBottom: '1px solid rgba(201,169,110,0.1)' }}
      >
        <p
          className="mx-auto max-w-2xl text-sm font-light leading-relaxed"
          style={{ color: '#a89a80', fontFamily: 'Inter, sans-serif' }}
        >
          Best for shoppers who want one piece that carries the whole outfit: gothic, vintage-inspired, and easy to buy one at a time.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block px-8 py-4 text-xs uppercase tracking-widest transition-all duration-200 hover:bg-[#c9a96e] hover:text-black"
          style={{
            border: '1px solid #c9a96e',
            color: '#c9a96e',
          }}
        >
          Continue Shopping
        </Link>
      </section>

      <Footer />
    </main>
  );
}
