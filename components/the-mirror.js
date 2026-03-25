"use client";

import { useState } from "react";

export function TheMirror() {
  const [mood, setMood] = useState("");
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReceiveReading = async () => {
    if (!mood.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/mirror', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood }),
      });
      const data = await res.json();
      setReading(data);
    } catch {
      setReading({
        validation: 'The mirror is quiet tonight.',
        prescription: 'Return when the mood finds words.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-black px-8 py-32 lg:px-16">
      <div className="mx-auto max-w-2xl border border-zinc-800 p-12 text-center lg:p-16">
        <span className="text-xs uppercase tracking-widest text-[#B89C6D]">
          The Mirror
        </span>
        <p className="mt-6 text-sm text-zinc-400">
          A quiet reading: one validation, one prescription.
        </p>

        <div className="mt-10">
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="Describe your mood in a few words..."
            className="w-full border-b border-zinc-800 bg-transparent px-4 py-4 text-center text-sm text-white placeholder:text-zinc-600 focus:border-[#B89C6D] focus:outline-none transition-colors duration-160"
          />
        </div>

        <button
          onClick={handleReceiveReading}
          disabled={loading || !mood.trim()}
          className="mt-10 bg-[#B89C6D] px-8 py-4 text-xs uppercase tracking-widest text-black transition-opacity duration-160 hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Reading...' : 'Receive Reading'}
        </button>

        {reading && (
          <div className="mt-10 space-y-4 text-left border-t border-zinc-800 pt-10">
            <p className="text-sm text-zinc-300 italic">{reading.validation}</p>
            <p className="text-xs uppercase tracking-widest text-[#B89C6D]">{reading.prescription}</p>
          </div>
        )}
      </div>
    </section>
  );
}
