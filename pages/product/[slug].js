import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const formatTitle = (slug) =>
  slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function ProductDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const productName = slug ? formatTitle(slug) : "Threshold Artifact";
  const ritualLine =
    "A refined gothic piece designed for quiet ritual and calm presence.";
  const canonicalUrl = slug
    ? `https://charmedanddark.com/product/${slug}`
    : "https://charmedanddark.com/product";

  return (
    <>
      <Head>
        <title>{`${productName} | Charmed & Dark`}</title>
        <meta name="description" content={ritualLine} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${productName} | Charmed & Dark`} />
        <meta property="og:description" content={ritualLine} />
      </Head>
      <section className="space-y-10 pb-16 lg:pb-6">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/60">
              <span>Gallery</span>
              <span className="h-px flex-1 bg-white/10 ml-4" />
            </div>
            <div className="h-80 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-black/40 to-black/80 sm:h-[420px]" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 rounded-xl border border-white/10 bg-black/60"
                />
              ))}
            </div>
          </div>

          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
                {["Apparel", "New", "Limited"].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/15 px-3 py-1"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {productName}
              </h1>
              <p className="text-lg text-white/80">$168</p>
              <p className="text-sm text-white/70">{ritualLine}</p>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <Link
                href="/join"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Join the Sanctuary (10% off always)
              </Link>
              <button
                type="button"
                className="w-full rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Save for Later
              </button>
              <p className="text-xs text-white/50">
                Checkout opens soon. Members get first access.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-medium">Ritual Details</h2>
              <div className="space-y-3 text-sm text-white/70">
                <p>Composition: Matte blend with tonal depth.</p>
                <p>Form: Structured, minimal, and layered.</p>
                <p>Care: Cool wash, air dry, low steam.</p>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-medium">Mood Match</h2>
              <p className="text-sm text-white/70">
                Return to the atelier to align with your next ritual.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/shop"
                  className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  Back to Shop
                </Link>
                {["Veilbound", "Obsidian", "Nocturne"].map((mood) => (
                  <Link
                    key={mood}
                    href="/shop"
                    className="rounded-full border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:border-white/30"
                  >
                    {mood}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/70">
                Sanctuary members receive quiet access to ritual drops and
                private echoes.
              </p>
              <Link
                href="/join"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-5 py-2 text-xs font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Enter the Sanctuary
              </Link>
            </div>
          </div>
        </section>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 px-6 py-3 backdrop-blur sm:hidden">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Price
            </p>
            <p className="text-base font-medium text-white">$168</p>
          </div>
          <button
            type="button"
            disabled
            className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white/60"
          >
            Checkout soon
          </button>
        </div>
      </div>
    </>
  );
}
