import Link from "next/link";
import TwoPrice from "./TwoPrice";

export default function ReadingCard({ reading, product, isMember }) {
  if (!reading || !product) return null;

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">
          The Mirror Reading
        </p>
        <p className="text-sm text-white/80">{reading.validation}</p>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          Resonance: Silence is rising tonight.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          Prescription
        </p>
        <h3 className="mt-2 text-lg font-semibold text-white">
          {product.name}
        </h3>
        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-white/50">
          {product.category}
        </p>
        <div className="mt-3">
          <TwoPrice
            price={product.price}
            salePrice={product.salePrice}
            currency={product.currency}
            isMember={isMember}
            showGate={false}
            variant="compact"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={isMember ? "/shop" : "/join"}
          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Unlock Sanctuary Price
        </Link>
        <Link
          href={isMember ? "/sanctuary/grimoire" : "/join"}
          className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Keep this Reading
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white/60 transition hover:border-white/30 hover:text-white"
        >
          Shop the House
        </Link>
      </div>
    </div>
  );
}
