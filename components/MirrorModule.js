import { useMemo, useState } from "react";
import ReadingCard from "./ReadingCard";

const validations = [
  "The Mirror hears a quiet weight beneath your breath.",
  "Your shadow moves with purpose tonight—measured, deliberate.",
  "There is a steady calm in your pulse, even if the noise swells.",
  "The Mirror reflects restraint, not absence.",
  "Your atmosphere is shifting—low light, slow ritual, clear intent.",
];

const prescriptions = [
  "Anchor the moment with a grounded object.",
  "Choose a piece that holds light without revealing it all.",
  "Let the ritual be tactile, weighted, and deliberate.",
  "Seek a form that feels quiet, but unmistakable.",
  "Select something that keeps the room still.",
];

const moodMap = [
  { keywords: ["calm", "quiet", "soft"], category: "Candles & Scent" },
  { keywords: ["dark", "shadow", "noir"], category: "Decor Objects" },
  { keywords: ["ritual", "altar", "sacred"], category: "Dining & Serveware" },
  { keywords: ["mirror", "reflection", "vision"], category: "Wall Art" },
  { keywords: ["comfort", "warm", "wrap"], category: "Textiles" },
];

const getHash = (value) =>
  value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

export default function MirrorModule({ products, isMember }) {
  const [input, setInput] = useState("");
  const [reading, setReading] = useState(null);
  const [isActive, setIsActive] = useState(false);

  const recommendedProduct = useMemo(() => {
    if (!reading) return null;
    const inStock = products.filter(
      (product) => product.qty > 0 && !product.hidden
    );
    if (!inStock.length) return null;
    const desiredCategory = reading.category;
    const matches = inStock.filter(
      (product) => product.category === desiredCategory
    );
    const pool = matches.length ? matches : inStock;
    const index = reading.seed % pool.length;
    return pool[index];
  }, [products, reading]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    const seed = getHash(input.toLowerCase());
    const validation = validations[seed % validations.length];
    const prescription = prescriptions[seed % prescriptions.length];
    const lowered = input.toLowerCase();
    const matched = moodMap.find((entry) =>
      entry.keywords.some((word) => lowered.includes(word))
    );
    setReading({
      validation,
      prescription,
      category: matched?.category || "Decor Objects",
      seed,
    });
  };

  return (
    <section className="space-y-4 rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 via-black/40 to-black/80 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">
          The Mirror
        </p>
        <p className="text-sm text-white/80">
          A quiet reading card: one validation, one prescription.
        </p>
        {reading ? (
          <p className="text-sm text-white/80">{reading.prescription}</p>
        ) : null}
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            if (!isActive) setIsActive(true);
          }}
          onFocus={() => setIsActive(true)}
          placeholder="Describe your mood in a few words..."
          className="w-full flex-1 rounded-full border border-white/15 bg-black px-5 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        />
        <button
          type="submit"
          className="btn-primary w-full rounded-full px-6 py-3 text-sm font-medium sm:w-auto"
        >
          Receive Reading
        </button>
      </form>

      {reading && recommendedProduct ? (
        <ReadingCard
          reading={reading}
          product={recommendedProduct}
          isMember={isMember}
        />
      ) : null}

      {!reading && isActive ? (
        <p className="text-xs uppercase tracking-[0.35em] text-white/55">
          Receive your reading, then keep it in the Sanctuary.
        </p>
      ) : null}
    </section>
  );
}
