import Link from "next/link";

const archiveDrops = [
  {
    name: "Eclipse I",
    season: "Winter Ritual 2024",
    description: "Opening the Threshold with core essentials and relic tones.",
  },
  {
    name: "Eclipse II",
    season: "Silent Spring 2024",
    description: "Expanded silhouettes, shadowed metallics, and refined cuts.",
  },
  {
    name: "Eclipse III",
    season: "Nocturne Autumn 2024",
    description: "Reserved for members. Private access layered in quiet form.",
  },
  {
    name: "Eclipse IV",
    season: "Midwinter 2025",
    description: "A capsule of ceremony, matte textures, and sculpted shapes.",
  },
];

export default function Drops() {
  return (
    <section className="space-y-12">
      <section className="space-y-5">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">
          Drops
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Limited Drops. Quietly Released.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-white/70">
          Explore curated gothic apparel and home décor drops released in
          limited runs.
        </p>
        <p className="text-sm text-white/60">
          Some drops are open. Others are waiting.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/drops"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            View Current Drop
          </Link>
          <Link
            href="/join"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Join the Sanctuary
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Current Drop</h2>
        <div className="grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="relative min-h-[220px] rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-black/60 to-black/90 p-6">
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-semibold text-white/10">
              C&amp;D
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
              <span className="rounded-full border border-white/20 px-3 py-1">
                Open
              </span>
              <span className="rounded-full border border-white/20 px-3 py-1">
                Sanctuary Early Access
              </span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">
                Eclipse V
              </p>
              <h3 className="mt-2 text-2xl font-semibold">
                The Obsidian Ritual Capsule
              </h3>
            </div>
            <p className="text-sm leading-6 text-white/70">
              A curated run of gothic apparel and home décor crafted in limited
              quantities. Designed for the quiet collectors who arrive early.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/drops"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Enter Drop
              </Link>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Sanctuary members receive early access.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Drop Archive</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {archiveDrops.map((drop) => (
            <div
              key={drop.name}
              className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
                <span>{drop.name}</span>
                <span>Closed</span>
              </div>
              <h3 className="text-base font-medium">{drop.season}</h3>
              <p className="text-sm text-white/70">{drop.description}</p>
              <Link
                href="/drops"
                className="text-xs uppercase tracking-[0.3em] text-white/50 transition hover:text-white"
              >
                View Archive
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">How Drops Work</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            "Drops release quietly.",
            "Quantities are limited.",
            "Sanctuary members receive early or private access.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-medium">The Sanctuary</h2>
        <ul className="space-y-2 text-sm text-white/70">
          <li>10% off always.</li>
          <li>Early drop access.</li>
          <li>Private experiences (Mirror + Resonance).</li>
        </ul>
        <Link
          href="/join"
          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Enter the Sanctuary
        </Link>
      </section>
    </section>
  );
}
