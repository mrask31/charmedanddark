export default function Home() {
  return (
    <section className="space-y-10">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">
          Threshold Experience
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Charmed & Dark
        </h1>
        <p className="max-w-xl text-base leading-7 text-white/70">
          Enter the public threshold. Discover the mythology, explore the
          releases, and step into the realm with a quiet, gothic calm.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: "Featured Drop",
            body: "A new ritual collection arrives soon. Stay close to the veil.",
          },
          {
            title: "Threshold Story",
            body: "Fragments of lore, whispered guidance, and the path ahead.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <h2 className="text-lg font-medium">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-black/40 to-black/80 p-6">
        <h2 className="text-lg font-medium">Join the Inner Circle</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
          Gain early access to drops, private dispatches, and ritual updates
          curated for the Charmed & Dark community.
        </p>
      </div>
    </section>
  );
}
