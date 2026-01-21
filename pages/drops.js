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
          Drops
        </h1>
        <p className="max-w-2xl text-base leading-7 text-white/70">
          Limited releases of gothic apparel and dark home décor—curated in
          small runs, then sealed away.
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">
              The Mirror
            </p>
            <p className="text-sm text-white/70">
              Ask the Mirror what the House recommends tonight.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-5 py-2 text-xs font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Go to the Mirror
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="text-xs uppercase tracking-[0.35em] text-white/50">
          Current Drop
        </div>
        <h2 className="text-lg font-medium">The Obsidian Ritual Capsule</h2>
        <div className="grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="relative min-h-[220px] rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-black/60 to-black/90 p-6">
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-semibold text-white/10">
              C&amp;D
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
              <span className="rounded-full border border-white/20 px-3 py-1">
                Sanctuary Early Access
              </span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">
                Current Drop
              </p>
              <h3 className="mt-2 text-2xl font-semibold">
                The Obsidian Ritual Capsule
              </h3>
            </div>
            <p className="text-sm leading-6 text-white/70">
              A restrained collection built for modern ritual—heavy cotton,
              sharp silhouettes, and pieces that hold their shape in the dark.
              When it closes, it doesn’t return the same way.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/drops"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Enter Drop
              </Link>
              <Link
                href="/join"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Join the Sanctuary
              </Link>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Sanctuary members receive early access and 10% off always.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Sealed Drops</h2>
        <p className="max-w-2xl text-sm text-white/70">
          These releases are closed, but the memory remains. Browse past
          capsules, artifacts, and limited designs that shaped the House.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {archiveDrops.map((drop) => (
            <div
              key={drop.name}
              className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
                <span>{drop.name}</span>
                <span>Sealed</span>
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
        <p className="max-w-3xl text-sm text-white/70">
          Charmed & Dark Drops are released in limited runs. Some are open to
          all. Others arrive quietly for Sanctuary members first. If you miss a
          Drop, it may never return—at least not unchanged.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            "Released in small runs.",
            "Available for a short window.",
            "Then sealed into the archive.",
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
        <p className="text-sm text-white/70">
          For those who return often. For those who want the House to remember
          them.
        </p>
        <ul className="space-y-2 text-sm text-white/70">
          <li>10% off every purchase, always.</li>
          <li>Early access to Drops.</li>
          <li>The Mirror + Resonance (member-only experiences).</li>
        </ul>
        <Link
          href="/join"
          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Enter the Sanctuary
        </Link>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          No noise. No feeds. No performance—only presence.
        </p>
      </section>

      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        New Drops arrive without warning. The best way to know is to return.
      </p>
    </section>
  );
}
