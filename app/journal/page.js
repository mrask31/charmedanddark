import Link from "next/link";

export const metadata = {
  title: "Journal | Charmed & Dark",
  description: "Quiet reflections, ritual notes, and gothic musings.",
};

export default function Journal() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">
          Coming Soon
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          The Journal
        </h1>
        <p className="max-w-2xl text-base leading-7 text-white/70">
          Quiet reflections, ritual notes, and gothic musings. This space is
          being prepared.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
        <p className="text-sm text-white/70">
          The Journal will arrive soon. Return to explore the atelier in the
          meantime.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-8 py-4 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md"
        >
          Browse the Shop
        </Link>
      </div>
    </section>
  );
}
