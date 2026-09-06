import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/footer";
import { getProducts } from "@/lib/products";
import { productIsAvailable, productPricing, formatProductPrice } from "@/lib/product-display";
import {
  getActivePromotions,
  PROMOTION_ENGINE_ENABLED,
} from "@/lib/promotions";

// ISR: revalidate every 60 seconds (matches promotion cache TTL)
export const revalidate = 60;

export const metadata = {
  title: 'Sale',
  description: 'Shop current savings on gothic bags, candles, apparel, and dark home decor at Charmed & Dark.',
  alternates: { canonical: 'https://www.charmedanddark.com/sale' },
};

export default async function SalePage() {
  const allProducts = await getProducts();
  let promotions = [];
  if (PROMOTION_ENGINE_ENABLED) {
    try { promotions = await getActivePromotions(); } catch { /* Campaign copy is optional. */ }
  }
  const sorted = allProducts.map((product) => {
    const price = productPricing(product);
    return { product, pricing: { displayPrice: price.publicPrice, basePrice: price.originalPrice, percentage: price.salePercentage, savings: price.originalPrice - price.publicPrice, isOnSale: price.isOnSale } };
  }).filter(({ pricing }) => pricing.isOnSale).sort((a, b) => b.pricing.percentage - a.pricing.percentage);
  const primary = (sorted.length && promotions[0]) || {
    name: 'Current Savings',
    heroTitle: 'Discover a Little More Darkness',
    heroSubtitle: sorted.length ? 'Current savings on pieces for your wardrobe, rituals, and home.' : 'Our next sale is still taking shape. Explore the full collection while you wait.',
    accentColor: '#c9a96e',
  };

  return (
    <main
      className="min-h-screen text-white"
      style={{
        background:
          "linear-gradient(180deg, #0a0a12 0%, #0f0d14 30%, #110e16 60%, #0a0a12 100%)",
      }}
    >
      {/* ── Sale Hero ── */}
      <section className="relative overflow-hidden px-8 pt-24 pb-16 text-center lg:px-16">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 30%, ${primary.accentColor}06 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-10">
          {/* Badge */}
          <span
            className="inline-block px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] font-medium mb-6"
            style={{
              color: primary.accentColor,
              border: `1px solid ${primary.accentColor}40`,
              backgroundColor: `${primary.accentColor}08`,
            }}
          >
            {sorted.length ? "Current Savings" : "The Collection Awaits"}
          </span>

          <h1
            className="mx-auto max-w-4xl font-serif text-4xl italic leading-tight md:text-6xl"
            style={{ color: "#f5f0e8" }}
          >
            {primary.heroTitle || primary.name}
          </h1>

          {primary.heroSubtitle && (
            <p
              className="mx-auto mt-6 max-w-2xl text-sm font-light leading-relaxed md:text-lg"
              style={{
                color: "rgba(232, 228, 220, 0.7)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {primary.heroSubtitle}
            </p>
          )}

          <p
            className="mt-4 text-[11px] uppercase tracking-[0.2em]"
            style={{
              color: `${primary.accentColor}99`,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {sorted.length} {sorted.length === 1 ? "item" : "items"} on sale
          </p>
        </div>
      </section>

      {/* ── Product Grid ── */}
      <section className="px-8 pb-24 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map(({ product, pricing }) => {
            const slug = product.slug || product.handle;
            const imageUrl =
              product.imageUrls?.[0] || null;
            const isSoldOut = !productIsAvailable(product);

            return (
              <Link
                key={slug}
                href={`/shop/${slug}`}
                className="group flex flex-col gap-3"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden border border-[rgba(201,169,110,0.12)] bg-[#0e0d14] transition-all duration-200 group-hover:border-[#B89C6D]/40 group-hover:shadow-[0_0_20px_rgba(201,169,110,0.06)]">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isSoldOut ? "grayscale opacity-60" : ""}`}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-700">
                      <span className="font-serif text-4xl">C&D</span>
                    </div>
                  )}

                  {isSoldOut && <span className="absolute left-3 top-3 z-20 bg-black/80 px-3 py-1 text-xs text-zinc-200">Out of stock</span>}
                  {/* Sale badge */}
                  {pricing.badgeText && (
                    <span
                      className="absolute right-3 top-3 z-10 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.15em]"
                      style={{
                        color: "#fff",
                        backgroundColor: primary.accentColor,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {pricing.badgeText}
                    </span>
                  )}

                  {/* Percentage badge (fallback if no custom badge text) */}
                  {!pricing.badgeText && pricing.percentage > 0 && (
                    <span
                      className="absolute right-3 top-3 z-10 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.15em]"
                      style={{
                        color: "#fff",
                        backgroundColor: primary.accentColor,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {Math.round(pricing.percentage)}% Off
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col gap-1.5">
                  <h3
                    className="font-serif text-base leading-snug text-white transition-colors duration-160 group-hover:text-[#c9a96e] sm:text-lg line-clamp-2"
                    style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                  >
                    {product.name}
                  </h3>

                  {/* Pricing */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-sm font-light line-through"
                      style={{ color: "#6b6760", fontFamily: "Inter, sans-serif" }}
                    >
                      {formatProductPrice(pricing.basePrice, product.currency)}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: primary.accentColor,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {formatProductPrice(pricing.displayPrice, product.currency)}
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-[0.15em]"
                      style={{ color: "#6b6760", fontFamily: "Inter, sans-serif" }}
                    >
                      Save {formatProductPrice(pricing.savings, product.currency)}
                    </span>
                  </div>

                  {/* Sanctuary price */}
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="h-3 w-3 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      style={{ color: "#c9a96e" }}
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span
                      className="text-[11px]"
                      style={{ color: "#c9a96e", fontFamily: "Inter, sans-serif" }}
                    >
                      Member benefits confirmed in cart
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section
        className="px-8 py-14 text-center lg:px-16"
        style={{
          borderTop: "1px solid rgba(201,169,110,0.1)",
          borderBottom: "1px solid rgba(201,169,110,0.1)",
        }}
      >
        <p
          className="mx-auto max-w-2xl text-sm font-light leading-relaxed"
          style={{ color: "#a89a80", fontFamily: "Inter, sans-serif" }}
        >
          Current product prices are shown above. Eligible discounts, member benefits,
          shipping, and taxes are confirmed in your cart and at checkout.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block px-8 py-4 text-xs uppercase tracking-widest transition-all duration-200 hover:bg-[#c9a96e] hover:text-black"
          style={{ border: "1px solid #c9a96e", color: "#c9a96e" }}
        >
          Continue Shopping
        </Link>
      </section>

      <Footer />
    </main>
  );
}
