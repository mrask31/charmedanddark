export default function About() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">
          About
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          The Threshold Story
        </h1>
        <p className="max-w-2xl text-base leading-7 text-white/70">
          Charmed & Dark is a gothic atelier shaping modern ritual. The
          Threshold experience invites you into the quiet, the intimate, and the
          intentional.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: "Design Language",
            body: "Minimal silhouettes, matte textures, and ceremonial detail.",
          },
          {
            title: "Craft & Intent",
            body: "Small-batch production with reverence for shadow and light.",
          },
          {
            title: "Community",
            body: "Private access, shared ritual, and a bound circle.",
          },
          {
            title: "Future State",
            body: "The Threshold expands through drops, lore, and collaborations.",
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
    </section>
  );
}
