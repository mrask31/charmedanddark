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

  return (
    <section className="space-y-10">
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">
          Product Detail
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {productName}
        </h1>
        <p className="text-lg text-white/80">$168</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="h-72 rounded-2xl border border-white/10 bg-white/5 sm:h-96" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-24 rounded-xl border border-white/10 bg-black/60" />
            <div className="h-24 rounded-xl border border-white/10 bg-black/60" />
            <div className="h-24 rounded-xl border border-white/10 bg-black/60" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            A refined gothic piece designed for quiet ritual, with a calm
            silhouette and a thoughtful finish.
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-medium">Ritual Details</h2>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <p>Composition: Matte blend with tonal depth.</p>
              <p>Form: Structured, minimal, and layered.</p>
              <p>Care: Cool wash, air dry, low steam.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-medium">Mood Match</h2>
            <p className="mt-2 text-sm text-white/70">
              Return to the atelier to align with your next ritual.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:border-white/40 hover:text-white"
            >
              Back to Shop
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/70">
              Sanctuary members receive quiet access to ritual drops and private
              echoes.
            </p>
            <Link
              href="/join"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-white/20 bg-white px-5 py-2 text-xs font-medium text-black transition hover:bg-white/90"
            >
              Join the Sanctuary
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
}
