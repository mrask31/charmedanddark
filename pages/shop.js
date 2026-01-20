export default function Shop() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">
          Shop
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">The Atelier</h1>
        <p className="max-w-2xl text-base leading-7 text-white/70">
          Curated objects for the Threshold experience. Each piece is designed
          with ritual intent, clean lines, and a quietly gothic palette.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          "Ritual essentials and archival pieces",
          "Limited releases, crafted in small runs",
          "Giftable bundles and ceremonial pairings",
          "Seasonal collections with midnight tones",
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
  );
}
