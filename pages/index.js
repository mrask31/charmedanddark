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
  const bestSellerFallbacks = [
    "/brand/1000018547.png",
    "/brand/1000018548.png",
    "/brand/1000018551.png",
    "/brand/female_beanie.png",
  ];
  const decorFallbacks = [
    "/brand/Deep%20red%20anatomical%20heart%20vase%20holding%20a%20bouquet%20of%20red%20and%20black%20roses,%20placed%20on%20a%20stone%20gothic%20fireplace%20mantel%20next%20to%20dripping%20wax%20candles%20and%20an.png",
    "/brand/Luxurious%20black%20satin%206-piece%20sheet%20set%20styled%20on%20a%20large%20bed%20in%20a%20dark,%20romantic%20gothic%20bedroom%20with%20candlelight%20and%20black%20velvet%20decor..png",
  ];
  const bestSellerItems = bestSellers.map((item, index) => {
    const product = products.find((entry) =>
      entry.name?.toLowerCase().includes(item.toLowerCase())
    );
    return {
      name: item,
      image:
        product?.imageUrls?.[0] ||
        bestSellerFallbacks[index % bestSellerFallbacks.length],
    };
  });
  const decorItems = decorSpotlight.map((item, index) => {
    const product = products.find((entry) =>
      entry.name?.toLowerCase().includes(item.toLowerCase())
    );
    return {
      name: item,
      image:
        product?.imageUrls?.[0] || decorFallbacks[index % decorFallbacks.length],
    };
  });

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
                  Elegant gothic goods for the life you actually live.
                </h1>
                <p className="text-base text-white/70">
                  Apparel for the world. Home rituals for the quiet hours.
                </p>
                <p className="text-sm text-white/60">
                  Charmed & Dark is an elegant gothic store for apparel and home
                  decor — with a private members sanctuary.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <span className="px-6 py-3">Shop The Threshold</span>
                </Link>
                <Link
                  href="/join"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-transparent px-6 py-3 text-xs uppercase tracking-[0.3em] text-white/60 transition hover:border-white/40 hover:text-white"
                >
                  Enter The Sanctuary (10% off always)
                </Link>
              </div>
              <Link
                href="#mirror"
                className="text-xs uppercase tracking-[0.3em] text-white/50 transition hover:text-white"
              >
                Or take a quiet reading from The Mirror →
              </Link>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Quiet by design. No feeds. No noise. No performance.
              </p>
            </div>
            <div className="order-first flex justify-center lg:order-none lg:justify-end">
              <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black/90 text-center text-3xl font-semibold tracking-[0.2em] text-white/80 shadow-[0_0_60px_rgba(255,255,255,0.08)] sm:h-40 sm:w-40">
                <img
                  src="/brand/Charmed%20and%20Dark%20Logo.png"
                  alt="Charmed & Dark"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 rounded-full ring-1 ring-white/10" />
              </div>
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
            {bestSellerItems.map((item) => (
              <Link
                key={item.name}
                href="/shop"
                className="group relative min-w-[220px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/25 sm:min-w-[240px]"
              >
                <img
                  src={item.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                <div className="relative">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Best Seller
                  </p>
                  <h3 className="mt-2 text-base font-medium">{item.name}</h3>
                  <p className="mt-2 text-sm text-white/70">
                    Signature cut, matte finish.
                  </p>
                  <div className="mt-4 hidden text-xs uppercase tracking-[0.3em] text-white/50 md:block">
                    Public Price · Sanctuary Price
                  </div>
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
            {decorItems.map((item) => (
              <Link
                key={item.name}
                href="/shop"
                className="group relative min-w-[220px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/25 sm:min-w-[240px]"
              >
                <img
                  src={item.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                <div className="relative">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Home Decor
                  </p>
                  <h3 className="mt-2 text-base font-medium">{item.name}</h3>
                  <p className="mt-2 text-sm text-white/70">
                    Quiet ritual, refined form.
                  </p>
                  <div className="mt-4 hidden text-xs uppercase tracking-[0.3em] text-white/50 md:block">
                    Public Price · Sanctuary Price
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      <section id="mirror" className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            THE MIRROR
          </p>
          <div className="h-px w-full bg-gradient-to-r from-white/30 via-white/10 to-transparent" />
          <p className="text-sm text-white/70">
            A quiet reading: one validation, one prescription.
          </p>
        </div>
        <div className="rounded-3xl border border-white/20 bg-white/5 p-1 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <MirrorModule products={products} isMember={isMember} />
        </div>
      </section>

      <SectionDivider />

      <section className="space-y-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 p-6">
          <img
            src="/brand/Black%20crushed%20velvet%20comforter%20set%20with%20a%20diamond-quilted%20pattern%20and%20a%20moon%20phase%20accent%20pillow,%20styled%20on%20a%20four-poster%20bed%20in%20a%20dark,%20luxurious%20gothic.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover blur-[2px]"
          />
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative space-y-8">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">
                Members Only
              </p>
              <h2 className="text-xl font-semibold text-white">The Sanctuary</h2>
              <p className="text-sm text-white/80">
                A private realm designed for daily return—quiet by design.
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                No feeds. No followers. No performance.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group rounded-2xl border border-white/15 bg-white/10 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_22px_55px_rgba(0,0,0,0.45)]">
                <div className="flex items-start gap-3">
                  <span className="rounded-full border border-white/15 bg-black/50 p-2 text-white/80">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M7.5 12h9" />
                      <path d="M12 7.5v9" />
                    </svg>
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">
                      Sanctuary Price
                    </p>
                    <p className="text-xs text-white/80">
                      10% off always—shown on every item.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-white/15 bg-white/10 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_22px_55px_rgba(0,0,0,0.45)]">
                <div className="flex items-start gap-3">
                  <span className="rounded-full border border-white/15 bg-black/50 p-2 text-white/80">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 6.5c0-1.1.9-2 2-2h8a3 3 0 0 1 3 3v10.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
                      <path d="M7.5 8.5h6" />
                      <path d="M7.5 12h6" />
                      <path d="M7.5 15.5h4" />
                    </svg>
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">
                      Grimoire Archive
                    </p>
                    <p className="text-xs text-white/80">
                      Keep your Mirror readings in one private place.
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">
                      Saving is placeholder for now.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-white/15 bg-white/10 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_22px_55px_rgba(0,0,0,0.45)]">
                <div className="flex items-start gap-3">
                  <span className="rounded-full border border-white/15 bg-black/50 p-2 text-white/80">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4.5 12.5l7.5-7.5 7.5 7.5" />
                      <path d="M7 12v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-6" />
                      <path d="M9.5 12.5h5" />
                    </svg>
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">Early Drops</p>
                    <p className="text-xs text-white/80">
                      Limited releases, available to members first.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-[0_22px_55px_rgba(0,0,0,0.45)] backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-white">
                  Grimoire Preview
                </p>
                <span className="rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white/70">
                  Locked
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 text-sm text-white/80">
                  <span className="mt-2 h-2 w-2 rounded-full bg-white/30" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">
                      Reading Card #001
                    </p>
                    <p className="text-xs text-white/70">
                      Silence is rising tonight.
                    </p>
                  </div>
                </div>
                <div className="h-px w-full bg-white/10" />
                <div className="flex items-start gap-3 text-sm text-white/80">
                  <span className="mt-2 h-2 w-2 rounded-full bg-white/30" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">
                      Saved privately.
                    </p>
                    <p className="text-xs text-white/70">
                      Timestamped. Always yours.
                    </p>
                  </div>
                </div>
                <div className="h-px w-full bg-white/10" />
                <div className="flex items-start gap-3 text-sm text-white/80">
                  <span className="mt-2 h-2 w-2 rounded-full bg-white/30" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white">
                      Unlock by joining
                    </p>
                    <p className="text-xs text-white/70">
                      Enter the Sanctuary to keep your readings.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/join"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Enter the Sanctuary
              </Link>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Unlock Sanctuary Price + keep your readings.
              </p>
            </div>

            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Join free. Save 10% always.
            </p>

            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Membership is calm by design. Nothing public. Nothing performative.
            </p>
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
