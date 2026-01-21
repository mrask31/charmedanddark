import Link from "next/link";
import MirrorModule from "@/components/MirrorModule";
import { getProducts } from "@/lib/products";
import { isMember } from "@/lib/membership";

const categoryCards = [
  { title: "Apparel", subtitle: "Layered silhouettes", href: "/shop" },
  { title: "Home Decor", subtitle: "Ceremonial interiors", href: "/shop" },
  { title: "Drops", subtitle: "Limited rituals", href: "/shop" },
  { title: "Best Sellers", subtitle: "Curated icons", href: "/shop" },
];

const moodCards = [
  "Veilbound Ritual",
  "Obsidian Calm",
  "Nocturne Atelier",
  "Cathedral Minimal",
  "Shadow Botanica",
  "Eclipse Essentials",
];

const bestSellers = [
  "Ritual Velvet Wrap",
  "Nocturne Column Dress",
  "Ebon Tailored Pant",
  "Eclipse Knit Layer",
];

const decorSpotlight = [
  "Smoke Glass Vessel",
  "Blackened Brass Tray",
  "Incense Stone Set",
];

export async function getStaticProps() {
  const products = getProducts();
  return { props: { products } };
}

export default function Home({ products }) {
  return (
    <section className="space-y-12">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/70 px-6 py-10 sm:px-10">
        <div className="fog-layer" aria-hidden="true">
          <div className="fog-blob" />
          <div className="fog-blob-alt" />
        </div>
        <div className="relative z-10 space-y-10">
          <section className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                Threshold
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Enter the Threshold.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/70">
                A quiet storefront for the corporate goth—uniforms for the
                world, rituals for the home.
              </p>
              <p className="text-sm text-white/60">
                No noise. No performance. Just atmosphere.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="#mirror"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <span className="px-6 py-3">Reveal My Reading</span>
              </Link>
              <Link
                href="/join"
                className="text-xs uppercase tracking-[0.3em] text-white/60 transition hover:text-white"
              >
                Enter the Sanctuary
              </Link>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Sanctuary members unlock 10% off always.
            </p>
          </section>

          <section id="mirror" className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-medium">The Mirror</h2>
              <p className="text-sm text-white/70">
                Tell the Mirror how the shadow feels. Receive a Reading Card:
                validation, one prescription, and a quiet resonance.
              </p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/5 p-1 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
              <MirrorModule products={products} isMember={isMember} />
            </div>
          </section>
        </div>
      </div>

      <div className="h-px bg-white/10" />

      <section className="grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <h2 className="text-lg font-medium">The Sanctuary (Members Only)</h2>
          <p className="text-sm text-white/70">
            A private realm designed for daily return—quiet by design.
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            No feeds. No followers. No performance.
          </p>
        </div>
        <div className="space-y-4">
          <ul className="space-y-2 text-sm text-white/70">
            <li>10% off always (Sanctuary Price on every item)</li>
            <li>Save Mirror readings in your Grimoire (placeholder for now)</li>
            <li>A calmer realm—no feeds, no noise, no performance</li>
          </ul>
          <Link
            href="/join"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Enter the Sanctuary
          </Link>
        </div>
      </section>

      <div className="h-px bg-white/10" />

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Mood Gate</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moodCards.map((mood) => (
            <Link
              key={mood}
              href="/shop"
              className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/25"
            >
              <p className="text-sm text-white/60">Mood Portal</p>
              <h3 className="mt-2 text-base font-medium text-white">{mood}</h3>
              <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/40">
                Enter Shop
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          Shop by Category
        </p>
        <div className="flex flex-wrap gap-2">
          {categoryCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:border-white/30 hover:text-white"
            >
              {card.title}
            </Link>
          ))}
        </div>
      </section>

      <div className="h-px bg-white/10" />

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-medium">Drops</h2>
          <p className="text-sm text-white/70">
            Limited releases. Kept intentional. Archived with care.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-black/50 to-black/90 p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            ECLIPSE IV — The Obsidian Ritual Capsule
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">
            A limited run of layered silhouettes, midnight textures, and
            ceremonial detail. Quietly released for the Threshold.
          </p>
          <Link
            href="/drops"
            className="mt-5 inline-flex items-center text-xs uppercase tracking-[0.3em] text-white/60 transition hover:text-white"
          >
            Explore Drops →
          </Link>
        </div>
      </section>

      <div className="h-px bg-white/10" />

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            The Uniform
          </p>
          <h2 className="mt-4 text-xl font-semibold">
            Structured silhouettes for the world outside.
          </h2>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            The Ritual
          </p>
          <h2 className="mt-4 text-xl font-semibold">
            Objects that soften the room and quiet the mind.
          </h2>
        </div>
      </section>

      <div className="h-px bg-white/10" />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Best Sellers</h2>
            <p className="text-sm text-white/60">
              Curated icons for the Threshold.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.3em] text-white/50"
          >
            Shop All
          </Link>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          Sanctuary members see the true price.
        </p>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-12 bg-gradient-to-r from-black via-black/70 to-transparent md:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-12 bg-gradient-to-l from-black via-black/70 to-transparent md:block" />
          <p className="mb-2 hidden text-xs uppercase tracking-[0.3em] text-white/40 md:block">
            Drag to explore
          </p>
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          {bestSellers.map((item) => (
            <Link
              key={item}
              href="/shop"
              className="min-w-[220px] flex-1 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/25 sm:min-w-[240px]"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Best Seller
              </p>
              <h3 className="mt-2 text-base font-medium">{item}</h3>
              <p className="mt-2 text-sm text-white/70">Signature cut, matte finish.</p>
              <div className="mt-4 hidden text-xs uppercase tracking-[0.3em] text-white/50 md:block">
                Public Price · Sanctuary Price
              </div>
            </Link>
          ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-white/10" />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">For the Home</h2>
            <p className="text-sm text-white/60">Objects that quiet the room.</p>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.3em] text-white/50"
          >
            Shop All
          </Link>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          Sanctuary members see the true price.
        </p>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-12 bg-gradient-to-r from-black via-black/70 to-transparent md:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-12 bg-gradient-to-l from-black via-black/70 to-transparent md:block" />
          <p className="mb-2 hidden text-xs uppercase tracking-[0.3em] text-white/40 md:block">
            Drag to explore
          </p>
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          {decorSpotlight.map((item) => (
            <Link
              key={item}
              href="/shop"
              className="min-w-[220px] flex-1 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/25 sm:min-w-[240px]"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Home Decor
              </p>
              <h3 className="mt-2 text-base font-medium">{item}</h3>
              <p className="mt-2 text-sm text-white/70">Quiet ritual, refined form.</p>
              <div className="mt-4 hidden text-xs uppercase tracking-[0.3em] text-white/50 md:block">
                Public Price · Sanctuary Price
              </div>
            </Link>
          ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-white/10" />

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Resonance</h2>
          <p className="text-sm text-white/70">Silence is rising tonight.</p>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Members sometimes leave a trace—never names, never noise.
          </p>
        </div>
      </section>

      <div className="h-px bg-white/10" />

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-medium">
          Keep the Reading. Unlock the Sanctuary Price.
        </h2>
        <p className="text-sm leading-6 text-white/70">
          The Mirror is the entry. The Sanctuary is where it stays. Members keep
          their readings, unlock the Sanctuary Price, and return with quiet
          intent.
        </p>
        <Link
          href="/join"
          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Enter the Sanctuary
        </Link>
        <div className="space-y-3 text-sm text-white/70">
          {[
            {
              q: "Is this a subscription?",
              a: "Not yet. For now it’s membership access + Sanctuary Price.",
            },
            {
              q: "Do I need social features?",
              a: "No. No profiles, no comments, no threads.",
            },
            {
              q: "What happens to my readings?",
              a: "Saved to your Grimoire—placeholder now, real saving later.",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-white/10 bg-black/60 p-4"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                {item.q}
              </p>
              <p className="mt-2">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 pt-6 text-xs uppercase tracking-[0.35em] text-white/40">
        <div className="flex flex-wrap gap-6">
          <Link href="/about">About</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/drops">Drops</Link>
          <Link href="/join">Join</Link>
        </div>
      </footer>
    </section>
  );
}
