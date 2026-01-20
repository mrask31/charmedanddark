import Link from "next/link";

const moodCards = [
  "Veilbound Ritual",
  "Obsidian Calm",
  "Nocturne Atelier",
  "Cathedral Minimal",
  "Shadow Botanica",
  "Eclipse Essentials",
];

const apparelSpotlight = [
  "Midnight Veil Top",
  "Ritual Knit Layer",
  "Ebon Tailored Pant",
];

const decorSpotlight = [
  "Smoke Glass Vessel",
  "Blackened Brass Tray",
  "Incense Stone Set",
];

export default function Home() {
  return (
    <section className="space-y-16">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            Threshold Storefront
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Enter the Charmed & Dark Threshold
          </h1>
          <p className="max-w-2xl text-base leading-7 text-white/70">
            A premium gothic atelier for modern ritual. Explore the drops,
            curated apparel, and shadowed decor designed for quiet power.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white text-sm font-medium text-black transition hover:bg-white/90"
          >
            <span className="px-6 py-3">Shop the Threshold</span>
          </Link>
          <Link
            href="/drops"
            className="inline-flex items-center justify-center rounded-full border border-white/20 text-sm font-medium text-white/80 transition hover:text-white"
          >
            <span className="px-6 py-3">View Featured Drops</span>
          </Link>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Mood Gate</h2>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            06 Curation
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moodCards.map((mood) => (
            <Link
              key={mood}
              href="/shop"
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/25"
            >
              <p className="text-sm text-white/60">Mood</p>
              <h3 className="mt-2 text-base font-medium text-white">
                {mood}
              </h3>
              <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/40">
                Enter Shop
              </p>
            </Link>
          ))}
        </div>
      </section>

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
            A quiet arrival of layered silhouettes, midnight textures, and
            ceremonial detail. Limited release.
          </p>
        </Link>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Apparel Spotlight</h2>
          <Link href="/shop" className="text-xs uppercase tracking-[0.3em] text-white/50">
            Shop All
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {apparelSpotlight.map((item) => (
            <Link
              key={item}
              href="/shop"
              className="min-w-[220px] flex-1 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/25 sm:min-w-[240px]"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Apparel
              </p>
              <h3 className="mt-2 text-base font-medium">{item}</h3>
              <p className="mt-2 text-sm text-white/70">Signature cut, matte finish.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Decor Spotlight</h2>
          <Link href="/shop" className="text-xs uppercase tracking-[0.3em] text-white/50">
            Shop All
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {decorSpotlight.map((item) => (
            <Link
              key={item}
              href="/shop"
              className="min-w-[220px] flex-1 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/25 sm:min-w-[240px]"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Decor
              </p>
              <h3 className="mt-2 text-base font-medium">{item}</h3>
              <p className="mt-2 text-sm text-white/70">Quiet ritual, refined form.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            Sanctuary Invitation
          </p>
          <h2 className="text-xl font-semibold">Join the Inner Circle</h2>
          <p className="text-sm leading-6 text-white/70">
            Access the quiet side of the Threshold and receive private updates.
          </p>
        </div>
        <ul className="space-y-2 text-sm text-white/70">
          <li>Early access to drops and limited rituals.</li>
          <li>Curated dispatches and atelier notes.</li>
          <li>Private invitations to shadow releases.</li>
        </ul>
        <Link
          href="/join"
          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white text-sm font-medium text-black transition hover:bg-white/90"
        >
          <span className="px-6 py-3">Join the Circle</span>
        </Link>
      </section>

      <footer className="border-t border-white/10 pt-6 text-xs uppercase tracking-[0.35em] text-white/40">
        Charmed & Dark — Threshold Public Experience
      </footer>
    </section>
  );
}
