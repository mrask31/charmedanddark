"use client";

import Link from "next/link";
import { useState } from "react";
import TwoPrice, { formatCurrency, getPublicPrice } from "@/components/TwoPrice";
import { isMember } from "@/lib/membership";

export default function ProductDetailContent({ product }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">
          Item sealed away
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          This ritual is no longer available.
        </h1>
        <p className="mt-3 text-sm text-white/70">
          The artifact you sought has been sealed into the archive. Return to
          the atelier to browse what remains.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md"
        >
          Back to Shop
        </Link>
      </section>
    );
  }

  const productName = product.name || "Item Sealed Away";
  const ritualLine =
    product.description ||
    "A refined gothic piece designed for quiet ritual and calm presence.";
  const price = product.price || null;
  const salePrice = product.salePrice || null;
  const publicPrice = getPublicPrice(price, salePrice);
  const sanctuaryPrice = publicPrice ? publicPrice * 0.9 : null;
  const previewImage =
    product.imageUrls?.[activeImageIndex] || product.imageUrls?.[0];
  const galleryImages = product.imageUrls?.length
    ? product.imageUrls.slice(0, 3)
    : [null, null, null];

  return (
    <>
      <section className="space-y-10 pb-16 lg:pb-6">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/60">
              <span>Gallery</span>
              <span className="ml-4 h-px flex-1 bg-white/10" />
              <span className="hidden text-[10px] uppercase tracking-[0.35em] text-white/40 md:block">
                Hover to zoom
              </span>
            </div>
            <div className="relative h-80 overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 via-black/60 to-black/90 shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:h-[420px]">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]" />
                  <div className="absolute inset-4 rounded-2xl border border-white/10" />
                  <div className="absolute inset-0 flex items-center justify-center text-5xl font-semibold tracking-[0.2em] text-white/10">
                    C&amp;D
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_55%)]" />
                </>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible">
              {galleryImages.map((image, index) => (
                <button
                  key={`${product.sku}-${index}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative h-20 min-w-[96px] flex-1 rounded-xl border bg-black/70 sm:h-24 sm:min-w-0 ${
                    index === activeImageIndex
                      ? "border-white/50 ring-1 ring-white/40"
                      : "border-white/10"
                  }`}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={`${product.name} preview ${index + 1}`}
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-black/50 to-black/80" />
                      <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.3em] text-white/30">
                        C&amp;D
                      </div>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
                <span className="rounded-full border border-white/15 px-3 py-1">
                  {product.category}
                </span>
                {product.salePrice && product.salePrice < product.price ? (
                  <span className="rounded-full border border-white/15 px-3 py-1">
                    Sale
                  </span>
                ) : null}
                {product.qty <= 0 ? (
                  <span className="rounded-full border border-white/15 px-3 py-1">
                    Sold Out
                  </span>
                ) : null}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {product.name}
              </h1>
              <TwoPrice
                price={price}
                salePrice={salePrice}
                currency={product.currency}
                isMember={isMember}
              />
              <p className="text-sm text-white/70">{ritualLine}</p>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <Link
                href="/join"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Join the Sanctuary (10% off always)
              </Link>
              <button
                type="button"
                className="w-full rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Save for Later
              </button>
              <p className="text-xs text-white/50">
                Checkout opens soon. Members get first access.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-medium">Ritual Details</h2>
              <div className="space-y-3 text-sm text-white/70">
                <p>Composition: Matte blend with tonal depth.</p>
                <p>Form: Structured, minimal, and layered.</p>
                <p>Care: Cool wash, air dry, low steam.</p>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-medium">Mood Match</h2>
              <p className="text-sm text-white/70">
                Return to the atelier to align with your next ritual.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/shop"
                  className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  Back to Shop
                </Link>
                {["Veilbound", "Obsidian", "Nocturne"].map((mood) => (
                  <Link
                    key={mood}
                    href="/shop"
                    className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:border-white/30"
                  >
                    {mood}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/70">
                Sanctuary members receive quiet access to ritual drops and
                private echoes.
              </p>
              <Link
                href="/join"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-5 py-2 text-xs font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Enter the Sanctuary
              </Link>
            </div>
          </div>
        </section>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 px-6 py-3 backdrop-blur sm:hidden">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Sanctuary
            </p>
            <p className="text-base font-medium text-white">
              {formatCurrency(sanctuaryPrice, product.currency)}
            </p>
          </div>
          <button
            type="button"
            disabled
            className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white/60"
          >
            Checkout soon
          </button>
        </div>
      </div>
    </>
  );
}
