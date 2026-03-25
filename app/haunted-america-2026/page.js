import Link from "next/link";

export const metadata = {
  title: "Haunted America 2026",
  description:
    "A gothic convention experience. Details and registration coming soon.",
};

export default function HauntedAmerica2026() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">
          Convention • 2026
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Haunted America 2026
        </h1>
        <p className="max-w-2xl text-base leading-7 text-white/70">
          A gothic convention experience. Details and registration coming soon.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
        <div className="space-y-4">
          <p className="text-sm text-white/70">
            The ritual is being prepared. Return soon for dates, location, and
            how to join.
          </p>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">
            Sanctuary members receive early access
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/join"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-8 py-4 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md"
          >
            Join the Sanctuary
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white"
          >
            Browse the Shop
          </Link>
        </div>
      </div>
    </section>
  );
}
