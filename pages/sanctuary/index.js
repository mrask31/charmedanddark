import Head from "next/head";
import Link from "next/link";

const isMemberDemo = false;

const resonanceItems = [
  { label: "Candle", count: 12 },
  { label: "Rose", count: 7 },
  { label: "Moon", count: 4 },
  { label: "Star", count: 9 },
];

const TileBadge = ({ children }) => (
  <span className="rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white/70">
    {children}
  </span>
);

const ResonanceIcon = ({ label }) => (
  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs uppercase tracking-[0.2em] text-white/60">
    {label.slice(0, 1)}
  </span>
);

export default function Sanctuary() {
  const mirrorCta = isMemberDemo
    ? { label: "Enter The Mirror", href: "/#mirror" }
    : { label: "Reveal a Reading (Preview)", href: "/#mirror" };
  const grimoireCta = isMemberDemo
    ? { label: "Open Grimoire", href: "/sanctuary/grimoire" }
    : { label: "Join to Unlock", href: "/join" };
  const priceCta = isMemberDemo
    ? { label: "Shop with Sanctuary Price", href: "/shop" }
    : { label: "Join to Unlock", href: "/join" };

  return (
    <>
      <Head>
        <title>The Sanctuary | Charmed & Dark</title>
        <meta
          name="description"
          content="A private realm for members—quiet by design. Unlock Sanctuary Price, keep your Grimoire, and return to The Mirror."
        />
      </Head>
      <section className="space-y-10">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-black/40 to-black/80" />
          <div className="relative space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">
              NO FEEDS. NO FOLLOWERS. NO PERFORMANCE.
            </p>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                The Sanctuary
              </h1>
              <p className="text-base text-white/80">
                A private realm designed for daily return — quiet by design.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-[0_20px_55px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-white">The Mirror</h2>
                <p className="text-sm text-white/80">
                  A private reflection and recommendation—quiet, personal,
                  on-brand.
                </p>
              </div>
              {!isMemberDemo ? <TileBadge>Preview</TileBadge> : null}
            </div>
            <Link
              href={mirrorCta.href}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-black/80 px-5 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto"
            >
              {mirrorCta.label}
            </Link>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-[0_20px_55px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-white">Grimoire</h2>
                <p
                  className={`text-sm text-white/80 ${
                    isMemberDemo ? "" : "blur-[2px]"
                  }`}
                >
                  Your saved readings—private, timestamped, and always yours.
                </p>
              </div>
              {!isMemberDemo ? <TileBadge>Locked</TileBadge> : null}
            </div>
            <Link
              href={grimoireCta.href}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-black/80 px-5 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto"
            >
              {grimoireCta.label}
            </Link>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-[0_20px_55px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-white">
                  Sanctuary Price
                </h2>
                <p
                  className={`text-sm text-white/80 ${
                    isMemberDemo ? "" : "blur-[2px]"
                  }`}
                >
                  10% off always—shown on every item.
                </p>
              </div>
              {!isMemberDemo ? <TileBadge>Locked</TileBadge> : null}
            </div>
            <Link
              href={priceCta.href}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-black/80 px-5 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto"
            >
              {priceCta.label}
            </Link>
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_16px_45px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm uppercase tracking-[0.35em] text-white/60">
                Resonance
              </h3>
              <p className="text-sm text-white/70">
                Sometimes members leave a trace—never names, never noise.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {resonanceItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/60"
                >
                  <ResonanceIcon label={item.label} />
                  {item.count}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">
              Recent in your Grimoire
            </h3>
            {!isMemberDemo ? <TileBadge>Locked</TileBadge> : null}
          </div>
          {isMemberDemo ? (
            <div className="mt-4 space-y-3 text-sm text-white/70">
              {[
                "Reading • 01 Confess",
                "Reading • 02 Receive",
                "Reading • 03 Keep",
              ].map((entry) => (
                <div
                  key={entry}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
                >
                  <span>{entry}</span>
                  <span className="text-xs uppercase tracking-[0.25em] text-white/50">
                    07.22.25
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-white/70">
                Your Grimoire appears when you join.
              </p>
              <Link
                href="/join"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto"
              >
                Join Free
              </Link>
            </div>
          )}
        </section>
      </section>
    </>
  );
}
