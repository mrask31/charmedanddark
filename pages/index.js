import Link from "next/link";

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

export default function Home() {
  return (
    <section className="space-y-10">
      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            Threshold Home
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Charmed & Dark sells gothic apparel and gothic home decor.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-white/70">
            A premium gothic atelier for modern ritual. Shop refined silhouettes
            and shadowed interiors with quiet, intentional design.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white text-sm font-medium text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span className="px-6 py-3">Shop Apparel</span>
          </Link>
          <Link
            href="/join"
            className="inline-flex items-center justify-center rounded-full border border-white/20 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span className="px-6 py-3">Enter the Sanctuary</span>
          </Link>
        </div>
      </section>

      <div className="h-px bg-white/10" />

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Shop by Category</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoryCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/25"
            >
              <h3 className="text-base font-medium">{card.title}</h3>
              <p className="mt-2 text-sm text-white/70">{card.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="h-px bg-white/10" />

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Featured Drop</h2>
        <Link
          href="/drops"
          className="block rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-black/50 to-black/90 p-6 transition hover:border-white/25"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            Eclipse IV
          </p>
          <h3 className="mt-3 text-xl font-semibold">
            The Obsidian Ritual Capsule
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            A limited run of layered silhouettes, midnight textures, and
            ceremonial detail. Quietly released for the Threshold.
          </p>
        </Link>
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

      <div className="h-px bg-white/10" />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Best Sellers</h2>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.3em] text-white/50"
          >
            Shop All
          </Link>
        </div>
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
            </Link>
          ))}
        </div>
      </section>

      <div className="h-px bg-white/10" />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Home Decor Spotlight</h2>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.3em] text-white/50"
          >
            Shop All
          </Link>
        </div>
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
            </Link>
          ))}
        </div>
      </section>

      <div className="h-px bg-white/10" />

      <section className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Sanctuary Invitation</h2>
          <p className="text-sm leading-6 text-white/70">
            Join the sanctuary for permanent rituals and private access.
          </p>
        </div>
        <ul className="space-y-2 text-sm text-white/70">
          <li>10% off always.</li>
          <li>The Mirror.</li>
          <li>Resonance (Pulse Windows + Echo Cards).</li>
        </ul>
        <Link
          href="/join"
          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white text-sm font-medium text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <span className="px-6 py-3">Join the Sanctuary</span>
        </Link>
      </section>

      <div className="h-px bg-white/10" />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Tonight in Resonance</h2>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Locked
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {["Day", "Evening", "Midnight"].map((window) => (
            <div
              key={window}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                {window} Window
              </p>
              <p className="mt-3 text-sm text-white/70">
                Pulse notes and curated echoes.
              </p>
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/70 text-xs uppercase tracking-[0.3em] text-white/70">
                Join to Unlock
              </div>
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
