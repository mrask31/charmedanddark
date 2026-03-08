import Link from "next/link";

export const metadata = {
  title: "The Grimoire | Charmed & Dark",
  description:
    "A private ledger of your readings, rituals, and quiet rewards.",
};

export default function Grimoire() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">
          Sanctuary
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          The Grimoire
        </h1>
        <p className="max-w-2xl text-base leading-7 text-white/70">
          A private ledger of your readings, rituals, and quiet rewards.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Member Badge
          </p>
          <h2 className="mt-3 text-lg font-medium">Shadow Tier</h2>
          <p className="mt-2 text-sm text-white/70">
            Join date: Awaiting initiation
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Total Savings
          </p>
          <h2 className="mt-3 text-lg font-medium">$0.00</h2>
          <p className="mt-2 text-sm text-white/70">
            Sanctuary pricing will appear once access is unlocked.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-medium">Readings Archive</h2>
        <ul className="mt-4 space-y-3 text-sm text-white/70">
          <li>Evening Ritual — The Mirror whispered a quiet alignment.</li>
          <li>Midnight Pulse — A grounded object kept the room still.</li>
          <li>Shadow Calm — The House recommended a ceremonial vessel.</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/70">
          The Grimoire awakens with membership. Step closer to keep your
          readings and unlock Sanctuary pricing.
        </p>
        <Link
          href="/join"
          className="mt-4 inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Enter the Sanctuary
        </Link>
      </div>
    </section>
  );
}
