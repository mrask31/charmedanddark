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

const SectionDivider = () => (
  <div className="flex items-center gap-3 text-white/20">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    <div className="h-1.5 w-1.5 rotate-45 border border-white/30" />
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  </div>
);

export async function getStaticProps() {
  const products = getProducts();
  return { props: { products } };
}

export default function Home({ products }) {
  return (
    <section className="space-y-14">
      <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-white/10 px-6 py-12 sm:min-h-[520px] sm:px-10">
        <div className="fog-layer" aria-hidden="true">
          <div className="fog-blob" />
          <div className="fog-blob-alt" />
        </div>
        <div className="absolute inset-0">
          <img
            src="/brand/Female_signature_hoodie_3.png"
            alt=""
            className="h-full w-full object-cover object-[center_top]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90" />
        </div>
        <div className="relative z-10 space-y-12">
          <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="order-last space-y-5 lg:order-none">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                  Threshold
                </p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Enter the Threshold.
                </h1>
                <p className="text-base text-white/70">
                  Uniforms for the world. Rituals for the home.
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
            </div>
            <div className="order-first flex justify-center lg:order-none">
              <div className="relative flex h-56 w-56 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black/90 text-center text-3xl font-semibold tracking-[0.2em] text-white/80 shadow-[0_0_80px_rgba(255,255,255,0.08)] sm:h-64 sm:w-64">
                <img
                  src="/brand/Charmed%20and%20Dark%20Logo.png"
                  alt="Charmed & Dark"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 rounded-full ring-1 ring-white/10" />
              </div>
            </div>
          </section>

          <section id="mirror" className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                THE MIRROR
              </p>
              <div className="h-px w-full bg-gradient-to-r from-white/30 via-white/10 to-transparent" />
              <p className="text-sm text-white/70">
                A Reading Card: validation, one prescription, and quiet resonance.
              </p>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/5 p-1 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
              <MirrorModule products={products} isMember={isMember} />
            </div>
          </section>
        </div>
      </div>

      <SectionDivider />

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Choose Your Entrance</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: "The Uniform",
              subtitle: "Structured silhouettes. Midnight restraint.",
              href: "/shop",
              image: "/brand/1000018547.png",
            },
            {
              title: "The Ritual",
              subtitle: "Objects for quiet nights and softer rooms.",
              href: "/shop",
              image: "/brand/Deep%20red%20anatomical%20heart%20vase%20holding%20a%20bouquet%20of%20red%20and%20black%20roses,%20placed%20on%20a%20stone%20gothic%20fireplace%20mantel%20next%20to%20dripping%20wax%20candles%20and%20an.png",
            },
          ].map((portal) => (
            <Link
              key={portal.title}
              href={portal.href}
              className="group relative overflow-hidden rounded-3xl border border-white/15 bg-black/80 transition hover:-translate-y-1 hover:border-white/40 hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
            >
              <img
                src={portal.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
              <div className="relative flex h-full flex-col justify-end gap-2 p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                  {portal.title}
                </p>
                <h3 className="text-lg font-semibold text-white">
                  {portal.subtitle}
                </h3>
                <span className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Enter {portal.title} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <SectionDivider />

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-medium">The Sanctuary (Members Only)</h2>
        <div className="relative overflow-hidden rounded-2xl border border-white/10 p-6">
          <img
            src="/brand/Black%20crushed%20velvet%20comforter%20set%20with%20a%20diamond-quilted%20pattern%20and%20a%20moon%20phase%20accent%20pillow,%20styled%20on%20a%20four-poster%20bed%20in%20a%20dark,%20luxurious%20gothic.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover blur-[2px]"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-white/70">
                A private realm designed for daily return—quiet by design.
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                No feeds. No followers. No performance.
              </p>
            </div>
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
        </div>
      </section>

      <SectionDivider />

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

      <SectionDivider />

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

      <SectionDivider />

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

      <SectionDivider />

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Resonance</h2>
          <p className="text-sm text-white/70">Silence is rising tonight.</p>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Members sometimes leave a trace—never names, never noise.
          </p>
        </div>
      </section>

      <SectionDivider />

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
