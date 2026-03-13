"use client";

import { useState } from "react";

export function TheMirror() {
  const [mood, setMood] = useState("");

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

        <button className="mt-10 bg-[#B89C6D] px-8 py-4 text-xs uppercase tracking-widest text-black transition-opacity duration-160 hover:opacity-90">
          Receive Reading
        </button>
      </div>
    </section>
  );
}
