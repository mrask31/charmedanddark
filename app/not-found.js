import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">
          404 — Path Sealed
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          This chamber is locked.
        </h1>
        <p className="mt-4 text-base text-white/70">
          The ritual you sought has been sealed or never existed. Return to the
          atelier to continue your journey.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-8 py-4 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Return Home
        </Link>
      </div>
    </section>
  );
}
