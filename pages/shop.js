import Link from "next/link";
import { useEffect, useState } from "react";

const products = [
  {
    name: "Obsidian Ritual Coat",
    category: "Apparel",
    price: "$248",
    tag: "Limited",
    slug: "obsidian-ritual-coat",
    description:
      "A structured outer layer with a quiet drape, designed for nightly ritual.",
  },
  {
    name: "Nocturne Column Dress",
    category: "Apparel",
    price: "$198",
    tag: "New",
    slug: "nocturne-column-dress",
    description:
      "A long, minimal silhouette with a soft weight and refined presence.",
  },
  {
    name: "Eclipse Knit Layer",
    category: "Apparel",
    price: "$164",
    tag: "Essential",
    slug: "eclipse-knit-layer",
    description:
      "Midweight knit designed to anchor the Threshold wardrobe.",
  },
  {
    name: "Midnight Veil Top",
    category: "Apparel",
    price: "$128",
    tag: "New",
    slug: "midnight-veil-top",
    description:
      "A sheer layered piece with a subtle sheen and quiet movement.",
  },
  {
    name: "Smoke Glass Vessel",
    category: "Home Decor",
    price: "$68",
    tag: "Essential",
    slug: "smoke-glass-vessel",
    description: "A smoked glass form for incense, stems, or ritual objects.",
  },
  {
    name: "Blackened Brass Tray",
    category: "Home Decor",
    price: "$82",
    tag: "Limited",
    slug: "blackened-brass-tray",
    description: "A grounded surface for offerings, candles, or collections.",
  },
  {
    name: "Incense Stone Set",
    category: "Home Decor",
    price: "$54",
    tag: "New",
    slug: "incense-stone-set",
    description: "A trio of stones designed to hold scent and intention.",
  },
  {
    name: "Ritual Velvet Wrap",
    category: "Apparel",
    price: "$142",
    tag: "Essential",
    slug: "ritual-velvet-wrap",
    description:
      "A velvet layer with quiet drape and tonal depth for evening wear.",
  },
];

const moods = [
  "Veilbound",
  "Obsidian",
  "Nocturne",
  "Cathedral",
  "Shadow",
  "Eclipse",
];

export default function Shop() {
  const [activeProduct, setActiveProduct] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveProduct(null);
      }
    };

    if (activeProduct) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeProduct]);

  return (
    <section className="space-y-10">
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">Shop</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Shop
        </h1>
        <p className="max-w-2xl text-base leading-7 text-white/70">
          A curated boutique of gothic apparel and home decor, designed for
          quiet ritual and refined presence.
        </p>
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
          {["Apparel", "Home Decor", "Drops"].map((tab) => (
            <span
              key={tab}
              className="rounded-full border border-white/10 px-4 py-2"
            >
              {tab}
            </span>
          ))}
        </div>
      </section>

      <div className="h-px bg-white/10" />

      <section className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
            Search
            <input
              type="text"
              placeholder="Search the atelier"
              className="rounded-full border border-white/15 bg-black px-4 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            />
          </label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
            Category
            <select className="rounded-full border border-white/15 bg-black px-4 py-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
              <option>All</option>
              <option>Apparel</option>
              <option>Home Decor</option>
              <option>Drops</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
            Sort
            <select className="rounded-full border border-white/15 bg-black px-4 py-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
              <option>Newest</option>
              <option>Best Sellers</option>
              <option>Price</option>
            </select>
          </label>
          <button
            type="button"
            className="mt-6 h-[46px] rounded-full border border-white/20 px-6 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Filter
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Boutique Catalog</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <button
              key={product.name}
              type="button"
              onClick={() => setActiveProduct(product)}
              className="group rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-white/25"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
                <span>{product.tag}</span>
                <span>{product.category}</span>
              </div>
              <div className="mt-4 h-32 rounded-xl border border-white/10 bg-black/60" />
              <h3 className="mt-4 text-base font-medium text-white">
                {product.name}
              </h3>
              <p className="mt-2 text-sm text-white/70">{product.price}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/40">
                Quick View
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-[0.35em] text-white/60">
          Shop by Mood
        </h2>
        <div className="flex flex-wrap gap-2">
          {moods.map((mood) => (
            <Link
              key={mood}
              href="/shop"
              className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:border-white/30"
            >
              {mood}
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 pt-6 text-xs uppercase tracking-[0.35em] text-white/40">
        <div className="flex flex-wrap gap-6">
          <Link href="/shop">Gothic Apparel</Link>
          <Link href="/shop">Gothic Home Decor</Link>
          <Link href="/drops">Limited Drops</Link>
        </div>
      </footer>

      {activeProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setActiveProduct(null)}
          />
          <div className="modal-surface relative w-full max-w-xl rounded-2xl border border-white/15 bg-black p-6 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  {activeProduct.category} • {activeProduct.tag}
                </p>
                <h3 className="mt-2 text-xl font-semibold">
                  {activeProduct.name}
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  {activeProduct.description}
                </p>
              </div>
              <p className="text-base font-medium">{activeProduct.price}</p>
            </div>

            <div className="mt-5 h-48 rounded-xl border border-white/10 bg-white/5" />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/product/${activeProduct.slug}`}
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                View Full Details
              </Link>
              <button
                type="button"
                onClick={() => setActiveProduct(null)}
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
