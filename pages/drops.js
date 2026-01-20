export default function Drops() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">
          Drops
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Release Vault</h1>
        <p className="max-w-2xl text-base leading-7 text-white/70">
          The Threshold releases live here. Each drop is time-bound, curated,
          and meant to be collected in the moment.
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            title: "Eclipse I",
            body: "Opening the Threshold with core essentials and relic tones.",
          },
          {
            title: "Eclipse II",
            body: "Expanded silhouettes, shadowed metallics, and refined cuts.",
          },
          {
            title: "Eclipse III",
            body: "Reserved for members. Private access coming soon.",
          },
        ].map((drop) => (
          <div
            key={drop.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <h2 className="text-lg font-medium">{drop.title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">{drop.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
